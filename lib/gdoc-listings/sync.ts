import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { SHEET_LISTINGS_TAG } from "@/lib/gdoc-listings/types";
import type { Prisma } from "@prisma/client";
import { applySheetListingSync, listSheetListingRecords } from "@/lib/dal/sheet-listings";
import { fetchSheetValueRows } from "@/lib/gdoc-listings/fetch-sheet";
import { sheetListingContentHash } from "@/lib/gdoc-listings/hash";
import { foldSheetDrafts, parseSheetRows } from "@/lib/gdoc-listings/parse";
import type { SheetListingDraft } from "@/lib/gdoc-listings/types";
import { googleSheetsConfigured } from "@/lib/gdoc-listings/google";
import { dropAmount } from "@/lib/listings/money";

export type SheetSyncResult = {
  ok: boolean;
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

export async function syncSheetListings(): Promise<SheetSyncResult> {
  if (!googleSheetsConfigured()) {
    throw new Error("missing_credentials");
  }

  const rows = await fetchSheetValueRows();
  const parsed = parseSheetRows(rows);
  const drafts = foldSheetDrafts(parsed.drafts);
  const existing = await listSheetListingRecords();
  const existingByCode = new Map(existing.filter((row) => row.listingCode).map((row) => [row.listingCode as string, row]));
  const existingByKey = new Map(existing.map((row) => [row.sheetKey, row]));
  const reservedSlugs = new Set(existing.map((row) => row.slug));
  const now = new Date();
  const creates: Prisma.SheetListingCreateManyInput[] = [];
  const updates: Array<{ id: number; data: Prisma.SheetListingUpdateInput }> = [];
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
      creates.push(toCreate(draft, slug, contentHash, price, now));
      continue;
    }

    const nextSlug = nextExistingSlug(draft, current.slug, reservedSlugs);
    if (nextSlug !== current.slug) {
      reservedSlugs.delete(current.slug);
      reservedSlugs.add(nextSlug);
    }
    updates.push({
      id: current.id,
      data: toUpdate(draft, nextSlug, contentHash, price, now),
    });
  }

  const staleIds = existing
    .filter((row) => !seenIds.has(row.id) && row.removedAt == null && !row.manualHold)
    .map((row) => row.id);

  await applySheetListingSync({ creates, updates, staleIds, now });
  refreshSheetListingPages([
    ...creates.map((row) => String(row.slug ?? "")),
    ...updates.map((row) => (typeof row.data.slug === "string" ? row.data.slug : "")),
    ...drafts.map((draft) => draft.listingCode),
    ...drafts.map((draft) => draft.sheetSlug),
    ...existing.filter((row) => seenIds.has(row.id)).flatMap((row) => [row.slug, row.listingCode ?? ""]),
  ]);

  const result: SheetSyncResult = {
    ok: true,
    rows: parsed.rows,
    unique: drafts.length,
    created: creates.length,
    updated: updates.length,
    unchanged,
    held,
    inactivated: staleIds.length,
    skipped: parsed.skipped,
  };
  console.log("[SHEET_LISTINGS_SYNC]", result);
  return result;
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

function refreshSheetListingPages(slugs: string[]) {
  try {
    revalidateTag(SHEET_LISTINGS_TAG, "max");
    revalidatePath("/sheet-listings");
    revalidatePath("/sitemap.xml");
    revalidatePath("/api/listings/sheet");
    revalidatePath("/admin");
    revalidatePath("/admin/sheet-listings");
    for (const slug of slugs) {
      if (slug) revalidatePath(`/sheet-listings/${slug}`);
    }
  } catch (error) {
    console.error("[SHEET_LISTINGS_SYNC]", {
      skipped: "revalidate_failed",
      name: error instanceof Error ? error.name : "Error",
    });
  }
}
