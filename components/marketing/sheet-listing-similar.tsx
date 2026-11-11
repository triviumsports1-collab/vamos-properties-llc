import Link from "next/link";
import { SheetListingCard } from "@/components/marketing/sheet-listing-card";
import { sheetListingCatalogHref } from "@/lib/gdoc-listings/display";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/routes";
import type { SheetListingCardView } from "@/lib/gdoc-listings/types";

export function SheetListingSimilar({
  listings,
  locale,
}: {
  listings: SheetListingCardView[];
  locale: Locale;
}) {
  if (listings.length === 0) return null;
  const copy = propertyListingStrings[locale];

  return (
    <section className="mt-12 border-t border-line pt-10 md:mt-16 md:pt-12" aria-labelledby="similar-homes">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="similar-homes" className="text-xl font-semibold text-ink md:text-2xl">
            {copy.similarHeading}
          </h2>
          <p className="mt-2 max-w-2xl text-base leading-7 text-muted">{copy.similarIntro}</p>
        </div>
        <Link
          href={sheetListingCatalogHref(locale)}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-pine"
        >
          {copy.similarViewAll}
        </Link>
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <li key={listing.id}>
            <SheetListingCard
              listing={listing}
              locale={locale}
              heading="h3"
              className="overflow-hidden rounded-2xl shadow-[0_8px_30px_rgba(16,36,61,0.06)]"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
