import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { SheetDeskTabs } from "@/components/admin/sheet-desk-tabs";
import { SheetListingMarginDesk } from "@/components/admin/sheet-listing-margin-desk";
import { SheetListingToolbar } from "@/components/admin/sheet-listing-toolbar";
import { SheetPricingRulePanel } from "@/components/admin/sheet-pricing-rule-panel";
import { SheetSyncHistory } from "@/components/admin/sheet-sync-history";
import { formatWhen } from "@/lib/admin/clock";
import {
  getSheetListingAdminSummary,
  listAdminSheetListingPlaces,
  listAdminSheetListings,
  listRecentSheetSyncRuns,
} from "@/lib/dal/sheet-listings";
import { getSheetPricingRule, getSheetPricingRuleAdmin, listRecentSheetPricingRuleEvents } from "@/lib/dal/sheet-pricing";
import { parseSheetDeskTab, sheetDeskHref, type SheetDeskQuery } from "@/lib/gdoc-listings/desk-href";
import { formatGlobalRule } from "@/lib/gdoc-listings/margin";
import { parseSheetListingView, sheetListingViews } from "@/lib/gdoc-listings/status";
import { parseDollars } from "@/lib/listings/money";
import type { SheetListingAdminSummary } from "@/lib/gdoc-listings/types";

export const metadata: Metadata = {
  title: "Sheet listings",
};

export const instant = false;

type DeskProps = {
  searchParams: Promise<{
    tab?: string | string[];
    view?: string | string[];
    q?: string | string[];
    min?: string | string[];
    max?: string | string[];
    city?: string | string[];
    region?: string | string[];
    margin?: string | string[];
  }>;
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
  const tab = parseSheetDeskTab(first(params.tab));
  const view = parseSheetListingView(first(params.view));
  const query = first(params.q).trim().slice(0, 80);
  const minRaw = first(params.min);
  const maxRaw = first(params.max);
  const city = first(params.city).trim();
  const region = first(params.region).trim();
  const marginRaw = first(params.margin);
  const margin = marginRaw === "with" || marginRaw === "without" ? marginRaw : "all";
  let minPrice = minRaw ? parseDollars(minRaw) : null;
  let maxPrice = maxRaw ? parseDollars(maxRaw) : null;
  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    const swap = minPrice;
    minPrice = maxPrice;
    maxPrice = swap;
  }

  const filters: SheetDeskQuery = { tab, view, q: query, min: minRaw, max: maxRaw, city, region, margin };

  if (tab === "rules") {
    const [summary, pricingRule, pricingEvents] = await Promise.all([
      getSheetListingAdminSummary(),
      getSheetPricingRuleAdmin(),
      listRecentSheetPricingRuleEvents(),
    ]);
    return (
      <DeskShell summary={summary} filters={filters}>
        <SheetPricingRulePanel rule={pricingRule} events={pricingEvents} />
      </DeskShell>
    );
  }

  const [summary, places, listings, runs, rule] = await Promise.all([
    getSheetListingAdminSummary(),
    listAdminSheetListingPlaces(),
    listAdminSheetListings({ view, query, minPrice, maxPrice, city, region, margin }),
    listRecentSheetSyncRuns(4),
    getSheetPricingRule(),
  ]);

  return (
    <DeskShell summary={summary} filters={filters}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusPills summary={summary} filters={filters} />
        <Link
          href={sheetDeskHref({ ...filters, tab: "rules" })}
          className="inline-flex min-h-11 items-center text-sm text-pine"
        >
          Global rule · {formatGlobalRule(rule)}
        </Link>
      </div>
      <SheetListingToolbar query={filters} places={places} sheetsReady={summary.sheetsReady} resultCount={listings.length} />
      {listings.length === 0 ? (
        <p className="border border-line bg-panel px-4 py-6 text-base text-ink">
          {summary.total === 0
            ? "No sheet homes in the database yet. Run a copy when Google Sheets is configured."
            : "No sheet homes match this view."}
        </p>
      ) : (
        <SheetListingMarginDesk
          listings={listings}
          filters={{ view, q: query, min: minRaw, max: maxRaw, city, region, margin }}
        />
      )}
      <SheetSyncHistory runs={runs} />
    </DeskShell>
  );
}

function DeskShell({
  summary,
  filters,
  children,
}: {
  summary: SheetListingAdminSummary;
  filters: SheetDeskQuery;
  children: ReactNode;
}) {
  const tab = filters.tab === "rules" ? "rules" : "inventory";
  return (
    <AdminShell current="/admin/sheet-listings">
      <main className="mx-auto max-w-6xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-ink sm:text-3xl">Sheet listings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Inventory and markup for the public catalog at /properties. Custom markups stay locked through the next
              sheet copy.
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
          <Kpi label="Active" value={String(summary.active)} />
          <Kpi label="With markup" value={String(summary.withMargin)} />
          <Kpi label="Custom" value={String(summary.customMargins)} />
          <Kpi label="Last copy" value={summary.lastSyncedAt ? formatWhen(summary.lastSyncedAt) : "Not copied"} />
        </div>
        <div className="mt-6">
          <SheetDeskTabs query={filters} tab={tab} />
        </div>
        <div className="mt-6 grid gap-4">{children}</div>
      </main>
    </AdminShell>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-panel px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{label}</p>
      <p className="mt-1 break-words text-lg font-semibold text-ink sm:text-xl">{value}</p>
    </div>
  );
}

function StatusPills({ summary, filters }: { summary: SheetListingAdminSummary; filters: SheetDeskQuery }) {
  return (
    <div className="flex flex-wrap gap-1 overflow-x-auto border border-line bg-panel p-1 touch-scroll" aria-label="Listing status">
      {sheetListingViews.map((item) => {
        const href = sheetDeskHref({ ...filters, view: item.value });
        const active = filters.view === item.value;
        const count =
          item.value === "all"
            ? summary.total
            : item.value === "active"
              ? summary.active
              : item.value === "inactive"
                ? summary.inactive
                : item.value === "sold"
                  ? summary.sold
                  : summary.underContract;
        return (
          <Link
            key={item.value}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center px-3 text-sm ${
              active ? "bg-navy text-white" : "text-ink hover:bg-mist"
            }`}
          >
            {item.label}
            <span className={`ml-2 text-xs ${active ? "text-white/80" : "text-muted"}`}>{count}</span>
          </Link>
        );
      })}
    </div>
  );
}

function first(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}
