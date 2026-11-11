import { cacheLife } from "next/cache";
import { ClosingBand } from "@/components/marketing/closing-band";
import { Founders } from "@/components/marketing/founders";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

export const metadata = {
  title: "Nosotros — Patrick y Jaime",
  description:
    "Vamos Properties LLC es Patrick y Jaime, compradores locales que ayudan a dueños de casa en el condado de Maricopa a vender tal como está o a hablar sobre una hipoteca atrasada.",
  alternates: {
    canonical: "/es/nosotros",
    ...hreflang("/about", "/es/nosotros"),
  },
};

export default async function SpanishAboutPage() {
  "use cache";
  cacheLife("hours");

  return (
    <div lang="es">
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Las personas que contestan</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Dos personas en el Valle, no un centro de atención nacional.
        </h1>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            Vamos Properties LLC compra casas en el condado de Maricopa a dueños que necesitan una salida privada. Patrick y Jaime contestan el teléfono. La misma persona que conoce al principio es quien sigue con el expediente.
          </p>
          <p>
            No somos una empresa nacional que manda a un representante. No tenemos un centro de llamadas. Cuando alguien llama a{" "}
            <a href={site.phoneTel} className="font-semibold text-link">
              {site.phoneDisplay}
            </a>
            , contesta Patrick o Jaime.
          </p>
          <p>
            Compramos casas tal como están. Si el contado no alcanza para pagar el préstamo, le decimos. Si hay una venta del fiduciario próxima, empezamos por esa fecha. Ninguna llamada le obliga a vender ni a aceptar una oferta.
          </p>
        </div>
      </Section>

      <Section tone="mist">
        <Founders linked />
      </Section>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">¿Tiene preguntas? Envíe la dirección.</h2>
            <p className="mt-4 text-lg leading-8 text-muted">
              Llame al{" "}
              <a href={site.phoneTel} className="font-semibold text-link">
                {site.phoneDisplay}
              </a>
              , de 8:00 a.m. a 7:00 p.m., los siete días. O use el formulario y le respondemos el mismo día.
            </p>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted">Teléfono</dt>
                <dd className="mt-2">
                  <a href={site.phoneTel} className="text-2xl font-semibold text-ink">
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
          </div>
          <LeadForm sourcePath="/es/nosotros" language="es" />
        </div>
      </Section>

      <ClosingBand
        title="Mándenos la dirección. Le llamamos hoy."
        body="Patrick o Jaime responden el mismo día. Pedir una oferta no lo obliga a vender."
        offerLabel="Pedir mi oferta"
      />
    </div>
  );
}
