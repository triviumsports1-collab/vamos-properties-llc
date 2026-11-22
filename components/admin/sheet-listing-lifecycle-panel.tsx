"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SheetListingLifecycleBadge } from "@/components/admin/sheet-listing-status";
import { FormNotice, Spinner } from "@/components/admin/status-form";
import { formatWhen } from "@/lib/admin/clock";
import { idleForm } from "@/lib/admin/schema";
import { EXPIRY_DAY_PRESETS, type LifecycleSettings } from "@/lib/gdoc-listings/lifecycle";
import { setSheetListingLifecycleForm } from "@/lib/gdoc-listings/lifecycle-actions";
import type { SheetListingAdminDetail } from "@/lib/gdoc-listings/types";

const buttonClass =
  "inline-flex min-h-12 items-center justify-center gap-2 border border-line bg-paper px-4 text-base text-ink disabled:opacity-60";

export function SheetListingLifecyclePanel({
  listing,
  settings,
  nowIso,
}: {
  listing: SheetListingAdminDetail;
  settings: LifecycleSettings;
  nowIso: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(setSheetListingLifecycleForm, idleForm);
  const [intent, setIntent] = useState("");
  const live = listing.status === "active" && !listing.removed;
  const [windowChoice, setWindowChoice] = useState("default");

  useEffect(() => {
    if (state.stamp && state.ok) router.refresh();
  }, [state.stamp, state.ok, router]);

  return (
    <section className="mt-8 border border-line bg-panel p-5" aria-labelledby="lifecycle-heading">
      <h2 id="lifecycle-heading" className="text-lg font-semibold text-ink">
        Status and active window
      </h2>
      <div className="mt-3 flex flex-wrap items-start gap-4">
        <SheetListingLifecycleBadge listing={listing} settings={settings} nowIso={nowIso} />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <dt className="text-muted">Went live</dt>
          <dd className="text-ink">{listing.activatedAt ? formatWhen(listing.activatedAt) : "Not started"}</dd>
          <dt className="text-muted">Expires</dt>
          <dd className="text-ink">
            {listing.expiresAt ? formatWhen(listing.expiresAt) : listing.activatedAt ? "No expiry" : "—"}
            {!settings.autoExpire && listing.expiresAt ? " (auto-expiry off)" : ""}
          </dd>
          <dt className="text-muted">Status source</dt>
          <dd className="text-ink">{listing.statusOverride ? "Locked by this desk" : "Google Sheet"}</dd>
        </dl>
      </div>

      <form action={action} className="mt-5 grid gap-4" aria-busy={pending} onSubmit={(event) => {
        const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        setIntent(submitter?.value ?? "");
      }}>
        <FormNotice state={state} />
        <input type="hidden" name="slug" value={listing.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-ink" htmlFor="lifecycle-window">
              Active for
            </label>
            <select
              id="lifecycle-window"
              name="window"
              value={windowChoice}
              onChange={(event) => setWindowChoice(event.target.value)}
              className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
            >
              <option value="default">Default ({settings.expiryDays} days)</option>
              {EXPIRY_DAY_PRESETS.filter((days) => days !== settings.expiryDays).map((days) => (
                <option key={days} value={String(days)}>
                  {days} days
                </option>
              ))}
              <option value="never">No expiry</option>
            </select>
            <p className="mt-1 text-sm text-muted">Counted from the moment you save.</p>
          </div>
          <label className="flex min-h-12 items-start gap-3 self-end text-base text-ink">
            <input type="checkbox" name="lock" value="yes" defaultChecked className="mt-1 size-5" />
            <span>
              Lock status against the sheet copy
              <span className="block text-sm text-muted">Only used by “Set active”.</span>
            </span>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="intent"
            value="activate"
            disabled={pending}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-60"
          >
            {pending && intent === "activate" ? <Spinner label="Saving…" /> : live ? "Set active (restart window)" : "Set active"}
          </button>
          <button type="submit" name="intent" value="renew" disabled={pending} className={buttonClass}>
            {pending && intent === "renew" ? <Spinner label="Renewing…" /> : "Renew window"}
          </button>
          {live || listing.status !== "inactive" ? (
            <button type="submit" name="intent" value="deactivate" disabled={pending} className={buttonClass}>
              {pending && intent === "deactivate" ? <Spinner label="Saving…" /> : "Set inactive"}
            </button>
          ) : null}
          {listing.statusOverride ? (
            <button type="submit" name="intent" value="release" disabled={pending} className={buttonClass}>
              {pending && intent === "release" ? <Spinner label="Saving…" /> : "Let the sheet control status"}
            </button>
          ) : null}
        </div>
        <p className="text-sm text-muted">
          Set inactive locks the status, so a Google Sheet copy never turns it back on. Expired homes also stay Inactive
          through sheet copies until you renew them.
        </p>
      </form>
    </section>
  );
}
