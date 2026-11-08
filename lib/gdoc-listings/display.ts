import type { SheetListingCardView, SheetListingView } from "@/lib/dal/gdoc-listings";

export function sheetListingPlace(listing: Pick<SheetListingView, "address" | "city">) {
  if (listing.city && !listing.address.toLowerCase().includes(listing.city.toLowerCase())) {
    return `${listing.address}, ${listing.city}`;
  }
  return listing.address;
}

export function sheetListingHref(id: string) {
  return `/sheet-listings/${encodeURIComponent(id)}`;
}

export function sheetListingStatusLabel(status: string, removed: boolean) {
  if (removed) return "Inactive";
  if (status === "active") return "Active";
  if (status === "under_contract") return "Under contract";
  if (status === "sold") return "Sold";
  if (status === "inactive") return "Inactive";
  return status.replaceAll("_", " ");
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
