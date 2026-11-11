import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { SheetListingEditForm } from "@/components/admin/sheet-listing-edit-form";
import { SheetListingMarginForm } from "@/components/admin/sheet-listing-margin-form";
import { SheetListingRowActions } from "@/components/admin/sheet-listing-row-actions";
import { SheetListingStatusBadge } from "@/components/admin/sheet-listing-status";
import { formatWhen } from "@/lib/admin/clock";
import { getAdminSheetListingById, listSheetListingMarginEvents, listSheetSyncEventsForListing } from "@/lib/dal/sheet-listings";
import { formatMoney } from "@/lib/listings/money";
import { formatMarginPercent } from "@/lib/gdoc-listings/margin";
import { sheetListingHref, sheetSyncEventLabel } from "@/lib/gdoc-listings/display";

type EditProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Edit sheet home",
};

export default function EditSheetListingPage({ params }: EditProps) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-base text-muted">Loading the sheet home…</p>}>
      <EditSheetListing params={params} />
    </Suspense>
  );
}

async function EditSheetListing({ params }: EditProps) {
  const { id } = await params;
  const listing = await getAdminSheetListingById(decodeURIComponent(id));
  if (!listing) notFound();
  const events = await listSheetSyncEventsForListing(listing.id);
  const marginEvents = await listSheetListingMarginEvents(listing.id);

  return (
    <AdminShell current="/admin/sheet-listings">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/admin/sheet-listings" className="inline-flex min-h-11 items-center text-sm text-pine">
          All sheet listings
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SheetListingStatusBadge status={listing.status} removed={listing.removed} />
          {listing.held ? (
            <span className="inline-flex min-h-8 items-center border border-line bg-mist px-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Desk copy
            </span>
          ) : null}
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-ink">{listing.title}</h1>
        {listing.listingCode ? <p className="mt-1 text-sm text-muted">{listing.listingCode}</p> : null}
        <p className="mt-2 text-base text-ink">{listing.address}</p>
        <p className="mt-2 text-sm text-muted">
          Last copied {formatWhen(listing.syncedAt)}
          {listing.removedAt ? ` · taken off ${formatWhen(listing.removedAt)}` : ""}
        </p>
        {!listing.removed && listing.status === "active" ? (
          <Link href={sheetListingHref(listing.id)} className="mt-3 inline-flex min-h-11 items-center text-sm text-pine">
            View the public page
          </Link>
        ) : null}
        <SheetListingRowActions
          slug={listing.id}
          title={listing.title}
          removed={listing.removed || listing.status === "inactive"}
          publicVisible={!listing.removed && listing.status === "active"}
        />
        <SheetListingMarginForm listing={listing} />
        {marginEvents.length > 0 ? (
          <section className="mt-8 border border-line bg-panel p-5">
            <h2 className="text-lg font-semibold text-ink">Markup history</h2>
            <ul className="mt-3 grid gap-2 text-sm text-ink">
              {marginEvents.map((event, index) => (
                <li key={`${event.createdAt}-${index}`}>
                  {marginEventLabel(event)}
                  <span className="text-muted"> · {formatWhen(event.createdAt)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {events.length > 0 ? (
          <section className="mt-8 border border-line bg-panel p-5">
            <h2 className="text-lg font-semibold text-ink">Why this home changed</h2>
            <ul className="mt-3 grid gap-2 text-sm text-ink">
              {events.map((event, index) => (
                <li key={`${event.createdAt}-${index}`}>
                  {sheetSyncEventLabel(event.action, event.reason)}
                  <span className="text-muted"> · {formatWhen(event.createdAt)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <SheetListingEditForm listing={listing} />
      </main>
    </AdminShell>
  );
}

function marginEventLabel(event: {
  actorEmail: string;
  action: string;
  mode: string;
  nextAmount: number | null;
  nextPercentBps: number | null;
  nextDisplay: number | null;
}) {
  const who = event.actorEmail || "Admin";
  if (event.action === "follow_set" || event.action === "follow_clear") {
    return `${who} set this home to follow the global rule`;
  }
  if (event.action === "global_set") {
    return `${who} applied the global rule`;
  }
  if (event.action === "sync_set" || event.action === "sync_clear" || event.action === "sync_recompute") {
    return "Sheet copy updated markup";
  }
  if (event.action.endsWith("clear") || event.mode === "clear") {
    return `${who} removed markup`;
  }
  const amount = event.nextAmount != null ? formatMoney(event.nextAmount) : "markup";
  const percent = event.nextPercentBps != null ? ` (${formatMarginPercent(event.nextPercentBps)})` : "";
  const display = event.nextDisplay != null ? ` · display ${formatMoney(event.nextDisplay)}` : "";
  return `${who} set ${amount}${percent}${display}`;
}
