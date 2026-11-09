import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/marketing/json-ld";
import { ShareListing } from "@/components/marketing/share-listing";
import { SheetListingFlags, SheetListingPriceChange } from "@/components/marketing/sheet-listing-flags";
import { SheetListingInquiry } from "@/components/marketing/sheet-listing-inquiry";
import { SheetListingPhotos } from "@/components/marketing/sheet-listing-photos";
import { getSheetListingById, listPublicSheetListingSlugs } from "@/lib/dal/gdoc-listings";
import { sheetListingHref, sheetListingPlace, sheetListingStatusLabel } from "@/lib/gdoc-listings/display";
import { sheetListingJsonLd, sheetListingMetadata, sheetListingPublicUrl } from "@/lib/gdoc-listings/seo";
import { SHEET_LISTINGS_TAG } from "@/lib/gdoc-listings/types";
import { propertyTypeLabel } from "@/lib/listings/catalog";
import { formatMoney } from "@/lib/listings/money";
import { site } from "@/lib/site";

type DetailProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await listPublicSheetListingSlugs();
    if (slugs.length === 0) return [{ id: "_" }];
    return slugs.map((id) => ({ id }));
  } catch {
    return [{ id: "_" }];
  }
}

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  const { id } = await params;
  const listing = await getSheetListingById(id);
  if (!listing) return { title: "Home", robots: { index: false, follow: false } };
  return sheetListingMetadata(listing);
}

export default async function SheetListingDetailPage({ params }: DetailProps) {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  const { id } = await params;
  const listing = await getSheetListingById(id);
  if (!listing) notFound();
  if (id !== listing.id) permanentRedirect(sheetListingHref(listing.id));

  const place = sheetListingPlace(listing);
  const typeLabel = propertyTypeLabel(listing.propertyType) || listing.propertyType;
  const pageUrl = sheetListingPublicUrl(listing);
  const price = listing.listPrice != null ? formatMoney(listing.listPrice) : "Call for the price";
  const statusLabel = listing.status === "active" ? "For sale" : sheetListingStatusLabel(listing.status, false);
  const stats = [
    listing.beds != null ? { label: "Beds", value: String(listing.beds) } : null,
    listing.baths ? { label: "Baths", value: listing.baths } : null,
    listing.sqft != null ? { label: "Sq ft", value: listing.sqft.toLocaleString("en-US") } : null,
    typeLabel ? { label: "Type", value: typeLabel } : null,
  ].filter((item): item is { label: string; value: string } => item != null);
  const amenities = [
    listing.hoa ? { label: "HOA", value: listing.hoa } : null,
    listing.ac ? { label: "A/C", value: listing.ac } : null,
    listing.roof ? { label: "Roof", value: listing.roof } : null,
    listing.waterHeater ? { label: "Water heater", value: listing.waterHeater } : null,
    listing.titleCompany ? { label: "Title company", value: listing.titleCompany } : null,
    listing.arv != null ? { label: "ARV", value: formatMoney(listing.arv) } : null,
  ].filter((item): item is { label: string; value: string } => item != null);
  const mapQuery =
    listing.latitude != null && listing.longitude != null
      ? `${listing.latitude},${listing.longitude}`
      : encodeURIComponent(`${listing.address}${listing.city ? `, ${listing.city}` : ""}, Arizona`);

  return (
    <div className="bg-paper">
      <JsonLd data={sheetListingJsonLd(listing)} />
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
        <Link href="/sheet-listings" className="inline-flex min-h-11 items-center text-sm font-semibold text-pine">
          All sheet homes
        </Link>

        <SheetListingPhotos photos={listing.photos} title={listing.title || listing.address}>
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
            <div>
              {listing.priceDropped || listing.updated ? (
                <div className="mb-3">
                  <SheetListingFlags priceDropped={listing.priceDropped} updated={listing.updated} />
                </div>
              ) : null}
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-link">{statusLabel}</p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-ink md:text-4xl">{listing.title}</h1>
              <p className="mt-2 text-lg text-muted">{place}</p>
              {listing.localTargetArea ? <p className="mt-1 text-sm text-muted">{listing.localTargetArea}</p> : null}
              {listing.listingCode ? <p className="mt-1 text-sm text-muted">{listing.listingCode}</p> : null}

              <p className="mt-5 text-3xl font-semibold text-ink">{price}</p>
              <SheetListingPriceChange listPrice={listing.listPrice} previousPrice={listing.previousPrice} drop={listing.drop} />

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
                Call {site.phoneDisplay}
              </a>

              <div className="mt-6">
                <ShareListing title={listing.title || listing.address} url={pageUrl} />
              </div>

              {listing.description ? (
                <section className="mt-10">
                  <h2 className="text-xl font-semibold text-ink">About this home</h2>
                  <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-ink">{listing.description}</p>
                </section>
              ) : null}

              {listing.priceHistory ? (
                <section className="mt-10">
                  <h2 className="text-xl font-semibold text-ink">Price history</h2>
                  <p className="mt-4 rounded-xl border border-line bg-panel px-4 py-4 whitespace-pre-wrap text-base leading-7 text-ink">
                    {listing.priceHistory}
                  </p>
                </section>
              ) : null}

              {amenities.length > 0 ? (
                <section className="mt-10">
                  <h2 className="text-xl font-semibold text-ink">Facts and features</h2>
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
                  Open the photo folder
                </a>
              ) : null}

              <section className="mt-10">
                <h2 className="text-xl font-semibold text-ink">Map</h2>
                <p className="mt-2 text-sm text-muted">
                  {listing.latitude != null && listing.longitude != null
                    ? "The pin uses the coordinates from the listing sheet. Confirm it before you visit."
                    : "The pin is a search for the address. Confirm it before you visit."}
                </p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-line">
                  <iframe title={`Map of ${listing.address}`} src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`} className="h-72 w-full" />
                </div>
                <a href={`https://maps.google.com/maps?q=${mapQuery}`} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-pine">
                  Open the map
                </a>
              </section>
            </div>

            <aside className="lg:sticky lg:top-4 lg:self-start">
              <div className="rounded-2xl border border-line bg-panel p-5 shadow-[0_8px_30px_rgba(16,36,61,0.06)]">
                <p className="inline-flex min-h-7 items-center rounded-md bg-navy px-2 text-xs font-semibold text-white">{statusLabel}</p>
                <p className="mt-3 text-3xl font-semibold text-ink">{price}</p>
                <SheetListingPriceChange listPrice={listing.listPrice} previousPrice={listing.previousPrice} drop={listing.drop} />
                {listing.arv != null ? <p className="mt-2 text-sm text-muted">ARV {formatMoney(listing.arv)}</p> : null}
                <a
                  href={site.phoneTel}
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-navy px-4 text-base font-semibold text-white"
                >
                  Call {site.phoneDisplay}
                </a>
                <div className="mt-6 border-t border-line pt-5">
                  <SheetListingInquiry listingId={listing.id} title={listing.title} address={place} />
                </div>
              </div>
            </aside>
          </div>
        </SheetListingPhotos>
      </div>
    </div>
  );
}
