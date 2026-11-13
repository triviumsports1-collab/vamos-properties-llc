import { JsonLd } from "@/components/marketing/json-ld";
import { areas } from "@/lib/content/areas";
import { businessProfiles, site } from "@/lib/site";

export const businessId = `${site.url}#business`;

/** Small reference to the business, for `provider` / `publisher` fields on other pages. */
export function businessRef() {
  return {
    "@type": "LocalBusiness",
    "@id": businessId,
    name: "Vamos Properties",
    url: site.url,
    telephone: site.phoneTel.replace(/^tel:/, ""),
  };
}

export function LocalBusinessJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": businessId,
        name: "Vamos Properties",
        legalName: site.name,
        url: site.url,
        logo: `${site.url}/brand/vamos-logo.jpg`,
        image: `${site.url}${site.ogImagePath}`,
        description:
          "Local cash home buyers in Maricopa County, Arizona. We buy houses as-is and help homeowners who are behind on the mortgage or facing a trustee sale.",
        telephone: site.phoneTel.replace(/^tel:/, ""),
        email: site.email,
        knowsLanguage: ["en", "es"],
        founder: [
          { "@type": "Person", name: "Patrick Szymczak" },
          { "@type": "Person", name: "Jaime Miranda" },
        ],
        employee: [
          { "@type": "Person", name: "Patrick Szymczak", email: site.patrickEmail, jobTitle: "Founder" },
          { "@type": "Person", name: "Jaime Miranda", email: site.jaimeEmail, jobTitle: "Founder" },
        ],
        areaServed: [
          ...areas.map((area) => ({
            "@type": "City",
            name: `${area.name}, AZ`,
          })),
          { "@type": "AdministrativeArea", name: "Maricopa County, AZ" },
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Phoenix",
          addressRegion: "AZ",
          addressCountry: "US",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "08:00",
            closes: "19:00",
          },
        ],
        ...(businessProfiles.length > 0 ? { sameAs: businessProfiles } : {}),
      }}
    />
  );
}
