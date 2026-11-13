import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import Link from "next/link";
import { ClosingBand } from "@/components/marketing/closing-band";
import { JsonLd } from "@/components/marketing/json-ld";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import { situations } from "@/lib/content/situations";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

const title = "Sell Your House in Any Situation in Phoenix";
const description =
  "Inherited a house, going through a divorce, tired of a rental, facing repairs, or moving away? How a cash sale works in each situation in Maricopa County.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sell", ...hreflang("/sell", "/es/vender") },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: "/sell",
    title: `${title} · Vamos Properties`,
    description,
    images: [{ url: site.ogImagePath, alt: site.ogImageAlt }],
  },
};

const otherPaths = [
  { href: "/stop-foreclosure", label: "Behind on payments or facing a trustee sale", blurb: "A notice of trustee's sale, the 91-day clock, and what a cash sale can still do." },
  { href: "/take-over-payments", label: "Taking over the payments", blurb: "When the loan stays in place, and the risk you should understand first." },
];

export default async function SellHubPage() {
  "use cache";
  cacheLife("hours");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            { "@type": "ListItem", position: 2, name: "Situations we buy", item: `${site.url}/sell` },
          ],
        }}
      />
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Situations we buy</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          The reason you are selling changes the paperwork, not whether we will look.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Pick the one that sounds like yours. Each page covers who has to sign, what Arizona rules matter, and what to have ready for the first call.
        </p>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {situations.map((item) => (
            <li key={item.slug} className="border border-line p-6">
              <h2 className="text-2xl font-semibold text-ink">
                <Link href={`/sell/${item.slug}`} className="text-link">
                  {item.label}
                </Link>
              </h2>
              <p className="mt-3 leading-7 text-muted">{item.blurb}</p>
            </li>
          ))}
          {otherPaths.map((item) => (
            <li key={item.href} className="border border-line p-6">
              <h2 className="text-2xl font-semibold text-ink">
                <Link href={item.href} className="text-link">
                  {item.label}
                </Link>
              </h2>
              <p className="mt-3 leading-7 text-muted">{item.blurb}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Not sure which fits?</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Send the address anyway.</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
              Most houses fit more than one of these. Patrick or Jaime read the form and call you back. You can say no after the call.
            </p>
          </div>
          <LeadForm sourcePath="/sell" language="en" />
        </div>
      </Section>

      <ClosingBand
        title="Whatever the reason, the first step is the same."
        body="Send the address. You are not signing anything by asking."
      />
    </>
  );
}
