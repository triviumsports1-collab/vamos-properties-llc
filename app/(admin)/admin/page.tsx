import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { SheetListingSync } from "@/components/admin/sheet-listing-sync";
import { formatWhen } from "@/lib/admin/clock";
import { statusLabel } from "@/lib/admin/pipeline";
import { listLeadQueue, recentActivity } from "@/lib/dal/admin";
import { listListings } from "@/lib/dal/listings";
import { getSheetListingAdminSummary } from "@/lib/dal/sheet-listings";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-base text-muted">Loading the desk…</p>}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const [{ leads }, listings, activity] = await Promise.all([listLeadQueue(null), listListings(), recentActivity()]);
  const sheet = await getSheetListingAdminSummary();
  const open = leads.filter((lead) => lead.status !== "closed" && lead.status !== "lost");
  const urgent = open.filter((lead) => lead.urgent).length;
  const waiting = open.filter((lead) => lead.reply.kind === "waiting" || lead.reply.kind === "due").length;
  const activeListings = listings.filter((listing) => listing.status === "active").length;

  return (
    <AdminShell current="/admin">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          Open files, sale dates inside 21 days, and houses ready to show. The daytime goal is still a human note within 5 minutes, 8:00 a.m. to 7:00 p.m. Phoenix time.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Open leads" value={String(open.length)} href="/admin/pipeline" />
          <Stat label="Sale inside 21 days" value={String(urgent)} href="/admin/pipeline" />
          <Stat label="Waiting on a reply" value={String(waiting)} href="/admin/pipeline" />
          <Stat label="Active listings" value={String(activeListings)} href="/admin/listings" />
        </div>
        <section className="mt-8 border border-line bg-panel p-5">
          <h2 className="text-lg font-semibold text-ink">Sheet listings</h2>
          <p className="mt-2 max-w-2xl text-base leading-7 text-muted">
            {sheet.active} on the public catalog at /properties
            {sheet.lastSyncedAt ? ` · last copied ${formatWhen(sheet.lastSyncedAt)}` : " · not copied yet"}. This is
            separate from the listings desk.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <SheetListingSync ready={sheet.sheetsReady} />
            <Link href="/admin/sheet-listings" className="inline-flex min-h-12 items-center text-base text-pine">
              Open the sheet desk
            </Link>
          </div>
        </section>
        <section className="mt-6 border border-line bg-panel p-5">
          <h2 className="text-lg font-semibold text-ink">Latest activity</h2>
          {activity.length === 0 ? (
            <p className="mt-3 text-base text-muted">No notes yet.</p>
          ) : (
            <ul className="mt-4 grid gap-3">
              {activity.map((event) => (
                <li key={event.id} className="border-t border-line pt-3">
                  <p className="text-sm text-muted">
                    {event.author} · {formatWhen(event.createdAt)}
                  </p>
                  <Link href={`/admin/leads/${event.leadId}`} className="mt-1 block text-base text-ink">
                    {event.body}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="mt-6 border border-line bg-panel p-5">
          <h2 className="text-lg font-semibold text-ink">Pipeline</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-5">
            {["new", "contacted", "under_contract", "closed", "lost"].map((status) => (
              <li key={status} className="border border-line bg-paper px-3 py-3">
                <p className="text-sm text-muted">{statusLabel(status)}</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{leads.filter((lead) => lead.status === status).length}</p>
              </li>
            ))}
          </ul>
        </section>
        <p className="mt-6 text-sm text-muted">
          {activeListings} active on the listings desk. {listings.length - activeListings} still private. The public catalog is /properties.
        </p>
      </main>
    </AdminShell>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="border border-line bg-panel px-4 py-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </Link>
  );
}
