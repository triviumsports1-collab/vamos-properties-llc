"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormNotice, Spinner } from "@/components/admin/status-form";
import { applySheetListingMarginForm } from "@/lib/gdoc-listings/margin-actions";
import { formatMarginPercent } from "@/lib/gdoc-listings/margin";
import { idleSheetMargin, type SheetListingAdminDetail } from "@/lib/gdoc-listings/types";
import { formatMoney } from "@/lib/listings/money";

export function SheetListingMarginForm({ listing }: { listing: SheetListingAdminDetail }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(applySheetListingMarginForm, idleSheetMargin);
  const [mode, setMode] = useState<"flat" | "percent">(listing.marginPercentBps != null ? "percent" : "flat");

  useEffect(() => {
    if (state.stamp && state.ok) router.refresh();
  }, [state.stamp, state.ok, router]);

  return (
    <section className="mt-8 border border-line bg-panel p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-ink">Markup</h2>
        <span
          className={`inline-flex min-h-8 items-center px-2 text-xs font-semibold uppercase tracking-[0.08em] ${
            listing.marginOverride ? "bg-navy text-white" : listing.marginAmount != null ? "border border-line bg-mist text-ink" : "border border-line bg-mist text-muted"
          }`}
        >
          {listing.marginOverride ? "Custom" : listing.marginAmount != null ? "Follows global" : "None"}
        </span>
      </div>
      <p className="mt-2 text-base leading-7 text-muted">
        Saving a markup here locks a custom value so sheet copies and the global rule leave it alone. Follow global
        unlocks this home so the default rule applies.
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted">Base asking</dt>
          <dd className="mt-1 text-base font-semibold text-ink">{listing.listPrice != null ? formatMoney(listing.listPrice) : "None"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Markup</dt>
          <dd className="mt-1 text-base font-semibold text-ink">
            {listing.marginAmount != null
              ? `${formatMoney(listing.marginAmount)}${listing.marginPercentBps != null ? ` · ${formatMarginPercent(listing.marginPercentBps)}` : ""}`
              : "None"}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Display price</dt>
          <dd className="mt-1 text-base font-semibold text-ink">
            {listing.finalDisplayPrice != null ? formatMoney(listing.finalDisplayPrice) : "None"}
          </dd>
        </div>
      </dl>
      <form action={action} className="mt-5 grid gap-4" aria-busy={pending}>
        <FormNotice state={{ ok: state.ok, message: state.message, stamp: state.stamp }} />
        <input type="hidden" name="scope" value="one" />
        <input type="hidden" name="slug" value={listing.id} />
        <fieldset>
          <legend className="text-sm text-ink">Markup type</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            <label className="inline-flex min-h-11 items-center gap-2 text-base text-ink">
              <input type="radio" name="mode" value="flat" checked={mode === "flat"} onChange={() => setMode("flat")} className="size-4" />
              Flat dollars
            </label>
            <label className="inline-flex min-h-11 items-center gap-2 text-base text-ink">
              <input
                type="radio"
                name="mode"
                value="percent"
                checked={mode === "percent"}
                onChange={() => setMode("percent")}
                className="size-4"
              />
              Percent of asking
            </label>
          </div>
        </fieldset>
        <label className="block text-sm text-ink" htmlFor="margin-amount">
          {mode === "percent" ? "Percent" : "Markup dollars"}
        </label>
        <input
          id="margin-amount"
          name="amount"
          defaultValue={
            listing.marginPercentBps != null
              ? String(listing.marginPercentBps / 100)
              : listing.marginAmount != null
                ? String(listing.marginAmount)
                : ""
          }
          inputMode="decimal"
          placeholder={mode === "percent" ? "10" : "25000"}
          className="min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="intent"
            value="set"
            disabled={pending}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-60"
          >
            {pending ? <Spinner label="Saving…" /> : "Save markup"}
          </button>
          <button
            type="submit"
            name="intent"
            value="clear"
            disabled={pending}
            className="inline-flex min-h-12 items-center border border-line bg-paper px-4 text-base text-ink disabled:opacity-60"
          >
            Remove markup
          </button>
          <button
            type="submit"
            name="intent"
            value="follow"
            disabled={pending}
            className="inline-flex min-h-12 items-center border border-line bg-paper px-4 text-base text-ink disabled:opacity-60"
          >
            Follow global rule
          </button>
        </div>
      </form>
    </section>
  );
}
