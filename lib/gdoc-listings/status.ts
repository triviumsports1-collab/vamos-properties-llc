export const sheetListingStatuses = [
  { value: "active", label: "Active" },
  { value: "under_contract", label: "Under contract" },
  { value: "sold", label: "Sold" },
  { value: "inactive", label: "Inactive" },
] as const;

export type SheetListingStatus = (typeof sheetListingStatuses)[number]["value"];

export const sheetListingViews = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "under_contract", label: "Under contract" },
  { value: "sold", label: "Sold" },
] as const;

export type SheetListingViewFilter = (typeof sheetListingViews)[number]["value"];

export function isSheetListingStatus(value: string): value is SheetListingStatus {
  return sheetListingStatuses.some((item) => item.value === value);
}

export function isSheetListingView(value: string): value is SheetListingViewFilter {
  return sheetListingViews.some((item) => item.value === value);
}

export function parseSheetListingView(value: string | undefined): SheetListingViewFilter {
  if (!value) return "all";
  return isSheetListingView(value) ? value : "all";
}
