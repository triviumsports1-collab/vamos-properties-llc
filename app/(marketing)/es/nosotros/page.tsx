import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import { AboutView } from "@/components/marketing/about-view";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

const title = "Quiénes somos | Vamos Properties en Phoenix";
const description =
  "Conozca a Vamos Properties, compradores locales de casas en Maricopa dirigidos por Patrick Szymczak y Jaime Miranda. Cómo funciona una venta, paso a paso.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/es/nosotros", ...hreflang("/about", "/es/nosotros") },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "es_US",
    url: "/es/nosotros",
    title,
    description,
    images: [{ url: site.ogImagePath, alt: site.ogImageAlt }],
  },
};

export default async function SpanishAboutPage() {
  "use cache";
  cacheLife("hours");
  return <AboutView locale="es" />;
}
