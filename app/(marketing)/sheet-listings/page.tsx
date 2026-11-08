import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/json-ld";
import { Section } from "@/components/marketing/section";
import { SheetListingCatalog } from "@/components/marketing/sheet-listing-catalog";
import { listSheetListings, toSheetListingCard } from "@/lib/dal/gdoc-listings";
import { SHEET_LISTINGS_TAG } from "@/lib/gdoc-listings/types";
import { sheetListingCatalogJsonLd } from "@/lib/gdoc-listings/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Homes from the listing sheet",
  description: "Homes from the Vamos listing sheet in Phoenix and Maricopa County. Call before you drive over.",
  alternates: { canonical: "/sheet-listings" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Homes from the listing sheet",
    description: "Homes from the Vamos listing sheet in Phoenix and Maricopa County. Call before you drive over.",
    url: "/sheet-listings",
    type: "website",
    locale: "en_US",
  },
};

export default async function SheetListingsPage() {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  const listings = await listSheetListings();
  const cards = listings.map(toSheetListingCard);

  return (
    <Section>
      <JsonLd data={sheetListingCatalogJsonLd(cards)} />
      <h1 className="text-4xl font-semibold text-ink">Homes from the listing sheet</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        These houses come from the listing sheet. Call before you drive over. Selling your own house starts on the
        contact page.
      </p>
      {listings.length === 0 ? (
        <p className="mt-8 border border-line bg-panel px-4 py-6 text-base text-ink">
          No homes are on the sheet right now. Call {site.phoneDisplay} if you want to hear about the next one.
        </p>
      ) : (
        <div className="mt-8">
          <SheetListingCatalog listings={cards} />
        </div>
      )}
    </Section>
  );
}
