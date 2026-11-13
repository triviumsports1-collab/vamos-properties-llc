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
import { getAreaEs } from "@/lib/content/areas-es";
import { areas, getArea } from "@/lib/content/areas";
import { situationsEs } from "@/lib/content/situations-es";
import { hreflang } from "@/lib/i18n/routes";
import { site, spanishForeclosurePath } from "@/lib/site";

export function generateStaticParams() {
  return areas.map((area) => ({ city: area.slug }));
}

type AreaParams = { params: Promise<{ city: string }> };

export const instant = false;

const imageAlt = "Casas de un piso en una calle tranquila del Valle de Phoenix, condado de Maricopa";

export async function generateMetadata({ params }: AreaParams): Promise<Metadata> {
  const { city } = await params;
  const area = getArea(city);
  const es = getAreaEs(city);
  if (!area || !es) return {};
  const title = `Compramos casas en ${area.name}, AZ al contado`;
  const path = `/es/zonas/${area.slug}`;
  return {
    title,
    description: es.description,
    alternates: { canonical: path, ...hreflang(`/areas/${area.slug}`, path) },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "es_US",
      url: path,
      title: `${title} · Vamos Properties`,
      description: es.description,
      images: [{ url: site.ogImagePath, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Vamos Properties`,
      description: es.description,
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
  ["Con quién habla", "Un agente y luego el prestamista del comprador", "Patrick o Jaime, y luego una compañía de título", "Patrick o Jaime. El préstamo puede quedar a su nombre"],
  ["Conviene cuando", "Puede esperar y quiere precio de mercado", "Quiere vender tal como está y con fecha", "Una venta de contado dejaría poco después del pago"],
];

const people = [
  { name: "Patrick Szymczak", src: "/founders/patrick-szymczak.jpg", line: "Revisa los números y la fecha del aviso." },
  { name: "Jaime Miranda", src: "/founders/jaime-miranda.jpg", line: "Se encarga de los papeles desde la primera llamada hasta la compañía de título." },
];

export default async function AreaPageEs({ params }: AreaParams) {
  "use cache";
  cacheLife("hours");
  const { city } = await params;
  const area = getArea(city);
  const es = getAreaEs(city);
  if (!area || !es) notFound();
  const name = area.name;
  const nearby = area.nearby.map((slug) => getArea(slug)).filter((item) => item !== undefined);
  const pageUrl = `${site.url}/es/zonas/${area.slug}`;

  const steps = [
    {
      title: `Envíe la dirección en ${name}`,
      body: "Use el formulario o llame. La dirección, lo que debe y la fecha de cualquier aviso bastan para empezar.",
    },
    {
      title: "Hable con Patrick o Jaime",
      body: "Uno de ellos le llama, pregunta por la casa y el préstamo, y la ve. Recibe un número con el cálculo, no un rango.",
    },
    {
      title: "Usted decide",
      body: "Si dice que sí, una compañía de título del condado de Maricopa maneja el cierre y paga el préstamo con la venta. Si dice que no, no pasa nada.",
    },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: `${site.url}/es` },
            { "@type": "ListItem", position: 2, name: `Vender una casa en ${name}`, item: pageUrl },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Compra de casas al contado en ${name}, AZ`,
          serviceType: "Comprador de casas al contado",
          inLanguage: "es",
          url: pageUrl,
          description: es.description,
          provider: businessRef(),
          areaServed: { "@type": "City", name: `${name}, AZ` },
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
              <li aria-current="page" className="text-white">{name}</li>
            </ol>
          </nav>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-amber">
            Compramos casas en {name}, Arizona
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">
            Venda su casa en {name} sin listarla.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/88">{es.heroLine}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#offer"
              className="inline-flex min-h-12 items-center justify-center bg-amber px-6 text-base font-semibold text-amber-ink"
            >
              Reciba su oferta en {name}
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
            <Eyebrow>Vender en {name}</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Cómo es una venta privada aquí.</h2>
            <p className="mt-5 text-lg leading-8 text-muted">{es.opening}</p>
            <div className="mt-5 space-y-4 text-lg leading-8 text-ink">
              {es.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <aside className="self-start border-l-4 border-amber bg-mist p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-link">Vale la pena saber</p>
            <p className="mt-3 text-lg leading-8 text-ink">{es.fact}</p>
            <p className="mt-4 leading-7 text-muted">
              Si ya tiene un aviso, lea{" "}
              <Link href={spanishForeclosurePath} className="font-semibold text-link">
                cómo detener una ejecución hipotecaria
              </Link>
              .
            </p>
          </aside>
        </div>
      </Section>

      {/* Situations */}
      <Section tone="mist">
        <div className="max-w-2xl">
          <Eyebrow>Por qué llaman los dueños en {name}</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Las situaciones que más escuchamos.</h2>
          <p className="mt-4 leading-7 text-muted">
            Estas son las razones por las que la gente llama. No son reseñas, y no publicamos nombres de vendedores ni resultados inventados.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {es.situations.map((item) => (
            <li key={item.title} className="bg-panel p-6">
              <h3 className="text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 leading-7 text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Neighborhoods */}
      <Section>
        <div className="max-w-2xl">
          <Eyebrow>Barrios de {name}</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Barrios, no un promedio de la ciudad.</h2>
          <p className="mt-4 leading-7 text-muted">
            No publicamos un precio medio de {name}. Dos calles pueden ser otra casa, otra HOA y otro préstamo.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {es.neighborhoods.map((place) => (
            <li key={place.name} className="border border-line bg-panel p-6">
              <h3 className="text-xl font-semibold text-ink">{place.name}</h3>
              <p className="mt-3 leading-7 text-muted">{place.note}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-ink">Códigos postales que vemos en {name}</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            Si el suyo no está en la lista, envíelo de todos modos. Son códigos comunes, no un límite.
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
      <Section tone="mist">
        <div className="max-w-2xl">
          <Eyebrow>Antes de dar un precio</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Qué es distinto en una venta en {name}.</h2>
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {es.localNotes.map((note) => (
            <li key={note.title} className="border-t-2 border-navy bg-panel p-6">
              <h3 className="text-xl font-semibold text-ink">{note.title}</h3>
              <p className="mt-3 leading-7 text-muted">{note.body}</p>
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
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber">¿Atrasado con una casa en {name}?</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">La fecha del aviso es el reloj.</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">
            En Arizona, una ejecución de una escritura de fideicomiso normalmente termina en una venta de fideicomisario. Para una casa en {name}, el aviso se registra en el Registrador del Condado de Maricopa, y la venta no puede hacerse antes del día 91 después de ese registro (A.R.S. § 33-808).
          </p>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            <li className="border-t-2 border-amber pt-5">
              <span className="text-sm font-semibold text-amber">Día 0</span>
              <h3 className="mt-2 text-xl font-semibold">Se registra el aviso</h3>
              <p className="mt-2 leading-7 text-white/78">La cuenta empieza en la fecha de registro, no el día en que llega la carta.</p>
            </li>
            <li className="border-t-2 border-white/40 pt-5">
              <span className="text-sm font-semibold text-white/80">Las semanas intermedias</span>
              <h3 className="mt-2 text-xl font-semibold">Su tiempo para decidir</h3>
              <p className="mt-2 leading-7 text-white/78">
                Hable con su prestamista, un abogado o un consejero de vivienda, y compare una venta de contado. El título necesita tiempo.
              </p>
            </li>
            <li className="border-t-2 border-white/40 pt-5">
              <span className="text-sm font-semibold text-white/80">Día 91 o después</span>
              <h3 className="mt-2 text-xl font-semibold">La fecha de venta del aviso</h3>
              <p className="mt-2 leading-7 text-white/78">Un cierre de contado busca pagar el préstamo antes de esta fecha. Las posposiciones pueden moverla.</p>
            </li>
          </ol>
          <p className="mt-8 max-w-2xl text-sm leading-6 text-white/65">
            Esto es información general, no asesoría legal. Pida a un abogado de Arizona que lea su aviso.{" "}
            <Link href={spanishForeclosurePath} className="font-semibold text-amber">
              Detener una ejecución hipotecaria: la página completa
            </Link>
          </p>
        </div>
      </section>

      {/* Comparison */}
      <Section tone="mist">
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
        <p className="mt-6 max-w-2xl leading-7 text-muted">
          Más detalles:{" "}
          <Link href="/es/oferta-en-efectivo" className="font-semibold text-link">oferta de contado</Link>,{" "}
          <Link href={spanishForeclosurePath} className="font-semibold text-link">ejecución hipotecaria</Link> y{" "}
          <Link href="/es/tomar-los-pagos" className="font-semibold text-link">tomar los pagos</Link>.
        </p>
      </Section>

      {/* People */}
      <Section>
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
      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <Eyebrow>Su oferta en {name}</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Empiece con la dirección en {name}.</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
              Patrick o Jaime la revisan y le llaman. Puede decir que no después de la llamada.
            </p>
            <h3 className="mt-10 text-lg font-semibold text-ink">¿Vende por una razón específica?</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {situationsEs.map((item) => (
                <li key={item.slug}>
                  <Link href={`/es/vender/${item.slug}`} className="inline-flex min-h-11 items-center border border-line bg-panel px-4 font-semibold text-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            {nearby.length > 0 ? (
              <div className="mt-10">
                <h3 className="text-lg font-semibold text-ink">Ciudades cercanas</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {nearby.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/es/zonas/${item.slug}`}
                        className="inline-flex min-h-11 items-center border border-line bg-panel px-4 font-semibold text-link"
                      >
                        Vender una casa en {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="mt-8 leading-7 text-muted">
              ¿Busca casas que ya compramos?{" "}
              <Link href="/es/propiedades" className="font-semibold text-link">
                Casas en venta
              </Link>
              . Esta página es para vender la suya.
            </p>
          </div>
          <LeadForm sourcePath={`/es/zonas/${area.slug}`} language="es" />
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <FaqList faqs={es.faqs} heading={`Preguntas desde ${name}`} />
      </Section>

      <ClosingBand
        title={`¿Vende una casa en ${name}? Envíe la dirección.`}
        body="Patrick o Jaime la revisan y le llaman. Preguntar no le obliga a nada."
        offerLabel="Reciba su oferta"
      />
    </>
  );
}
