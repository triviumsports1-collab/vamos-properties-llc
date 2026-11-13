import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import Link from "next/link";
import { ClosingBand } from "@/components/marketing/closing-band";
import { JsonLd } from "@/components/marketing/json-ld";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import { situationsEs } from "@/lib/content/situations-es";
import { hreflang } from "@/lib/i18n/routes";
import { site, spanishForeclosurePath } from "@/lib/site";

const title = "Venda su casa en cualquier situación en Phoenix";
const description =
  "¿Heredó una casa, está en un divorcio, cansado de rentar, con reparaciones o se muda? Cómo funciona una venta de contado en cada situación en el condado de Maricopa.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/es/vender", ...hreflang("/sell", "/es/vender") },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "es_US",
    url: "/es/vender",
    title: `${title} · Vamos Properties`,
    description,
    images: [{ url: site.ogImagePath, alt: site.ogImageAlt }],
  },
};

const otherPaths = [
  {
    href: spanishForeclosurePath,
    label: "Atrasado con los pagos o con una venta de fideicomisario",
    blurb: "Un aviso de venta de fideicomisario, el plazo de 91 días y lo que todavía puede hacer una venta de contado.",
  },
  {
    href: "/es/tomar-los-pagos",
    label: "Tomar los pagos",
    blurb: "Cuando el préstamo sigue igual, y el riesgo que conviene entender primero.",
  },
];

export default async function VenderHubPage() {
  "use cache";
  cacheLife("hours");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: `${site.url}/es` },
            { "@type": "ListItem", position: 2, name: "Situaciones que compramos", item: `${site.url}/es/vender` },
          ],
        }}
      />
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Situaciones que compramos</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          La razón por la que vende cambia los papeles, no si vemos la casa.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Elija la que se parezca a la suya. Cada página explica quién tiene que firmar, qué reglas de Arizona importan y qué tener listo para la primera llamada.
        </p>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {situationsEs.map((item) => (
            <li key={item.slug} className="border border-line p-6">
              <h2 className="text-2xl font-semibold text-ink">
                <Link href={`/es/vender/${item.slug}`} className="text-link">
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
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">¿No sabe cuál le queda?</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Envíe la dirección de todos modos.</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
              Muchas casas encajan en más de una. Patrick o Jaime revisan el formulario y le llaman. Puede decir que no después de la llamada.
            </p>
          </div>
          <LeadForm sourcePath="/es/vender" language="es" />
        </div>
      </Section>

      <ClosingBand
        title="Sea cual sea la razón, el primer paso es el mismo."
        body="Envíe la dirección. Preguntar no lo obliga a nada."
        offerLabel="Reciba su oferta"
      />
    </>
  );
}
