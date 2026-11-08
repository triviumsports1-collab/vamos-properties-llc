import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { ListingSkeleton } from "@/components/marketing/listing-skeleton";
import { Section } from "@/components/marketing/section";
import { SheetListingCatalog } from "@/components/marketing/sheet-listing-catalog";
import { listSheetListings, toSheetListingCard } from "@/lib/dal/gdoc-listings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Homes from the listing sheet",
  description: "Homes from the Vamos listing sheet. Call before you drive over.",
};

export default function SheetListingsPage() {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <SheetListings />
    </Suspense>
  );
}

async function SheetListings() {
  await connection();
  const listings = (await listSheetListings()).map(toSheetListingCard);

  return (
    <Section>
      <h1 className="text-4xl font-semibold text-ink">Homes from the listing sheet</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        These houses come from the live listing sheet. Call before you drive over. Selling your own house starts on the
        contact page.
      </p>
      {listings.length === 0 ? (
        <p className="mt-8 border border-line bg-panel px-4 py-6 text-base text-ink">
          No homes are on the sheet right now. Call {site.phoneDisplay} if you want to hear about the next one.
        </p>
      ) : (
        <div className="mt-8">
          <SheetListingCatalog listings={listings} />
        </div>
      )}
    </Section>
  );
}
