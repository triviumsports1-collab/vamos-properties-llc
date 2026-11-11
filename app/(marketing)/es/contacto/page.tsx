import { cacheLife } from "next/cache";
import { LeadForm } from "@/components/marketing/lead-form";
import { LocalBusinessJsonLd } from "@/components/marketing/local-business";
import { Section } from "@/components/marketing/section";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

export const metadata = {
  title: "Contacto",
  description:
    "Llame o escriba a Vamos Properties en Phoenix, o envíe la dirección. Patrick o Jaime responden el mismo día.",
  alternates: {
    canonical: "/es/contacto",
    ...hreflang("/contact", "/es/contacto"),
  },
};

export default async function SpanishContactPage() {
  "use cache";
  cacheLife("hours");

  return (
    <div lang="es">
      <LocalBusinessJsonLd />
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Contacto</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Llame, escriba, o envíe la dirección.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Lo más útil que puede darnos es la dirección y, si la tiene, la fecha de la venta del fiduciario. Si quiere leer primero, empiece por la{" "}
          <a href="/es/oferta-en-efectivo" className="font-semibold text-link">oferta de contado</a>{" "}
          o la{" "}
          <a href="/es/ejecucion-hipotecaria" className="font-semibold text-link">ejecución hipotecaria</a>.
        </p>
        <dl className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-muted">Teléfono</dt>
            <dd className="mt-2">
              <a href={site.phoneTel} className="text-2xl font-semibold text-ink sm:text-3xl">
                {site.phoneDisplay}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Correo</dt>
            <dd className="mt-2">
              <a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center break-all text-lg font-semibold text-ink">
                {site.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Horario</dt>
            <dd className="mt-2 text-lg leading-8 text-ink">8:00 a.m. a 7:00 p.m., los siete días</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Dónde compramos</dt>
            <dd className="mt-2 text-lg leading-8 text-ink">Condado de Maricopa, Arizona</dd>
          </div>
        </dl>
      </Section>

      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Envíenos la dirección.</h2>
            <p className="mt-4 text-lg leading-8 text-muted">
              Patrick o Jaime responden el mismo día. Si es después de las 7:00 p.m., le respondemos por la mañana.
            </p>
          </div>
          <LeadForm sourcePath="/es/contacto" language="es" />
        </div>
      </Section>
    </div>
  );
}
