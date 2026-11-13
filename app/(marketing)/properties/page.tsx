import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import { SheetListingCatalogPage } from "@/components/marketing/sheet-listing-catalog-page";
import { catalogSearchValue, sheetListingCatalogHref } from "@/lib/gdoc-listings/display";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import { hreflang } from "@/lib/i18n/routes";
import { listSheetListingCards } from "@/lib/dal/gdoc-listings";
import { SHEET_LISTINGS_TAG } from "@/lib/gdoc-listings/types";

const copy = propertyListingStrings.en;
const canonical = sheetListingCatalogHref("en");

export const instant = false;

/** Index the catalog only while homes are listed; an empty catalog is a thin page. */
export async function generateMetadata(): Promise<Metadata> {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  const listings = await listSheetListingCards();
  return {
    title: { absolute: `Homes for sale in Phoenix, Gilbert, Scottsdale, Chandler · Vamos` },
    description: copy.catalogDescription,
    alternates: { canonical, ...hreflang(canonical, sheetListingCatalogHref("es")) },
    robots: listings.length > 0 ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: copy.catalogTitle,
      description: copy.catalogDescription,
      url: canonical,
      type: "website",
      locale: "en_US",
    },
  };
}

type CatalogProps = {
  searchParams: Promise<{ q?: string | string[]; type?: string | string[] }>;
};

export default async function PropertiesPage({ searchParams }: CatalogProps) {
  const params = await searchParams;
  return (
    <SheetListingCatalogPage
      locale="en"
      query={catalogSearchValue(params.q)}
      propertyType={catalogSearchValue(params.type)}
    />
  );
}
