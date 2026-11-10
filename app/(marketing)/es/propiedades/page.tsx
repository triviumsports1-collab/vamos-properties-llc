import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/json-ld";
import { Section } from "@/components/marketing/section";
import { SheetListingCatalog } from "@/components/marketing/sheet-listing-catalog";
import { listSheetListings, toSheetListingCard } from "@/lib/dal/gdoc-listings";
import { sheetListingCatalogHref } from "@/lib/gdoc-listings/display";
import { sheetListingCatalogJsonLd } from "@/lib/gdoc-listings/seo";
import { SHEET_LISTINGS_TAG } from "@/lib/gdoc-listings/types";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

const copy = propertyListingStrings.es;
const canonical = sheetListingCatalogHref("es");

export const metadata: Metadata = {
  title: copy.catalogTitle,
  description: copy.catalogDescription,
  alternates: { canonical, ...hreflang(sheetListingCatalogHref("en"), canonical) },
  robots: { index: true, follow: true },
  openGraph: {
    title: copy.catalogTitle,
    description: copy.catalogDescription,
    url: canonical,
    type: "website",
    locale: "es_US",
  },
};

export default async function PropiedadesPage() {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  const listings = await listSheetListings();
  const cards = listings.map(toSheetListingCard);

  return (
    <Section>
      <JsonLd data={sheetListingCatalogJsonLd(cards, "es")} />
      <h1 className="text-4xl font-semibold text-ink">{copy.catalogTitle}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{copy.catalogIntro}</p>
      {listings.length === 0 ? (
        <p className="mt-8 border border-line bg-panel px-4 py-6 text-base text-ink">
          {copy.catalogEmpty.replace("{phone}", site.phoneDisplay)}
        </p>
      ) : (
        <div className="mt-8">
          <SheetListingCatalog listings={cards} locale="es" />
        </div>
      )}
    </Section>
  );
}
