import type { Metadata } from "next";
import { SheetListingCatalogPage } from "@/components/marketing/sheet-listing-catalog-page";
import { catalogSearchValue, sheetListingCatalogHref } from "@/lib/gdoc-listings/display";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import { hreflang } from "@/lib/i18n/routes";

const copy = propertyListingStrings.en;
const canonical = sheetListingCatalogHref("en");

export const instant = false;

export const metadata: Metadata = {
  title: copy.catalogTitle,
  description: copy.catalogDescription,
  alternates: { canonical, ...hreflang(canonical, sheetListingCatalogHref("es")) },
  robots: { index: true, follow: true },
  openGraph: {
    title: copy.catalogTitle,
    description: copy.catalogDescription,
    url: canonical,
    type: "website",
    locale: "en_US",
  },
};

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
