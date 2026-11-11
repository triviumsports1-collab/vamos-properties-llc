import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/marketing/faq-list";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import { areas, getArea } from "@/lib/content/areas";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return areas.map((area) => ({ city: area.slug }));
}

type AreaParams = { params: Promise<{ city: string }> };

export const instant = false;

export async function generateMetadata({ params }: AreaParams): Promise<Metadata> {
  const { city } = await params;
  const area = getArea(city);
  if (!area) return {};
  return {
    title: `Sell a house in ${area.name}`,
    description: area.description,
    alternates: { canonical: `/areas/${area.slug}` },
  };
}

export default async function AreaPage({ params }: AreaParams) {
  "use cache";
  cacheLife("hours");
  const { city } = await params;
  const area = getArea(city);
  if (!area) notFound();
  const nearby = area.nearby.map((slug) => getArea(slug)).filter((item) => item !== undefined);

  return (
    <>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">{area.name}, Arizona</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Sell a {area.name} house without listing it.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{area.opening}</p>
        <p className="mt-6 max-w-2xl border-l-2 border-amber pl-4 text-lg leading-8 text-ink">{area.fact}</p>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          {area.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-6 max-w-2xl leading-7 text-muted">
          The Valley-wide pages are{" "}
          <Link href="/cash-offer" className="font-semibold text-link">a cash offer in {area.name}</Link>,{" "}
          <Link href="/stop-foreclosure" className="font-semibold text-link">a {area.name} house headed to a trustee sale</Link>, and{" "}
          <Link href="/take-over-payments" className="font-semibold text-link">taking over the payments</Link>.
          Call <a href={site.phoneTel} className="font-semibold text-link">{site.phoneDisplay}</a>.
        </p>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          Looking at houses we already bought?{" "}
          <Link href="/properties" className="font-semibold text-link">
            Homes for sale in {area.name}
          </Link>{" "}
          are on the inventory page. This page is for selling the one you own.
        </p>
      </Section>

      <Section tone="mist">
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Neighborhoods, not a city average.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          We do not publish a {area.name} median price. Two streets can be a different house, a different HOA, and a different loan. This is the local difference that actually changes the call.
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {area.neighborhoods.map((place) => (
            <li key={place.name} className="bg-panel p-5">
              <h3 className="text-xl font-semibold text-ink">{place.name}</h3>
              <p className="mt-2 leading-7 text-muted">{place.note}</p>
            </li>
          ))}
        </ul>
        <h2 className="mt-12 text-2xl font-semibold text-ink">Zip codes we see on {area.name} calls</h2>
        <p className="mt-3 max-w-2xl leading-7 text-muted">
          If yours is not on this list, still send it. These are common {area.name} codes, not a boundary.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {area.zips.map((zip) => (
            <li key={zip} className="bg-panel px-3 py-2 text-sm font-semibold text-ink">
              {zip}
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Start with the {area.name} address.</h2>
            <p className="mt-4 leading-7 text-muted">
              Read <Link href="/guides/cash-sale" className="font-semibold text-link">how a cash closing works</Link> or{" "}
              <Link href="/guides/trustee-sale" className="font-semibold text-link">what to do after the notice</Link> if you want the steps before the form.
            </p>
            {nearby.length > 0 ? (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-ink">Nearby cities</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {nearby.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/areas/${item.slug}`} className="inline-flex min-h-11 items-center border border-line px-4 font-semibold text-link">
                        Sell a house in {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <LeadForm sourcePath={`/areas/${area.slug}`} language="en" />
        </div>
      </Section>

      <Section tone="mist">
        <FaqList faqs={area.faqs} heading={`Questions from ${area.name}`} />
      </Section>
    </>
  );
}
