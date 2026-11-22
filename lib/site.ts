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

/** Primary business line: Google Voice, rings and receives texts on (602) 834-3983. */
export const GOOGLE_VOICE_E164 = "+16028343983";
export const GOOGLE_VOICE_DISPLAY = "(602) 834-3983";

const jaimePhoneDisplay = process.env.NEXT_PUBLIC_PHONE_DISPLAY || GOOGLE_VOICE_DISPLAY;
const jaimePhoneE164 = process.env.NEXT_PUBLIC_PHONE_E164 || GOOGLE_VOICE_E164;

/**
 * `sms:` link with a pre-filled body. `?&body=` is the form both iOS and Android Messages
 * accept; Google Voice receives the text natively on the business line.
 */
/**
 * Pre-filled opener for "Text us" links. It ends where the visitor naturally types next
 * (the address), so one tap plus a few words sends a useful first text to Google Voice.
 */
export const textUsBody = {
  en: "Hi Vamos, I'm thinking about selling my house at ",
  es: "Hola Vamos, estoy pensando en vender mi casa en ",
} as const;

export function smsHref(body?: string) {
  const base = `sms:${jaimePhoneE164}`;
  if (!body) return base;
  // RFC 3986 strict: encodeURIComponent leaves ' ( ) * ! unescaped; some SMS apps choke on them.
  const encoded = encodeURIComponent(body).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  return `${base}?&body=${encoded}`;
}

export const site = {
  /** Public brand name: titles, headers, footer, OpenGraph, JSON-LD `name`. */
  name: "Vamos Properties",
  /**
   * Registered entity. Only for legal text that must name the entity: the TCPA call/text
   * consent on lead forms and the JSON-LD `legalName` field. Never in branding or titles.
   */
  legalName: "Vamos Properties LLC",
  shortName: "Vamos",
  url: publicSiteUrl(),
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "GTM-5XGG59XD",
  phoneDisplay: jaimePhoneDisplay,
  phoneTel: `tel:${jaimePhoneE164}`,
  phoneE164: jaimePhoneE164,
  phoneSms: `sms:${jaimePhoneE164}`,
  email: "info@vamos-properties.com",
  patrickEmail: "patrick@vamos-properties.com",
  jaimeEmail: "jaime@vamos-properties.com",
  jaimePhoneDisplay,
  jaimePhoneTel: `tel:${jaimePhoneE164}`,
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

/**
 * Public profiles of the business (Google Business Profile share link, Facebook, LinkedIn,
 * YouTube, Yelp, BBB...). Add each URL here once it exists; it feeds `sameAs` in the
 * LocalBusiness JSON-LD so Google can tie the profiles to this site.
 */
export const businessProfiles: string[] = [];

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
