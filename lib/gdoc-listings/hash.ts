import { createHash } from "node:crypto";
import type { SheetListingDraft } from "@/lib/gdoc-listings/types";

export function sheetListingContentHash(draft: SheetListingDraft) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        title: draft.title,
        address: draft.address,
        city: draft.city,
        listPrice: draft.listPrice,
        previousPrice: draft.previousPrice,
        arv: draft.arv,
        beds: draft.beds,
        baths: draft.baths,
        sqft: draft.sqft,
        propertyType: draft.propertyType,
        status: draft.status,
        description: draft.description,
        photos: draft.photos,
        galleries: draft.galleries,
        coverPhoto: draft.coverPhoto,
        driveFolderUrl: draft.driveFolderUrl,
        hoa: draft.hoa,
        ac: draft.ac,
        roof: draft.roof,
        waterHeater: draft.waterHeater,
        titleCompany: draft.titleCompany,
        sourceMessageId: draft.sourceMessageId,
        listingCode: draft.listingCode,
        sheetSlug: draft.sheetSlug,
        listedAt: draft.listedAt,
        sheetUpdatedAt: draft.sheetUpdatedAt,
        priceHistory: draft.priceHistory,
        updateNotes: draft.updateNotes,
        metaTitle: draft.metaTitle,
        metaDescription: draft.metaDescription,
        metaKeywords: draft.metaKeywords,
        localTargetArea: draft.localTargetArea,
        canonicalUrl: draft.canonicalUrl,
        schemaJsonLd: draft.schemaJsonLd,
        latitude: draft.latitude,
        longitude: draft.longitude,
        sheetSyncStatus: draft.sheetSyncStatus,
        sheetSyncedAt: draft.sheetSyncedAt,
        flaggedDrop: draft.flaggedDrop,
        flaggedUpdated: draft.flaggedUpdated,
      }),
    )
    .digest("hex");
}
