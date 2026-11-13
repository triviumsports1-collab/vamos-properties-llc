import { cacheLife } from "next/cache";
import Link from "next/link";
import { ClosingBand } from "@/components/marketing/closing-band";
import { FaqList } from "@/components/marketing/faq-list";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import { CityLinks } from "@/components/marketing/city-links";
import { SituationLinks } from "@/components/marketing/situation-links";
import { hreflang } from "@/lib/i18n/routes";
import { site, spanishForeclosurePath } from "@/lib/site";

const faqs = [
  {
    question: "¿Cuánto tiempo tengo después del aviso de venta del fiduciario?",
    answer:
      "En Arizona, la venta normalmente no puede hacerse antes del día 91 después de que se registra el aviso. La fecha que importa es la que aparece en su documento. Confírmela y no espere a la semana de la subasta para pedir ayuda.",
  },
  {
    question: "¿Vender de contado borra el historial de crédito?",
    answer:
      "No. Los pagos atrasados que ya están en su reporte se quedan. Una venta antes de la subasta, con el préstamo pagado en el cierre, puede evitar la venta misma. No reparamos crédito.",
  },
    {
    question: "¿El préstamo sale de mi nombre si ustedes toman los pagos?",
    answer:
      "No por sí solo. En esa opción, la escritura puede cambiar de dueño y el préstamo puede seguir a su nombre. Si después se pierde un pago, su crédito todavía puede sufrir. Una venta de contado que paga el préstamo es la salida más limpia.",
  },
  {
    question: "¿Qué hago si la fecha está cerca?",
    answer:
      "Díganos la fecha en la primera llamada. La compañía de título necesita días para pedir el saldo y confirmar quién puede firmar. Algunas fechas todavía alcanzan. Otras ya no.",
  },
  {
    question: "¿Tengo que aceptar la oferta?",
    answer:
      "No. Pedir una oferta es una conversación. Puede decir que no y seguir hablando con su banco o con un abogado.",
  },
];

export const metadata = {
  title: "Detener una ejecución hipotecaria en Phoenix",
  description:
    "Si recibió un aviso de venta del fiduciario en el condado de Maricopa, hable con Vamos sobre una venta de contado antes de la fecha.",
  alternates: {
    canonical: spanishForeclosurePath,
    ...hreflang("/stop-foreclosure", spanishForeclosurePath),
  },
};

export default async function SpanishForeclosurePage() {
  "use cache";
  cacheLife("hours");

  return (
    <div lang="es">
      <Section>
        <p className="text-sm font-semibold text-link">
          <Link href="/stop-foreclosure">Leer en inglés</Link>
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Si la venta del fiduciario ya tiene fecha, empiece por esa fecha.
        </h1>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            Un aviso de venta del fiduciario en Arizona es un reloj. En la mayoría de los casos, la venta no puede hacerse antes del día 91 después de que se registra el aviso. La fecha impresa en su documento es la que cuenta.
          </p>
          <p>
            Una venta de contado busca pagar el préstamo en una compañía de título antes de esa fecha. No reparamos crédito y no borramos los meses que ya estuvo atrasado. Esta página es una explicación sencilla, no un consejo legal. Confirme su aviso con un abogado de Arizona si quiere una opinión sobre su caso.
          </p>
        </div>
      </Section>

      <Section tone="mist">
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">Cómo suele ir una venta de contado.</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-2">
          <li className="bg-panel p-5">
            <h3 className="text-lg font-semibold text-ink">La dirección y la fecha</h3>
            <p className="mt-2 leading-7 text-muted">Mándenos las dos. La fecha del aviso decide si hay tiempo para abrir un expediente de título.</p>
          </li>
          <li className="bg-panel p-5">
            <h3 className="text-lg font-semibold text-ink">La llamada del mismo día</h3>
            <p className="mt-2 leading-7 text-muted">Patrick o Jaime preguntan el saldo, el estado de la casa y quién tiene que firmar. No hace falta limpiar antes.</p>
          </li>
          <li className="bg-panel p-5">
            <h3 className="text-lg font-semibold text-ink">Un número, o un no</h3>
            <p className="mt-2 leading-7 text-muted">Si el contado puede pagar el préstamo antes de la fecha, seguimos. Si no alcanza, lo decimos.</p>
          </li>
          <li className="bg-panel p-5">
            <h3 className="text-lg font-semibold text-ink">Lo que no cambia</h3>
            <p className="mt-2 leading-7 text-muted">Los pagos atrasados ya reportados se quedan. Tomar los pagos puede dejar el préstamo a su nombre. Esta página no es un consejo legal.</p>
          </li>
        </ol>
        <p className="mt-6 max-w-2xl leading-7 text-muted">
          Las páginas de ciudades, como Phoenix, Mesa y Glendale, están en inglés. Al salir de esta página, el menú también vuelve al inglés.
        </p>
      </Section>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Si el contado no alcanza, lo decimos.</h2>
            <p className="mt-4 text-lg leading-8 text-muted">
              También podemos hablar de tomar los pagos. En esa opción, su nombre puede seguir en el préstamo. Léalo con calma antes de firmar.
            </p>
            <p className="mt-4 leading-7 text-muted">
              Llame al <a href={site.phoneTel} className="font-semibold text-link">{site.phoneDisplay}</a>, de 8:00 a.m. a 7:00 p.m., los siete días.
            </p>
          </div>
          <LeadForm sourcePath={spanishForeclosurePath} language="es" />
        </div>
      </Section>

      <Section>
        <SituationLinks language="es" />
        <div className="mt-14">
          <CityLinks language="es" />
        </div>
      </Section>

      <Section tone="mist">
        <FaqList faqs={faqs} heading="Preguntas que conviene hacer primero" />
      </Section>

      <ClosingBand
        title="Mándenos la dirección y la fecha del aviso."
        body="Patrick o Jaime le llaman el mismo día. Pedir una oferta no lo obliga a vender."
        offerLabel="Pedir mi oferta"
      />
    </div>
  );
}
