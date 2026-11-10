import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ListingForm } from "@/components/admin/listing-form";
import { formatWhen } from "@/lib/admin/clock";
import { getListing } from "@/lib/dal/listings";
import { formatMoney } from "@/lib/listings/money";

export const metadata: Metadata = {
  title: "Edit listing",
};

type EditProps = {
  params: Promise<{ id: string }>;
};

export default function EditListingPage({ params }: EditProps) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-base text-muted">Loading the listing…</p>}>
      <EditListing params={params} />
    </Suspense>
  );
}

async function EditListing({ params }: EditProps) {
  const { id } = await params;
  const listingId = Number(id);
  if (!Number.isInteger(listingId) || listingId < 1) notFound();
  const listing = await getListing(listingId);
  if (!listing) notFound();

  return (
    <AdminShell current="/admin/listings">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/admin/listings" className="inline-flex min-h-11 items-center text-sm text-pine">
          All listings
        </Link>
        <h1 className="mt-4 text-3xl font-semibold text-ink">{listing.title}</h1>
        {listing.prices.length > 0 ? (
          <section className="mt-6 border border-line bg-panel p-4">
            <h2 className="text-lg font-semibold text-ink">Price history</h2>
            <ul className="mt-3 grid gap-2">
              {listing.prices.map((price) => (
                <li key={price.id} className="text-base text-ink">
                  {formatMoney(price.amount)}
                  {price.previousAmount != null ? ` · was ${formatMoney(price.previousAmount)}` : " · first price"}
                  {` · ${formatWhen(price.recordedAt)}`}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <ListingForm listing={listing} />
      </main>
    </AdminShell>
  );
}
