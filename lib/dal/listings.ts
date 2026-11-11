import "server-only";

import { getDb } from "@/src/prisma/db";
import { listingSlugBase, normalizeAddress } from "@/lib/listings/address";
import { formatMoney } from "@/lib/listings/money";
import type { PropertyType } from "@/lib/listings/catalog";

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
  try {
    const db = getDb();
    const addressKey = normalizeAddress(input.address);
    const now = new Date();

    return await db.$transaction(async (tx) => {
      console.log("[LISTING_DB_LOOKUP]", {
        sourceMessageId: input.sourceMessageId || null,
        addressKey,
        address: input.address,
      });
      if (input.sourceMessageId) {
        const sameMessage = await tx.listing.findFirst({
          where: { sourceMessageId: input.sourceMessageId },
          select: { id: true, slug: true },
        });
        if (sameMessage) {
          console.log("[LISTING_DB_RESULT]", {
            duplicate: true,
            reason: "sourceMessageId",
            listingId: sameMessage.id,
            slug: sameMessage.slug,
          });
          return { duplicate: true as const, id: sameMessage.id, slug: sameMessage.slug };
        }
      }

      const existing = await tx.listing.findMany({
        select: { id: true, slug: true, address: true, addressKey: true },
      });
      const sameAddress = existing.find((row) => (row.addressKey || normalizeAddress(row.address)) === addressKey);
      if (sameAddress) {
        console.log("[LISTING_DB_RESULT]", {
          duplicate: true,
          reason: "addressKey",
          listingId: sameAddress.id,
          slug: sameAddress.slug,
        });
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
      console.log("[LISTING_DB_RESULT]", {
        duplicate: false,
        reason: "inserted",
        listingId: created.id,
        slug,
      });
      return { duplicate: false as const, id: created.id, slug };
    }, { timeout: 12_000 });
  } catch (error) {
    console.error("[LISTING_DB_FAILED]", {
      name: error instanceof Error ? error.name : "Error",
      message: error instanceof Error ? error.message : String(error),
    });
    throw new Error("listing_email_db_failed");
  }
}
