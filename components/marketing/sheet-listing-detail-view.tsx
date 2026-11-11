import Link from "next/link";
import { JsonLd } from "@/components/marketing/json-ld";
import { ShareListing } from "@/components/marketing/share-listing";
import { SheetListingFlags, SheetListingPriceChange } from "@/components/marketing/sheet-listing-flags";
import { SheetListingInquiry } from "@/components/marketing/sheet-listing-inquiry";
import { SheetListingPhotos } from "@/components/marketing/sheet-listing-photos";
import { SheetListingSimilar } from "@/components/marketing/sheet-listing-similar";
import {
  sheetListingCatalogHref,
  sheetListingForSaleLabel,
  sheetListingPlace,
  sheetListingTypeLabel,
} from "@/lib/gdoc-listings/display";
import { sheetListingJsonLd, sheetListingPublicUrl } from "@/lib/gdoc-listings/seo";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/routes";
import type { SheetListingCardView, SheetListingView } from "@/lib/gdoc-listings/types";
import { formatMoney } from "@/lib/listings/money";
import { site } from "@/lib/site";

export function SheetListingDetailView({
  listing,
  similar = [],
  locale,
}: {
  listing: SheetListingView;
  similar?: SheetListingCardView[];
  locale: Locale;
}) {
  const copy = propertyListingStrings[locale];
  const place = sheetListingPlace(listing);
  const typeLabel = sheetListingTypeLabel(listing.propertyType, locale);
  const pageUrl = sheetListingPublicUrl(listing, locale);
  const price = listing.displayPrice != null ? formatMoney(listing.displayPrice) : copy.callForPrice;
  const statusLabel = sheetListingForSaleLabel(listing.status, locale);
  const numberLocale = locale === "es" ? "es-US" : "en-US";
  const stats = [
    listing.beds != null ? { label: copy.beds, value: String(listing.beds) } : null,
    listing.baths ? { label: copy.baths, value: listing.baths } : null,
    listing.sqft != null ? { label: copy.sqft, value: listing.sqft.toLocaleString(numberLocale) } : null,
    typeLabel ? { label: copy.type, value: typeLabel } : null,
  ].filter((item): item is { label: string; value: string } => item != null);
  const amenities = [
    listing.hoa ? { label: copy.hoa, value: listing.hoa } : null,
    listing.ac ? { label: copy.ac, value: listing.ac } : null,
    listing.roof ? { label: copy.roof, value: listing.roof } : null,
    listing.waterHeater ? { label: copy.waterHeater, value: listing.waterHeater } : null,
    listing.titleCompany ? { label: copy.titleCompany, value: listing.titleCompany } : null,
    listing.arv != null ? { label: copy.arv, value: formatMoney(listing.arv) } : null,
  ].filter((item): item is { label: string; value: string } => item != null);
  const mapQuery =
    listing.latitude != null && listing.longitude != null
      ? `${listing.latitude},${listing.longitude}`
      : encodeURIComponent(`${listing.address}${listing.city ? `, ${listing.city}` : ""}, Arizona`);

  return (
    <div className="bg-paper" lang={locale === "es" ? "es" : undefined}>
      <JsonLd data={sheetListingJsonLd(listing, locale)} />
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
        <Link href={sheetListingCatalogHref(locale)} className="inline-flex min-h-11 items-center text-sm font-semibold text-pine">
          {copy.back}
        </Link>

        <SheetListingPhotos photos={listing.photos} title={listing.title || listing.address} locale={locale}>
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
            <div>
              {listing.priceDropped || listing.updated ? (
                <div className="mb-3">
                  <SheetListingFlags priceDropped={listing.priceDropped} updated={listing.updated} locale={locale} />
                </div>
              ) : null}
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-link">{statusLabel}</p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink md:text-4xl">{listing.title}</h1>
              <p className="mt-2 text-lg text-muted">{place}</p>
              {listing.localTargetArea ? <p className="mt-1 text-sm text-muted">{listing.localTargetArea}</p> : null}
              {listing.listingCode ? <p className="mt-1 text-sm text-muted">{listing.listingCode}</p> : null}

              <p className="mt-5 text-3xl font-semibold text-ink">{price}</p>
              <SheetListingPriceChange
                listPrice={listing.listPrice}
                previousPrice={listing.previousPrice}
                drop={listing.drop}
                locale={locale}
              />

              {stats.length > 0 ? (
                <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-line bg-panel px-3 py-3">
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{stat.label}</dt>
                      <dd className="mt-1 text-base font-semibold text-ink">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <a
                href={site.phoneTel}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-navy px-4 text-base font-semibold text-white lg:hidden"
              >
                {copy.call} {site.phoneDisplay}
              </a>

              <div className="mt-6">
                <ShareListing title={listing.title || listing.address} url={pageUrl} locale={locale} />
              </div>

              {listing.description ? (
                <section className="mt-10">
                  <h2 className="text-xl font-semibold text-ink">{copy.about}</h2>
                  <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-ink">{listing.description}</p>
                </section>
              ) : null}

              {listing.priceHistory ? (
                <section className="mt-10">
                  <h2 className="text-xl font-semibold text-ink">{copy.priceHistory}</h2>
                  <p className="mt-4 rounded-xl border border-line bg-panel px-4 py-4 whitespace-pre-wrap text-base leading-7 text-ink">
                    {listing.priceHistory}
                  </p>
                </section>
              ) : null}

              {amenities.length > 0 ? (
                <section className="mt-10">
                  <h2 className="text-xl font-semibold text-ink">{copy.facts}</h2>
                  <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                    {amenities.map((item) => (
                      <div key={item.label} className="rounded-xl border border-line bg-panel px-4 py-4">
                        <dt className="text-sm text-muted">{item.label}</dt>
                        <dd className="mt-1 text-base font-semibold text-ink">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}

              {listing.driveFolderUrl ? (
                <a href={listing.driveFolderUrl} className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-pine">
                  {copy.openFolder}
                </a>
              ) : null}

              <section className="mt-10">
                <h2 className="text-xl font-semibold text-ink">{copy.map}</h2>
                <p className="mt-2 text-sm text-muted">
                  {listing.latitude != null && listing.longitude != null ? copy.mapCoords : copy.mapAddress}
                </p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-line">
                  <iframe
                    title={copy.mapTitle(listing.address)}
                    src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-72 w-full"
                  />
                </div>
                <a href={`https://maps.google.com/maps?q=${mapQuery}`} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-pine">
                  {copy.openMap}
                </a>
              </section>
            </div>

            <aside className="lg:sticky lg:top-4 lg:self-start">
              <div className="rounded-2xl border border-line bg-panel p-5 shadow-[0_8px_30px_rgba(16,36,61,0.06)]">
                <p className="inline-flex min-h-7 items-center rounded-md bg-navy px-2 text-xs font-semibold text-white">{statusLabel}</p>
                <p className="mt-3 text-3xl font-semibold text-ink">{price}</p>
                <SheetListingPriceChange
                  listPrice={listing.listPrice}
                  previousPrice={listing.previousPrice}
                  drop={listing.drop}
                  locale={locale}
                />
                {listing.arv != null ? (
                  <p className="mt-2 text-sm text-muted">
                    {copy.arv} {formatMoney(listing.arv)}
                  </p>
                ) : null}
                <a
                  href={site.phoneTel}
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-navy px-4 text-base font-semibold text-white"
                >
                  {copy.call} {site.phoneDisplay}
                </a>
                <div className="mt-6 border-t border-line pt-5">
                  <SheetListingInquiry listingId={listing.id} title={listing.title} address={place} locale={locale} />
                </div>
              </div>
            </aside>
          </div>
        </SheetListingPhotos>
        <SheetListingSimilar listings={similar} locale={locale} />
      </div>
    </div>
  );
}
