"use client";

import { useMemo, useState } from "react";
import { SheetListingCard } from "@/components/marketing/sheet-listing-card";
import { sheetListingTypes } from "@/lib/gdoc-listings/display";
import { propertyTypeLabel } from "@/lib/listings/catalog";
import type { SheetListingCardView } from "@/lib/dal/gdoc-listings";

export function SheetListingCatalog({ listings }: { listings: SheetListingCardView[] }) {
  const [query, setQuery] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const types = useMemo(() => sheetListingTypes(listings), [listings]);
  const needle = query.trim().toLowerCase();
  const visible = listings.filter((listing) => {
    if (propertyType && listing.propertyType !== propertyType) return false;
    if (!needle) return true;
    const haystack = `${listing.title} ${listing.address} ${listing.city}`.toLowerCase();
    return haystack.includes(needle);
  });

  return (
    <div>
      <form
        className="grid gap-3 border border-line bg-panel p-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto]"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block text-sm text-ink">
          Search
          <input
            type="search"
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            placeholder="Address or title"
            className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
          />
        </label>
        <label className="block text-sm text-ink">
          Property type
          <select
            name="type"
            value={propertyType}
            onChange={(event) => setPropertyType(event.target.value)}
            className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
          >
            <option value="">All types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {propertyTypeLabel(type) || type}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center bg-navy px-4 text-base font-semibold text-white sm:w-auto">
            Show homes
          </button>
        </div>
      </form>
      {visible.length === 0 ? (
        <p className="mt-8 border border-line bg-panel px-4 py-6 text-base text-ink">
          {needle || propertyType ? "Nothing matches that search right now." : "No homes are on the sheet right now."}
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((listing) => (
            <li key={listing.id}>
              <SheetListingCard listing={listing} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
