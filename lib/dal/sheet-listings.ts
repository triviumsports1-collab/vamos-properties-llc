import "server-only";

import type { Prisma, SheetListing } from "@prisma/client";
import { dropAmount, formatMoney } from "@/lib/listings/money";
import { propertyTypeLabel } from "@/lib/listings/catalog";
import { normalizeAddress } from "@/lib/listings/address";
import { requireAdmin } from "@/lib/admin/auth";
import { googleSheetsConfigured } from "@/lib/gdoc-listings/google";
import type { SheetListingStatus } from "@/lib/gdoc-listings/status";
import type {
  SheetGalleryGroup,
  SheetListingAdminDetail,
  SheetListingAdminFilters,
  SheetListingAdminRow,
  SheetListingAdminSummary,
  SheetListingCardView,
  SheetListingSpec,
  SheetListingView,
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
  const rows = await getDb().sheetListing.findMany({
    select: { status: true, removedAt: true, syncedAt: true },
    orderBy: { syncedAt: "desc" },
  });
  let active = 0;
  let inactive = 0;
  let sold = 0;
  let underContract = 0;
  for (const row of rows) {
    if (row.status === "inactive" || row.removedAt) inactive += 1;
    if (row.status === PUBLIC_STATUS && row.removedAt == null) active += 1;
    if (row.status === "sold" && row.removedAt == null) sold += 1;
    if (row.status === "under_contract" && row.removedAt == null) underContract += 1;
  }
  return {
    total: rows.length,
    active,
    inactive,
    sold,
    underContract,
    hidden: Math.max(0, rows.length - active),
    lastSyncedAt: rows[0]?.syncedAt.toISOString() ?? null,
    sheetsReady: googleSheetsConfigured(),
  };
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
      listPrice: true,
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

  await getDb().sheetListing.update({
    where: { id: existing.id },
    data: {
      sheetKey: nextKey,
      addressKey: nextKey,
      title: input.title,
      address: input.address,
      city: input.city || null,
      listPrice: input.listPrice,
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

export async function listSheetListingRecords() {
  return getDb().sheetListing.findMany({
    select: {
      id: true,
      sheetKey: true,
      slug: true,
      listingCode: true,
      listPrice: true,
      previousPrice: true,
      priceChangedAt: true,
      contentHash: true,
      status: true,
      removedAt: true,
      manualHold: true,
    },
  });
}

export async function applySheetListingSync(input: {
  creates: Prisma.SheetListingCreateManyInput[];
  updates: Array<{ id: number; data: Prisma.SheetListingUpdateInput }>;
  staleIds: number[];
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
    },
    { maxWait: 5_000, timeout: 20_000 },
  );
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
  if (clauses.length === 0) return {};
  return { AND: clauses };
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
  listPrice: number | null;
  previousPrice: number | null;
  status: string;
  removedAt: Date | null;
  manualHold: boolean;
  syncedAt: Date;
  priceDropped: boolean;
  updated: boolean;
}): SheetListingAdminRow {
  return {
    id: row.slug,
    listingCode: row.listingCode ?? "",
    title: row.title,
    address: row.address,
    city: row.city ?? "",
    listPrice: row.listPrice,
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

function toView(row: SheetListing): SheetListingView {
  const photos = parseStringArray(row.photos);
  const galleries = parseGalleries(row.galleries, photos);
  const listPrice = row.listPrice;
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
      listPrice,
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
