import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import { ContactView } from "@/components/marketing/contact-view";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

const title = "Contact Vamos Properties - Cash Offer in Phoenix";
const description = `Call or text Vamos Properties at ${site.phoneDisplay}, or send the address for a cash offer on your Maricopa County house. Same-day reply, seven days a week.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/contact", ...hreflang("/contact", "/es/contacto") },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: "/contact",
    title,
    description,
    images: [{ url: site.ogImagePath, alt: site.ogImageAlt }],
  },
};

export default async function ContactPage() {
  "use cache";
  cacheLife("hours");
  return <ContactView locale="en" />;
}
