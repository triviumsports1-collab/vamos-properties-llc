import Link from "next/link";
import { SheetListingSync } from "@/components/admin/sheet-listing-sync";
import { sheetDeskAdvancedCount, sheetDeskHref, type SheetDeskQuery } from "@/lib/gdoc-listings/desk-href";
import type { SheetListingAdminPlaces } from "@/lib/gdoc-listings/types";

export function SheetListingToolbar({
  query,
  places,
  sheetsReady,
  resultCount,
}: {
  query: SheetDeskQuery;
  places: SheetListingAdminPlaces;
  sheetsReady: boolean;
  resultCount: number;
}) {
  const advanced = sheetDeskAdvancedCount(query);
  const chips = filterChips(query);

  return (
    <div className="border border-line bg-panel">
      <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end">
      <form method="get" className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-end">
        {query.view !== "all" ? <input type="hidden" name="view" value={query.view} /> : null}
          <div className="min-w-0 flex-1">
            <label className="block text-sm text-ink" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={query.q}
              placeholder="Address, title, city, or listing ID"
              className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <details className="relative">
              <summary className="inline-flex min-h-12 cursor-pointer list-none items-center border border-line bg-paper px-4 text-sm text-ink [&::-webkit-details-marker]:hidden">
                Filters
                {advanced ? ` · ${advanced}` : ""}
              </summary>
              <div className="z-20 mt-2 grid max-h-[min(28rem,70dvh)] gap-3 overflow-y-auto border border-line bg-panel p-4 shadow-lg touch-scroll sm:absolute sm:right-0 sm:w-[22rem]">
                <div>
                  <label className="block text-sm text-ink" htmlFor="city">
                    City
                  </label>
                  <select
                    id="city"
                    name="city"
                    defaultValue={query.city}
                    className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
                  >
                    <option value="">All cities</option>
                    {places.cities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-ink" htmlFor="region">
                    Region
                  </label>
                  <select
                    id="region"
                    name="region"
                    defaultValue={query.region}
                    className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
                  >
                    <option value="">All regions</option>
                    {places.regions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-ink" htmlFor="min">
                      Min asking
                    </label>
                    <input
                      id="min"
                      name="min"
                      defaultValue={query.min}
                      inputMode="numeric"
                      placeholder="200000"
                      className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-ink" htmlFor="max">
                      Max asking
                    </label>
                    <input
                      id="max"
                      name="max"
                      defaultValue={query.max}
                      inputMode="numeric"
                      placeholder="800000"
                      className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-ink" htmlFor="margin">
                    Markup
                  </label>
                  <select
                    id="margin"
                    name="margin"
                    defaultValue={query.margin}
                    className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
                  >
                    <option value="all">All</option>
                    <option value="with">Has markup</option>
                    <option value="without">No markup</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="submit" className="inline-flex min-h-12 items-center bg-amber px-4 text-sm font-semibold text-amber-ink">
                    Apply filters
                  </button>
                  {advanced ? (
                    <Link
                      href={sheetDeskHref({ ...query, min: "", max: "", city: "", region: "", margin: "all" })}
                      className="inline-flex min-h-12 items-center px-3 text-sm text-pine"
                    >
                      Clear filters
                    </Link>
                  ) : null}
                </div>
              </div>
            </details>
            <button type="submit" className="inline-flex min-h-12 items-center bg-amber px-4 text-sm font-semibold text-amber-ink">
              Show homes
            </button>
          </div>
      </form>
        <div className="shrink-0">
          <SheetListingSync ready={sheetsReady} />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3">
        <p className="text-sm text-muted">
          {resultCount === 1 ? "1 home" : `${resultCount} homes`}
          {query.q ? ` matching “${query.q}”` : ""}
        </p>
        {chips.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip.key}>
                <Link
                  href={chip.href}
                  className="inline-flex min-h-11 items-center border border-line bg-mist px-3 text-sm text-ink"
                >
                  {chip.label}
                  <span className="ml-2 text-pine">Clear</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function filterChips(query: SheetDeskQuery) {
  const chips: { key: string; label: string; href: string }[] = [];
  if (query.q) {
    chips.push({
      key: "q",
      label: `Search: ${query.q}`,
      href: sheetDeskHref({ ...query, q: "" }),
    });
  }
  if (query.city) {
    chips.push({
      key: "city",
      label: `City: ${query.city}`,
      href: sheetDeskHref({ ...query, city: "" }),
    });
  }
  if (query.region) {
    chips.push({
      key: "region",
      label: `Region: ${query.region}`,
      href: sheetDeskHref({ ...query, region: "" }),
    });
  }
  if (query.min) {
    chips.push({
      key: "min",
      label: `Min $${query.min}`,
      href: sheetDeskHref({ ...query, min: "" }),
    });
  }
  if (query.max) {
    chips.push({
      key: "max",
      label: `Max $${query.max}`,
      href: sheetDeskHref({ ...query, max: "" }),
    });
  }
  if (query.margin === "with" || query.margin === "without") {
    chips.push({
      key: "margin",
      label: query.margin === "with" ? "Has markup" : "No markup",
      href: sheetDeskHref({ ...query, margin: "all" }),
    });
  }
  return chips;
}
