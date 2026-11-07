import "server-only";

import { getDb } from "@/src/prisma/db";
import { requireAdmin } from "@/lib/admin/auth";
import type { ListingStatus } from "@/lib/admin/pipeline";
import { isGalleryPhoto, listingSlugBase, normalizeAddress } from "@/lib/listings/address";
import { isFreshListing, isPropertyType, isPublicStatus, type ListingSort, type PropertyType } from "@/lib/listings/catalog";
import { dropAmount, formatMoney } from "@/lib/listings/money";

export type ListingInput = {
  title: string;
  address: string;
  city: string;
  beds: number | null;
  baths: string;
  sqft: number | null;
  propertyType: PropertyType | "";
  listPrice: number | null;
  monthlyPayment: number | null;
  terms: string;
  status: ListingStatus;
  featured: boolean;
  summary: string;
  description: string;
  features: string;
  neighborhood: string;
  schools: string;
  yearBuilt: number | null;
  photos: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  localTags: string;
  arv: number | null;
  driveFolderUrl: string;
};

export type PricePoint = {
  id: number;
  amount: number;
  previousAmount: number | null;
  recordedAt: string;
};

export type ListingView = {
  id: number;
  title: string;
  slug: string;
  address: string;
  city: string | null;
  beds: number | null;
  baths: string | null;
  sqft: number | null;
  propertyType: string | null;
  price: string | null;
  listPrice: number | null;
  previousPrice: number | null;
  priceChangedAt: string | null;
  drop: number | null;
  monthlyPayment: number | null;
  terms: string | null;
  status: string;
  featured: boolean;
  summary: string | null;
  description: string | null;
  features: string[];
  neighborhood: string | null;
  schools: string | null;
  yearBuilt: number | null;
  photos: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  localTags: string | null;
  arv: number | null;
  driveFolderUrl: string | null;
  source: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  prices: PricePoint[];
  isNew: boolean;
};

type ListingRow = {
  id: number;
  title: string;
  slug: string;
  address: string;
  city: string | null;
  beds: number | null;
  baths: string | null;
  sqft: number | null;
  propertyType: string | null;
  price: string | null;
  listPrice: number | null;
  previousPrice: number | null;
  priceChangedAt: Date | string | null;
  monthlyPayment: number | null;
  terms: string | null;
  status: string;
  featured: boolean;
  summary: string | null;
  description: string | null;
  features: string | null;
  neighborhood: string | null;
  schools: string | null;
  yearBuilt: number | null;
  photos: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  localTags: string | null;
  arv: number | null;
  driveFolderUrl: string | null;
  source: string;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

function slugify(title: string, address: string, city: string) {
  return listingSlugBase(address, city, title);
}

export function photoList(value: string | null) {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function lineList(value: string | null) {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toIso(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : d;
}

function toIsoRequired(d: Date | string): string {
  return d instanceof Date ? d.toISOString() : d;
}

function toView(row: ListingRow, prices: PricePoint[], now: number): ListingView {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    address: row.address,
    city: row.city,
    beds: row.beds,
    baths: row.baths,
    sqft: row.sqft,
    propertyType: row.propertyType,
    price: row.listPrice != null ? formatMoney(row.listPrice) : row.price,
    listPrice: row.listPrice,
    previousPrice: row.previousPrice,
    priceChangedAt: toIso(row.priceChangedAt),
    drop: dropAmount(row.previousPrice, row.listPrice),
    monthlyPayment: row.monthlyPayment,
    terms: row.terms,
    status: row.status,
    featured: row.featured,
    summary: row.summary,
    description: row.description,
    features: lineList(row.features),
    neighborhood: row.neighborhood,
    schools: row.schools,
    yearBuilt: row.yearBuilt,
    photos: photoList(row.photos).filter(isGalleryPhoto),
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
    keywords: row.keywords,
    localTags: row.localTags,
    arv: row.arv,
    driveFolderUrl: row.driveFolderUrl,
    source: row.source,
    publishedAt: toIso(row.publishedAt),
    createdAt: toIsoRequired(row.createdAt),
    updatedAt: toIsoRequired(row.updatedAt),
    prices,
    isNew: isFreshListing(toIso(row.publishedAt), now),
  };
}

async function uniqueSlug(title: string, address: string, city: string, currentId?: number) {
  const db = getDb();
  const base = slugify(title, address, city);
  const taken = await db.listing.findFirst({ where: { slug: base }, select: { id: true } });
  if (!taken || taken.id === currentId) return base;
  return `${base}-${currentId ?? Date.now().toString(36)}`;
}

async function pricesFor(listingId: number): Promise<PricePoint[]> {
  const db = getDb();
  const rows = await db.listingPrice.findMany({
    where: { listingId },
    orderBy: { recordedAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    amount: row.amount,
    previousAmount: row.previousAmount,
    recordedAt: row.recordedAt.toISOString(),
  }));
}

export async function listListings() {
  await requireAdmin();
  const db = getDb();
  const now = Date.now();
  const rows = await db.listing.findMany({ orderBy: { updatedAt: "desc" } });
  return rows.map((row) => toView(row, [], now));
}

export async function getListing(id: number) {
  await requireAdmin();
  const db = getDb();
  const row = await db.listing.findFirst({ where: { id } });
  if (!row) return null;
  const prices = await pricesFor(id);
  return toView(row, prices, Date.now());
}

function listingData(
  input: ListingInput,
  publishedAt: string | null,
  previousPrice: number | null,
  priceChangedAt: string | null,
) {
  return {
    title: input.title,
    address: input.address,
    city: input.city || null,
    beds: input.beds,
    baths: input.baths || null,
    sqft: input.sqft,
    propertyType: input.propertyType || null,
    price: input.listPrice != null ? formatMoney(input.listPrice) : null,
    listPrice: input.listPrice,
    previousPrice,
    priceChangedAt: priceChangedAt ? new Date(priceChangedAt) : null,
    monthlyPayment: input.monthlyPayment,
    terms: input.terms || null,
    status: input.status,
    featured: input.featured,
    summary: input.summary || null,
    description: input.description || null,
    features: input.features || null,
    neighborhood: input.neighborhood || null,
    schools: input.schools || null,
    yearBuilt: input.yearBuilt,
    photos: input.photos || null,
    metaTitle: input.metaTitle || null,
    metaDescription: input.metaDescription || null,
    keywords: input.keywords || null,
    localTags: input.localTags || null,
    arv: input.arv,
    driveFolderUrl: input.driveFolderUrl || null,
    addressKey: normalizeAddress(input.address),
    publishedAt: publishedAt ? new Date(publishedAt) : null,
  };
}

export async function saveListing(id: number | null, input: ListingInput) {
  await requireAdmin();
  const db = getDb();
  const nowIso = new Date().toISOString();

  return db.$transaction(
    async (tx) => {
      if (id) {
        const current = await tx.listing.findFirst({
          where: { id },
          select: { id: true, slug: true, listPrice: true, previousPrice: true, priceChangedAt: true, publishedAt: true },
        });
        if (!current) return { ok: false as const, message: "That listing is not in the inventory." };

        const priceChanged = input.listPrice != null && input.listPrice !== current.listPrice;
        const publishedAt = current.publishedAt
          ? current.publishedAt.toISOString()
          : isPublicStatus(input.status)
            ? nowIso
            : null;

        await tx.listing.update({
          where: { id },
          data: listingData(
            input,
            publishedAt,
            priceChanged ? current.listPrice : current.previousPrice,
            priceChanged ? nowIso : toIso(current.priceChangedAt),
          ),
        });

        if (priceChanged && input.listPrice != null) {
          await tx.listingPrice.create({
            data: {
              listingId: id,
              amount: input.listPrice,
              previousAmount: current.listPrice,
            },
          });
        }
        return { ok: true as const, id, slug: current.slug, message: priceChanged ? "Price updated." : "Listing saved." };
      }

      const slug = await uniqueSlug(input.title, input.address, input.city);
      const created = await tx.listing.create({
        data: {
          ...listingData(input, isPublicStatus(input.status) ? nowIso : null, null, null),
          slug,
        },
      });
      if (input.listPrice != null) {
        await tx.listingPrice.create({
          data: {
            listingId: created.id,
            amount: input.listPrice,
            previousAmount: null,
          },
        });
      }
      return { ok: true as const, id: created.id, slug, message: "Listing saved." };
    },
    { timeout: 30_000 },
  );
}

export type PublicQuery = {
  city: string;
  propertyType: string;
  status: string;
  min: number | null;
  max: number | null;
  sort: ListingSort;
};

export async function listPublicListings(query: PublicQuery, now: number) {
  const db = getDb();
  const rows = await db.listing.findMany({ orderBy: { updatedAt: "desc" } });
  const listings = rows
    .map((row) => toView(row, [], now))
    .filter((listing) => isPublicStatus(listing.status))
    .filter((listing) => (query.status && isPublicStatus(query.status) ? listing.status === query.status : true))
    .filter((listing) => (query.city ? listing.city?.toLowerCase() === query.city.toLowerCase() : true))
    .filter((listing) => (query.propertyType && isPropertyType(query.propertyType) ? listing.propertyType === query.propertyType : true))
    .filter((listing) => (query.min != null ? listing.listPrice != null && listing.listPrice >= query.min : true))
    .filter((listing) => (query.max != null ? listing.listPrice != null && listing.listPrice <= query.max : true))
    .sort((left, right) => {
      if (left.featured !== right.featured) return left.featured ? -1 : 1;
      if (query.sort === "price_asc") return (left.listPrice ?? Number.MAX_SAFE_INTEGER) - (right.listPrice ?? Number.MAX_SAFE_INTEGER);
      if (query.sort === "price_desc") return (right.listPrice ?? 0) - (left.listPrice ?? 0);
      return right.publishedAt?.localeCompare(left.publishedAt ?? "") ?? 0;
    });

  const cities = [...new Set(rows.filter((row) => isPublicStatus(row.status) && row.city).map((row) => row.city as string))].sort((a, b) =>
    a.localeCompare(b),
  );
  return { listings, cities };
}

export async function getPublicListing(slug: string, now: number) {
  const db = getDb();
  const row = await db.listing.findFirst({ where: { slug } });
  if (!row || !isPublicStatus(row.status)) return null;
  const prices = await pricesFor(row.id);
  return toView(row, prices, now);
}

export async function listPublicSlugs() {
  const db = getDb();
  const rows = await db.listing.findMany({
    select: { slug: true, updatedAt: true, status: true },
  });
  return rows
    .filter((row) => isPublicStatus(row.status))
    .map((row) => ({ slug: row.slug, updatedAt: row.updatedAt.toISOString() }));
}

export type EmailListingInput = {
  title: string;
  address: string;
  city: string;
  beds: number | null;
  baths: string;
  sqft: number | null;
  propertyType: PropertyType | "";
  listPrice: number | null;
  arv: number | null;
  description: string;
  driveFolderUrl: string;
  photos: string;
  sourceMessageId: string;
};

export async function createListingFromEmail(input: EmailListingInput) {
  const db = getDb();
  const addressKey = normalizeAddress(input.address);
  const now = new Date();

  return db.$transaction(async (tx) => {
    if (input.sourceMessageId) {
      const sameMessage = await tx.listing.findFirst({
        where: { sourceMessageId: input.sourceMessageId },
        select: { id: true, slug: true },
      });
      if (sameMessage) {
        return { duplicate: true as const, id: sameMessage.id, slug: sameMessage.slug };
      }
    }

    const existing = await tx.listing.findMany({
      select: { id: true, slug: true, address: true, addressKey: true },
    });
    const sameAddress = existing.find((row) => (row.addressKey || normalizeAddress(row.address)) === addressKey);
    if (sameAddress) {
      return { duplicate: true as const, id: sameAddress.id, slug: sameAddress.slug };
    }

    const base = listingSlugBase(input.address, input.city, input.title);
    const taken = await tx.listing.findFirst({ where: { slug: base }, select: { id: true } });
    const slug = taken ? `${base}-${Date.now().toString(36)}` : base;
    const summary = input.description.replace(/\s+/g, " ").trim().slice(0, 280);
    const created = await tx.listing.create({
      data: {
        title: input.title,
        slug,
        address: input.address,
        addressKey,
        city: input.city || null,
        beds: input.beds,
        baths: input.baths || null,
        sqft: input.sqft,
        propertyType: input.propertyType || null,
        price: input.listPrice != null ? formatMoney(input.listPrice) : null,
        listPrice: input.listPrice,
        arv: input.arv,
        description: input.description || null,
        summary: summary || null,
        photos: input.photos || null,
        driveFolderUrl: input.driveFolderUrl || null,
        status: "active",
        featured: false,
        source: "email",
        sourceMessageId: input.sourceMessageId || null,
        publishedAt: now,
      },
    });
    if (input.listPrice != null) {
      await tx.listingPrice.create({
        data: {
          listingId: created.id,
          amount: input.listPrice,
          previousAmount: null,
        },
      });
    }
    return { duplicate: false as const, id: created.id, slug };
  }, { timeout: 30_000 });
}
