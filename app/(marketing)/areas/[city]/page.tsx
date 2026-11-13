import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClosingBand } from "@/components/marketing/closing-band";
import { Comparison } from "@/components/marketing/comparison";
import { FaqList } from "@/components/marketing/faq-list";
import { Founders } from "@/components/marketing/founders";
import { JsonLd } from "@/components/marketing/json-ld";
import { businessRef } from "@/components/marketing/local-business";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import { TrustRow } from "@/components/marketing/trust-row";
import { getAreaExtras } from "@/lib/content/area-extras";
import { areas, getArea } from "@/lib/content/areas";
import { guides } from "@/lib/content/guides";
import { situations } from "@/lib/content/situations";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return areas.map((area) => ({ city: area.slug }));
}

type AreaParams = { params: Promise<{ city: string }> };

export const instant = false;

const valleyImageAlt = "Single-story homes on a quiet street in the Phoenix Valley, Maricopa County";

export async function generateMetadata({ params }: AreaParams): Promise<Metadata> {
  const { city } = await params;
  const area = getArea(city);
  if (!area) return {};
  const title = `We Buy Houses in ${area.name}, AZ for Cash`;
  const path = `/areas/${area.slug}`;
  const imageAlt = area.slug === "phoenix" ? site.ogImageAlt : valleyImageAlt;
  return {
    title,
    description: area.description,
    alternates: { canonical: path, ...hreflang(path, `/es/zonas/${area.slug}`) },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_US",
      url: path,
      title: `${title} · Vamos Properties`,
      description: area.description,
      images: [{ url: site.ogImagePath, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Vamos Properties`,
      description: area.description,
      images: [site.ogImagePath],
    },
  };
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">{children}</p>;
}

export default async function AreaPage({ params }: AreaParams) {
  "use cache";
  cacheLife("hours");
  const { city } = await params;
  const area = getArea(city);
  if (!area) notFound();
  const extras = getAreaExtras(area.slug);
  const nearby = area.nearby.map((slug) => getArea(slug)).filter((item) => item !== undefined);
  const neighborhoods = extras?.neighborhoods ?? area.neighborhoods;
  const faqs = [...area.faqs, ...(extras?.moreFaqs ?? [])];
  const pageUrl = `${site.url}/areas/${area.slug}`;
  const name = area.name;

  const steps = [
    {
      title: `Send the ${name} address`,
      body: "Use the form or call. The address, what you owe, and the date on any notice are enough to start.",
    },
    {
      title: "Talk to Patrick or Jaime",
      body: `One of them calls you, asks about the house and the loan, and looks at it. You get a number with the math behind it, not a range.`,
    },
    {
      title: "Choose, or don't",
      body: "If you say yes, a Maricopa County title company handles the closing and pays the loan and any liens from the sale. If you say no, nothing happens.",
    },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            { "@type": "ListItem", position: 2, name: `Sell a house in ${name}`, item: pageUrl },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Cash home buying in ${name}, AZ`,
          serviceType: "Cash home buyer",
          url: pageUrl,
          description: area.description,
          provider: businessRef(),
          areaServed: { "@type": "City", name: `${name}, AZ` },
        }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <Image
          src={site.ogImagePath}
          alt={area.slug === "phoenix" ? site.ogImageAlt : valleyImageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0c1c30]/80" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">{name}</li>
            </ol>
          </nav>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-amber">
            We buy houses in {name}, Arizona
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">
            Sell a {name} house without listing it.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/88">{extras?.heroLine ?? area.opening}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#offer"
              className="inline-flex min-h-12 items-center justify-center bg-amber px-6 text-base font-semibold text-amber-ink"
            >
              Get your {name} cash offer
            </a>
            <a
              href={site.phoneTel}
              className="inline-flex min-h-12 items-center justify-center border border-white/35 px-6 text-base font-semibold text-white"
            >
              Call or text {site.phoneDisplay}
            </a>
          </div>
          <p className="mt-5 text-sm text-white/75">
            {site.hours}. Asking does not put the house under contract.
          </p>
        </div>
      </section>

      <TrustRow />

      {/* Intro */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <Eyebrow>Selling in {name}</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">What a private sale looks like here.</h2>
            {extras ? <p className="mt-5 text-lg leading-8 text-muted">{area.opening}</p> : null}
            <div className="mt-5 space-y-4 text-lg leading-8 text-ink">
              {area.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <aside className="self-start border-l-4 border-amber bg-mist p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-link">Worth knowing</p>
            <p className="mt-3 text-lg leading-8 text-ink">{area.fact}</p>
            <p className="mt-4 leading-7 text-muted">
              Read the{" "}
              <Link href="/guides/trustee-sale" className="font-semibold text-link">
                trustee sale guide
              </Link>{" "}
              or the{" "}
              <Link href="/guides/cash-sale" className="font-semibold text-link">
                cash sale guide
              </Link>{" "}
              if you want the steps first.
            </p>
          </aside>
        </div>
      </Section>

      {/* Situations */}
      {extras ? (
        <Section tone="mist">
          <div className="max-w-2xl">
            <Eyebrow>Why {name} owners call</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">The situations we hear most.</h2>
            <p className="mt-4 leading-7 text-muted">
              These are the reasons people call about {name} houses. They are not reviews, and we do not publish a seller&apos;s name or a made-up result.
            </p>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {extras.situations.map((item) => (
              <li key={item.title} className="bg-panel p-6">
                <h3 className="text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-3 leading-7 text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Neighborhoods */}
      <Section tone={extras ? "white" : "mist"}>
        <div className="max-w-2xl">
          <Eyebrow>{name} neighborhoods</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Neighborhoods, not a city average.</h2>
          <p className="mt-4 leading-7 text-muted">
            We do not publish a {name} median price. Two streets can be a different house, a different HOA, and a different loan. This is the local difference that actually changes the call.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {neighborhoods.map((place) => (
            <li key={place.name} className="border border-line bg-panel p-6">
              <h3 className="text-xl font-semibold text-ink">{place.name}</h3>
              <p className="mt-3 leading-7 text-muted">{place.note}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-ink">Zip codes we see on {name} calls</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            If yours is not on this list, still send it. These are common {name} codes, not a boundary.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {area.zips.map((zip) => (
              <li key={zip} className="border border-line bg-mist px-3 py-2 text-sm font-semibold text-ink">
                {zip}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Local notes */}
      {extras ? (
        <Section tone="mist">
          <div className="max-w-2xl">
            <Eyebrow>Before we name a price</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">What is different about a {name} sale.</h2>
          </div>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {extras.localNotes.map((note) => (
              <li key={note.title} className="border-t-2 border-navy bg-panel p-6">
                <h3 className="text-xl font-semibold text-ink">{note.title}</h3>
                <p className="mt-3 leading-7 text-muted">{note.body}</p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Steps */}
      <Section>
        <div className="max-w-2xl">
          <Eyebrow>What happens next</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Three steps. Then it is your decision.</h2>
        </div>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-navy pt-5">
              <span className="text-sm font-semibold tracking-wide text-link">0{index + 1}</span>
              <h3 className="mt-2 text-2xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-3 leading-7 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Trustee sale timeline */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber">Behind on a {name} house?</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
            The date on the notice is the clock.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">
            Arizona foreclosures on a deed of trust usually run through a trustee&apos;s sale. For a {name} house the notice is recorded with the Maricopa County Recorder, and the sale cannot be held before the 91st day after that recording (A.R.S. § 33-808).
          </p>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            <li className="border-t-2 border-amber pt-5">
              <span className="text-sm font-semibold text-amber">Day 0</span>
              <h3 className="mt-2 text-xl font-semibold">The notice is recorded</h3>
              <p className="mt-2 leading-7 text-white/78">The count starts on the recording date, not the day the letter arrives.</p>
            </li>
            <li className="border-t-2 border-white/40 pt-5">
              <span className="text-sm font-semibold text-white/80">The weeks in between</span>
              <h3 className="mt-2 text-xl font-semibold">Your window to choose</h3>
              <p className="mt-2 leading-7 text-white/78">
                Talk to your lender, a lawyer, or a housing counselor, and compare a cash sale. Title needs time, so earlier is better.
              </p>
            </li>
            <li className="border-t-2 border-white/40 pt-5">
              <span className="text-sm font-semibold text-white/80">Day 91 or later</span>
              <h3 className="mt-2 text-xl font-semibold">The sale date on the notice</h3>
              <p className="mt-2 leading-7 text-white/78">A cash closing is meant to pay the loan off before this date. Postponements can move it.</p>
            </li>
          </ol>
          <p className="mt-8 max-w-2xl text-sm leading-6 text-white/65">
            This is general information, not legal advice. Have an Arizona attorney read your notice.{" "}
            <Link href="/stop-foreclosure" className="font-semibold text-amber">
              Stop a foreclosure: the full page
            </Link>
          </p>
        </div>
      </section>

      {/* Comparison */}
      <Section tone="mist">
        <Comparison />
        <p className="mt-6 max-w-2xl leading-7 text-muted">
          The Valley-wide pages are{" "}
          <Link href="/cash-offer" className="font-semibold text-link">a cash offer in {name}</Link>,{" "}
          <Link href="/stop-foreclosure" className="font-semibold text-link">a {name} house headed to a trustee sale</Link>, and{" "}
          <Link href="/take-over-payments" className="font-semibold text-link">taking over the payments</Link>.
        </p>
      </Section>

      {/* People */}
      <Section>
        <Founders linked />
      </Section>

      {/* Form */}
      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <Eyebrow>Get your {name} offer</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Start with the {name} address.</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
              Patrick or Jaime read it and call you back. You can say no after the call.
            </p>
            <h3 className="mt-10 text-lg font-semibold text-ink">If you want to read first</h3>
            <ul className="mt-3 grid gap-3">
              {guides.map((guide) => (
                <li key={guide.slug}>
                  <Link href={`/guides/${guide.slug}`} className="block border border-line bg-panel p-4 font-semibold text-ink">
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-10 text-lg font-semibold text-ink">Selling for a specific reason?</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {situations.map((item) => (
                <li key={item.slug}>
                  <Link href={`/sell/${item.slug}`} className="inline-flex min-h-11 items-center border border-line bg-panel px-4 font-semibold text-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            {nearby.length > 0 ? (
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-ink">Nearby cities</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {nearby.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/areas/${item.slug}`} className="inline-flex min-h-11 items-center border border-line bg-panel px-4 font-semibold text-link">
                        Sell a house in {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="mt-8 leading-7 text-muted">
              Looking at houses we already bought?{" "}
              <Link href="/properties" className="font-semibold text-link">
                Homes for sale near {name}
              </Link>{" "}
              are on the inventory page. This page is for selling the one you own.
            </p>
          </div>
          <LeadForm sourcePath={`/areas/${area.slug}`} language="en" />
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <FaqList faqs={faqs} heading={`Questions from ${name}`} />
      </Section>

      <ClosingBand
        title={`Selling a house in ${name}? Send the address.`}
        body="Patrick or Jaime read it and call you. You are not signing anything by asking."
      />
    </>
  );
}
