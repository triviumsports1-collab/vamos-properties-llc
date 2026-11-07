export const spanishForeclosurePath = "/es/ejecucion-hipotecaria";

export const site = {
  name: "Vamos Properties LLC",
  shortName: "Vamos",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://vamosproperties.com",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "GTM-5XGG59XD",
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? "(602) 555-0148",
  phoneTel: `tel:${process.env.NEXT_PUBLIC_PHONE_E164 ?? "+16025550148"}`,
  hours: "8:00 a.m. to 7:00 p.m., seven days",
  area: "Maricopa County, Arizona",
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
