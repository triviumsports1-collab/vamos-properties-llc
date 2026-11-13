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

export const metadata = {
  title: "Reciba una oferta de contado por su casa en Phoenix",
  description:
    "Vamos compra casas tal como están en el condado de Maricopa. Sin reparaciones, sin visitas, sin cobro por preguntar. Patrick o Jaime llaman el mismo día.",
  alternates: {
    canonical: "/es/oferta-en-efectivo",
    ...hreflang("/cash-offer", "/es/oferta-en-efectivo"),
  },
};

const steps = [
  {
    title: "Envíe la dirección",
    body: "El formulario tarda un minuto. Agregue lo que debe si lo sabe, y la fecha de la venta del fiduciario si ya tiene un aviso.",
  },
  {
    title: "Le llamamos y vemos la casa",
    body: "Patrick o Jaime preguntan sobre el préstamo, el estado de la propiedad y quién está en el título. Si los números funcionan, inspeccionamos la casa. No hay que limpiar antes.",
  },
  {
    title: "Recibe un número",
    body: "La oferta es por escrito para que pueda compararla con quedarse, listar, o llamar a su banco. Decir que no es una respuesta completa.",
  },
  {
    title: "El título cierra, o se detiene",
    body: "Si acepta, una compañía de título maneja la escritura y el pago del préstamo. Usted ve el estado de cuenta antes de firmar. Si algún dato cambia el precio, se lo decimos antes del cierre, no después.",
  },
];

const included = [
  ["Sin lista de reparaciones", "Un techo viejo, alfombra desgastada, o una cocina anticuada salen del precio. No contrata al contratista primero."],
  ["Sin visitas de fin de semana", "No hay extraños caminando por la casa mientras usted todavía decide. Una inspección con nosotros es la visita usual."],
  ["Sin comisión de agente", "El porcentaje del agente normalmente sale del precio de venta. En una venta de contado no hay agente, así que ese dinero no sale de su bolsillo."],
  ["Un precio cierto", "La oferta de contado es la que tiene menos variables. Un precio de lista puede bajar, una oferta financiada puede caer. El contado no."],
];

const faqs = [
  {
    question: "¿Por qué una oferta de contado es menor que el precio de lista?",
    answer:
      "Porque compramos tal como está, pagamos el cierre y no necesitamos inspecciones de banco. Ese descuento cubre lo que usted no paga: reparaciones, comisión de agente, y tiempo.",
  },
  {
    question: "¿Cuánto tiempo tarda el cierre?",
    answer:
      "Depende del título, el saldo y quién tiene que firmar. Algunas semanas en casos simples; más si hay herederos o un segundo préstamo. Si hay una fecha de venta del fiduciario, díganos esa fecha primero.",
  },
  {
    question: "¿Qué pasa si no pueden cubrir lo que debo?",
    answer:
      "Se lo decimos. Si el saldo es mayor que lo que podemos pagar, le explicamos la opción de tomar los pagos, incluyendo los riesgos. No le decimos que el problema ya pasó cuando todavía no.",
  },
  {
    question: "¿Tengo que limpiar o reparar algo?",
    answer:
      "No. Compramos tal como está. Las reparaciones necesarias salen del precio, no de su bolsillo.",
  },
];

export default async function SpanishCashOfferPage() {
  "use cache";
  cacheLife("hours");

  return (
    <div lang="es">
      <Section>
        <p className="text-sm font-semibold text-link">
          <Link href="/cash-offer">Read in English</Link>
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Reciba una oferta de contado por su casa en Phoenix.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Vamos Properties compra casas en el condado de Maricopa tal como están. Sin reparaciones, sin visitas, y sin cobro por preguntar.
        </p>
      </Section>

      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Cómo funciona</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Cuatro pasos. Luego es su decisión.</h2>
            <ol className="mt-8 grid gap-6">
              {steps.map((step, index) => (
                <li key={step.title} className="border-t-2 border-navy pt-5">
                  <span className="text-sm font-semibold tracking-wide text-link">0{index + 1}</span>
                  <h3 className="mt-2 text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <LeadForm sourcePath="/es/oferta-en-efectivo" language="es" />
        </div>
      </Section>

      <Section>
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">Qué incluye una oferta de contado.</h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {included.map(([title, body]) => (
            <li key={title} className="border border-line p-6">
              <h3 className="text-xl font-semibold text-ink">{title}</h3>
              <p className="mt-3 leading-7 text-muted">{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="mist">
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">Si el contado no alcanza.</h2>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            Si el saldo del préstamo es mayor que lo que podemos ofrecer, se lo decimos. No hacemos que firme algo que no le conviene.
          </p>
          <p>
            En ese caso podemos hablar de{" "}
            <Link href="/es/tomar-los-pagos" className="font-semibold text-link">tomar los pagos</Link>.
            En esa opción, su nombre puede quedar en el préstamo. Léala antes de decidir.
          </p>
          <p>
            Si hay una venta del fiduciario próxima, empiece por{" "}
            <Link href={spanishForeclosurePath} className="font-semibold text-link">esa página</Link>.
            La fecha del aviso decide si el título tiene tiempo.
          </p>
        </div>
        <p className="mt-6 text-sm leading-6 text-muted">
          Llame al <a href={site.phoneTel} className="font-semibold text-link">{site.phoneDisplay}</a>, de 8:00 a.m. a 7:00 p.m., los siete días.
        </p>
      </Section>

      <Section>
        <SituationLinks language="es" />
        <div className="mt-14">
          <CityLinks language="es" />
        </div>
      </Section>

      <Section>
        <FaqList faqs={faqs} heading="Preguntas frecuentes sobre la oferta de contado" />
      </Section>

      <ClosingBand
        title="Envíe la dirección y le decimos el número."
        body="Patrick o Jaime llaman el mismo día. Pedir una oferta no lo obliga a vender."
        offerLabel="Pedir mi oferta"
      />
    </div>
  );
}
