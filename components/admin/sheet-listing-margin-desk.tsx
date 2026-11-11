"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormNotice, Spinner } from "@/components/admin/status-form";
import { SheetListingRowActions } from "@/components/admin/sheet-listing-row-actions";
import { SheetListingStatusBadge } from "@/components/admin/sheet-listing-status";
import { formatWhen } from "@/lib/admin/clock";
import { applySheetListingMarginForm } from "@/lib/gdoc-listings/margin-actions";
import { formatMarginPercent } from "@/lib/gdoc-listings/margin";
import { idleSheetMargin, type SheetListingAdminRow, type SheetMarginFormState } from "@/lib/gdoc-listings/types";
import { formatMoney } from "@/lib/listings/money";

type Filters = {
  view: string;
  q: string;
  min: string;
  max: string;
  city: string;
  region: string;
  margin: string;
};

export function SheetListingMarginDesk({
  listings,
  filters,
}: {
  listings: SheetListingAdminRow[];
  filters: Filters;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [state, action, pending] = useActionState(applySheetListingMarginForm, idleSheetMargin);
  const setRef = useRef<HTMLDialogElement>(null);
  const clearRef = useRef<HTMLDialogElement>(null);
  const followRef = useRef<HTMLDialogElement>(null);
  const filterRef = useRef<HTMLDialogElement>(null);
  const oneRef = useRef<HTMLDialogElement>(null);
  const [oneSlug, setOneSlug] = useState("");
  const visibleIds = useMemo(() => listings.map((listing) => listing.id), [listings]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const visibleSelected = selected.filter((id) => visibleIds.includes(id));
  const allVisibleSelected = listings.length > 0 && visibleSelected.length === listings.length;

  useEffect(() => {
    setSelected((current) => current.filter((id) => visibleIds.includes(id)));
  }, [visibleIds]);

  useEffect(() => {
    if (!state.stamp) return;
    if (state.ok) {
      setRef.current?.close();
      clearRef.current?.close();
      followRef.current?.close();
      filterRef.current?.close();
      oneRef.current?.close();
      setSelected([]);
      router.refresh();
    }
  }, [state.stamp, state.ok, router]);

  function toggleAll() {
    setSelected(allVisibleSelected ? [] : visibleIds);
  }

  function toggleOne(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function openOne(id: string) {
    setOneSlug(id);
    oneRef.current?.showModal();
  }

  return (
    <div className={visibleSelected.length > 0 ? "pb-[calc(7rem+env(safe-area-inset-bottom))]" : undefined}>
      <FormNotice state={toNotice(state)} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">Select homes to set, clear, or follow markup.</p>
        <button
          type="button"
          className="inline-flex min-h-11 items-center text-sm text-pine"
          onClick={() => filterRef.current?.showModal()}
        >
          Apply markup to all matching homes
        </button>
      </div>
      <ul className="grid gap-3 lg:hidden">
        <li className="flex items-center border border-line bg-panel px-3">
          <label className="inline-flex min-h-12 w-full items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleAll}
              className="size-5"
            />
            Select all visible homes
          </label>
        </li>
        {listings.map((listing) => (
          <li
            key={listing.id}
            className={`border border-line bg-panel p-4 ${selectedSet.has(listing.id) ? "bg-mist/80" : ""}`}
          >
            <div className="flex items-start gap-3">
              <label className="inline-flex min-h-11 items-center">
                <input
                  type="checkbox"
                  checked={selectedSet.has(listing.id)}
                  onChange={() => toggleOne(listing.id)}
                  className="size-5"
                  aria-label={`Select ${listing.title}`}
                />
              </label>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{listing.title}</p>
                {listing.listingCode ? <p className="mt-1 text-xs text-muted">{listing.listingCode}</p> : null}
                <p className="mt-1 text-sm text-muted">{listing.address}</p>
                <p className="mt-1 text-sm text-muted">
                  {listing.city || "—"}
                  {listing.region ? ` · ${listing.region}` : ""}
                </p>
                <div className="mt-2">
                  <SheetListingStatusBadge status={listing.status} removed={listing.removed} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted">Base asking</dt>
                    <dd>{listing.listPrice != null ? formatMoney(listing.listPrice) : "No asking price"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Display price</dt>
                    <dd className="font-semibold">
                      {listing.finalDisplayPrice != null ? formatMoney(listing.finalDisplayPrice) : "—"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-3">
                  <MarkupCell listing={listing} />
                  <button
                    type="button"
                    className="mt-1 inline-flex min-h-11 items-center text-sm text-pine"
                    onClick={() => openOne(listing.id)}
                  >
                    Edit markup
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted">Copied {formatWhen(listing.syncedAt)}</p>
                <SheetListingRowActions
                  slug={listing.id}
                  title={listing.title}
                  removed={listing.removed || listing.status === "inactive"}
                  publicVisible={!listing.removed && listing.status === "active"}
                  compact
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto border border-line bg-panel touch-scroll lg:block">
        <table className="w-full min-w-[64rem] text-left text-sm text-ink">
          <thead>
            <tr className="border-b border-line bg-mist text-xs uppercase tracking-[0.08em] text-muted">
              <th className="px-3 py-2 font-medium">
                <label className="inline-flex min-h-11 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    className="size-5"
                    aria-label="Select all visible homes"
                  />
                  <span className="sr-only">Select all</span>
                </label>
              </th>
              <th className="px-3 py-2 font-medium">Home</th>
              <th className="px-3 py-2 font-medium">Location</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Base asking</th>
              <th className="px-3 py-2 font-medium">Markup</th>
              <th className="px-3 py-2 font-medium">Display price</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr
                key={listing.id}
                className={`border-b border-line align-top motion-safe:transition-colors ${
                  selectedSet.has(listing.id) ? "bg-mist/80" : "hover:bg-mist/40"
                }`}
              >
                <td className="px-3 py-2.5">
                  <label className="inline-flex min-h-11 items-center">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(listing.id)}
                      onChange={() => toggleOne(listing.id)}
                      className="size-5"
                      aria-label={`Select ${listing.title}`}
                    />
                  </label>
                </td>
                <td className="px-3 py-2.5">
                  <p className="font-semibold text-ink">{listing.title}</p>
                  {listing.listingCode ? <p className="mt-1 text-xs text-muted">{listing.listingCode}</p> : null}
                  <p className="mt-1 text-sm text-muted">{listing.address}</p>
                </td>
                <td className="px-3 py-2.5">
                  <p>{listing.city || "—"}</p>
                  {listing.region ? <p className="mt-1 text-xs text-muted">{listing.region}</p> : null}
                </td>
                <td className="px-3 py-2.5">
                  <SheetListingStatusBadge status={listing.status} removed={listing.removed} />
                </td>
                <td className="px-3 py-2.5">{listing.listPrice != null ? formatMoney(listing.listPrice) : "No asking price"}</td>
                <td className="px-3 py-2.5">
                  <MarkupCell listing={listing} />
                  <button
                    type="button"
                    className="mt-1 inline-flex min-h-11 items-center text-sm text-pine"
                    onClick={() => openOne(listing.id)}
                  >
                    Edit markup
                  </button>
                </td>
                <td className="px-3 py-2.5">
                  <p className="font-semibold">
                    {listing.finalDisplayPrice != null ? formatMoney(listing.finalDisplayPrice) : "—"}
                  </p>
                  {listing.marginAmount != null && listing.listPrice != null ? (
                    <p className="mt-1 text-xs text-muted">
                      {formatMoney(listing.listPrice)} + {formatMoney(listing.marginAmount)}
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-2.5">
                  <p className="text-xs text-muted">Copied {formatWhen(listing.syncedAt)}</p>
                  <SheetListingRowActions
                    slug={listing.id}
                    title={listing.title}
                    removed={listing.removed || listing.status === "inactive"}
                    publicVisible={!listing.removed && listing.status === "active"}
                    compact
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visibleSelected.length > 0 ? (
        <div
          role="region"
          aria-label="Bulk markup actions"
          className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mt-4 border border-line bg-panel/95 px-3 py-3 shadow-lg backdrop-blur-sm motion-safe:transition-opacity sm:px-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink">
              {visibleSelected.length === 1 ? "1 home selected" : `${visibleSelected.length} homes selected`}
            </p>
            <button
              type="button"
              className="inline-flex min-h-11 items-center bg-amber px-3 text-sm font-semibold text-amber-ink"
              onClick={() => setRef.current?.showModal()}
            >
              Set markup
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center border border-line bg-paper px-3 text-sm text-ink"
              onClick={() => clearRef.current?.showModal()}
            >
              Clear markup
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center border border-line bg-paper px-3 text-sm text-ink"
              onClick={() => followRef.current?.showModal()}
            >
              Follow global rule
            </button>
            <button type="button" className="inline-flex min-h-11 items-center px-3 text-sm text-pine" onClick={() => setSelected([])}>
              Clear selection
            </button>
          </div>
        </div>
      ) : null}

      <MarginDialog
        dialogRef={oneRef}
        title="Set markup for this home"
        body="The public catalog will show base asking plus this markup. Inactive homes stay off the public page, but the markup is stored."
        action={action}
        pending={pending}
        state={state}
        filters={filters}
        scope="one"
        slugs={oneSlug ? [oneSlug] : []}
        confirmLabel="Save markup"
      />
      <MarginDialog
        dialogRef={setRef}
        title="Set markup on selected homes"
        body={`Apply the same flat dollar or percent markup to ${visibleSelected.length} selected home${visibleSelected.length === 1 ? "" : "s"}.`}
        action={action}
        pending={pending}
        state={state}
        filters={filters}
        scope="selected"
        slugs={visibleSelected}
        confirmLabel="Apply to selected"
      />
      <ConfirmClear
        dialogRef={clearRef}
        action={action}
        pending={pending}
        state={state}
        filters={filters}
        scope="selected"
        slugs={visibleSelected}
        count={visibleSelected.length}
      />
      <ConfirmFollow
        dialogRef={followRef}
        action={action}
        pending={pending}
        state={state}
        filters={filters}
        scope="selected"
        slugs={visibleSelected}
        count={visibleSelected.length}
      />
      <MarginDialog
        dialogRef={filterRef}
        title="Apply markup to every matching home"
        body={`This uses the filters on this page, not the checkboxes. ${listings.length} home${listings.length === 1 ? "" : "s"} currently match.`}
        action={action}
        pending={pending}
        state={state}
        filters={filters}
        scope="filtered"
        slugs={[]}
        confirmLabel="Apply to matching homes"
        allowClear
      />
    </div>
  );
}

function MarkupCell({ listing }: { listing: SheetListingAdminRow }) {
  const kind = listing.marginOverride ? "Custom" : listing.marginAmount != null ? "Global" : "None";
  const typeLabel =
    listing.marginPercentBps != null ? formatMarginPercent(listing.marginPercentBps) : listing.marginAmount != null ? "Flat" : null;
  const badgeClass = listing.marginOverride
    ? "bg-navy text-white"
    : listing.marginAmount != null
      ? "border border-line bg-mist text-ink"
      : "border border-line bg-mist text-muted";
  return (
    <div>
      <span className={`inline-flex min-h-8 items-center px-2 text-xs font-semibold uppercase tracking-[0.08em] ${badgeClass}`}>
        {kind}
        {typeLabel ? ` · ${typeLabel}` : ""}
      </span>
      {listing.marginAmount != null ? <p className="mt-2 font-semibold">{formatMoney(listing.marginAmount)}</p> : null}
    </div>
  );
}

function MarginDialog({
  dialogRef,
  title,
  body,
  action,
  pending,
  state,
  filters,
  scope,
  slugs,
  confirmLabel,
  allowClear,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  title: string;
  body: string;
  action: (formData: FormData) => void;
  pending: boolean;
  state: SheetMarginFormState;
  filters: Filters;
  scope: "one" | "selected" | "filtered";
  slugs: string[];
  confirmLabel: string;
  allowClear?: boolean;
}) {
  const [mode, setMode] = useState<"flat" | "percent">("flat");
  return (
    <dialog ref={dialogRef} className="dialog-box">
      <form action={action} aria-busy={pending}>
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-3 text-base leading-7 text-muted">{body}</p>
        <FormNotice state={toNotice(state)} />
        <HiddenFilters filters={filters} scope={scope} slugs={slugs} />
        <fieldset className="mt-4">
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
        <label className="mt-4 block text-sm text-ink" htmlFor={`${scope}-amount`}>
          {mode === "percent" ? "Percent" : "Markup dollars"}
        </label>
        <input
          id={`${scope}-amount`}
          name="amount"
          inputMode="decimal"
          placeholder={mode === "percent" ? "10" : "25000"}
          className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
        />
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="submit"
            name="intent"
            value="set"
            disabled={pending}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-60"
          >
            {pending ? <Spinner label="Saving…" /> : confirmLabel}
          </button>
          {allowClear ? (
            <button
              type="submit"
              name="intent"
              value="clear"
              disabled={pending}
              className="inline-flex min-h-12 items-center border border-line bg-paper px-4 text-base text-ink disabled:opacity-60"
            >
              Clear matching markup
            </button>
          ) : null}
          {scope === "one" ? (
            <button
              type="submit"
              name="intent"
              value="follow"
              disabled={pending}
              className="inline-flex min-h-12 items-center border border-line bg-paper px-4 text-base text-ink disabled:opacity-60"
            >
              Follow global rule
            </button>
          ) : null}
          <button type="button" className="inline-flex min-h-12 items-center px-4 text-base text-pine" onClick={() => dialogRef.current?.close()}>
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  );
}

function ConfirmClear({
  dialogRef,
  action,
  pending,
  state,
  filters,
  scope,
  slugs,
  count,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  action: (formData: FormData) => void;
  pending: boolean;
  state: SheetMarginFormState;
  filters: Filters;
  scope: "selected";
  slugs: string[];
  count: number;
}) {
  return (
    <dialog ref={dialogRef} className="dialog-box">
      <form action={action} aria-busy={pending}>
        <h3 className="text-lg font-semibold text-ink">Clear markup on selected homes?</h3>
        <p className="mt-3 text-base leading-7 text-muted">
          Display price goes back to the sheet asking price on {count === 1 ? "this home" : `these ${count} homes`}. This does not change the Google Sheet.
        </p>
        <FormNotice state={toNotice(state)} />
        <HiddenFilters filters={filters} scope={scope} slugs={slugs} />
        <input type="hidden" name="intent" value="clear" />
        <input type="hidden" name="mode" value="flat" />
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-navy px-4 text-base font-semibold text-white disabled:opacity-60"
          >
            {pending ? <Spinner label="Clearing…" /> : "Clear markup"}
          </button>
          <button type="button" className="inline-flex min-h-12 items-center px-4 text-base text-pine" onClick={() => dialogRef.current?.close()}>
            Keep markup
          </button>
        </div>
      </form>
    </dialog>
  );
}

function ConfirmFollow({
  dialogRef,
  action,
  pending,
  state,
  filters,
  scope,
  slugs,
  count,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  action: (formData: FormData) => void;
  pending: boolean;
  state: SheetMarginFormState;
  filters: Filters;
  scope: "selected";
  slugs: string[];
  count: number;
}) {
  return (
    <dialog ref={dialogRef} className="dialog-box">
      <form action={action} aria-busy={pending}>
        <h3 className="text-lg font-semibold text-ink">Let selected homes follow the global rule?</h3>
        <p className="mt-3 text-base leading-7 text-muted">
          {count === 1 ? "This home" : `These ${count} homes`} will unlock the custom markup and use the current global
          rule. If the global rule is off, markup is cleared.
        </p>
        <FormNotice state={toNotice(state)} />
        <HiddenFilters filters={filters} scope={scope} slugs={slugs} />
        <input type="hidden" name="intent" value="follow" />
        <input type="hidden" name="mode" value="flat" />
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-navy px-4 text-base font-semibold text-white disabled:opacity-60"
          >
            {pending ? <Spinner label="Updating…" /> : "Follow global rule"}
          </button>
          <button type="button" className="inline-flex min-h-12 items-center px-4 text-base text-pine" onClick={() => dialogRef.current?.close()}>
            Keep custom markup
          </button>
        </div>
      </form>
    </dialog>
  );
}

function HiddenFilters({
  filters,
  scope,
  slugs,
}: {
  filters: Filters;
  scope: "one" | "selected" | "filtered";
  slugs: string[];
}) {
  return (
    <>
      <input type="hidden" name="scope" value={scope} />
      <input type="hidden" name="view" value={filters.view} />
      <input type="hidden" name="q" value={filters.q} />
      <input type="hidden" name="min" value={filters.min} />
      <input type="hidden" name="max" value={filters.max} />
      <input type="hidden" name="city" value={filters.city} />
      <input type="hidden" name="region" value={filters.region} />
      <input type="hidden" name="margin" value={filters.margin} />
      {scope === "one" && slugs[0] ? <input type="hidden" name="slug" value={slugs[0]} /> : null}
      {scope === "selected"
        ? slugs.map((slug) => <input key={slug} type="hidden" name="slugs" value={slug} />)
        : null}
    </>
  );
}

function toNotice(state: SheetMarginFormState) {
  return { ok: state.ok, message: state.message, stamp: state.stamp };
}
