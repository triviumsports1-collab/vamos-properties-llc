import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { listingStatusLabel } from "@/lib/admin/pipeline";
import { listListings } from "@/lib/dal/listings";
import { propertyTypeLabel } from "@/lib/listings/catalog";
import { formatMoney } from "@/lib/listings/money";

export const metadata: Metadata = {
  title: "Listings",
};

export default function ListingsPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-base text-muted">Loading listings…</p>}>
      <Listings />
    </Suspense>
  );
}

async function Listings() {
  const listings = await listListings();

  return (
    <AdminShell current="/admin/listings">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-ink">Listings</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
              Houses Vamos can offer. Available and under-contract listings show at /listings. The seller menu stays about selling.
            </p>
          </div>
          <Link href="/admin/listings/new" className="inline-flex min-h-12 items-center bg-amber px-4 text-base font-semibold text-amber-ink">
            New listing
          </Link>
        </div>
        {listings.length === 0 ? (
          <p className="mt-8 border border-line bg-panel px-4 py-6 text-base text-ink">No listings yet.</p>
        ) : (
          <ul className="mt-8 grid gap-3">
            {listings.map((listing) => (
              <li key={listing.id}>
                <Link href={`/admin/listings/${listing.id}`} className="block border border-line bg-panel px-4 py-4">
                  <p className="text-lg font-semibold text-ink">{listing.title}</p>
                  <p className="mt-1 text-base text-ink">{listing.address}</p>
                  <p className="mt-2 text-sm text-muted">
                    {listingStatusLabel(listing.status)}
                    {listing.price ? ` · ${listing.price}` : ""}
                    {listing.drop ? " · Price dropped" : ""}
                    {listing.beds ? ` · ${listing.beds} bd` : ""}
                    {listing.baths ? ` · ${listing.baths} ba` : ""}
                    {listing.sqft ? ` · ${listing.sqft} sqft` : ""}
                    {listing.propertyType ? ` · ${propertyTypeLabel(listing.propertyType)}` : ""}
                    {listing.source === "email" ? " · From email" : ""}
                    {listing.arv != null ? ` · ARV ${formatMoney(listing.arv)}` : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AdminShell>
  );
}
