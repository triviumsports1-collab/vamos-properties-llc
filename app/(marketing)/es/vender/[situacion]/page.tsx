import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ClosingBand } from "@/components/marketing/closing-band";
import { FaqList } from "@/components/marketing/faq-list";
import { JsonLd } from "@/components/marketing/json-ld";
import { businessRef } from "@/components/marketing/local-business";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import { areas } from "@/lib/content/areas";
import { getSituationEs, situationsEs } from "@/lib/content/situations-es";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return situationsEs.map((item) => ({ situacion: item.slug }));
}

type SituacionParams = { params: Promise<{ situacion: string }> };

export const instant = false;

const imageAlt = "Casas de un piso en una calle tranquila del Valle de Phoenix, condado de Maricopa";

export async function generateMetadata({ params }: SituacionParams): Promise<Metadata> {
  const { situacion } = await params;
  const item = getSituationEs(situacion);
  if (!item) return {};
  const path = `/es/vender/${item.slug}`;
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: path, ...hreflang(`/sell/${item.enSlug}`, path) },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "es_US",
      url: path,
      title: `${item.title} · Vamos Properties`,
      description: item.description,
      images: [{ url: site.ogImagePath, alt: imageAlt }],
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

const trust = [
  ["Sin costo por preguntar", "Revisar la dirección no cuesta nada."],
  ["Tal como está", "Sin reparaciones y sin desfile de visitas."],
  ["Respuesta el mismo día", "Patrick o Jaime llaman durante el día."],
  ["Puede decir que no", "Una oferta no es una promesa de vender."],
];

const comparisonRows = [
  ["Tiempo", "A menudo de uno a tres meses", "A menudo un par de semanas con título limpio", "Depende del préstamo y del título"],
  ["Reparaciones y visitas", "Normalmente se esperan", "Ninguna", "Ninguna"],
  ["Comisión de agente", "Normalmente sale de la venta", "Usted no paga ninguna", "Usted no paga ninguna"],
  ["Su nombre en el préstamo", "Sale cuando se paga el préstamo", "Sale cuando se paga el préstamo al cierre", "Puede quedar en el préstamo"],
  ["Conviene cuando", "Puede esperar y quiere precio de mercado", "Quiere vender tal como está y con fecha", "Una venta de contado dejaría poco después del pago"],
];

const people = [
  { name: "Patrick Szymczak", src: "/founders/patrick-szymczak.jpg", line: "Revisa los números y las fechas." },
  { name: "Jaime Miranda", src: "/founders/jaime-miranda.jpg", line: "Se encarga de los papeles desde la primera llamada hasta la compañía de título." },
];

export default async function SituacionPage({ params }: SituacionParams) {
  "use cache";
  cacheLife("hours");
  const { situacion } = await params;
  const item = getSituationEs(situacion);
  if (!item) notFound();
  const pageUrl = `${site.url}/es/vender/${item.slug}`;
  const others = situationsEs.filter((other) => other.slug !== item.slug);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: `${site.url}/es` },
            { "@type": "ListItem", position: 2, name: "Situaciones que compramos", item: `${site.url}/es/vender` },
            { "@type": "ListItem", position: 3, name: item.label, item: pageUrl },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: item.title,
          serviceType: "Comprador de casas al contado",
          inLanguage: "es",
          url: pageUrl,
          description: item.description,
          provider: businessRef(),
          areaServed: { "@type": "AdministrativeArea", name: "Maricopa County, AZ" },
        }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <Image src={site.ogImagePath} alt={imageAlt} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[#0c1c30]/80" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <nav aria-label="Ruta de navegación" className="text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/es" className="hover:text-white">Inicio</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/es/vender" className="hover:text-white">Situaciones que compramos</Link>
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
              Reciba una oferta de contado
            </a>
            <a
              href={site.phoneTel}
              className="inline-flex min-h-12 items-center justify-center border border-white/35 px-6 text-base font-semibold text-white"
            >
              Llame o envíe texto {site.phoneDisplay}
            </a>
          </div>
          <p className="mt-5 text-sm text-white/75">
            De 8:00 a.m. a 7:00 p.m., los siete días. Preguntar no pone la casa bajo contrato.
          </p>
        </div>
      </section>

      {/* Trust row */}
      <section className="border-b border-line bg-panel">
        <ul className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map(([title, body]) => (
            <li key={title}>
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Intro */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <Eyebrow>{item.label}</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Dónde empieza este tipo de venta.</h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-ink">
              {item.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <aside className="self-start border-l-4 border-amber bg-mist p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-link">Vale la pena saber</p>
            <p className="mt-3 text-lg leading-8 text-ink">{item.fact.text}</p>
            <p className="mt-4 leading-7 text-muted">{item.fact.note}</p>
          </aside>
        </div>
      </Section>

      {/* Problems */}
      <Section tone="mist">
        <div className="max-w-2xl">
          <Eyebrow>Lo que lo hace difícil</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Por lo que la gente nos llama.</h2>
          <p className="mt-4 leading-7 text-muted">
            Estas son razones comunes por las que llaman los dueños en esta situación. No son reseñas, y no publicamos nombres de vendedores ni resultados inventados.
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
          <Eyebrow>Qué pasa después</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Tres pasos. Luego es su decisión.</h2>
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
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber">Reglas de Arizona que importan aquí</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
            Lo que revisará la compañía de título.
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
            Esto es información general, no asesoría legal ni de impuestos. Pida a un abogado de Arizona o a un profesional de impuestos que revise su caso antes de firmar.
          </p>
        </div>
      </section>

      {/* Gather */}
      <Section tone="mist">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Eyebrow>Antes de la primera llamada</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Lo que ayuda tener a la mano.</h2>
            <p className="mt-4 leading-7 text-muted">
              No necesita todo para llamar. Solo hace la primera conversación más corta y el número más preciso.
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
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Tres caminos posibles</h2>
        <p className="mt-3 max-w-2xl leading-7 text-muted">
          Listar, vender de contado y tomar los pagos resuelven problemas distintos. La venta de contado es la que paga el préstamo y quita su nombre.
        </p>
        <div className="mt-6 overflow-x-auto border border-line touch-scroll">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <caption className="sr-only">Listar, oferta de contado y tomar los pagos comparados</caption>
            <thead className="bg-navy text-white">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium"> </th>
                <th scope="col" className="px-4 py-3 font-medium">Listar con un agente</th>
                <th scope="col" className="bg-amber px-4 py-4 font-semibold text-amber-ink">Oferta de contado</th>
                <th scope="col" className="px-4 py-3 font-medium">Tomar los pagos</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row[0]} className="border-t border-line">
                  <th scope="row" className="px-4 py-3 font-medium text-ink">{row[0]}</th>
                  <td className="px-4 py-3 text-muted">{row[1]}</td>
                  <td className="bg-amber/15 px-4 py-4 text-ink">{row[2]}</td>
                  <td className="px-4 py-3 text-muted">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* People */}
      <Section tone="mist">
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Patrick Szymczak y Jaime Miranda</h2>
        <p className="mt-3 max-w-2xl leading-7 text-muted">
          Usted habla con uno de ellos. No con un centro de llamadas.{" "}
          <Link href="/es/nosotros" className="font-semibold text-link">Conózcanos</Link>
        </p>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          {people.map((person) => (
            <figure key={person.name}>
              <div className="relative aspect-[3/4] max-w-sm overflow-hidden bg-line">
                <Image src={person.src} alt={person.name} fill sizes="(min-width: 640px) 320px, 80vw" className="object-cover object-top" />
              </div>
              <figcaption className="mt-3">
                <span className="block text-2xl text-ink">{person.name}</span>
                <span className="mt-1 block text-sm leading-6 text-muted">{person.line}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* Form */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <Eyebrow>Su oferta</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Empiece con la dirección.</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
              Patrick o Jaime la revisan y le llaman. Puede decir que no después de la llamada.
            </p>
            <h3 className="mt-10 text-lg font-semibold text-ink">Si prefiere leer primero</h3>
            <ul className="mt-3 grid gap-3">
              {item.related.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="block border border-line bg-panel p-4 font-semibold text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-10 text-lg font-semibold text-ink">Otras situaciones</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/es/vender/${other.slug}`}
                    className="inline-flex min-h-11 items-center border border-line bg-panel px-4 font-semibold text-link"
                  >
                    {other.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-10 text-lg font-semibold text-ink">Dónde compramos</h3>
            <p className="mt-3 leading-7 text-muted">
              Todo el condado de Maricopa, incluidos{" "}
              {areas.map((area, index) => (
                <span key={area.slug}>
                  <Link href={`/es/zonas/${area.slug}`} className="font-semibold text-link">
                    {area.name}
                  </Link>
                  {index < areas.length - 2 ? ", " : index === areas.length - 2 ? " y " : "."}
                </span>
              ))}
            </p>
          </div>
          <LeadForm sourcePath={`/es/vender/${item.slug}`} language="es" />
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="mist">
        <FaqList faqs={item.faqs} heading="Preguntas que nos hacen sobre esto" />
      </Section>

      <ClosingBand
        title="Envíe la dirección. Luego decida."
        body="Patrick o Jaime la revisan y le llaman. Preguntar no lo obliga a nada."
        offerLabel="Reciba su oferta"
      />
    </>
  );
}
