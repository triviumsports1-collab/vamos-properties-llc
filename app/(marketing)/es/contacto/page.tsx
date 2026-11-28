import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import { ContactView } from "@/components/marketing/contact-view";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

const title = "Contacto | Vamos Properties, oferta de contado";
const description = `Llame o escriba a Vamos Properties al ${site.phoneDisplay}, o envíe la dirección para una oferta de contado por su casa en Maricopa. Respuesta el mismo día.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/es/contacto", ...hreflang("/contact", "/es/contacto") },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "es_US",
    url: "/es/contacto",
    title,
    description,
    images: [{ url: site.ogImagePath, alt: site.ogImageAlt }],
  },
};

export default async function SpanishContactPage() {
  "use cache";
  cacheLife("hours");
  return <ContactView locale="es" />;
}
