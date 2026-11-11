export const spanishForeclosurePath = "/es/ejecucion-hipotecaria";

/** Canonical origin for sitemap, canonicals, and JSON-LD. Must match the Search Console URL-prefix property. */
export const canonicalSiteUrl = "https://www.vamos-properties.com";

const aliasHosts = new Set(["vamosproperties.com", "www.vamosproperties.com", "vamos-properties.com"]);

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function publicSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? canonicalSiteUrl).trim().replace(/\/+$/, "");
  try {
    const parsed = new URL(raw);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") return raw;
    if (aliasHosts.has(parsed.hostname) || parsed.hostname === "www.vamos-properties.com") {
      return canonicalSiteUrl;
    }
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return canonicalSiteUrl;
  }
}

const jaimePhoneDisplay = process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "+1 (602) 332-9553";
const jaimePhoneE164 = process.env.NEXT_PUBLIC_PHONE_E164 ?? "+16023329553";

export const site = {
  name: "Vamos Properties LLC",
  shortName: "Vamos",
  url: publicSiteUrl(),
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "GTM-5XGG59XD",
  phoneDisplay: jaimePhoneDisplay,
  phoneTel: `tel:${jaimePhoneE164}`,
  email: "info@vamos-properties.com",
  patrickEmail: "patrick@vamos-properties.com",
  jaimeEmail: "jaime@vamos-properties.com",
  jaimePhoneDisplay,
  jaimePhoneTel: `tel:${jaimePhoneE164}`,
  patrickPhoneDisplay: "+49 176 32892944",
  patrickPhoneTel: "tel:+4917632892944",
  whatsappNumber: digitsOnly(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || jaimePhoneE164),
  hours: "8:00 a.m. to 7:00 p.m., seven days",
  area: "Maricopa County, Arizona",
  ogImagePath: "/phoenix-street.jpg",
  ogImageAlt: "Single-story homes on a quiet Phoenix street in late afternoon light",
  consentText:
    "I agree that Vamos Properties LLC may call and text me about my house, including with automated messages. Message and data rates may apply. Consent is not required to sell or to receive an offer.",
  consentTextEs:
    "Acepto que Vamos Properties LLC me llame y me envíe mensajes de texto sobre mi casa, incluso con mensajes automáticos. Pueden aplicarse tarifas de mensajes y datos. El consentimiento no es necesario para vender ni para recibir una oferta.",
} as const;

export const situations = [
  { value: "behind", label: "Behind on payments" },
  { value: "trustee_sale", label: "Notice of Trustee's Sale" },
  { value: "divorce", label: "Divorce" },
  { value: "inheritance", label: "Inherited or probate" },
  { value: "job_loss", label: "Job loss" },
  { value: "sell", label: "I just need to sell" },
] as const;

export const paths = [
  { value: "cash", label: "Cash offer" },
  { value: "takeover", label: "Take over the payments" },
  { value: "unsure", label: "Tell me which one fits" },
] as const;

export const leadSituations = [
  ...situations,
  { value: "listing_inquiry", label: "Asking about a listed home" },
] as const;

export type Situation = (typeof leadSituations)[number]["value"];
export type PreferredPath = (typeof paths)[number]["value"];
