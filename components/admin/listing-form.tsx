"use client";

import { useActionState } from "react";
import { saveListingForm } from "@/lib/admin/actions";
import { listingStatuses } from "@/lib/admin/pipeline";
import { idleForm } from "@/lib/admin/schema";
import { propertyTypes } from "@/lib/listings/catalog";
import { formatMoney } from "@/lib/listings/money";
import { FormNotice, Spinner } from "@/components/admin/status-form";

export function ListingForm({
  listing,
}: {
  listing?: {
    id: number;
    title: string;
    address: string;
    city: string | null;
    beds: number | null;
    baths: string | null;
    sqft: number | null;
    propertyType: string | null;
    listPrice: number | null;
    monthlyPayment: number | null;
    terms: string | null;
    status: string;
    featured: boolean;
    summary: string | null;
    description: string | null;
    features: string[];
    neighborhood: string | null;
    schools: string | null;
    yearBuilt: number | null;
    photos: string[];
    metaTitle: string | null;
    metaDescription: string | null;
    keywords: string | null;
    localTags: string | null;
    arv: number | null;
    driveFolderUrl: string | null;
    source?: string;
  };
}) {
  const [state, action, pending] = useActionState(saveListingForm, idleForm);

  return (
    <form action={action} className="mt-6 grid gap-4" aria-busy={pending}>
      <FormNotice state={state} />
      <input type="hidden" name="listingId" value={listing?.id ?? ""} />
      <Field label="Title" name="title" defaultValue={listing?.title} required />
      <Field label="Address" name="address" defaultValue={listing?.address} required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" name="city" defaultValue={listing?.city ?? ""} required={false} />
        <div>
          <label className="block text-sm text-ink" htmlFor="propertyType">
            Property type
          </label>
          <select id="propertyType" name="propertyType" defaultValue={listing?.propertyType ?? ""} className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink">
            <option value="">Not set</option>
            {propertyTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Beds" name="beds" defaultValue={listing?.beds?.toString() ?? ""} required={false} />
        <Field label="Baths" name="baths" defaultValue={listing?.baths ?? ""} required={false} />
        <Field label="Square feet" name="sqft" defaultValue={listing?.sqft?.toString() ?? ""} required={false} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Asking price" name="price" defaultValue={listing?.listPrice != null ? formatMoney(listing.listPrice) : ""} required={false} />
        <Field label="ARV" name="arv" defaultValue={listing?.arv != null ? formatMoney(listing.arv) : ""} required={false} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Monthly payment" name="monthlyPayment" defaultValue={listing?.monthlyPayment != null ? formatMoney(listing.monthlyPayment) : ""} required={false} />
        <Field label="Google Drive folder" name="driveFolderUrl" defaultValue={listing?.driveFolderUrl ?? ""} required={false} />
      </div>
      <p className="text-sm text-muted">Changing the asking price records the old price and the date. A lower price shows as a drop on the public page.</p>
      <div>
        <label className="block text-sm text-ink" htmlFor="terms">
          Cash price or takeover terms
        </label>
        <textarea id="terms" name="terms" rows={4} maxLength={2000} defaultValue={listing?.terms ?? ""} className="mt-1 w-full border border-line bg-paper px-3 py-3 text-base text-ink" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm text-ink" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" defaultValue={listing?.status ?? "draft"} className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink">
            {listingStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-muted">Available and under contract show at /listings. Drafts and sold homes stay on this desk.</p>
        </div>
        <Field label="Year built" name="yearBuilt" defaultValue={listing?.yearBuilt?.toString() ?? ""} required={false} />
      </div>
      <label className="flex min-h-12 items-center gap-3 text-base text-ink">
        <input type="checkbox" name="featured" value="yes" defaultChecked={listing?.featured ?? false} className="size-5" />
        Feature this home at the top of the list
      </label>
      <Area label="Short line for the card" name="summary" rows={2} maxLength={300} defaultValue={listing?.summary ?? ""} />
      <Area label="Description" name="description" rows={6} maxLength={8000} defaultValue={listing?.description ?? ""} />
      <Area label="Features, one per line" name="features" rows={4} maxLength={2000} defaultValue={listing?.features.join("\n") ?? ""} />
      <Area label="Neighborhood" name="neighborhood" rows={4} maxLength={2000} defaultValue={listing?.neighborhood ?? ""} />
      <Area label="Schools" name="schools" rows={4} maxLength={2000} defaultValue={listing?.schools ?? ""} />
      <fieldset className="grid gap-4 border border-line bg-mist p-4">
        <legend className="px-1 text-base font-semibold text-ink">SEO and metadata</legend>
        <p className="text-sm leading-6 text-muted">
          These become the browser title, the search description, and the local tags for this home. Leave a box blank and the page uses the address and the short line.
        </p>
        <Field label="Meta title" name="metaTitle" defaultValue={listing?.metaTitle ?? ""} required={false} />
        <Area label="Meta description" name="metaDescription" rows={3} maxLength={320} defaultValue={listing?.metaDescription ?? ""} />
        <Area label="Keywords" name="keywords" rows={3} maxLength={400} defaultValue={listing?.keywords ?? ""} />
        <p className="-mt-2 text-sm text-muted">Separate keywords with commas.</p>
        <Area label="Local search tags" name="localTags" rows={3} maxLength={400} defaultValue={listing?.localTags ?? ""} />
        <p className="-mt-2 text-sm text-muted">City, neighborhood, and the way people search. Commas or new lines.</p>
      </fieldset>
      <div>
        <label className="block text-sm text-ink" htmlFor="photos">
          Photo links
        </label>
        <textarea
          id="photos"
          name="photos"
          rows={4}
          defaultValue={listing?.photos.join("\n") ?? ""}
          className="mt-1 w-full border border-line bg-paper px-3 py-3 text-base text-ink"
        />
        <p className="mt-1 text-sm text-muted">
          One image URL per line. Copy a link from the <a href="/admin/media" className="font-semibold text-link">media library</a>, or upload below.
        </p>
      </div>
      <div>
        <label className="block text-sm text-ink" htmlFor="uploads">
          Upload photos
        </label>
        <input id="uploads" name="uploads" type="file" accept="image/jpeg,image/png,image/webp" multiple className="mt-1 block w-full text-base text-ink" />
        <p className="mt-1 text-sm text-muted">JPG, PNG, or WebP. Up to 4 MB each, 12 photos total.</p>
      </div>
      <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center gap-2 bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-60">
        {pending ? <Spinner label="Saving…" /> : "Save listing"}
      </button>
    </form>
  );
}

function Field({ label, name, defaultValue, required }: { label: string; name: string; defaultValue?: string; required: boolean }) {
  return (
    <div>
      <label className="block text-sm text-ink" htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} required={required} defaultValue={defaultValue} className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink" />
    </div>
  );
}

function Area({ label, name, rows, maxLength, defaultValue }: { label: string; name: string; rows: number; maxLength: number; defaultValue: string }) {
  return (
    <div>
      <label className="block text-sm text-ink" htmlFor={name}>
        {label}
      </label>
      <textarea id={name} name={name} rows={rows} maxLength={maxLength} defaultValue={defaultValue} className="mt-1 w-full border border-line bg-paper px-3 py-3 text-base text-ink" />
    </div>
  );
}
