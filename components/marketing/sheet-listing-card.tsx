"use client";

import Link from "next/link";
import { SheetListingFlags, SheetListingPriceChange } from "@/components/marketing/sheet-listing-flags";
import { sheetListingHref, sheetListingPlace } from "@/lib/gdoc-listings/display";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/routes";
import { formatMoney } from "@/lib/listings/money";
import type { SheetListingCardView } from "@/lib/dal/gdoc-listings";

export function SheetListingCard({
  listing,
  locale,
}: {
  listing: SheetListingCardView;
  locale: Locale;
}) {
  const copy = propertyListingStrings[locale];
  const numberLocale = locale === "es" ? "es-US" : "en-US";
  const specs = [
    listing.beds != null ? `${listing.beds} ${copy.beds.toLowerCase()}` : "",
    listing.baths ? `${listing.baths} ${copy.baths.toLowerCase()}` : "",
    listing.sqft != null ? `${listing.sqft.toLocaleString(numberLocale)} ${copy.sqft}` : "",
  ].filter(Boolean);
  const typeLabel = copy.types[listing.propertyType] || listing.propertyType;
  const place = sheetListingPlace(listing);

  return (
    <article className="flex h-full flex-col border border-line bg-panel">
      <Link href={sheetListingHref(listing.id, locale)} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] bg-mist">
          {listing.coverPhoto ? (
            <img
              src={listing.coverPhoto}
              alt={`${listing.title} at ${place}`}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <p className="grid h-full place-items-center px-4 text-center text-sm text-muted">{copy.photoComing}</p>
          )}
          <div className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)]">
            <SheetListingFlags priceDropped={listing.priceDropped} updated={listing.updated} locale={locale} />
          </div>
        </div>
        <div className="flex flex-1 flex-col px-4 py-4">
          <p className="text-sm text-muted">{[listing.city, typeLabel].filter(Boolean).join(" · ")}</p>
          <h2 className="mt-1 text-lg font-semibold text-ink">{listing.title}</h2>
          <p className="mt-1 text-sm text-muted">{place}</p>
          <p className="mt-3 text-2xl font-semibold text-ink">
            {listing.listPrice != null ? formatMoney(listing.listPrice) : copy.callForPrice}
          </p>
          <SheetListingPriceChange
            listPrice={listing.listPrice}
            previousPrice={listing.previousPrice}
            drop={listing.drop}
            locale={locale}
          />
          {listing.arv != null ? (
            <p className="mt-1 text-sm text-muted">
              {copy.arv} {formatMoney(listing.arv)}
            </p>
          ) : null}
          {specs.length > 0 ? <p className="mt-3 text-sm text-ink">{specs.join(" · ")}</p> : null}
        </div>
      </Link>
    </article>
  );
}
