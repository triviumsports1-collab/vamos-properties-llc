import type { SheetListingCardView, SheetListingView } from "@/lib/dal/gdoc-listings";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/routes";

export const PROPERTIES_CATALOG_PATH = "/properties";
export const PROPERTIES_CATALOG_PATH_ES = "/es/propiedades";

export function sheetListingCatalogHref(locale: Locale = "en") {
  return locale === "es" ? PROPERTIES_CATALOG_PATH_ES : PROPERTIES_CATALOG_PATH;
}

export function sheetListingHref(id: string, locale: Locale = "en") {
  return `${sheetListingCatalogHref(locale)}/${encodeURIComponent(id)}`;
}

export function sheetListingPlace(listing: Pick<SheetListingView, "address" | "city">) {
  if (listing.city && !listing.address.toLowerCase().includes(listing.city.toLowerCase())) {
    return `${listing.address}, ${listing.city}`;
  }
  return listing.address;
}

export function sheetListingStatusLabel(status: string, removed: boolean, locale: Locale = "en") {
  const copy = propertyListingStrings[locale];
  if (removed) return copy.statusInactive;
  if (status === "active") return copy.statusActive;
  if (status === "under_contract") return copy.statusUnderContract;
  if (status === "sold") return copy.statusSold;
  if (status === "inactive") return copy.statusInactive;
  return status.replaceAll("_", " ");
}

export function sheetListingTypeLabel(type: string, locale: Locale = "en") {
  return propertyListingStrings[locale].types[type] || type;
}

export function sheetListingForSaleLabel(status: string, locale: Locale = "en") {
  const copy = propertyListingStrings[locale];
  return status === "active" ? copy.forSale : sheetListingStatusLabel(status, false, locale);
}

export function sheetSyncRunLabel(status: string) {
  if (status === "ok") return "Copied";
  if (status === "running") return "Running";
  if (status === "skipped") return "Skipped";
  return "Failed";
}

export function sheetSyncTriggerLabel(trigger: string) {
  return trigger === "admin" ? "Desk" : "Webhook";
}

export function sheetSyncEventLabel(action: string, reason: string) {
  if (action === "created") return "Added from the sheet";
  if (action === "held") return "Left alone (desk copy)";
  if (action === "inactivated") return "Taken off the public page (left the sheet)";
  if (reason === "price_drop") return "Asking price dropped";
  if (reason === "price_change") return "Asking price changed";
  if (reason === "restored") return "Restored to the public page";
  if (reason === "content_changed") return "Sheet fields changed";
  return reason.replaceAll("_", " ");
}

export function sheetListingTypes(listings: SheetListingCardView[]) {
  const seen = new Set<string>();
  const types: string[] = [];
  for (const listing of listings) {
    const value = listing.propertyType.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    types.push(value);
  }
  return types.sort((left, right) => left.localeCompare(right));
}
