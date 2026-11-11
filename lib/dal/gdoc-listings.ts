import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import {
  getPublicSheetListingById,
  listPublicSheetListingCards,
  listPublicSheetListings,
  listPublicSimilarSheetListings,
  listSheetListingSitemapEntries as listSheetListingSitemapRows,
  listSheetListingSlugs,
  toSheetListingCard,
  type SheetListingSimilarSeed,
} from "@/lib/dal/sheet-listings";
import {
  SHEET_LISTINGS_TAG,
  type SheetGalleryGroup,
  type SheetListingCardView,
  type SheetListingSpec,
  type SheetListingView,
} from "@/lib/gdoc-listings/types";

export type { SheetGalleryGroup, SheetListingCardView, SheetListingSpec, SheetListingView };

export async function listSheetListings(): Promise<SheetListingView[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  return listPublicSheetListings();
}

export async function listSheetListingCards(): Promise<SheetListingCardView[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  return listPublicSheetListingCards();
}

export async function getSheetListingById(id: string): Promise<SheetListingView | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  return getPublicSheetListingById(id);
}

export async function listSimilarSheetListings(seed: SheetListingSimilarSeed): Promise<SheetListingCardView[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  return listPublicSimilarSheetListings(seed);
}

export function similarSeedFromListing(listing: SheetListingView): SheetListingSimilarSeed {
  return {
    id: listing.id,
    listingCode: listing.listingCode,
    city: listing.city,
    localTargetArea: listing.localTargetArea,
    displayPrice: listing.displayPrice,
    listPrice: listing.listPrice,
    propertyType: listing.propertyType,
  };
}

export async function listPublicSheetListingSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  return listSheetListingSlugs();
}

export async function listSheetListingSitemapEntries(): Promise<Array<{ slug: string; updatedAt: string }>> {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  return listSheetListingSitemapRows();
}

export { toSheetListingCard, SHEET_LISTINGS_TAG };
