import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { JsonLd } from "@/components/marketing/json-ld";
import { ListingGallery } from "@/components/marketing/listing-gallery";
import { ListingInquiry } from "@/components/marketing/listing-inquiry";
import { ListingSkeleton } from "@/components/marketing/listing-skeleton";
import { PaymentEstimate } from "@/components/marketing/payment-estimate";
import { Section } from "@/components/marketing/section";
import { ShareListing } from "@/components/marketing/share-listing";
import { formatWhen } from "@/lib/admin/clock";
import { getPublicListing } from "@/lib/dal/listings";
import { propertyTypeLabel } from "@/lib/listings/catalog";
import { formatMoney } from "@/lib/listings/money";
import { site } from "@/lib/site";

function searchTerms(value: string | null) {
  if (!value) return [];
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function publicPhoto(photo: string) {
  if (photo.startsWith("https://") || photo.startsWith("http://")) return photo;
  if (photo.startsWith("/")) return `${site.url}${photo}`;
  return "";
}

type DetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const listing = await getPublicListing(slug, 0);
  if (!listing) return { title: "Home" };
  const place = listing.city ? `${listing.address}, ${listing.city}` : listing.address;
  const title = listing.metaTitle || place;
  const description = listing.metaDescription || listing.summary || `A home at ${place}. Call before you visit.`;
  const keywords = [...searchTerms(listing.keywords), ...searchTerms(listing.localTags)];
  const image = listing.photos.map(publicPhoto).find(Boolean);
  return {
    title: listing.metaTitle ? { absolute: listing.metaTitle } : place,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: { canonical: `/listings/${slug}` },
    openGraph: {
      title,
      description,
      url: `/listings/${slug}`,
      type: "website",
      images: image ? [{ url: image, alt: place }] : undefined,
    },
  };
}

export default function ListingDetailPage({ params }: DetailProps) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: DetailProps) {
  await connection();
  const { slug } = await params;
  const listing = await getPublicListing(slug, Date.now());
  if (!listing) notFound();

  const specs = [
    listing.beds != null ? `${listing.beds} bedrooms` : "",
    listing.baths ? `${listing.baths} bathrooms` : "",
    listing.sqft != null ? `${listing.sqft.toLocaleString("en-US")} sqft` : "",
    listing.yearBuilt ? `Built ${listing.yearBuilt}` : "",
    propertyTypeLabel(listing.propertyType),
  ].filter(Boolean);
  const mapQuery = encodeURIComponent(`${listing.address}${listing.city ? `, ${listing.city}` : ""}, Arizona`);
  const pageUrl = `${site.url}/listings/${listing.slug}`;
  const place = listing.city ? `${listing.address}, ${listing.city}` : listing.address;
  const description = listing.metaDescription || listing.summary || listing.description || `A home at ${place}.`;
  const keywords = [...searchTerms(listing.keywords), ...searchTerms(listing.localTags)];
  const images = listing.photos.map(publicPhoto).filter(Boolean);
  const phone = site.phoneTel.replace(/^tel:/, "");

  return (
    <Section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "RealEstateListing",
              name: listing.metaTitle || listing.title || place,
              url: pageUrl,
              description,
              image: images.length > 0 ? images : undefined,
              datePosted: listing.publishedAt ?? undefined,
              keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
              address: {
                "@type": "PostalAddress",
                streetAddress: listing.address,
                addressLocality: listing.city ?? undefined,
                addressRegion: "AZ",
                addressCountry: "US",
              },
              offers: listing.listPrice
                ? {
                    "@type": "Offer",
                    price: listing.listPrice,
                    priceCurrency: "USD",
                    availability:
                      listing.status === "under_contract" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
                    url: pageUrl,
                  }
                : undefined,
            },
            {
              "@type": ["RealEstateAgent", "LocalBusiness"],
              name: site.name,
              url: site.url,
              telephone: phone,
              areaServed: listing.city ? `${listing.city}, Arizona` : site.area,
              address: {
                "@type": "PostalAddress",
                addressLocality: listing.city ?? "Phoenix",
                addressRegion: "AZ",
                addressCountry: "US",
              },
            },
          ],
        }}
      />
      <Link href="/listings" className="inline-flex min-h-11 items-center text-sm text-pine">
        See all the homes
      </Link>
      <div className="mt-4 flex flex-wrap gap-2">
        {listing.isNew ? <span className="inline-flex min-h-7 items-center bg-navy px-2 text-xs font-semibold text-white">New</span> : null}
        {listing.drop ? <span className="inline-flex min-h-7 items-center bg-amber px-2 text-xs font-semibold text-amber-ink">Price dropped</span> : null}
        {listing.status === "under_contract" ? (
          <span className="inline-flex min-h-7 items-center bg-navy px-2 text-xs font-semibold text-white">Under contract</span>
        ) : null}
      </div>
      <h1 className="mt-3 text-4xl font-semibold text-ink">{listing.address}</h1>
      <p className="mt-2 text-lg text-muted">
        {[listing.city, "Arizona"].filter(Boolean).join(", ")}
        {listing.title && listing.title !== listing.address ? ` · ${listing.title}` : ""}
      </p>
      <div className="mt-6">
        <ListingGallery photos={listing.photos} title={listing.address} />
        {listing.driveFolderUrl ? (
          <a href={listing.driveFolderUrl} className="mt-3 inline-flex min-h-11 items-center text-pine">
            Photo folder
          </a>
        ) : null}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-8">
          <div>
            <p className="text-3xl font-semibold text-ink">{listing.listPrice != null ? formatMoney(listing.listPrice) : "Call for the price"}</p>
            {listing.drop && listing.previousPrice != null ? (
              <p className="mt-2 text-base text-muted">
                <span className="line-through">{formatMoney(listing.previousPrice)}</span>
                {` · Down ${formatMoney(listing.drop)}`}
                {listing.priceChangedAt ? ` on ${formatWhen(listing.priceChangedAt)}` : ""}
              </p>
            ) : null}
            {listing.arv != null ? <p className="mt-2 text-base text-muted">ARV {formatMoney(listing.arv)}</p> : null}
            {specs.length > 0 ? <p className="mt-4 text-base text-ink">{specs.join(" · ")}</p> : null}
            <div className="mt-4">
              <ShareListing title={listing.address} url={pageUrl} />
            </div>
          </div>
          {listing.status === "under_contract" ? (
            <p className="border border-line bg-mist px-4 py-3 text-base text-ink">This home is under contract. Ask if a backup conversation is still open.</p>
          ) : null}
          {listing.description ? <p className="whitespace-pre-wrap text-base leading-7 text-ink">{listing.description}</p> : null}
          {listing.summary && !listing.description ? <p className="text-base leading-7 text-ink">{listing.summary}</p> : null}
          {listing.terms ? (
            <section>
              <h2 className="text-xl font-semibold text-ink">Price and terms</h2>
              <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-ink">{listing.terms}</p>
            </section>
          ) : null}
          {listing.features.length > 0 ? (
            <section>
              <h2 className="text-xl font-semibold text-ink">Features</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {listing.features.map((feature) => (
                  <li key={feature} className="border border-line bg-panel px-3 py-3 text-base text-ink">
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {listing.neighborhood ? (
            <section>
              <h2 className="text-xl font-semibold text-ink">Neighborhood</h2>
              <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-ink">{listing.neighborhood}</p>
            </section>
          ) : null}
          {listing.schools ? (
            <section>
              <h2 className="text-xl font-semibold text-ink">Schools</h2>
              <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-ink">{listing.schools}</p>
            </section>
          ) : null}
          {listing.prices.filter((price) => price.previousAmount != null).length > 0 ? (
            <section>
              <h2 className="text-xl font-semibold text-ink">Price history</h2>
              <ul className="mt-3 grid gap-2">
                {listing.prices
                  .filter((price) => price.previousAmount != null)
                  .map((price) => (
                    <li key={price.id} className="text-base text-ink">
                      {formatMoney(price.previousAmount)} to {formatMoney(price.amount)} · {formatWhen(price.recordedAt)}
                    </li>
                  ))}
              </ul>
            </section>
          ) : null}
          <PaymentEstimate price={listing.listPrice} monthlyPayment={listing.monthlyPayment} />
          <section>
            <h2 className="text-xl font-semibold text-ink">Map</h2>
            <p className="mt-2 text-sm text-muted">The pin is a search for the address. Confirm it before you visit.</p>
            <iframe title={`Map of ${listing.address}`} src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`} className="mt-3 h-72 w-full border border-line" />
            <a href={`https://maps.google.com/maps?q=${mapQuery}`} className="mt-3 inline-flex min-h-11 items-center text-pine">
              Open the map
            </a>
          </section>
        </div>
        <div className="lg:sticky lg:top-4 lg:self-start">
          <ListingInquiry address={`${listing.address}${listing.city ? `, ${listing.city}` : ""}`} sourcePath={`/listings/${listing.slug}`} />
        </div>
      </div>
    </Section>
  );
}
