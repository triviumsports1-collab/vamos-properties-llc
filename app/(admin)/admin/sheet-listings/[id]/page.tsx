import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { SheetListingEditForm } from "@/components/admin/sheet-listing-edit-form";
import { SheetListingRowActions } from "@/components/admin/sheet-listing-row-actions";
import { SheetListingStatusBadge } from "@/components/admin/sheet-listing-status";
import { formatWhen } from "@/lib/admin/clock";
import { getAdminSheetListingById } from "@/lib/dal/sheet-listings";
import { sheetListingHref } from "@/lib/gdoc-listings/display";

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
        <SheetListingEditForm listing={listing} />
      </main>
    </AdminShell>
  );
}
