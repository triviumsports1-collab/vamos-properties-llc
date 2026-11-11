import { cacheLife, cacheTag } from "next/cache";
import { JsonLd } from "@/components/marketing/json-ld";
import { Section } from "@/components/marketing/section";
import { SheetListingCatalog } from "@/components/marketing/sheet-listing-catalog";
import { listSheetListingCards } from "@/lib/dal/gdoc-listings";
import { sheetListingCatalogJsonLd } from "@/lib/gdoc-listings/seo";
import { SHEET_LISTINGS_TAG } from "@/lib/gdoc-listings/types";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

export async function SheetListingCatalogPage({
  locale,
  query,
  propertyType,
}: {
  locale: Locale;
  query: string;
  propertyType: string;
}) {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  const copy = propertyListingStrings[locale];
  const cards = await listSheetListingCards();

  return (
    <Section>
      <JsonLd data={sheetListingCatalogJsonLd(cards, locale)} />
      <h1 className="text-3xl font-semibold text-ink md:text-4xl">{copy.catalogTitle}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{copy.catalogIntro}</p>
      {cards.length === 0 ? (
        <p className="mt-8 border border-line bg-panel px-4 py-6 text-base text-ink">
          {copy.catalogEmpty.replace("{phone}", site.phoneDisplay)}
        </p>
      ) : (
        <div className="mt-8">
          <SheetListingCatalog listings={cards} locale={locale} query={query} propertyType={propertyType} />
        </div>
      )}
    </Section>
  );
}
