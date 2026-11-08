import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/components/marketing/json-ld";
import { Section } from "@/components/marketing/section";
import { ShareListing } from "@/components/marketing/share-listing";
import { SheetListingFlags, SheetListingPriceChange } from "@/components/marketing/sheet-listing-flags";
import { SheetListingGalleries } from "@/components/marketing/sheet-listing-galleries";
import { SheetListingInquiry } from "@/components/marketing/sheet-listing-inquiry";
import { getSheetListingById, listPublicSheetListingSlugs } from "@/lib/dal/gdoc-listings";
import { SHEET_LISTINGS_TAG } from "@/lib/gdoc-listings/types";
import { sheetListingHref, sheetListingPlace } from "@/lib/gdoc-listings/display";
import { sheetListingJsonLd, sheetListingMetadata, sheetListingPublicUrl } from "@/lib/gdoc-listings/seo";
import { propertyTypeLabel } from "@/lib/listings/catalog";
import { formatMoney } from "@/lib/listings/money";
import { site } from "@/lib/site";

type DetailProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const slugs = await listPublicSheetListingSlugs();
  if (slugs.length === 0) return [{ id: "_" }];
  return slugs.map((id) => ({ id }));
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
  const mapQuery =
    listing.latitude != null && listing.longitude != null
      ? `${listing.latitude},${listing.longitude}`
      : encodeURIComponent(`${listing.address}${listing.city ? `, ${listing.city}` : ""}, Arizona`);

  return (
    <Section>
      <JsonLd data={sheetListingJsonLd(listing)} />
      <Link href="/sheet-listings" className="inline-flex min-h-11 items-center text-sm text-pine">
        See all sheet homes
      </Link>
      {listing.priceDropped || listing.updated ? (
        <div className="mt-4">
          <SheetListingFlags priceDropped={listing.priceDropped} updated={listing.updated} />
        </div>
      ) : null}
      <h1 className="mt-3 text-4xl font-semibold text-ink">{listing.title}</h1>
      <p className="mt-2 text-lg text-muted">
        {place}
        {typeLabel ? ` · ${typeLabel}` : ""}
        {listing.localTargetArea ? ` · ${listing.localTargetArea}` : ""}
      </p>
      {listing.listingCode ? <p className="mt-1 text-sm text-muted">{listing.listingCode}</p> : null}
      <div className="mt-6">
        <SheetListingGalleries galleries={listing.galleries} title={listing.address} />
        {listing.driveFolderUrl ? (
          <a href={listing.driveFolderUrl} className="mt-3 inline-flex min-h-11 items-center text-pine">
            Photo folder
          </a>
        ) : null}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-8">
          <div>
            <p className="text-3xl font-semibold text-ink">
              {listing.listPrice != null ? formatMoney(listing.listPrice) : "Call for the price"}
            </p>
            <SheetListingPriceChange listPrice={listing.listPrice} previousPrice={listing.previousPrice} drop={listing.drop} />
            {listing.arv != null ? <p className="mt-2 text-base text-muted">ARV {formatMoney(listing.arv)}</p> : null}
            <div className="mt-4">
              <ShareListing title={listing.title || listing.address} url={pageUrl} />
            </div>
          </div>
          {listing.specs.length > 0 ? (
            <section>
              <h2 className="text-xl font-semibold text-ink">Property specs</h2>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                {listing.specs.map((spec) => (
                  <div key={spec.label} className="border border-line bg-panel px-3 py-3">
                    <dt className="text-sm text-muted">{spec.label}</dt>
                    <dd className="mt-1 text-base font-semibold text-ink">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
          {listing.description ? (
            <section>
              <h2 className="text-xl font-semibold text-ink">Notes</h2>
              <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-ink">{listing.description}</p>
            </section>
          ) : null}
          <section>
            <h2 className="text-xl font-semibold text-ink">Map</h2>
            <p className="mt-2 text-sm text-muted">
              {listing.latitude != null && listing.longitude != null
                ? "The pin uses the coordinates from the listing sheet. Confirm it before you visit."
                : "The pin is a search for the address. Confirm it before you visit."}
            </p>
            <iframe
              title={`Map of ${listing.address}`}
              src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`}
              className="mt-3 h-72 w-full border border-line"
            />
            <a href={`https://maps.google.com/maps?q=${mapQuery}`} className="mt-3 inline-flex min-h-11 items-center text-pine">
              Open the map
            </a>
          </section>
        </div>
        <div className="lg:sticky lg:top-4 lg:self-start">
          <SheetListingInquiry listingId={listing.id} title={listing.title} address={place} />
          <a href={site.phoneTel} className="mt-4 inline-flex min-h-11 items-center font-semibold text-pine">
            Call about {place}
          </a>
        </div>
      </div>
    </Section>
  );
}
