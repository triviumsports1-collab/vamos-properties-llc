import type { Metadata } from "next";
import {
  sheetListingCatalogHref,
  sheetListingHref,
  sheetListingPlace,
} from "@/lib/gdoc-listings/display";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import { hreflang, type Locale } from "@/lib/i18n/routes";
import type { SheetListingView } from "@/lib/gdoc-listings/types";
import { site } from "@/lib/site";

const BUSINESS_ID = `${site.url}#business`;
const RESIDENCE_TYPES = new Set(["Residence", "House", "SingleFamilyResidence", "Apartment", "Accommodation"]);

export type ListingCrumb = { name: string; path: string; url: string };

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

function rewriteLegacyListingPath(path: string) {
  return path.replace(/^\/sheet-listings(?=\/|$)/, "/properties");
}

export function sheetListingCanonicalPath(listing: { id: string; canonicalUrl: string }, locale: Locale = "en") {
  if (locale === "es") return sheetListingHref(listing.id, "es");
  const url = listing.canonicalUrl.trim();
  if (!url) return sheetListingHref(listing.id);
  if (url.startsWith("/")) return rewriteLegacyListingPath(url);
  try {
    const parsed = new URL(url);
    parsed.pathname = rewriteLegacyListingPath(parsed.pathname);
    return `${parsed.pathname}${parsed.search}` || sheetListingHref(listing.id);
  } catch {
    return sheetListingHref(listing.id);
  }
}

export function sheetListingPublicUrl(listing: { id: string; canonicalUrl: string }, locale: Locale = "en") {
  const path = sheetListingCanonicalPath(listing, locale);
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

export function sheetListingBreadcrumbs(listing: SheetListingView, locale: Locale = "en"): ListingCrumb[] {
  const copy = propertyListingStrings[locale];
  const place = sheetListingPlace(listing);
  const homePath = locale === "es" ? "/es" : "/";
  const catalogPath = sheetListingCatalogHref(locale);
  const pagePath = sheetListingCanonicalPath(listing, locale);
  return [
    { name: copy.home, path: homePath, url: `${site.url}${homePath === "/" ? "" : homePath}` },
    { name: copy.catalogTitle, path: catalogPath, url: `${site.url}${catalogPath}` },
    { name: listing.title || place, path: pagePath, url: sheetListingPublicUrl(listing, locale) },
  ];
}

export function sheetListingMetadata(listing: SheetListingView, locale: Locale = "en"): Metadata {
  const place = sheetListingPlace(listing);
  const fallbackTitle = listing.title && listing.title !== listing.address ? listing.title : place;
  const title = listing.metaTitle || fallbackTitle;
  const description = (
    listing.metaDescription ||
    listing.description ||
    (locale === "es" ? `Una casa en ${place}. Llame antes de ir.` : `A home at ${place}. Call before you visit.`)
  ).slice(0, 320);
  const keywords = sheetListingSearchTerms(listing.metaKeywords, listing.localTargetArea, listing.city);
  const canonical = sheetListingCanonicalPath(listing, locale);
  const url = sheetListingPublicUrl(listing, locale);
  const enPath = sheetListingHref(listing.id, "en");
  const esPath = sheetListingHref(listing.id, "es");
  const images = listing.coverPhoto ? [{ url: listing.coverPhoto, alt: place }] : undefined;
  return {
    title: listing.metaTitle ? { absolute: listing.metaTitle } : fallbackTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: { canonical, ...hreflang(enPath, esPath) },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: locale === "es" ? "es_US" : "en_US",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(listing.coverPhoto ? { images: [listing.coverPhoto] } : {}),
    },
  };
}

export function sheetListingJsonLd(listing: SheetListingView, locale: Locale = "en"): Record<string, unknown> {
  return mergeListingJsonLd(listingJsonLdGraph(listing, locale), sheetListingCustomJsonLd(listing.schemaJsonLd));
}

export function sheetListingCatalogJsonLd(
  listings: Array<{ id: string; title: string }>,
  locale: Locale = "en",
): Record<string, unknown> {
  const copy = propertyListingStrings[locale];
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy.catalogTitle,
    url: `${site.url}${sheetListingCatalogHref(locale)}`,
    numberOfItems: listings.length,
    itemListElement: listings.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${site.url}${sheetListingHref(item.id, locale)}`,
      name: item.title,
    })),
  };
}

function listingJsonLdGraph(listing: SheetListingView, locale: Locale): Record<string, unknown> {
  const place = sheetListingPlace(listing);
  const pageUrl = sheetListingPublicUrl(listing, locale);
  const keywords = sheetListingSearchTerms(listing.metaKeywords, listing.localTargetArea);
  const phone = site.phoneTel.replace(/^tel:/, "");
  const name = listing.metaTitle || listing.title || place;
  const description =
    listing.metaDescription || listing.description || (locale === "es" ? `Una casa en ${place}.` : `A home at ${place}.`);
  const address = {
    "@type": "PostalAddress",
    streetAddress: listing.address,
    addressLocality: listing.city || undefined,
    addressRegion: "AZ",
    postalCode: postalCodeFrom(listing),
    addressCountry: "US",
  };
  const geo =
    listing.latitude != null && listing.longitude != null
      ? {
          "@type": "GeoCoordinates",
          latitude: listing.latitude,
          longitude: listing.longitude,
        }
      : undefined;
  const images = listing.photos.length > 0 ? listing.photos : undefined;
  const baths = bathsTotal(listing.baths);
  const residenceId = `${pageUrl}#residence`;
  const offerId = `${pageUrl}#offer`;
  const crumbs = sheetListingBreadcrumbs(listing, locale);

  const residence: Record<string, unknown> = {
    "@type": schemaResidenceType(listing.propertyType),
    "@id": residenceId,
    name,
    description,
    image: images,
    address,
    geo,
    numberOfBedrooms: listing.beds ?? undefined,
    numberOfBathroomsTotal: baths,
    floorSize:
      listing.sqft != null
        ? { "@type": "QuantitativeValue", value: listing.sqft, unitCode: "FTK" }
        : undefined,
  };

  const offer = listing.displayPrice
    ? {
        "@type": "Offer",
        "@id": offerId,
        price: listing.displayPrice,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: pageUrl,
        businessFunction: "http://purl.org/goodrelations/v1#Sell",
        itemOffered: { "@id": residenceId },
        seller: { "@id": BUSINESS_ID },
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateListing",
        "@id": pageUrl,
        url: pageUrl,
        name,
        description,
        image: images,
        keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
        identifier: listing.listingCode || undefined,
        about: { "@id": residenceId },
        mainEntity: { "@id": residenceId },
        offers: offer ? { "@id": offerId } : undefined,
      },
      residence,
      ...(offer ? [offer] : []),
      {
        "@type": ["RealEstateAgent", "LocalBusiness"],
        "@id": BUSINESS_ID,
        name: site.name,
        url: site.url,
        telephone: phone,
        email: site.email,
        areaServed: listing.localTargetArea || (listing.city ? `${listing.city}, Arizona` : site.area),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      },
    ],
  };
}

function mergeListingJsonLd(
  generated: Record<string, unknown>,
  custom: Record<string, unknown> | null,
): Record<string, unknown> {
  const graph = asGraph(generated);
  if (!custom) {
    return { "@context": "https://schema.org", "@graph": graph };
  }

  const merged = new Map<string, Record<string, unknown>>();
  for (const node of graph) merged.set(nodeKey(node), node);
  for (const node of customNodes(custom)) {
    const key = nodeKey(node);
    const existing = merged.get(key);
    merged.set(key, existing ? mergeRecords(existing, node) : node);
  }

  return { "@context": "https://schema.org", "@graph": [...merged.values()] };
}

function customNodes(custom: Record<string, unknown>): Record<string, unknown>[] {
  if (Array.isArray(custom["@graph"])) {
    return custom["@graph"].map(asRecord).filter((node): node is Record<string, unknown> => node != null);
  }
  const rest = { ...custom };
  delete rest["@context"];
  return Object.keys(rest).length > 0 ? [rest] : [];
}

function asGraph(value: Record<string, unknown>): Record<string, unknown>[] {
  if (Array.isArray(value["@graph"])) {
    return value["@graph"].map(asRecord).filter((node): node is Record<string, unknown> => node != null);
  }
  const rest = { ...value };
  delete rest["@context"];
  return [rest];
}

function mergeRecords(base: Record<string, unknown>, extra: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(extra)) {
    if (key === "@context" || value === undefined) continue;
    if (key === "@id") continue;
    if (key === "@type") {
      out["@type"] = unionTypes(base, extra);
      continue;
    }
    const current = out[key];
    const extraRecord = asRecord(value);
    const currentRecord = asRecord(current);
    if (extraRecord && currentRecord) {
      out[key] = mergeRecords(currentRecord, extraRecord);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function nodeKey(node: Record<string, unknown>): string {
  const types = typesOf(node);
  if (types.includes("BreadcrumbList")) return "BreadcrumbList";
  if (types.includes("RealEstateListing")) return "RealEstateListing";
  if (types.some((type) => RESIDENCE_TYPES.has(type))) return "Residence";
  if (types.includes("Offer")) return "Offer";
  if (types.includes("LocalBusiness") || types.includes("RealEstateAgent")) return "Business";
  if (typeof node["@id"] === "string") return `id:${node["@id"]}`;
  return `extra:${types[0] ?? "Thing"}`;
}

function unionTypes(base: Record<string, unknown>, extra: Record<string, unknown>) {
  const union = [...new Set([...typesOf(base), ...typesOf(extra)])];
  return union.length === 1 ? union[0] : union;
}

function typesOf(node: Record<string, unknown>): string[] {
  const type = node["@type"];
  if (typeof type === "string") return [type];
  if (Array.isArray(type)) return type.filter((item): item is string => typeof item === "string");
  return [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function schemaResidenceType(propertyType: string) {
  if (propertyType === "condo") return "Apartment";
  if (propertyType === "house") return "SingleFamilyResidence";
  if (propertyType === "townhouse" || propertyType === "manufactured") return "House";
  return "Residence";
}

function bathsTotal(baths: string) {
  const match = /(\d+(?:\.\d+)?)/.exec(baths);
  if (!match) return undefined;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : undefined;
}

function postalCodeFrom(listing: Pick<SheetListingView, "address" | "localTargetArea">) {
  const match = /\b(\d{5})(?:-\d{4})?\b/.exec(`${listing.localTargetArea} ${listing.address}`);
  return match?.[1];
}
