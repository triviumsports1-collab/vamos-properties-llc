import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import { SheetListingCatalogPage } from "@/components/marketing/sheet-listing-catalog-page";
import { catalogSearchValue, sheetListingCatalogHref } from "@/lib/gdoc-listings/display";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import { hreflang } from "@/lib/i18n/routes";
import { listSheetListingCards } from "@/lib/dal/gdoc-listings";
import { SHEET_LISTINGS_TAG } from "@/lib/gdoc-listings/types";

const copy = propertyListingStrings.es;
const canonical = sheetListingCatalogHref("es");

export const instant = false;

/** Index the catalog only while homes are listed; an empty catalog is a thin page. */
export async function generateMetadata(): Promise<Metadata> {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  const listings = await listSheetListingCards();
  return {
    title: { absolute: `Casas en venta en Phoenix, Gilbert, Scottsdale, Chandler · Vamos` },
    description: copy.catalogDescription,
    alternates: { canonical, ...hreflang(sheetListingCatalogHref("en"), canonical) },
    robots: listings.length > 0 ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: copy.catalogTitle,
      description: copy.catalogDescription,
      url: canonical,
      type: "website",
      locale: "es_US",
    },
  };
}

type CatalogProps = {
  searchParams: Promise<{ q?: string | string[]; type?: string | string[] }>;
};

export default async function PropiedadesPage({ searchParams }: CatalogProps) {
  const params = await searchParams;
  return (
    <SheetListingCatalogPage
      locale="es"
      query={catalogSearchValue(params.q)}
      propertyType={catalogSearchValue(params.type)}
    />
  );
}
