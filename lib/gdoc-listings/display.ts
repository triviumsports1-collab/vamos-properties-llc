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
