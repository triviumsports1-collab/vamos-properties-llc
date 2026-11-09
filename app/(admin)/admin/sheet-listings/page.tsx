import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { SheetListingRowActions } from "@/components/admin/sheet-listing-row-actions";
import { SheetListingStatusBadge } from "@/components/admin/sheet-listing-status";
import { SheetListingSync } from "@/components/admin/sheet-listing-sync";
import { formatWhen } from "@/lib/admin/clock";
import { getSheetListingAdminSummary, listAdminSheetListings, listRecentSheetSyncRuns } from "@/lib/dal/sheet-listings";
import { sheetSyncEventLabel, sheetSyncRunLabel, sheetSyncTriggerLabel } from "@/lib/gdoc-listings/display";
import { parseSheetListingView, sheetListingViews } from "@/lib/gdoc-listings/status";
import { formatMoney, parseDollars } from "@/lib/listings/money";

export const metadata: Metadata = {
  title: "Sheet listings",
};

type DeskProps = {
  searchParams: Promise<{ view?: string | string[]; q?: string | string[]; min?: string | string[]; max?: string | string[] }>;
};

export default function AdminSheetListingsPage({ searchParams }: DeskProps) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-base text-muted">Loading sheet listings…</p>}>
      <SheetListingsDesk searchParams={searchParams} />
    </Suspense>
  );
}

async function SheetListingsDesk({ searchParams }: DeskProps) {
  const params = await searchParams;
  const view = parseSheetListingView(first(params.view));
  const query = first(params.q).trim().slice(0, 80);
  const minRaw = first(params.min);
  const maxRaw = first(params.max);
  let minPrice = minRaw ? parseDollars(minRaw) : null;
  let maxPrice = maxRaw ? parseDollars(maxRaw) : null;
  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    const swap = minPrice;
    minPrice = maxPrice;
    maxPrice = swap;
  }

  const summary = await getSheetListingAdminSummary();
  const listings = await listAdminSheetListings({ view, query, minPrice, maxPrice });
  const runs = await listRecentSheetSyncRuns();
  const href = (nextView: string) => deskHref({ view: nextView, q: query, min: minRaw, max: maxRaw });

  return (
    <AdminShell current="/admin/sheet-listings">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-semibold text-ink">Sheet listings</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          Homes copied from the Google Sheet into Postgres. The public catalog at /sheet-listings reads this table. This
          desk does not change the /listings inventory.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard label="Total synced" value={String(summary.total)} />
          <SummaryCard label="Active" value={String(summary.active)} />
          <SummaryCard label="Inactive" value={String(summary.inactive)} />
          <SummaryCard label="Under contract" value={String(summary.underContract)} />
          <SummaryCard label="Sold" value={String(summary.sold)} />
          <SummaryCard label="Last sync" value={summary.lastSyncedAt ? formatWhen(summary.lastSyncedAt) : "Not copied yet"} />
        </div>
        <section className="mt-8 border border-line bg-panel p-5">
          <h2 className="text-lg font-semibold text-ink">Copy from Google Sheet</h2>
          <p className="mt-2 max-w-2xl text-base leading-7 text-muted">
            Updates existing homes by address, records a price change when the asking price moves, and takes missing rows
            off the public page. Homes marked “keep this desk copy” are left alone.
          </p>
          <div className="mt-4">
            <SheetListingSync ready={summary.sheetsReady} />
          </div>
          {runs.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <h3 className="text-base font-semibold text-ink">Recent copies</h3>
              <table className="mt-3 w-full min-w-[36rem] text-left text-sm text-ink">
                <thead>
                  <tr className="border-b border-line text-muted">
                    <th className="py-2 pr-3 font-medium">When</th>
                    <th className="py-2 pr-3 font-medium">Source</th>
                    <th className="py-2 pr-3 font-medium">Result</th>
                    <th className="py-2 pr-3 font-medium">Changes</th>
                    <th className="py-2 font-medium">Trace</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.errorId} className="border-b border-line">
                      <td className="py-2 pr-3">{formatWhen(run.startedAt)}</td>
                      <td className="py-2 pr-3">{sheetSyncTriggerLabel(run.trigger)}</td>
                      <td className="py-2 pr-3">
                        {sheetSyncRunLabel(run.status)}
                        {run.error ? ` · ${run.error.replaceAll("_", " ")}` : ""}
                      </td>
                      <td className="py-2 pr-3">
                        {run.status === "ok"
                          ? `${run.createdCount} new, ${run.updatedCount} updated, ${run.inactivatedCount} off page`
                          : "—"}
                      </td>
                      <td className="py-2 font-mono text-xs text-muted">{run.errorId.slice(0, 8)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {runs[0]?.events.length ? (
                <ul className="mt-3 grid gap-1 text-sm text-muted">
                  {runs[0].events.slice(0, 6).map((event, index) => (
                    <li key={`${event.createdAt}-${index}`}>
                      {sheetSyncEventLabel(event.action, event.reason)}
                      {event.listingCode ? ` · ${event.listingCode}` : event.slug ? ` · ${event.slug}` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </section>
        <div className="mt-8 flex flex-wrap gap-2">
          {sheetListingViews.map((item) => (
            <FilterLink key={item.value} href={href(item.value)} active={view === item.value}>
              {item.label}
              {item.value === "all"
                ? ` ${summary.total}`
                : item.value === "active"
                  ? ` ${summary.active}`
                  : item.value === "inactive"
                    ? ` ${summary.inactive}`
                    : item.value === "sold"
                      ? ` ${summary.sold}`
                      : ` ${summary.underContract}`}
            </FilterLink>
          ))}
        </div>
        <form method="get" className="mt-6 grid gap-3 border border-line bg-panel p-4 sm:grid-cols-4">
          {view !== "all" ? <input type="hidden" name="view" value={view} /> : null}
          <div className="sm:col-span-2">
            <label className="block text-sm text-ink" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={query}
              placeholder="Address, title, city, or listing ID"
              className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
            />
          </div>
          <div>
            <label className="block text-sm text-ink" htmlFor="min">
              Min price
            </label>
            <input
              id="min"
              name="min"
              defaultValue={minRaw}
              inputMode="numeric"
              placeholder="200000"
              className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
            />
          </div>
          <div>
            <label className="block text-sm text-ink" htmlFor="max">
              Max price
            </label>
            <input
              id="max"
              name="max"
              defaultValue={maxRaw}
              inputMode="numeric"
              placeholder="800000"
              className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
            />
          </div>
          <div className="flex flex-wrap items-end gap-2 sm:col-span-4">
            <button type="submit" className="inline-flex min-h-12 items-center bg-amber px-4 text-base font-semibold text-amber-ink">
              Show homes
            </button>
            {query || minRaw || maxRaw ? (
              <Link href={deskHref({ view, q: "", min: "", max: "" })} className="inline-flex min-h-12 items-center px-3 text-sm text-pine">
                Clear search
              </Link>
            ) : null}
          </div>
        </form>
        {listings.length === 0 ? (
          <p className="mt-8 border border-line bg-panel px-4 py-6 text-base text-ink">
            {summary.total === 0
              ? "No sheet homes in the database yet. Run a copy when Google Sheets is configured."
              : "No sheet homes match this view."}
          </p>
        ) : (
          <ul className="mt-8 grid gap-3">
            {listings.map((listing) => (
              <li key={listing.id} className="border border-line bg-panel px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <SheetListingStatusBadge status={listing.status} removed={listing.removed} />
                  {listing.held ? (
                    <span className="inline-flex min-h-8 items-center border border-line bg-mist px-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                      Desk copy
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-lg font-semibold text-ink">{listing.title}</p>
                {listing.listingCode ? <p className="mt-1 text-sm text-muted">{listing.listingCode}</p> : null}
                <p className="mt-1 text-base text-ink">{listing.address}</p>
                <p className="mt-2 text-sm text-muted">
                  {listing.city ? `${listing.city} · ` : ""}
                  {listing.listPrice != null ? formatMoney(listing.listPrice) : "No asking price"}
                  {listing.previousPrice != null ? ` · was ${formatMoney(listing.previousPrice)}` : ""}
                  {listing.priceDropped ? " · Price dropped" : ""}
                  {listing.updated ? " · Updated" : ""}
                  {` · Copied ${formatWhen(listing.syncedAt)}`}
                </p>
                <SheetListingRowActions
                  slug={listing.id}
                  title={listing.title}
                  removed={listing.removed || listing.status === "inactive"}
                  publicVisible={!listing.removed && listing.status === "active"}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </AdminShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-panel px-4 py-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-11 items-center border px-3 text-sm ${active ? "border-navy bg-navy text-white" : "border-line bg-panel text-ink"}`}
    >
      {children}
    </Link>
  );
}

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function deskHref(input: { view: string; q: string; min: string; max: string }) {
  const params = new URLSearchParams();
  if (input.view && input.view !== "all") params.set("view", input.view);
  if (input.q) params.set("q", input.q);
  if (input.min) params.set("min", input.min);
  if (input.max) params.set("max", input.max);
  const query = params.toString();
  return query ? `/admin/sheet-listings?${query}` : "/admin/sheet-listings";
}
