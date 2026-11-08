import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import {
  getPublicSheetListingById,
  listPublicSheetListings,
  listSheetListingSitemapEntries as listSheetListingSitemapRows,
  listSheetListingSlugs,
  toSheetListingCard,
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
  try {
    return await listPublicSheetListings();
  } catch (error) {
    console.error("[SHEET_LISTINGS]", {
      name: error instanceof Error ? error.name : "Error",
    });
    return [];
  }
}

export async function getSheetListingById(id: string): Promise<SheetListingView | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  try {
    return await getPublicSheetListingById(id);
  } catch (error) {
    console.error("[SHEET_LISTINGS]", {
      name: error instanceof Error ? error.name : "Error",
    });
    return null;
  }
}

export async function listPublicSheetListingSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  try {
    return await listSheetListingSlugs();
  } catch (error) {
    console.error("[SHEET_LISTINGS]", {
      name: error instanceof Error ? error.name : "Error",
    });
    return [];
  }
}

export async function listSheetListingSitemapEntries(): Promise<Array<{ slug: string; updatedAt: string }>> {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  try {
    return await listSheetListingSitemapRows();
  } catch (error) {
    console.error("[SHEET_LISTINGS]", {
      name: error instanceof Error ? error.name : "Error",
    });
    return [];
  }
}

export { toSheetListingCard, SHEET_LISTINGS_TAG };
