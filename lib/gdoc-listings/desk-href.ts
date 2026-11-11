export type SheetDeskTab = "inventory" | "rules";

export type SheetDeskQuery = {
  tab?: SheetDeskTab;
  view: string;
  q: string;
  min: string;
  max: string;
  city: string;
  region: string;
  margin: string;
};

export function parseSheetDeskTab(value: string | undefined): SheetDeskTab {
  return value === "rules" ? "rules" : "inventory";
}

export function sheetDeskHref(input: SheetDeskQuery) {
  const params = new URLSearchParams();
  if (input.tab === "rules") params.set("tab", "rules");
  if (input.view && input.view !== "all") params.set("view", input.view);
  if (input.q) params.set("q", input.q);
  if (input.min) params.set("min", input.min);
  if (input.max) params.set("max", input.max);
  if (input.city) params.set("city", input.city);
  if (input.region) params.set("region", input.region);
  if (input.margin && input.margin !== "all") params.set("margin", input.margin);
  const query = params.toString();
  return query ? `/admin/sheet-listings?${query}` : "/admin/sheet-listings";
}

export function sheetDeskAdvancedCount(input: Pick<SheetDeskQuery, "min" | "max" | "city" | "region" | "margin">) {
  let count = 0;
  if (input.min) count += 1;
  if (input.max) count += 1;
  if (input.city) count += 1;
  if (input.region) count += 1;
  if (input.margin && input.margin !== "all") count += 1;
  return count;
}
