import type { Metadata } from "next";
import { SheetListingCatalogPage } from "@/components/marketing/sheet-listing-catalog-page";
import { catalogSearchValue, sheetListingCatalogHref } from "@/lib/gdoc-listings/display";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import { hreflang } from "@/lib/i18n/routes";

const copy = propertyListingStrings.es;
const canonical = sheetListingCatalogHref("es");

export const instant = false;

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
