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
import { areas } from "@/lib/content/areas";
import { getSituation, situations } from "@/lib/content/situations";
import { spanishSituationPath } from "@/lib/content/situations-es";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return situations.map((item) => ({ situation: item.slug }));
}

type SituationParams = { params: Promise<{ situation: string }> };

export const instant = false;

export async function generateMetadata({ params }: SituationParams): Promise<Metadata> {
  const { situation } = await params;
  const item = getSituation(situation);
  if (!item) return {};
  const path = `/sell/${item.slug}`;
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: path, ...hreflang(path, spanishSituationPath(item.slug)) },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_US",
      url: path,
      title: `${item.title} · Vamos Properties`,
      description: item.description,
      images: [{ url: site.ogImagePath, alt: site.ogImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} · Vamos Properties`,
      description: item.description,
      images: [site.ogImagePath],
    },
  };
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">{children}</p>;
}

export default async function SituationPage({ params }: SituationParams) {
  "use cache";
  cacheLife("hours");
  const { situation } = await params;
  const item = getSituation(situation);
  if (!item) notFound();
  const pageUrl = `${site.url}/sell/${item.slug}`;
  const others = situations.filter((other) => other.slug !== item.slug);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            { "@type": "ListItem", position: 2, name: "Situations we buy", item: `${site.url}/sell` },
            { "@type": "ListItem", position: 3, name: item.label, item: pageUrl },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: item.title,
          serviceType: "Cash home buyer",
          url: pageUrl,
          description: item.description,
          provider: businessRef(),
          areaServed: { "@type": "AdministrativeArea", name: "Maricopa County, AZ" },
        }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <Image src={site.ogImagePath} alt={site.ogImageAlt} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[#0c1c30]/80" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <nav aria-label="Breadcrumb" className="text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/sell" className="hover:text-white">Situations we buy</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">{item.label}</li>
            </ol>
          </nav>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-amber">{item.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">{item.h1}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/88">{item.heroLine}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#offer"
              className="inline-flex min-h-12 items-center justify-center bg-amber px-6 text-base font-semibold text-amber-ink"
            >
              Get a cash offer
            </a>
            <a
              href={site.phoneTel}
              className="inline-flex min-h-12 items-center justify-center border border-white/35 px-6 text-base font-semibold text-white"
            >
              Call or text {site.phoneDisplay}
            </a>
          </div>
          <p className="mt-5 text-sm text-white/75">{site.hours}. Asking does not put the house under contract.</p>
        </div>
      </section>

      <TrustRow />

      {/* Intro */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <Eyebrow>{item.label}</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Where this kind of sale starts.</h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-ink">
              {item.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <aside className="self-start border-l-4 border-amber bg-mist p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-link">Worth knowing</p>
            <p className="mt-3 text-lg leading-8 text-ink">{item.fact.text}</p>
            <p className="mt-4 leading-7 text-muted">{item.fact.note}</p>
          </aside>
        </div>
      </Section>

      {/* Problems */}
      <Section tone="mist">
        <div className="max-w-2xl">
          <Eyebrow>What makes it hard</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">The parts people call us about.</h2>
          <p className="mt-4 leading-7 text-muted">
            These are common reasons owners in this situation call. They are not reviews, and we do not publish a seller&apos;s name or a made-up result.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {item.problems.map((problem) => (
            <li key={problem.title} className="bg-panel p-6">
              <h3 className="text-xl font-semibold text-ink">{problem.title}</h3>
              <p className="mt-3 leading-7 text-muted">{problem.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Steps */}
      <Section>
        <div className="max-w-2xl">
          <Eyebrow>What happens next</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Three steps. Then it is your decision.</h2>
        </div>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {item.steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-navy pt-5">
              <span className="text-sm font-semibold tracking-wide text-link">0{index + 1}</span>
              <h3 className="mt-2 text-2xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-3 leading-7 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Arizona rules */}
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber">Arizona rules that matter here</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
            What the title company will look at.
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {item.rules.map((rule) => (
              <li key={rule.title} className="border-t-2 border-amber pt-5">
                <h3 className="text-xl font-semibold">{rule.title}</h3>
                <p className="mt-2 leading-7 text-white/78">{rule.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl text-sm leading-6 text-white/65">
            This is general information, not legal or tax advice. Have an Arizona attorney or a tax professional look at your situation before you sign.
          </p>
        </div>
      </section>

      {/* Gather */}
      <Section tone="mist">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Eyebrow>Before the first call</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">What helps to have nearby.</h2>
            <p className="mt-4 leading-7 text-muted">
              You do not need all of it to call. It just makes the first conversation shorter and the number more accurate.
            </p>
          </div>
          <ul className="grid gap-3">
            {item.gather.map((thing) => (
              <li key={thing} className="flex gap-3 border border-line bg-panel p-4 leading-7 text-ink">
                <span aria-hidden="true" className="font-semibold text-link">✓</span>
                <span>{thing}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Comparison */}
      <Section>
        <Comparison />
      </Section>

      {/* People */}
      <Section tone="mist">
        <Founders linked />
      </Section>

      {/* Form */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <Eyebrow>Get your offer</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Start with the address.</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
              Patrick or Jaime read it and call you back. You can say no after the call.
            </p>
            <h3 className="mt-10 text-lg font-semibold text-ink">If you want to read first</h3>
            <ul className="mt-3 grid gap-3">
              {item.related.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="block border border-line bg-panel p-4 font-semibold text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-10 text-lg font-semibold text-ink">Other situations</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/sell/${other.slug}`}
                    className="inline-flex min-h-11 items-center border border-line bg-panel px-4 font-semibold text-link"
                  >
                    {other.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-10 text-lg font-semibold text-ink">Where we buy</h3>
            <p className="mt-3 leading-7 text-muted">
              All of Maricopa County, including{" "}
              {areas.map((area, index) => (
                <span key={area.slug}>
                  <Link href={`/areas/${area.slug}`} className="font-semibold text-link">
                    {area.name}
                  </Link>
                  {index < areas.length - 2 ? ", " : index === areas.length - 2 ? ", and " : "."}
                </span>
              ))}
            </p>
          </div>
          <LeadForm sourcePath={`/sell/${item.slug}`} language="en" />
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="mist">
        <FaqList faqs={item.faqs} heading="Questions we get about this" />
      </Section>

      <ClosingBand
        title="Send the address. Then decide."
        body="Patrick or Jaime read it and call you. You are not signing anything by asking."
      />
    </>
  );
}
