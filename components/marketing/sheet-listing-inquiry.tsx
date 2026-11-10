"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { submitSheetListingLead } from "@/lib/gdoc-listings/actions";
import { sheetListingLeadSchema } from "@/lib/gdoc-listings/schema";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/routes";
import { type LeadFormState } from "@/lib/leads/actions";
import { site } from "@/lib/site";

const initialState: LeadFormState = { message: "", fieldErrors: {} };

export function SheetListingInquiry({
  listingId,
  title,
  address,
  locale,
}: {
  listingId: string;
  title: string;
  address: string;
  locale: Locale;
}) {
  const [state, action, pending] = useActionState(submitSheetListingLead, initialState);
  const [clientMessage, setClientMessage] = useState("");
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const fieldErrors = { ...clientErrors, ...state.fieldErrors };
  const banner = state.message || clientMessage;
  const property = title && title !== address ? `${title} · ${address}` : address;
  const copy = propertyListingStrings[locale];

  useEffect(() => {
    if (!banner) return;
    document.getElementById("sheet-inquiry-status")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [banner]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const parsed = sheetListingLeadSchema.safeParse({
      listingId: String(formData.get("listingId") ?? ""),
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      consent: formData.get("consent") === "yes" ? "yes" : "",
      company: "",
    });
    if (parsed.success) {
      setClientErrors({});
      setClientMessage("");
      return;
    }
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!nextErrors[key]) nextErrors[key] = issue.message;
    }
    setClientErrors(nextErrors);
    setClientMessage(copy.checkFields);
  }

  return (
    <form id="offer" action={action} onSubmit={onSubmit} className="scroll-mt-24" aria-busy={pending}>
      <h2 className="text-lg font-semibold text-ink">{copy.askHeading}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{copy.askSub}</p>
      {banner ? (
        <p id="sheet-inquiry-status" role="status" className="mt-4 rounded-lg border border-line bg-mist px-3 py-3 text-base text-ink">
          {banner}
        </p>
      ) : null}
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="language" value={locale} />
      <div aria-hidden="true">
        <label className="hidden" htmlFor="sheet-inquiry-company">
          Company
        </label>
        <input id="sheet-inquiry-company" name="company" tabIndex={-1} autoComplete="off" className="hidden" defaultValue="" />
      </div>
      <p className="mt-4 text-sm text-ink">
        {copy.property}
        <span className="mt-1 block text-base">{property}</span>
      </p>
      <Field label={copy.name} name="name" autoComplete="name" error={fieldErrors.name} />
      <Field label={copy.email} name="email" autoComplete="email" type="email" error={fieldErrors.email} />
      <Field label={copy.phone} name="phone" autoComplete="tel" inputMode="tel" error={fieldErrors.phone} />
      <label className="mt-4 block text-sm text-ink" htmlFor="sheet-inquiry-message">
        {copy.message}
      </label>
      <textarea
        id="sheet-inquiry-message"
        name="message"
        required
        minLength={5}
        rows={4}
        aria-invalid={fieldErrors.message ? true : undefined}
        className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-3 text-base text-ink"
      />
      {fieldErrors.message ? <p className="mt-1 text-sm text-ink">{fieldErrors.message}</p> : null}
      <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-ink">
        <input type="checkbox" name="consent" value="yes" required className="mt-1 size-5 shrink-0 accent-pine" />
        <span>{locale === "es" ? site.consentTextEs : site.consentText}</span>
      </label>
      {fieldErrors.consent ? <p className="mt-1 text-sm text-ink">{fieldErrors.consent}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-60"
      >
        {pending ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-amber-ink/30 border-t-amber-ink motion-reduce:animate-none" aria-hidden="true" />
            {copy.sending}
          </>
        ) : (
          copy.requestInfo
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  autoComplete,
  error,
  type = "text",
  inputMode,
}: {
  label: string;
  name: string;
  autoComplete: string;
  error?: string;
  type?: string;
  inputMode?: "tel" | "email" | "text";
}) {
  return (
    <div className="mt-4">
      <label className="block text-sm text-ink" htmlFor={`sheet-inquiry-${name}`}>
        {label}
      </label>
      <input
        id={`sheet-inquiry-${name}`}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        className="mt-1 min-h-12 w-full rounded-lg border border-line bg-paper px-3 text-base text-ink"
      />
      {error ? <p className="mt-1 text-sm text-ink">{error}</p> : null}
    </div>
  );
}
