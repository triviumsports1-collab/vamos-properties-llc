import type { Metadata } from "next";
import { sheetListingHref, sheetListingPlace } from "@/lib/gdoc-listings/display";
import type { SheetListingView } from "@/lib/gdoc-listings/types";
import { site } from "@/lib/site";

export function sheetListingSearchTerms(...values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const value of values) {
    if (!value) continue;
    for (const item of value.split(/[,\n;|]+/)) {
      const term = item.trim();
      const key = term.toLowerCase();
      if (!term || seen.has(key)) continue;
      seen.add(key);
      terms.push(term);
    }
  }
  return terms;
}

export function sheetListingCanonicalPath(listing: { id: string; canonicalUrl: string }) {
  const url = listing.canonicalUrl.trim();
  if (!url) return sheetListingHref(listing.id);
  if (url.startsWith("/")) return url;
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}` || sheetListingHref(listing.id);
  } catch {
    return sheetListingHref(listing.id);
  }
}

export function sheetListingPublicUrl(listing: { id: string; canonicalUrl: string }) {
  const path = sheetListingCanonicalPath(listing);
  if (path.startsWith("http")) return path;
  return `${site.url}${path}`;
}

export function sheetListingCustomJsonLd(value: string): Record<string, unknown> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function sheetListingMetadata(listing: SheetListingView): Metadata {
  const place = sheetListingPlace(listing);
  const fallbackTitle = listing.title && listing.title !== listing.address ? listing.title : place;
  const title = listing.metaTitle || fallbackTitle;
  const description = (
    listing.metaDescription ||
    listing.description ||
    `A home at ${place}. Call before you visit.`
  ).slice(0, 320);
  const keywords = sheetListingSearchTerms(listing.metaKeywords, listing.localTargetArea, listing.city);
  const canonical = sheetListingCanonicalPath(listing);
  const url = sheetListingPublicUrl(listing);
  return {
    title: listing.metaTitle ? { absolute: listing.metaTitle } : fallbackTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: "en_US",
      images: listing.coverPhoto ? [{ url: listing.coverPhoto, alt: place }] : undefined,
    },
    twitter: {
      card: listing.coverPhoto ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export function sheetListingJsonLd(listing: SheetListingView): Record<string, unknown> {
  const custom = sheetListingCustomJsonLd(listing.schemaJsonLd);
  if (custom) return custom;

  const place = sheetListingPlace(listing);
  const pageUrl = sheetListingPublicUrl(listing);
  const keywords = sheetListingSearchTerms(listing.metaKeywords, listing.localTargetArea);
  const phone = site.phoneTel.replace(/^tel:/, "");
  const name = listing.metaTitle || listing.title || place;
  const description = listing.metaDescription || listing.description || `A home at ${place}.`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateListing",
        name,
        url: pageUrl,
        description,
        image: listing.photos.length > 0 ? listing.photos : undefined,
        keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
        identifier: listing.listingCode || undefined,
        address: {
          "@type": "PostalAddress",
          streetAddress: listing.address,
          addressLocality: listing.city || undefined,
          addressRegion: "AZ",
          postalCode: postalCodeFrom(listing),
          addressCountry: "US",
        },
        geo:
          listing.latitude != null && listing.longitude != null
            ? {
                "@type": "GeoCoordinates",
                latitude: listing.latitude,
                longitude: listing.longitude,
              }
            : undefined,
        offers: listing.listPrice
          ? {
              "@type": "Offer",
              price: listing.listPrice,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: pageUrl,
            }
          : undefined,
      },
      {
        "@type": ["RealEstateAgent", "LocalBusiness"],
        name: site.name,
        url: site.url,
        telephone: phone,
        areaServed: listing.localTargetArea || (listing.city ? `${listing.city}, Arizona` : site.area),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Homes from the listing sheet",
            item: `${site.url}/sheet-listings`,
          },
          { "@type": "ListItem", position: 3, name: listing.title || place, item: pageUrl },
        ],
      },
    ],
  };
}

export function sheetListingCatalogJsonLd(listings: Array<{ id: string; title: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Homes from the listing sheet",
    url: `${site.url}/sheet-listings`,
    numberOfItems: listings.length,
    itemListElement: listings.map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${site.url}${sheetListingHref(listing.id)}`,
      name: listing.title,
    })),
  };
}

function postalCodeFrom(listing: Pick<SheetListingView, "address" | "localTargetArea">) {
  const match = /\b(\d{5})(?:-\d{4})?\b/.exec(`${listing.localTargetArea} ${listing.address}`);
  return match?.[1];
}
