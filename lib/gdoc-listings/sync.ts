import "server-only";

import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import {
  applySheetListingSync,
  beginSheetSyncRun,
  finishSheetSyncRun,
  listSheetListingRecords,
  releaseSheetSyncLock,
} from "@/lib/dal/sheet-listings";
import { getSheetPricingRule } from "@/lib/dal/sheet-pricing";
import { SheetSyncError, sheetSyncErrorCode } from "@/lib/gdoc-listings/errors";
import { fetchSheetValueRows } from "@/lib/gdoc-listings/fetch-sheet";
import { googleSheetsConfigured } from "@/lib/gdoc-listings/google";
import { sheetListingContentHash } from "@/lib/gdoc-listings/hash";
import { foldSheetDrafts, parseSheetRows } from "@/lib/gdoc-listings/parse";
import type {
  SheetListingDraft,
  SheetMarginAuditDraft,
  SheetSyncEventDraft,
  SheetSyncTrigger,
} from "@/lib/gdoc-listings/types";
import { resolveSyncMargin, sameMargin, type MarginFields } from "@/lib/gdoc-listings/margin";
import { dropAmount } from "@/lib/listings/money";
import { refreshSheetListingViews } from "@/lib/gdoc-listings/cache";

export type SheetSyncResult = {
  ok: boolean;
  errorId: string;
  rows: number;
  unique: number;
  created: number;
  updated: number;
  unchanged: number;
  held: number;
  inactivated: number;
  skipped: Record<string, number>;
};

type ExistingRow = Awaited<ReturnType<typeof listSheetListingRecords>>[number];

export async function syncSheetListings(trigger: SheetSyncTrigger = "webhook"): Promise<SheetSyncResult> {
  if (!googleSheetsConfigured()) {
    throw new SheetSyncError("missing_credentials", "Google Sheets is not configured.");
  }

  const run = await beginSheetSyncRun(trigger);
  try {
    const rows = await fetchSheetValueRows();
    const parsed = parseSheetRows(rows);
    const drafts = foldSheetDrafts(parsed.drafts);
    const existing = await listSheetListingRecords();
    if (drafts.length === 0 && existing.some((row) => row.removedAt == null)) {
      throw new SheetSyncError("empty_sheet", "The sheet copy was empty, so existing homes were left alone.");
    }

    const result = await applyDrafts(run.id, drafts, existing, parsed.rows, parsed.skipped);
    refreshSheetListingPages([
      ...drafts.map((draft) => draft.listingCode),
      ...drafts.map((draft) => draft.sheetSlug),
      ...existing.filter((row) => result.seenIds.has(row.id)).flatMap((row) => [row.slug, row.listingCode ?? ""]),
    ]);
    console.log("[SHEET_LISTINGS_SYNC]", {
      event: "ok",
      errorId: run.errorId,
      trigger,
      rows: result.sync.rows,
      unique: result.sync.unique,
      created: result.sync.created,
      updated: result.sync.updated,
      unchanged: result.sync.unchanged,
      held: result.sync.held,
      inactivated: result.sync.inactivated,
      skipped: result.sync.skipped,
    });
    return { ...result.sync, errorId: run.errorId };
  } catch (error) {
    const code = sheetSyncErrorCode(error) || "sync_failed";
    const status = code === "busy" || code === "empty_sheet" ? "skipped" : "failed";
    await finishSheetSyncRun(run.id, status, code).catch(() => undefined);
    console.error("[SHEET_LISTINGS_SYNC]", {
      event: "failed",
      errorId: run.errorId,
      trigger,
      code,
      name: error instanceof Error ? error.name : "Error",
    });
    throw error instanceof SheetSyncError ? error : new SheetSyncError("sync_failed", "Sheet sync failed.");
  } finally {
    await releaseSheetSyncLock(run.errorId).catch(() => undefined);
  }
}

async function applyDrafts(
  runId: number,
  drafts: SheetListingDraft[],
  existing: ExistingRow[],
  rowCount: number,
  skipped: Record<string, number>,
) {
  const existingByCode = new Map(existing.filter((row) => row.listingCode).map((row) => [row.listingCode as string, row]));
  const existingByKey = new Map(existing.map((row) => [row.sheetKey, row]));
  const reservedSlugs = new Set(existing.map((row) => row.slug));
  const now = new Date();
  const creates: Prisma.SheetListingCreateManyInput[] = [];
  const updates: Array<{ id: number; data: Prisma.SheetListingUpdateInput }> = [];
  const events: SheetSyncEventDraft[] = [];
  const marginEvents: SheetMarginAuditDraft[] = [];
  const marginBatchId = randomUUID();
  const engine = await getSheetPricingRule();
  const seenIds = new Set<number>();
  let unchanged = 0;
  let held = 0;

  for (const draft of drafts) {
    const current =
      (draft.listingCode ? existingByCode.get(draft.listingCode) : undefined) ?? existingByKey.get(draft.sheetKey);
    if (current) {
      if (seenIds.has(current.id)) continue;
      seenIds.add(current.id);
    }
    if (current?.manualHold) {
      held += 1;
      events.push(eventFor(draft, current.slug, "held", "manual_hold"));
      continue;
    }
    const contentHash = sheetListingContentHash(draft);
    const price = priceFields(current, draft, now);

    if (
      current &&
      current.contentHash === contentHash &&
      current.removedAt == null &&
      current.status === draft.status &&
      current.previousPrice === price.previousPrice
    ) {
      unchanged += 1;
      continue;
    }

    if (!current) {
      const slug = pickSlug(draft, reservedSlugs);
      reservedSlugs.add(slug);
      const margin = resolveSyncMargin(draft.listPrice, undefined, engine);
      creates.push(toCreate(draft, slug, contentHash, price, now, margin));
      events.push(eventFor(draft, slug, "created", "new_row"));
      const createdMargin = marginAudit(draft, slug, emptyMargin(draft.listPrice), margin, engine.enabled, "new_row");
      if (createdMargin) marginEvents.push(createdMargin);
      continue;
    }

    const nextSlug = nextExistingSlug(draft, current.slug, reservedSlugs);
    if (nextSlug !== current.slug) {
      reservedSlugs.delete(current.slug);
      reservedSlugs.add(nextSlug);
    }
    const margin = resolveSyncMargin(draft.listPrice, current, engine);
    updates.push({
      id: current.id,
      data: toUpdate(draft, nextSlug, contentHash, price, now, margin),
    });
    events.push(eventFor(draft, nextSlug, "updated", updateReason(current, price)));
    const previousMargin = {
      marginAmount: current.marginAmount,
      marginPercentBps: current.marginPercentBps,
      finalDisplayPrice: current.finalDisplayPrice ?? current.listPrice,
    };
    const updatedMargin = marginAudit(
      draft,
      nextSlug,
      previousMargin,
      margin,
      engine.enabled,
      current.marginOverride ? "custom_lock" : "sync_apply",
    );
    if (updatedMargin) marginEvents.push(updatedMargin);
  }

  const stale = existing.filter((row) => !seenIds.has(row.id) && row.removedAt == null && !row.manualHold);
  for (const row of stale) {
    events.push({
      listingCode: row.listingCode ?? "",
      sheetKey: row.sheetKey,
      slug: row.slug,
      action: "inactivated",
      reason: "left_sheet",
    });
  }

  const sync: SheetSyncResult = {
    ok: true,
    errorId: "",
    rows: rowCount,
    unique: drafts.length,
    created: creates.length,
    updated: updates.length,
    unchanged,
    held,
    inactivated: stale.length,
    skipped,
  };

  await applySheetListingSync({
    runId,
    creates,
    updates,
    staleIds: stale.map((row) => row.id),
    events,
    marginEvents,
    marginBatchId,
    counts: {
      rows: sync.rows,
      uniqueCount: sync.unique,
      createdCount: sync.created,
      updatedCount: sync.updated,
      unchangedCount: sync.unchanged,
      heldCount: sync.held,
      inactivatedCount: sync.inactivated,
      skippedJson: JSON.stringify(skipped),
    },
    now,
  });

  return { sync, seenIds };
}

function eventFor(
  draft: SheetListingDraft,
  slug: string,
  action: SheetSyncEventDraft["action"],
  reason: string,
): SheetSyncEventDraft {
  return {
    listingCode: draft.listingCode,
    sheetKey: draft.sheetKey,
    slug,
    action,
    reason,
  };
}

function updateReason(current: ExistingRow, price: ReturnType<typeof priceFields>) {
  if (current.removedAt) return "restored";
  if (price.priceDropped && price.priceChangedAt && current.priceChangedAt !== price.priceChangedAt) return "price_drop";
  if (price.updated && price.priceChangedAt && current.priceChangedAt !== price.priceChangedAt) return "price_change";
  return "content_changed";
}

function priceFields(existing: ExistingRow | undefined, draft: SheetListingDraft, now: Date) {
  const incomingPrice = draft.listPrice;
  const priorStored = existing?.listPrice ?? null;
  const priceChanged = existing != null && incomingPrice != null && priorStored != null && incomingPrice !== priorStored;
  const previousPrice = priceChanged ? priorStored : draft.previousPrice;
  const drop = dropAmount(previousPrice, incomingPrice);
  const priceDropped = draft.flaggedDrop || drop != null;
  const updated = draft.flaggedUpdated || (priceChanged && !priceDropped);
  return {
    previousPrice,
    drop,
    priceDropped,
    updated,
    priceChangedAt: priceChanged ? now : (existing?.priceChangedAt ?? null),
  };
}

function toCreate(
  draft: SheetListingDraft,
  slug: string,
  contentHash: string,
  price: ReturnType<typeof priceFields>,
  now: Date,
  margin: MarginFields & { marginOverride: boolean },
): Prisma.SheetListingCreateManyInput {
  return {
    sheetKey: draft.sheetKey,
    slug,
    listingCode: draft.listingCode || null,
    title: draft.title,
    address: draft.address,
    addressKey: draft.addressKey,
    city: draft.city || null,
    listPrice: draft.listPrice,
    previousPrice: price.previousPrice,
    drop: price.drop,
    priceChangedAt: price.priceChangedAt,
    priceDropped: price.priceDropped,
    updated: price.updated,
    arv: draft.arv,
    beds: draft.beds,
    baths: draft.baths || null,
    sqft: draft.sqft,
    propertyType: draft.propertyType || null,
    status: draft.status,
    description: draft.description || null,
    photos: JSON.stringify(draft.photos),
    galleries: JSON.stringify(draft.galleries),
    coverPhoto: draft.coverPhoto || null,
    driveFolderUrl: draft.driveFolderUrl || null,
    hoa: draft.hoa || null,
    ac: draft.ac || null,
    roof: draft.roof || null,
    waterHeater: draft.waterHeater || null,
    titleCompany: draft.titleCompany || null,
    sourceMessageId: draft.sourceMessageId || null,
    listedAt: draft.listedAt || null,
    sheetUpdatedAt: draft.sheetUpdatedAt || null,
    priceHistory: draft.priceHistory || null,
    updateNotes: draft.updateNotes || null,
    metaTitle: draft.metaTitle || null,
    metaDescription: draft.metaDescription || null,
    metaKeywords: draft.metaKeywords || null,
    localTargetArea: draft.localTargetArea || null,
    canonicalUrl: draft.canonicalUrl || null,
    schemaJsonLd: draft.schemaJsonLd || null,
    latitude: draft.latitude,
    longitude: draft.longitude,
    sheetSyncStatus: draft.sheetSyncStatus || null,
    sheetSyncedAt: draft.sheetSyncedAt || null,
    sheetRow: draft.sheetRow,
    contentHash,
    marginAmount: margin.marginAmount,
    marginPercentBps: margin.marginPercentBps,
    finalDisplayPrice: margin.finalDisplayPrice,
    marginOverride: margin.marginOverride,
    removedAt: null,
    syncedAt: now,
  };
}

function toUpdate(
  draft: SheetListingDraft,
  slug: string,
  contentHash: string,
  price: ReturnType<typeof priceFields>,
  now: Date,
  margin: MarginFields & { marginOverride: boolean },
): Prisma.SheetListingUpdateInput {
  return {
    sheetKey: draft.sheetKey,
    slug,
    listingCode: draft.listingCode || null,
    title: draft.title,
    address: draft.address,
    addressKey: draft.addressKey,
    city: draft.city || null,
    listPrice: draft.listPrice,
    previousPrice: price.previousPrice,
    drop: price.drop,
    priceChangedAt: price.priceChangedAt,
    priceDropped: price.priceDropped,
    updated: price.updated,
    arv: draft.arv,
    beds: draft.beds,
    baths: draft.baths || null,
    sqft: draft.sqft,
    propertyType: draft.propertyType || null,
    status: draft.status,
    description: draft.description || null,
    photos: JSON.stringify(draft.photos),
    galleries: JSON.stringify(draft.galleries),
    coverPhoto: draft.coverPhoto || null,
    driveFolderUrl: draft.driveFolderUrl || null,
    hoa: draft.hoa || null,
    ac: draft.ac || null,
    roof: draft.roof || null,
    waterHeater: draft.waterHeater || null,
    titleCompany: draft.titleCompany || null,
    sourceMessageId: draft.sourceMessageId || null,
    listedAt: draft.listedAt || null,
    sheetUpdatedAt: draft.sheetUpdatedAt || null,
    priceHistory: draft.priceHistory || null,
    updateNotes: draft.updateNotes || null,
    metaTitle: draft.metaTitle || null,
    metaDescription: draft.metaDescription || null,
    metaKeywords: draft.metaKeywords || null,
    localTargetArea: draft.localTargetArea || null,
    canonicalUrl: draft.canonicalUrl || null,
    schemaJsonLd: draft.schemaJsonLd || null,
    latitude: draft.latitude,
    longitude: draft.longitude,
    sheetSyncStatus: draft.sheetSyncStatus || null,
    sheetSyncedAt: draft.sheetSyncedAt || null,
    sheetRow: draft.sheetRow,
    contentHash,
    marginAmount: margin.marginAmount,
    marginPercentBps: margin.marginPercentBps,
    finalDisplayPrice: margin.finalDisplayPrice,
    marginOverride: margin.marginOverride,
    removedAt: null,
    syncedAt: now,
  };
}

function pickSlug(draft: SheetListingDraft, reserved: Set<string>) {
  if (draft.sheetSlug && !reserved.has(draft.sheetSlug)) return draft.sheetSlug;
  if (draft.listingCode) {
    const fromCode = draft.listingCode.toLowerCase();
    if (!reserved.has(fromCode)) return fromCode;
  }
  return uniqueSlug(draft.slugBase, reserved);
}

function nextExistingSlug(draft: SheetListingDraft, current: string, reserved: Set<string>) {
  if (draft.sheetSlug && (draft.sheetSlug === current || !reserved.has(draft.sheetSlug))) return draft.sheetSlug;
  return current;
}

function uniqueSlug(base: string, reserved: Set<string>) {
  const root = base || "home";
  if (!reserved.has(root)) return root;
  let n = 2;
  while (reserved.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}

function emptyMargin(listPrice: number | null): MarginFields {
  return { marginAmount: null, marginPercentBps: null, finalDisplayPrice: listPrice };
}

function marginAudit(
  draft: SheetListingDraft,
  slug: string,
  previous: MarginFields,
  next: MarginFields & { marginOverride: boolean },
  engineOn: boolean,
  reason: string,
): SheetMarginAuditDraft | null {
  if (sameMargin(previous, next)) return null;
  return {
    slug,
    listingCode: draft.listingCode,
    action: next.marginOverride ? "sync_recompute" : next.marginAmount == null ? "sync_clear" : "sync_set",
    mode: next.marginPercentBps != null ? "percent" : next.marginAmount != null ? "flat" : "clear",
    previousAmount: previous.marginAmount,
    nextAmount: next.marginAmount,
    previousPercentBps: previous.marginPercentBps,
    nextPercentBps: next.marginPercentBps,
    listPrice: draft.listPrice,
    previousDisplay: previous.finalDisplayPrice,
    nextDisplay: next.finalDisplayPrice,
    reason: engineOn && !next.marginOverride ? `${reason};engine` : reason,
  };
}

function refreshSheetListingPages(slugs: string[]) {
  try {
    refreshSheetListingViews(slugs);
  } catch (error) {
    console.error("[SHEET_LISTINGS_SYNC]", {
      skipped: "revalidate_failed",
      name: error instanceof Error ? error.name : "Error",
    });
  }
}
