import "server-only";

import type { Prisma, SheetListing } from "@prisma/client";
import { dropAmount, formatMoney } from "@/lib/listings/money";
import { propertyTypeLabel } from "@/lib/listings/catalog";
import { normalizeAddress } from "@/lib/listings/address";
import { requireAdmin } from "@/lib/admin/auth";
import { googleSheetsConfigured } from "@/lib/gdoc-listings/google";
import type { SheetListingStatus } from "@/lib/gdoc-listings/status";
import { randomUUID } from "node:crypto";
import { SheetSyncError } from "@/lib/gdoc-listings/errors";
import type { AdminActor } from "@/lib/dal/users";
import {
  applyMarginRule,
  engineMatchReason,
  engineMatchRule,
  matchPricingEngine,
  MAX_MARGIN_BATCH,
  publicDisplayPrice,
  recomputeStoredMargin,
  sameMargin,
  type GlobalPricingRule,
  type MarginRule,
} from "@/lib/gdoc-listings/margin";
import type {
  SheetGalleryGroup,
  SheetListingAdminDetail,
  SheetListingAdminFilters,
  SheetListingAdminPlaces,
  SheetListingAdminRow,
  SheetListingAdminSummary,
  SheetListingCardView,
  SheetListingMarginEventView,
  SheetListingSpec,
  SheetListingView,
  SheetMarginAuditDraft,
  SheetSyncEventDraft,
  SheetSyncEventView,
  SheetSyncRunView,
  SheetSyncTrigger,
} from "@/lib/gdoc-listings/types";
import { getDb } from "@/src/prisma/db";

const PUBLIC_STATUS = "active";

export async function listPublicSheetListings(): Promise<SheetListingView[]> {
  const rows = await getDb().sheetListing.findMany({
    where: { status: PUBLIC_STATUS, removedAt: null },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });
  return rows.map(toView);
}

const catalogCardSelect = {
  slug: true,
  title: true,
  address: true,
  city: true,
  listPrice: true,
  finalDisplayPrice: true,
  marginAmount: true,
  arv: true,
  beds: true,
  baths: true,
  sqft: true,
  propertyType: true,
  coverPhoto: true,
  photos: true,
  status: true,
  previousPrice: true,
  drop: true,
  priceDropped: true,
  updated: true,
} as const;

export async function listPublicSheetListingCards(): Promise<SheetListingCardView[]> {
  const rows = await getDb().sheetListing.findMany({
    where: { status: PUBLIC_STATUS, removedAt: null },
    select: catalogCardSelect,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });
  return rows.map(toCardFromRow);
}

export async function getPublicSheetListingById(id: string): Promise<SheetListingView | null> {
  const needle = id.trim();
  if (!needle) return null;

  const row = await getDb().sheetListing.findFirst({
    where: {
      status: PUBLIC_STATUS,
      removedAt: null,
      OR: [
        { slug: needle },
        { listingCode: needle.toUpperCase() },
        { sourceMessageId: needle },
        { sheetKey: normalizeAddress(needle) },
      ],
    },
  });
  return row ? toView(row) : null;
}

const SIMILAR_LIMIT = 3;
const SIMILAR_CANDIDATES = 24;
const SIMILAR_PRICE_RATIO = 0.2;
const SIMILAR_PRICE_FLOOR = 100_000;

export type SheetListingSimilarSeed = {
  id: string;
  listingCode: string;
  city: string;
  localTargetArea: string;
  displayPrice: number | null;
  listPrice: number | null;
  propertyType: string;
};

export async function listPublicSimilarSheetListings(
  seed: SheetListingSimilarSeed,
): Promise<SheetListingCardView[]> {
  const slug = seed.id.trim();
  if (!slug) return [];

  const city = seed.city.trim();
  const area = seed.localTargetArea.trim();
  const price = seed.displayPrice ?? seed.listPrice;
  const band = price != null ? similarPriceBand(price) : null;
  const locationOr: Prisma.SheetListingWhereInput[] = [];
  if (city) locationOr.push({ city: { equals: city, mode: "insensitive" } });
  if (area) locationOr.push({ localTargetArea: { equals: area, mode: "insensitive" } });
  const matchOr: Prisma.SheetListingWhereInput[] = [...locationOr];
  if (band) {
    matchOr.push({ finalDisplayPrice: { gte: band.min, lte: band.max } });
    matchOr.push({
      AND: [{ finalDisplayPrice: null }, { listPrice: { gte: band.min, lte: band.max } }],
    });
  }
  if (matchOr.length === 0) return [];

  const notSelf: Prisma.SheetListingWhereInput[] = [{ slug }];
  const listingCode = seed.listingCode.trim().toUpperCase();
  if (listingCode) notSelf.push({ listingCode });

  const rows = await getDb().sheetListing.findMany({
    where: {
      status: PUBLIC_STATUS,
      removedAt: null,
      NOT: notSelf.length === 1 ? notSelf[0] : { OR: notSelf },
      OR: matchOr,
    },
    select: similarCardSelect,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: SIMILAR_CANDIDATES,
  });

  return rankSimilarSheetListings(rows, {
    slug,
    listingCode,
    city,
    area,
    price,
    propertyType: seed.propertyType.trim().toLowerCase(),
    band,
  }).slice(0, SIMILAR_LIMIT);
}

export async function listSheetListingSlugs(): Promise<string[]> {
  const rows = await getDb().sheetListing.findMany({
    where: { status: PUBLIC_STATUS, removedAt: null },
    select: { slug: true, listingCode: true },
    orderBy: { id: "asc" },
  });
  return rows.flatMap((row) => [row.slug, ...(row.listingCode ? [row.listingCode] : [])]);
}

export async function listSheetListingSitemapEntries(): Promise<Array<{ slug: string; updatedAt: string }>> {
  const rows = await getDb().sheetListing.findMany({
    where: { status: PUBLIC_STATUS, removedAt: null },
    select: { slug: true, updatedAt: true },
    orderBy: { id: "asc" },
  });
  return rows.map((row) => ({ slug: row.slug, updatedAt: row.updatedAt.toISOString() }));
}

export async function getSheetListingAdminSummary(): Promise<SheetListingAdminSummary> {
  await requireAdmin();
  const db = getDb();
  const [total, active, inactive, sold, underContract, withMargin, customMargins, latest] = await Promise.all([
    db.sheetListing.count(),
    db.sheetListing.count({ where: { status: PUBLIC_STATUS, removedAt: null } }),
    db.sheetListing.count({ where: { OR: [{ status: "inactive" }, { removedAt: { not: null } }] } }),
    db.sheetListing.count({ where: { status: "sold", removedAt: null } }),
    db.sheetListing.count({ where: { status: "under_contract", removedAt: null } }),
    db.sheetListing.count({ where: { marginAmount: { not: null } } }),
    db.sheetListing.count({ where: { marginOverride: true } }),
    db.sheetListing.findFirst({
      select: { syncedAt: true },
      orderBy: { syncedAt: "desc" },
    }),
  ]);
  return {
    total,
    active,
    inactive,
    sold,
    underContract,
    hidden: Math.max(0, total - active),
    withMargin,
    customMargins,
    lastSyncedAt: latest?.syncedAt.toISOString() ?? null,
    sheetsReady: googleSheetsConfigured(),
  };
}

export async function listAdminSheetListingPlaces(): Promise<SheetListingAdminPlaces> {
  await requireAdmin();
  const rows = await getDb().sheetListing.findMany({
    select: { city: true, localTargetArea: true },
  });
  const cities = uniqueSorted(rows.map((row) => row.city));
  const regions = uniqueSorted(rows.map((row) => row.localTargetArea));
  return { cities, regions };
}

export async function listAdminSheetListings(filters?: SheetListingAdminFilters): Promise<SheetListingAdminRow[]> {
  await requireAdmin();
  const rows = await getDb().sheetListing.findMany({
    where: adminListWhere(filters),
    orderBy: [{ syncedAt: "desc" }, { id: "desc" }],
    select: {
      slug: true,
      listingCode: true,
      title: true,
      address: true,
      city: true,
      localTargetArea: true,
      listPrice: true,
      marginAmount: true,
      marginPercentBps: true,
      marginOverride: true,
      finalDisplayPrice: true,
      previousPrice: true,
      status: true,
      removedAt: true,
      manualHold: true,
      syncedAt: true,
      priceDropped: true,
      updated: true,
    },
  });
  return rows.map(toAdminRow);
}

export async function getAdminSheetListingById(id: string): Promise<SheetListingAdminDetail | null> {
  await requireAdmin();
  const row = await findAdminSheetListing(id);
  if (!row) return null;
  return {
    ...toAdminRow(row),
    arv: row.arv,
    beds: row.beds,
    baths: row.baths ?? "",
    sqft: row.sqft,
    propertyType: row.propertyType ?? "",
    description: row.description ?? "",
    hoa: row.hoa ?? "",
    ac: row.ac ?? "",
    roof: row.roof ?? "",
    waterHeater: row.waterHeater ?? "",
    titleCompany: row.titleCompany ?? "",
    listedAt: row.listedAt ?? "",
    sheetUpdatedAt: row.sheetUpdatedAt ?? "",
    priceHistory: row.priceHistory ?? "",
    updateNotes: row.updateNotes ?? "",
    metaTitle: row.metaTitle ?? "",
    metaDescription: row.metaDescription ?? "",
    metaKeywords: row.metaKeywords ?? "",
    localTargetArea: row.localTargetArea ?? "",
    canonicalUrl: row.canonicalUrl ?? "",
    schemaJsonLd: row.schemaJsonLd ?? "",
    latitude: row.latitude,
    longitude: row.longitude,
    sheetSyncStatus: row.sheetSyncStatus ?? "",
    removedAt: row.removedAt?.toISOString() ?? null,
  };
}

export async function updateAdminSheetListing(
  slug: string,
  input: {
    title: string;
    address: string;
    city: string;
    listPrice: number | null;
    arv: number | null;
    beds: number | null;
    baths: string;
    sqft: number | null;
    propertyType: string;
    status: SheetListingStatus;
    description: string;
    hoa: string;
    ac: string;
    roof: string;
    waterHeater: string;
    titleCompany: string;
    listingCode: string;
    listedAt: string;
    sheetUpdatedAt: string;
    priceHistory: string;
    updateNotes: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    localTargetArea: string;
    canonicalUrl: string;
    schemaJsonLd: string;
    latitude: number | null;
    longitude: number | null;
    manualHold: boolean;
  },
): Promise<{ ok: true; slug: string } | { ok: false; message: string }> {
  await requireAdmin();
  const existing = await findAdminSheetListing(slug);
  if (!existing) return { ok: false, message: "That sheet home is not on this desk." };

  const nextKey = normalizeAddress(input.address);
  if (!nextKey) return { ok: false, message: "Add a full street address." };
  if (nextKey !== existing.sheetKey) {
    const clash = await getDb().sheetListing.findUnique({
      where: { sheetKey: nextKey },
      select: { id: true },
    });
    if (clash && clash.id !== existing.id) {
      return { ok: false, message: "Another sheet home already uses that address." };
    }
  }
  if (input.listingCode && input.listingCode !== (existing.listingCode ?? "")) {
    const clash = await getDb().sheetListing.findUnique({
      where: { listingCode: input.listingCode },
      select: { id: true },
    });
    if (clash && clash.id !== existing.id) {
      return { ok: false, message: "Another sheet home already uses that listing ID." };
    }
  }

  const now = new Date();
  const priceChanged = existing.listPrice != null && input.listPrice != null && existing.listPrice !== input.listPrice;
  const previousPrice = priceChanged ? existing.listPrice : existing.previousPrice;
  const drop = dropAmount(previousPrice, input.listPrice);
  const removedAt = input.status === "inactive" ? (existing.removedAt ?? now) : null;
  const margin = recomputeStoredMargin(input.listPrice, existing.marginAmount, existing.marginPercentBps);

  await getDb().sheetListing.update({
    where: { id: existing.id },
    data: {
      sheetKey: nextKey,
      addressKey: nextKey,
      title: input.title,
      address: input.address,
      city: input.city || null,
      listPrice: input.listPrice,
      marginAmount: margin.marginAmount,
      marginPercentBps: margin.marginPercentBps,
      finalDisplayPrice: margin.finalDisplayPrice,
      previousPrice,
      drop,
      priceChangedAt: priceChanged ? now : existing.priceChangedAt,
      priceDropped: drop != null,
      updated: priceChanged && drop == null ? true : existing.updated,
      arv: input.arv,
      beds: input.beds,
      baths: input.baths || null,
      sqft: input.sqft,
      propertyType: input.propertyType || null,
      status: input.status,
      description: input.description || null,
      hoa: input.hoa || null,
      ac: input.ac || null,
      roof: input.roof || null,
      waterHeater: input.waterHeater || null,
      titleCompany: input.titleCompany || null,
      listingCode: input.listingCode || null,
      listedAt: input.listedAt || null,
      sheetUpdatedAt: input.sheetUpdatedAt || null,
      priceHistory: input.priceHistory || null,
      updateNotes: input.updateNotes || null,
      metaTitle: input.metaTitle || null,
      metaDescription: input.metaDescription || null,
      metaKeywords: input.metaKeywords || null,
      localTargetArea: input.localTargetArea || null,
      canonicalUrl: input.canonicalUrl || null,
      schemaJsonLd: input.schemaJsonLd || null,
      latitude: input.latitude,
      longitude: input.longitude,
      manualHold: input.manualHold,
      removedAt,
    },
  });
  return { ok: true, slug: existing.slug };
}

export async function inactivateAdminSheetListing(slug: string): Promise<{ ok: true; slug: string } | { ok: false; message: string }> {
  await requireAdmin();
  const existing = await findAdminSheetListing(slug);
  if (!existing) return { ok: false, message: "That sheet home is not on this desk." };
  await getDb().sheetListing.update({
    where: { id: existing.id },
    data: { status: "inactive", removedAt: existing.removedAt ?? new Date() },
  });
  return { ok: true, slug: existing.slug };
}

export async function restoreAdminSheetListing(slug: string): Promise<{ ok: true; slug: string } | { ok: false; message: string }> {
  await requireAdmin();
  const existing = await findAdminSheetListing(slug);
  if (!existing) return { ok: false, message: "That sheet home is not on this desk." };
  await getDb().sheetListing.update({
    where: { id: existing.id },
    data: { status: "active", removedAt: null },
  });
  return { ok: true, slug: existing.slug };
}

export async function deleteAdminSheetListing(slug: string): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();
  const existing = await findAdminSheetListing(slug);
  if (!existing) return { ok: false, message: "That sheet home is not on this desk." };
  await getDb().sheetListing.delete({ where: { id: existing.id } });
  return { ok: true };
}

export async function applySheetListingMargins(input: {
  actor: AdminActor;
  scope: "one" | "selected" | "filtered";
  slugs: string[];
  filters: SheetListingAdminFilters;
  rule: MarginRule;
  override?: boolean;
  engine?: GlobalPricingRule;
}): Promise<{ ok: true; updated: number; skipped: number; slugs: string[] } | { ok: false; message: string }> {
  await requireAdmin();
  const rows = await loadMarginTargets(input);
  if (!rows) return { ok: false, message: "Those sheet homes are not on this desk." };
  if (rows.length === 0) return { ok: false, message: "No sheet homes match that selection." };
  if (rows.length > MAX_MARGIN_BATCH) {
    return { ok: false, message: `Select up to ${MAX_MARGIN_BATCH} homes at a time.` };
  }

  const now = new Date();
  const batchId = randomUUID();
  const override = input.override ?? true;
  let updated = 0;
  let skipped = 0;
  const changed: string[] = [];

  await getDb().$transaction(
    async (tx) => {
      for (const row of rows) {
        const current = {
          marginAmount: row.marginAmount,
          marginPercentBps: row.marginPercentBps,
          finalDisplayPrice: row.finalDisplayPrice ?? row.listPrice,
        };
        const match = !override && input.engine ? matchPricingEngine(row.listPrice, input.engine) : null;
        const rule =
          match == null
            ? input.rule
            : match.kind === "off"
              ? { type: "clear" as const }
              : engineMatchRule(match);
        if (!rule) {
          skipped += 1;
          continue;
        }
        const applied = applyMarginRule(row.listPrice, rule);
        if (applied.skipped && override) {
          skipped += 1;
          continue;
        }
        const next = applied.skipped
          ? { marginAmount: null, marginPercentBps: null, finalDisplayPrice: row.listPrice }
          : applied;
        if (sameMargin(current, next) && row.marginOverride === override) {
          skipped += 1;
          continue;
        }
        const action = override
          ? marginAuditAction(input.scope, rule.type === "clear")
          : rule.type === "clear"
            ? "follow_clear"
            : "follow_set";
        await tx.sheetListing.update({
          where: { id: row.id },
          data: {
            marginAmount: next.marginAmount,
            marginPercentBps: next.marginPercentBps,
            finalDisplayPrice: next.finalDisplayPrice,
            marginOverride: override,
            marginUpdatedAt: now,
            marginUpdatedById: input.actor.id,
          },
        });
        await tx.sheetListingMarginEvent.create({
          data: {
            listingId: row.id,
            listingCode: row.listingCode,
            slug: row.slug,
            batchId,
            actorId: input.actor.id,
            actorEmail: input.actor.email,
            action,
            mode: rule.type,
            previousAmount: row.marginAmount,
            nextAmount: next.marginAmount,
            previousPercentBps: row.marginPercentBps,
            nextPercentBps: next.marginPercentBps,
            listPrice: row.listPrice,
            previousDisplay: current.finalDisplayPrice,
            nextDisplay: next.finalDisplayPrice,
            reason: override
              ? input.scope === "filtered"
                ? "filter_match"
                : input.scope === "selected"
                  ? "bulk_selected"
                  : "single"
              : `follow_global;${match ? engineMatchReason(match) : "engine"}`,
          },
        });
        updated += 1;
        changed.push(row.slug);
      }
    },
    { timeout: 20_000, maxWait: 5_000 },
  );

  if (updated === 0) {
    return {
      ok: false,
      message: skipped
        ? override
          ? "Those homes already have that markup."
          : "Those homes already follow the global rule."
        : "No sheet homes were changed.",
    };
  }
  return { ok: true, updated, skipped, slugs: changed };
}

export async function listSheetListingMarginEvents(id: string): Promise<SheetListingMarginEventView[]> {
  await requireAdmin();
  const needle = id.trim();
  if (!needle) return [];
  const rows = await getDb().sheetListingMarginEvent.findMany({
    where: { OR: [{ slug: needle }, { listingCode: needle.toUpperCase() }] },
    orderBy: { id: "desc" },
    take: 12,
  });
  return rows.map((row) => ({
    slug: row.slug,
    listingCode: row.listingCode ?? "",
    actorEmail: row.actorEmail,
    action: row.action,
    mode: row.mode,
    previousAmount: row.previousAmount,
    nextAmount: row.nextAmount,
    previousPercentBps: row.previousPercentBps,
    nextPercentBps: row.nextPercentBps,
    listPrice: row.listPrice,
    previousDisplay: row.previousDisplay,
    nextDisplay: row.nextDisplay,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function listSheetListingRecords() {
  return getDb().sheetListing.findMany({
    select: {
      id: true,
      sheetKey: true,
      slug: true,
      listingCode: true,
      listPrice: true,
      marginAmount: true,
      marginPercentBps: true,
      marginOverride: true,
      finalDisplayPrice: true,
      previousPrice: true,
      priceChangedAt: true,
      contentHash: true,
      status: true,
      removedAt: true,
      manualHold: true,
    },
  });
}

const SYNC_LOCK_STALE_MS = 120_000;

export async function beginSheetSyncRun(trigger: SheetSyncTrigger) {
  const db = getDb();
  const holder = randomUUID();
  await db.sheetSyncLock.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
  const stale = new Date(Date.now() - SYNC_LOCK_STALE_MS);
  const locked = await db.sheetSyncLock.updateMany({
    where: {
      id: 1,
      OR: [{ holder: null }, { lockedAt: null }, { lockedAt: { lt: stale } }],
    },
    data: { holder, lockedAt: new Date() },
  });
  if (locked.count !== 1) {
    await db.sheetSyncRun.create({
      data: {
        errorId: randomUUID(),
        trigger,
        status: "skipped",
        error: "busy",
        finishedAt: new Date(),
      },
    });
    throw new SheetSyncError("busy", "A sheet copy is already running.");
  }

  const run = await db.sheetSyncRun.create({
    data: { errorId: holder, trigger, status: "running" },
    select: { id: true, errorId: true },
  });
  return run;
}

export async function finishSheetSyncRun(
  runId: number,
  status: "failed" | "skipped",
  error: string,
) {
  await getDb().sheetSyncRun.update({
    where: { id: runId },
    data: { status, error, finishedAt: new Date() },
  });
}

export async function releaseSheetSyncLock(holder: string) {
  await getDb().sheetSyncLock.updateMany({
    where: { id: 1, holder },
    data: { holder: null },
  });
}

export async function applySheetListingSync(input: {
  runId: number;
  creates: Prisma.SheetListingCreateManyInput[];
  updates: Array<{ id: number; data: Prisma.SheetListingUpdateInput }>;
  staleIds: number[];
  events: SheetSyncEventDraft[];
  marginEvents?: SheetMarginAuditDraft[];
  marginBatchId?: string;
  counts: {
    rows: number;
    uniqueCount: number;
    createdCount: number;
    updatedCount: number;
    unchangedCount: number;
    heldCount: number;
    inactivatedCount: number;
    skippedJson: string;
  };
  now: Date;
}) {
  const db = getDb();
  await db.$transaction(
    async (tx) => {
      for (const data of input.creates) {
        await tx.sheetListing.create({ data });
      }
      for (const update of input.updates) {
        await tx.sheetListing.update({
          where: { id: update.id },
          data: update.data,
        });
      }
      if (input.staleIds.length > 0) {
        await tx.sheetListing.updateMany({
          where: { id: { in: input.staleIds }, removedAt: null },
          data: { status: "inactive", removedAt: input.now },
        });
      }
      if (input.events.length > 0) {
        await tx.sheetSyncEvent.createMany({
          data: input.events.map((event) => ({
            runId: input.runId,
            listingCode: event.listingCode || null,
            sheetKey: event.sheetKey || null,
            slug: event.slug || null,
            action: event.action,
            reason: event.reason,
          })),
        });
      }
      if (input.marginEvents && input.marginEvents.length > 0) {
        const slugs = [...new Set(input.marginEvents.map((event) => event.slug))];
        const homes = await tx.sheetListing.findMany({
          where: { slug: { in: slugs } },
          select: { id: true, slug: true },
        });
        const idBySlug = new Map(homes.map((home) => [home.slug, home.id]));
        const batchId = input.marginBatchId || `sync-${input.runId}`;
        await tx.sheetListingMarginEvent.createMany({
          data: input.marginEvents.flatMap((event) => {
            const listingId = idBySlug.get(event.slug);
            if (!listingId) return [];
            return [
              {
                listingId,
                listingCode: event.listingCode || null,
                slug: event.slug,
                batchId,
                actorEmail: "sheet-sync",
                action: event.action,
                mode: event.mode,
                previousAmount: event.previousAmount,
                nextAmount: event.nextAmount,
                previousPercentBps: event.previousPercentBps,
                nextPercentBps: event.nextPercentBps,
                listPrice: event.listPrice,
                previousDisplay: event.previousDisplay,
                nextDisplay: event.nextDisplay,
                reason: event.reason,
              },
            ];
          }),
        });
      }
      await tx.sheetSyncRun.update({
        where: { id: input.runId },
        data: {
          status: "ok",
          finishedAt: input.now,
          rows: input.counts.rows,
          uniqueCount: input.counts.uniqueCount,
          createdCount: input.counts.createdCount,
          updatedCount: input.counts.updatedCount,
          unchangedCount: input.counts.unchangedCount,
          heldCount: input.counts.heldCount,
          inactivatedCount: input.counts.inactivatedCount,
          skippedJson: input.counts.skippedJson,
          error: null,
        },
      });
    },
    { maxWait: 5_000, timeout: 40_000 },
  );
}

export async function listRecentSheetSyncRuns(limit = 8): Promise<SheetSyncRunView[]> {
  await requireAdmin();
  const rows = await getDb().sheetSyncRun.findMany({
    orderBy: { startedAt: "desc" },
    take: Math.min(20, Math.max(1, limit)),
    include: { events: { orderBy: { id: "desc" }, take: 12 } },
  });
  return rows.map(toSyncRunView);
}

export async function listSheetSyncEventsForListing(id: string): Promise<SheetSyncEventView[]> {
  await requireAdmin();
  const needle = id.trim();
  if (!needle) return [];
  const rows = await getDb().sheetSyncEvent.findMany({
    where: {
      OR: [{ slug: needle }, { listingCode: needle.toUpperCase() }],
    },
    orderBy: { id: "desc" },
    take: 12,
  });
  return rows.map(toSyncEventView);
}

function toSyncRunView(row: {
  errorId: string;
  trigger: string;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
  rows: number;
  uniqueCount: number;
  createdCount: number;
  updatedCount: number;
  unchangedCount: number;
  heldCount: number;
  inactivatedCount: number;
  skippedJson: string | null;
  error: string | null;
  events: Array<{ listingCode: string | null; slug: string | null; action: string; reason: string; createdAt: Date }>;
}): SheetSyncRunView {
  let skipped: Record<string, number> = {};
  if (row.skippedJson) {
    try {
      const parsed = JSON.parse(row.skippedJson) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        skipped = Object.fromEntries(
          Object.entries(parsed as Record<string, unknown>).filter(([, value]) => typeof value === "number"),
        ) as Record<string, number>;
      }
    } catch {
      skipped = {};
    }
  }
  return {
    errorId: row.errorId,
    trigger: row.trigger,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() ?? null,
    rows: row.rows,
    uniqueCount: row.uniqueCount,
    createdCount: row.createdCount,
    updatedCount: row.updatedCount,
    unchangedCount: row.unchangedCount,
    heldCount: row.heldCount,
    inactivatedCount: row.inactivatedCount,
    skipped,
    error: row.error ?? "",
    events: row.events.map(toSyncEventView),
  };
}

function toSyncEventView(row: {
  listingCode: string | null;
  slug: string | null;
  action: string;
  reason: string;
  createdAt: Date;
}): SheetSyncEventView {
  return {
    listingCode: row.listingCode ?? "",
    slug: row.slug ?? "",
    action: row.action,
    reason: row.reason,
    createdAt: row.createdAt.toISOString(),
  };
}

function adminListWhere(filters?: SheetListingAdminFilters): Prisma.SheetListingWhereInput {
  if (!filters) return {};
  const clauses: Prisma.SheetListingWhereInput[] = [];
  if (filters.view === "active") {
    clauses.push({ status: PUBLIC_STATUS, removedAt: null });
  } else if (filters.view === "inactive") {
    clauses.push({ OR: [{ status: "inactive" }, { removedAt: { not: null } }] });
  } else if (filters.view === "sold") {
    clauses.push({ status: "sold", removedAt: null });
  } else if (filters.view === "under_contract") {
    clauses.push({ status: "under_contract", removedAt: null });
  }
  if (filters.query) {
    clauses.push({
      OR: [
        { title: { contains: filters.query, mode: "insensitive" } },
        { address: { contains: filters.query, mode: "insensitive" } },
        { city: { contains: filters.query, mode: "insensitive" } },
        { listingCode: { contains: filters.query, mode: "insensitive" } },
        { localTargetArea: { contains: filters.query, mode: "insensitive" } },
      ],
    });
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    clauses.push({
      listPrice: {
        ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
      },
    });
  }
  if (filters.city?.trim()) {
    clauses.push({ city: { equals: filters.city.trim(), mode: "insensitive" } });
  }
  if (filters.region?.trim()) {
    clauses.push({ localTargetArea: { equals: filters.region.trim(), mode: "insensitive" } });
  }
  if (filters.margin === "with") {
    clauses.push({ marginAmount: { not: null } });
  } else if (filters.margin === "without") {
    clauses.push({ marginAmount: null });
  }
  if (clauses.length === 0) return {};
  return { AND: clauses };
}

async function loadMarginTargets(input: {
  scope: "one" | "selected" | "filtered";
  slugs: string[];
  filters: SheetListingAdminFilters;
}) {
  const select = {
    id: true,
    slug: true,
    listingCode: true,
    listPrice: true,
    marginAmount: true,
    marginPercentBps: true,
    marginOverride: true,
    finalDisplayPrice: true,
  } as const;
  if (input.scope === "filtered") {
    return getDb().sheetListing.findMany({
      where: adminListWhere(input.filters),
      select,
      orderBy: { id: "asc" },
    });
  }
  const needles = uniqueSorted(input.slugs.map((slug) => slug.trim()).filter(Boolean));
  if (needles.length === 0) return [];
  if (input.scope === "one" && needles.length !== 1) return null;
  const rows = await getDb().sheetListing.findMany({
    where: {
      OR: needles.flatMap((needle) => [{ slug: needle }, { listingCode: needle.toUpperCase() }]),
    },
    select,
  });
  const seen = new Set<number>();
  return rows.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

function marginAuditAction(scope: "one" | "selected" | "filtered", clear: boolean) {
  if (scope === "filtered") return clear ? "filter_clear" : "filter_set";
  if (scope === "selected") return clear ? "bulk_clear" : "bulk_set";
  return clear ? "clear" : "set";
}

function uniqueSorted(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const items: string[] = [];
  for (const value of values) {
    const next = value?.trim();
    if (!next) continue;
    const key = next.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(next);
  }
  return items.sort((left, right) => left.localeCompare(right));
}

async function findAdminSheetListing(id: string) {
  const needle = id.trim();
  if (!needle) return null;
  return getDb().sheetListing.findFirst({
    where: { OR: [{ slug: needle }, { listingCode: needle.toUpperCase() }, { sheetKey: normalizeAddress(needle) }] },
  });
}

function toAdminRow(row: {
  slug: string;
  listingCode?: string | null;
  title: string;
  address: string;
  city: string | null;
  localTargetArea?: string | null;
  listPrice: number | null;
  marginAmount?: number | null;
  marginPercentBps?: number | null;
  marginOverride?: boolean;
  finalDisplayPrice?: number | null;
  previousPrice: number | null;
  status: string;
  removedAt: Date | null;
  manualHold: boolean;
  syncedAt: Date;
  priceDropped: boolean;
  updated: boolean;
}): SheetListingAdminRow {
  const marginAmount = row.marginAmount ?? null;
  const marginPercentBps = row.marginPercentBps ?? null;
  return {
    id: row.slug,
    listingCode: row.listingCode ?? "",
    title: row.title,
    address: row.address,
    city: row.city ?? "",
    region: row.localTargetArea ?? "",
    listPrice: row.listPrice,
    marginAmount,
    marginPercentBps,
    marginOverride: row.marginOverride ?? false,
    finalDisplayPrice: publicDisplayPrice(row.listPrice, row.finalDisplayPrice ?? null, marginAmount),
    previousPrice: row.previousPrice,
    status: row.status,
    removed: row.removedAt != null,
    held: row.manualHold,
    syncedAt: row.syncedAt.toISOString(),
    priceDropped: row.priceDropped,
    updated: row.updated,
  };
}

export function toSheetListingCard(listing: SheetListingView): SheetListingCardView {
  return {
    id: listing.id,
    title: listing.title,
    address: listing.address,
    city: listing.city,
    listPrice: listing.listPrice,
    displayPrice: listing.displayPrice,
    marginAmount: listing.marginAmount,
    arv: listing.arv,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft,
    propertyType: listing.propertyType,
    coverPhoto: listing.coverPhoto,
    status: listing.status,
    previousPrice: listing.previousPrice,
    drop: listing.drop,
    priceDropped: listing.priceDropped,
    updated: listing.updated,
  };
}

const similarCardSelect = {
  slug: true,
  title: true,
  address: true,
  city: true,
  listPrice: true,
  finalDisplayPrice: true,
  marginAmount: true,
  arv: true,
  beds: true,
  baths: true,
  sqft: true,
  propertyType: true,
  coverPhoto: true,
  photos: true,
  status: true,
  previousPrice: true,
  drop: true,
  priceDropped: true,
  updated: true,
  localTargetArea: true,
  listingCode: true,
} as const;

type SimilarCardRow = {
  slug: string;
  title: string;
  address: string;
  city: string | null;
  listPrice: number | null;
  finalDisplayPrice: number | null;
  marginAmount: number | null;
  arv: number | null;
  beds: number | null;
  baths: string | null;
  sqft: number | null;
  propertyType: string | null;
  coverPhoto: string | null;
  photos: string | null;
  status: string;
  previousPrice: number | null;
  drop: number | null;
  priceDropped: boolean;
  updated: boolean;
  localTargetArea: string | null;
  listingCode: string | null;
};

function similarPriceBand(price: number) {
  const delta = Math.max(Math.round(price * SIMILAR_PRICE_RATIO), SIMILAR_PRICE_FLOOR);
  return { min: Math.max(1, price - delta), max: price + delta };
}

function rankSimilarSheetListings(
  rows: SimilarCardRow[],
  seed: {
    slug: string;
    listingCode: string;
    city: string;
    area: string;
    price: number | null;
    propertyType: string;
    band: { min: number; max: number } | null;
  },
) {
  const cityKey = seed.city.toLowerCase();
  const areaKey = seed.area.toLowerCase();
  const scored = rows
    .filter((row) => row.slug !== seed.slug && (!seed.listingCode || (row.listingCode ?? "").toUpperCase() !== seed.listingCode))
    .map((row) => {
      const displayPrice = publicDisplayPrice(row.listPrice, row.finalDisplayPrice, row.marginAmount);
      const city = (row.city ?? "").trim().toLowerCase();
      const area = (row.localTargetArea ?? "").trim().toLowerCase();
      const type = (row.propertyType ?? "").trim().toLowerCase();
      let score = 0;
      if (cityKey && city === cityKey) score += 100;
      if (areaKey && area === areaKey) score += 40;
      if (seed.propertyType && type === seed.propertyType) score += 15;
      if (seed.price != null && displayPrice != null && seed.band) {
        const span = Math.max(1, seed.band.max - seed.band.min);
        const distance = Math.abs(displayPrice - seed.price);
        score += Math.round(50 * (1 - Math.min(1, distance / span)));
      }
      return { row, displayPrice, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.row.slug.localeCompare(right.row.slug));

  return scored.map((item) => toSimilarCard(item.row, item.displayPrice));
}

function toCardFromRow(row: {
  slug: string;
  title: string;
  address: string;
  city: string | null;
  listPrice: number | null;
  finalDisplayPrice: number | null;
  marginAmount: number | null;
  arv: number | null;
  beds: number | null;
  baths: string | null;
  sqft: number | null;
  propertyType: string | null;
  coverPhoto: string | null;
  photos?: string | null;
  status: string;
  previousPrice: number | null;
  drop: number | null;
  priceDropped: boolean;
  updated: boolean;
}): SheetListingCardView {
  return {
    id: row.slug,
    title: row.title,
    address: row.address,
    city: row.city ?? "",
    listPrice: row.listPrice,
    displayPrice: publicDisplayPrice(row.listPrice, row.finalDisplayPrice, row.marginAmount),
    marginAmount: row.marginAmount,
    arv: row.arv,
    beds: row.beds,
    baths: row.baths ?? "",
    sqft: row.sqft,
    propertyType: row.propertyType ?? "",
    coverPhoto: row.coverPhoto || parseStringArray(row.photos ?? null)[0] || "",
    status: row.status,
    previousPrice: row.previousPrice,
    drop: row.drop,
    priceDropped: row.priceDropped,
    updated: row.updated,
  };
}

function toSimilarCard(row: SimilarCardRow, displayPrice: number | null): SheetListingCardView {
  return { ...toCardFromRow(row), displayPrice };
}

function toView(row: SheetListing): SheetListingView {
  const photos = parseStringArray(row.photos);
  const galleries = parseGalleries(row.galleries, photos);
  const listPrice = row.listPrice;
  const marginAmount = row.marginAmount;
  const displayPrice = publicDisplayPrice(listPrice, row.finalDisplayPrice, marginAmount);
  const previousPrice = row.previousPrice;
  const drop = row.drop ?? dropAmount(previousPrice, listPrice);
  const hoa = row.hoa ?? "";
  const ac = row.ac ?? "";
  const roof = row.roof ?? "";
  const waterHeater = row.waterHeater ?? "";
  const titleCompany = row.titleCompany ?? "";
  const beds = row.beds;
  const baths = row.baths ?? "";
  const sqft = row.sqft;
  const propertyType = row.propertyType ?? "";
  const arv = row.arv;

  return {
    id: row.slug,
    listingCode: row.listingCode ?? "",
    sourceMessageId: row.sourceMessageId ?? "",
    addressKey: row.addressKey,
    title: row.title,
    address: row.address,
    city: row.city ?? "",
    listPrice,
    displayPrice,
    marginAmount,
    arv,
    beds,
    baths,
    sqft,
    propertyType,
    description: row.description ?? "",
    photos,
    coverPhoto: row.coverPhoto || photos[0] || "",
    galleries,
    driveFolderUrl: row.driveFolderUrl ?? "",
    status: row.status,
    previousPrice,
    drop,
    priceDropped: row.priceDropped || drop != null,
    updated: row.updated,
    hoa,
    ac,
    roof,
    waterHeater,
    titleCompany,
    listedAt: row.listedAt ?? "",
    sheetUpdatedAt: row.sheetUpdatedAt ?? "",
    priceHistory: row.priceHistory ?? "",
    updateNotes: row.updateNotes ?? "",
    metaTitle: row.metaTitle ?? "",
    metaDescription: row.metaDescription ?? "",
    metaKeywords: row.metaKeywords ?? "",
    localTargetArea: row.localTargetArea ?? "",
    canonicalUrl: row.canonicalUrl ?? "",
    schemaJsonLd: row.schemaJsonLd ?? "",
    latitude: row.latitude,
    longitude: row.longitude,
    specs: listingSpecs({
      listPrice: displayPrice,
      arv,
      beds,
      baths,
      sqft,
      propertyType,
      hoa,
      ac,
      roof,
      waterHeater,
      titleCompany,
    }),
  };
}

function parseStringArray(value: string | null) {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function parseGalleries(value: string | null, photos: string[]): SheetGalleryGroup[] {
  if (value) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter(isGalleryGroup);
      }
    } catch {
      // fall through to photos
    }
  }
  if (photos.length === 0) return [];
  return [{ id: "photos", label: photos.length === 1 ? "Cover photo" : "Photos", photos }];
}

function isGalleryGroup(value: unknown): value is SheetGalleryGroup {
  if (!value || typeof value !== "object") return false;
  const record = value as { id?: unknown; label?: unknown; photos?: unknown };
  return (
    typeof record.id === "string" &&
    typeof record.label === "string" &&
    Array.isArray(record.photos) &&
    record.photos.every((item) => typeof item === "string")
  );
}

function listingSpecs(input: {
  listPrice: number | null;
  arv: number | null;
  beds: number | null;
  baths: string;
  sqft: number | null;
  propertyType: string;
  hoa: string;
  ac: string;
  roof: string;
  waterHeater: string;
  titleCompany: string;
}): SheetListingSpec[] {
  const typeLabel = propertyTypeLabel(input.propertyType) || input.propertyType.replace(/_/g, " ");
  return [
    input.listPrice != null ? { label: "Asking price", value: formatMoney(input.listPrice) } : null,
    input.arv != null ? { label: "ARV", value: formatMoney(input.arv) } : null,
    input.beds != null ? { label: "Beds", value: String(input.beds) } : null,
    input.baths ? { label: "Baths", value: input.baths } : null,
    input.sqft != null ? { label: "Square feet", value: input.sqft.toLocaleString("en-US") } : null,
    typeLabel ? { label: "Property type", value: typeLabel } : null,
    input.hoa ? { label: "HOA", value: input.hoa } : null,
    input.ac ? { label: "A/C", value: input.ac } : null,
    input.roof ? { label: "Roof", value: input.roof } : null,
    input.waterHeater ? { label: "Water heater", value: input.waterHeater } : null,
    input.titleCompany ? { label: "Title company", value: input.titleCompany } : null,
  ].filter((item): item is SheetListingSpec => item != null);
}
