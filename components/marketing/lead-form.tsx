"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { submitLead, type LeadFormState } from "@/lib/leads/actions";
import { leadSchema } from "@/lib/leads/schema";
import { paths, site, situations } from "@/lib/site";

const initialState: LeadFormState = { message: "", fieldErrors: {} };

export function LeadForm({
  sourcePath,
  language,
}: {
  sourcePath: string;
  language: "en" | "es";
}) {
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const [situation, setSituation] = useState("behind");
  const [address, setAddress] = useState("");
  const [clientMessage, setClientMessage] = useState("");
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [utm, setUtm] = useState({ source: "", medium: "", campaign: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUtm({
      source: params.get("utm_source") ?? "",
      medium: params.get("utm_medium") ?? "",
      campaign: params.get("utm_campaign") ?? "",
    });
    const stored = sessionStorage.getItem("vamos-address");
    if (stored) setAddress(stored);
    function onAddress(event: Event) {
      const detail = (event as CustomEvent<string>).detail;
      if (typeof detail === "string") setAddress(detail);
    }
    window.addEventListener("vamos-address", onAddress);
    return () => window.removeEventListener("vamos-address", onAddress);
  }, []);

  useEffect(() => {
    if (!state.message) return;
    document.getElementById("offer-status")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state.message]);

  const copy =
    language === "es"
      ? {
          title: "Cuéntenos de la casa",
          address: "Dirección de la propiedad",
          name: "Su nombre",
          phone: "Teléfono móvil",
          email: "Correo electrónico",
          message: "Qué está pasando en sus palabras",
          messageHint: "Unas líneas son suficientes. Incluya la fecha del aviso si la tiene.",
          situation: "Qué está pasando",
          date: "Fecha de la venta del fiduciario",
          path: "Cómo podemos ayudar",
          sending: "Enviando…",
          submit: "Pedir mi oferta",
          note: "Toma menos de un minuto. Nuestros especialistas le responden el mismo día.",
          check: "Revise los campos marcados y envíelo otra vez.",
          situations: {
            behind: "Atrasado en los pagos",
            trustee_sale: "Aviso de venta del fiduciario",
            divorce: "Divorcio",
            inheritance: "Herencia o sucesión",
            job_loss: "Pérdida del trabajo",
            sell: "Solo necesito vender",
          },
          paths: {
            cash: "Oferta de contado",
            takeover: "Tomar los pagos",
            unsure: "Díganme cuál conviene",
          },
        }
      : {
          title: "Tell us about the house",
          address: "Property address",
          name: "Your name",
          phone: "Mobile number",
          email: "Email address",
          message: "What is going on, in your words",
          messageHint: "A few lines are enough. Include the notice date if you have it.",
          situation: "What is happening",
          date: "Trustee sale date",
          path: "How should we help",
          sending: "Sending…",
          submit: "Get your cash offer",
          note: "This takes under a minute. Our specialists reply the same day.",
          check: "Check the highlighted fields, then send it again.",
          situations: Object.fromEntries(situations.map((item) => [item.value, item.label])) as Record<string, string>,
          paths: Object.fromEntries(paths.map((item) => [item.value, item.label])) as Record<string, string>,
        };

  const fieldErrors = { ...clientErrors, ...state.fieldErrors };
  const banner = state.message || clientMessage;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const parsed = leadSchema.safeParse({
      address: String(formData.get("address") ?? ""),
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      situation: String(formData.get("situation") ?? ""),
      trusteeSaleDate: String(formData.get("trusteeSaleDate") ?? ""),
      preferredPath: String(formData.get("preferredPath") ?? ""),
      language: String(formData.get("language") ?? ""),
      sourcePath: String(formData.get("sourcePath") ?? ""),
      utmSource: String(formData.get("utmSource") ?? ""),
      utmMedium: String(formData.get("utmMedium") ?? ""),
      utmCampaign: String(formData.get("utmCampaign") ?? ""),
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
    setClientMessage(copy.check);
    window.setTimeout(() => {
      document.getElementById("offer-status")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }

  return (
    <form id="offer" action={formAction} onSubmit={onSubmit} aria-busy={pending} className="scroll-mt-24 border border-line bg-panel p-6">
      <h2 className="font-serif text-2xl text-ink">{copy.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{copy.note}</p>
      {banner ? (
        <p id="offer-status" className="mt-4 border border-line bg-paper px-3 py-3 text-sm leading-6 text-ink" role="alert">
          {banner}
        </p>
      ) : null}

      <div aria-hidden="true">
        <label className="hidden" htmlFor={`${sourcePath}-company`}>
          Company
        </label>
        <input
          id={`${sourcePath}-company`}
          name="company"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          defaultValue=""
        />
      </div>
      <input type="hidden" name="sourcePath" value={sourcePath} />
      <input type="hidden" name="language" value={language} />
      <input type="hidden" name="utmSource" value={utm.source} />
      <input type="hidden" name="utmMedium" value={utm.medium} />
      <input type="hidden" name="utmCampaign" value={utm.campaign} />

      <Field
        label={copy.address}
        name="address"
        error={fieldErrors.address}
        autoComplete="street-address"
        value={address}
        onChange={setAddress}
      />
      <Field label={copy.name} name="name" error={fieldErrors.name} autoComplete="name" />
      <Field label={copy.phone} name="phone" error={fieldErrors.phone} autoComplete="tel" inputMode="tel" />
      <Field label={copy.email} name="email" error={fieldErrors.email} autoComplete="email" type="email" />
      <div className="mt-4">
        <label className="block text-sm text-ink" htmlFor="message">
          {copy.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={5}
          rows={4}
          aria-invalid={fieldErrors.message ? true : undefined}
          className="mt-1 w-full border border-line bg-paper px-3 py-3 text-base leading-6 text-ink"
        />
        <p className="mt-1 text-sm leading-6 text-muted">{copy.messageHint}</p>
        {fieldErrors.message ? <FieldError message={fieldErrors.message} /> : null}
      </div>

      <label className="mt-4 block text-sm text-ink" htmlFor={`${sourcePath}-situation`}>
        {copy.situation}
      </label>
      <select
        id={`${sourcePath}-situation`}
        name="situation"
        className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
        value={situation}
        onChange={(event) => setSituation(event.target.value)}
      >
        {situations.map((item) => (
          <option key={item.value} value={item.value}>
            {copy.situations[item.value]}
          </option>
        ))}
      </select>
      {fieldErrors.situation ? <FieldError message={fieldErrors.situation} /> : null}

      {situation === "trustee_sale" ? (
        <Field label={copy.date} name="trusteeSaleDate" error={fieldErrors.trusteeSaleDate} type="date" required={false} />
      ) : (
        <input type="hidden" name="trusteeSaleDate" value="" />
      )}

      <label className="mt-4 block text-sm text-ink" htmlFor={`${sourcePath}-path`}>
        {copy.path}
      </label>
      <select
        id={`${sourcePath}-path`}
        name="preferredPath"
        className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
        defaultValue="unsure"
      >
        {paths.map((item) => (
          <option key={item.value} value={item.value}>
            {copy.paths[item.value]}
          </option>
        ))}
      </select>
      {fieldErrors.preferredPath ? <FieldError message={fieldErrors.preferredPath} /> : null}

      <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-muted">
        <input name="consent" type="checkbox" value="yes" className="mt-1 size-4 accent-pine" required />
        <span>{language === "es" ? site.consentTextEs : site.consentText}</span>
      </label>
      {fieldErrors.consent ? <FieldError message={fieldErrors.consent} /> : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-60"
      >
        {pending ? (
          <>
            <span
              className="size-4 animate-spin rounded-full border-2 border-amber-ink/30 border-t-amber-ink motion-reduce:animate-none"
              aria-hidden="true"
            />
            {copy.sending}
          </>
        ) : (
          copy.submit
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  type = "text",
  required = true,
  autoComplete,
  inputMode,
  value,
  onChange,
}: {
  label: string;
  name: string;
  error?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "tel" | "email" | "text";
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="mt-4">
      <label className="block text-sm text-ink" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        value={onChange ? value : undefined}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="mt-1 min-h-12 w-full border border-line bg-paper px-3 text-base text-ink"
      />
      {error ? <FieldError id={`${name}-error`} message={error} /> : null}
    </div>
  );
}

function FieldError({ message, id }: { message: string; id?: string }) {
  return (
    <p id={id} className="mt-1 text-sm text-pine">
      {message}
    </p>
  );
}
