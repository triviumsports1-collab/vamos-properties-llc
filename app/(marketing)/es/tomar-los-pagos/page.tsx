import { cacheLife } from "next/cache";
import Link from "next/link";
import { ClosingBand } from "@/components/marketing/closing-band";
import { FaqList } from "@/components/marketing/faq-list";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import { CityLinks } from "@/components/marketing/city-links";
import { SituationLinks } from "@/components/marketing/situation-links";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

export const metadata = {
  title: "Tomar los pagos de su hipoteca en Phoenix",
  description:
    "Vamos puede poner al día un préstamo atrasado y hacer los pagos. El préstamo puede quedar a su nombre. Lea los riesgos antes de decidir.",
  alternates: {
    canonical: "/es/tomar-los-pagos",
    ...hreflang("/take-over-payments", "/es/tomar-los-pagos"),
  },
};

const steps = [
  {
    title: "Revisamos el saldo y la tasa",
    body: "Si una venta de contado pagaría el préstamo y le dejaría dinero, se lo decimos y dejamos de hablar de tomar los pagos. La tasa baja solo importa cuando el contado no funciona.",
  },
  {
    title: "Le decimos qué queda a su nombre",
    body: "La escritura puede cambiar de manos. El préstamo existente puede quedarse a su nombre en los libros del banco. Esto no es un refinanciamiento ni un nuevo préstamo a nuestro nombre.",
  },
  {
    title: "El acuerdo de pago queda por escrito",
    body: "Quién paga, cuánto, y qué pasa si se atrasa. Una conversación no es un historial de pagos. No firme si esa parte está confusa.",
  },
  {
    title: "Usted hace que un abogado lo lea",
    body: "Los derechos de vencimiento, un pago atrasado posterior, y su crédito son parte de esa revisión. No le diremos que la ejecución ya terminó.",
  },
];

const risks = [
  {
    title: "Su nombre puede quedarse en el préstamo",
    body: "La escritura puede cambiar de dueño mientras la hipoteca sigue a su nombre en los libros del banco. Esto no es un nuevo préstamo a nuestro nombre.",
  },
  {
    title: "El banco puede exigir el pago total",
    body: "Muchos préstamos tienen una cláusula de vencimiento al vender. El banco puede pedir el saldo completo después de que la escritura cambie.",
  },
  {
    title: "Un pago atrasado posterior sigue siendo suyo",
    body: "Si se atrasa un pago acordado y el préstamo sigue a su nombre, su crédito puede sufrir. No le diremos que la ejecución ya terminó.",
  },
  {
    title: "La tasa baja no compensa todo",
    body: "Si una venta de contado puede pagar el préstamo y dejarle dinero, ese suele ser el camino más limpio. Tomar los pagos tiene sentido cuando el contado no alcanza.",
  },
];

const faqs = [
  {
    question: "¿Por qué no simplemente hacer una venta de contado?",
    answer:
      "Si el contado puede pagar el préstamo y dejarle algo, ese es el camino más limpio. Hablamos de tomar los pagos cuando el saldo es tan alto que el contado no alcanza.",
  },
  {
    question: "¿El préstamo sale de mi nombre?",
    answer:
      "No por sí solo. La escritura puede cambiar de dueño y el préstamo puede seguir a su nombre. Si después se atrasa un pago, su crédito todavía puede sufrir. Confirme esto con un abogado antes de firmar.",
  },
  {
    question: "¿Qué pasa si hay una venta del fiduciario próxima?",
    answer:
      "Díganos la fecha primero. La fecha decide si el título tiene tiempo. Una venta del fiduciario puede detenerse con un cierre antes de esa fecha.",
  },
  {
    question: "¿Tengo que aceptar?",
    answer:
      "No. Pedir información es una conversación. Puede decir que no y seguir con su banco, un consejero de vivienda, o un abogado.",
  },
];

export default async function SpanishTakeoverPage() {
  "use cache";
  cacheLife("hours");

  return (
    <div lang="es">
      <Section>
        <p className="text-sm font-semibold text-link">
          <Link href="/take-over-payments">Read in English</Link>
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Tomar los pagos. Lea los riesgos antes de decidir.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Vamos puede poner al día un préstamo atrasado y hacerse cargo de los pagos. El préstamo puede quedar a su nombre en los libros del banco. Esta página es una explicación sencilla, no un consejo legal.
        </p>
      </Section>

      <Section tone="mist">
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">Los riesgos, dicho en voz alta.</h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {risks.map((risk) => (
            <li key={risk.title} className="bg-panel p-6">
              <h3 className="text-xl font-semibold text-ink">{risk.title}</h3>
              <p className="mt-3 leading-7 text-muted">{risk.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Cómo funciona</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Cuatro pasos, con los riesgos dichos antes de firmar.</h2>
            <ol className="mt-8 grid gap-6">
              {steps.map((step, index) => (
                <li key={step.title} className="border-t-2 border-navy pt-5">
                  <span className="text-sm font-semibold tracking-wide text-link">0{index + 1}</span>
                  <h3 className="mt-2 text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 max-w-xl leading-7 text-muted">
              Llame al{" "}
              <a href={site.phoneTel} className="font-semibold text-link">
                {site.phoneDisplay}
              </a>
              , de 8:00 a.m. a 7:00 p.m., los siete días.
            </p>
          </div>
          <LeadForm sourcePath="/es/tomar-los-pagos" language="es" />
        </div>
      </Section>

      <Section>
        <SituationLinks language="es" />
        <div className="mt-14">
          <CityLinks language="es" />
        </div>
      </Section>

      <Section tone="mist">
        <FaqList faqs={faqs} heading="Preguntas frecuentes sobre tomar los pagos" />
      </Section>

      <ClosingBand
        title="Si el contado no alcanza, hablamos de los pagos."
        body="Patrick o Jaime le explican la diferencia. Pedir información no lo obliga a nada."
        offerLabel="Pedir mi oferta"
      />
    </div>
  );
}
