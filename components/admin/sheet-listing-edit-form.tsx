"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormNotice, Spinner } from "@/components/admin/status-form";
import { idleForm } from "@/lib/admin/schema";
import { saveSheetListingForm } from "@/lib/gdoc-listings/admin-actions";
import { sheetListingStatuses } from "@/lib/gdoc-listings/status";
import type { SheetListingAdminDetail } from "@/lib/gdoc-listings/types";
import { propertyTypes } from "@/lib/listings/catalog";
import { formatMoney } from "@/lib/listings/money";

export function SheetListingEditForm({ listing }: { listing: SheetListingAdminDetail }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveSheetListingForm, idleForm);
  const [status, setStatus] = useState(listing.status);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmRef = useRef<HTMLDialogElement>(null);
  const skipConfirm = useRef(false);

  useEffect(() => {
    if (state.stamp && state.ok) router.refresh();
  }, [state.stamp, state.ok, router]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (skipConfirm.current) {
      skipConfirm.current = false;
      return;
    }
    const next = new FormData(event.currentTarget).get("status");
    const critical = next === "inactive" || next === "sold";
    if (critical && next !== listing.status) {
      event.preventDefault();
      confirmRef.current?.showModal();
    }
  }

  return (
    <>
      <form ref={formRef} action={action} onSubmit={onSubmit} className="mt-6 grid gap-4" aria-busy={pending}>
        <FormNotice state={state} />
        <input type="hidden" name="slug" value={listing.id} />
        <Field label="Listing ID" name="listingCode" defaultValue={listing.listingCode} required={false} />
        <p className="-mt-2 text-sm text-muted">Unique catalog ID from the sheet, like VP-AZ-PHX-000001.</p>
        <Field label="Title" name="title" defaultValue={listing.title} required />
        <Field label="Address" name="address" defaultValue={listing.address} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" name="city" defaultValue={listing.city} required={false} />
          <div>
            <label className="block text-sm text-ink" htmlFor="propertyType">
              Property type
            </label>
            <select
              id="propertyType"
              name="propertyType"
              defaultValue={listing.propertyType}
              className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
            >
              <option value="">Not set</option>
              {propertyTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
              {listing.propertyType && !propertyTypes.some((item) => item.value === listing.propertyType) ? (
                <option value={listing.propertyType}>{listing.propertyType}</option>
              ) : null}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Beds" name="beds" defaultValue={listing.beds?.toString() ?? ""} required={false} />
          <Field label="Baths" name="baths" defaultValue={listing.baths} required={false} />
          <Field label="Square feet" name="sqft" defaultValue={listing.sqft?.toString() ?? ""} required={false} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Asking price"
            name="price"
            defaultValue={listing.listPrice != null ? formatMoney(listing.listPrice) : ""}
            required={false}
          />
          <Field label="ARV" name="arv" defaultValue={listing.arv != null ? formatMoney(listing.arv) : ""} required={false} />
        </div>
        <p className="text-sm text-muted">
          Changing the asking price keeps the old price and marks a drop when the new price is lower.
        </p>
        <div>
          <label className="block text-sm text-ink" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
          >
            {sheetListingStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-muted">Only Active homes show on the public sheet catalog.</p>
        </div>
        <Area label="Notes / description" name="description" rows={6} maxLength={8000} defaultValue={listing.description} />
        <Area label="Update notes" name="updateNotes" rows={3} maxLength={4000} defaultValue={listing.updateNotes} />
        <Area label="Price history" name="priceHistory" rows={3} maxLength={4000} defaultValue={listing.priceHistory} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Listed (sheet)" name="listedAt" defaultValue={listing.listedAt} required={false} />
          <Field label="Last updated (sheet)" name="sheetUpdatedAt" defaultValue={listing.sheetUpdatedAt} required={false} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="HOA" name="hoa" defaultValue={listing.hoa} required={false} />
          <Field label="A/C" name="ac" defaultValue={listing.ac} required={false} />
          <Field label="Roof" name="roof" defaultValue={listing.roof} required={false} />
          <Field label="Water heater" name="waterHeater" defaultValue={listing.waterHeater} required={false} />
          <Field label="Title company" name="titleCompany" defaultValue={listing.titleCompany} required={false} />
        </div>
        <fieldset className="grid gap-4 border border-line bg-mist p-4">
          <legend className="px-1 text-base font-semibold text-ink">SEO and local targeting</legend>
          <Field label="Meta title" name="metaTitle" defaultValue={listing.metaTitle} required={false} />
          <Area label="Meta description" name="metaDescription" rows={3} maxLength={320} defaultValue={listing.metaDescription} />
          <Area label="Meta keywords" name="metaKeywords" rows={2} maxLength={400} defaultValue={listing.metaKeywords} />
          <Field label="Local target area" name="localTargetArea" defaultValue={listing.localTargetArea} required={false} />
          <Field label="Canonical URL" name="canonicalUrl" defaultValue={listing.canonicalUrl} required={false} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Latitude" name="latitude" defaultValue={listing.latitude != null ? String(listing.latitude) : ""} required={false} />
            <Field label="Longitude" name="longitude" defaultValue={listing.longitude != null ? String(listing.longitude) : ""} required={false} />
          </div>
          <Area label="JSON-LD" name="schemaJsonLd" rows={6} maxLength={20000} defaultValue={listing.schemaJsonLd} />
        </fieldset>
        {listing.sheetSyncStatus ? (
          <p className="text-sm text-muted">Sheet sync status: {listing.sheetSyncStatus}.</p>
        ) : null}
        <label className="flex min-h-12 items-center gap-3 text-base text-ink">
          <input type="checkbox" name="manualHold" value="yes" defaultChecked={listing.held} className="size-5" />
          Keep this desk copy when the Google Sheet is copied again
        </label>
        <p className="-mt-2 text-sm text-muted">
          Turn this on after a small fix so the next sheet copy does not overwrite it. The home also stays if it leaves
          the sheet.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-60"
        >
          {pending ? <Spinner label="Saving…" /> : "Save sheet home"}
        </button>
      </form>
      <dialog
        ref={confirmRef}
        className="dialog-box"
        aria-labelledby="sheet-status-confirm"
      >
        <h3 id="sheet-status-confirm" className="text-lg font-semibold text-ink">
          Change this home to {status === "sold" ? "Sold" : "Inactive"}?
        </h3>
        <p className="mt-3 text-base leading-7 text-muted">
          {status === "sold"
            ? "Sold homes stay on this desk and leave the public sheet catalog."
            : "Inactive homes leave the public sheet catalog. They stay in the database."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-12 items-center bg-amber px-4 text-base font-semibold text-amber-ink"
            onClick={() => {
              skipConfirm.current = true;
              confirmRef.current?.close();
              formRef.current?.requestSubmit();
            }}
          >
            Change status
          </button>
          <button
            type="button"
            className="inline-flex min-h-12 items-center border border-line bg-paper px-4 text-base text-ink"
            onClick={() => confirmRef.current?.close()}
          >
            Keep current status
          </button>
        </div>
      </dialog>
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-ink" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
      />
    </div>
  );
}

function Area({
  label,
  name,
  rows,
  maxLength,
  defaultValue,
}: {
  label: string;
  name: string;
  rows: number;
  maxLength: number;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="block text-sm text-ink" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        maxLength={maxLength}
        defaultValue={defaultValue}
        className="mt-1 w-full border border-line bg-paper px-3 py-3 text-base text-ink"
      />
    </div>
  );
}
