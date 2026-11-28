import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import { AboutView } from "@/components/marketing/about-view";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

const title = "About Vamos Properties | Phoenix Cash Home Buyers";
const description =
  "Meet Vamos Properties, a local Maricopa County home buyer led by co-founders Patrick Szymczak and Jaime Miranda. How a deal works, from first call to title.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/about", ...hreflang("/about", "/es/nosotros") },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: "/about",
    title,
    description,
    images: [{ url: site.ogImagePath, alt: site.ogImageAlt }],
  },
};

export default async function AboutPage() {
  "use cache";
  cacheLife("hours");
  return <AboutView locale="en" />;
}
