import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { ClosingBand } from "@/components/marketing/closing-band";
import { FaqList } from "@/components/marketing/faq-list";
import { Founders } from "@/components/marketing/founders";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import { CityLinks } from "@/components/marketing/city-links";
import { SituationLinks } from "@/components/marketing/situation-links";
import { hreflang } from "@/lib/i18n/routes";
import { site, spanishForeclosurePath } from "@/lib/site";

export const metadata = {
  title: {
    absolute: "¿Atrasado con la casa? Reciba una oferta de contado hoy",
  },
  description:
    "Vamos Properties compra casas tal como están en el condado de Maricopa y puede hablar sobre una hipoteca atrasada. Llame a Patrick o Jaime.",
  alternates: {
    canonical: "/es",
    ...hreflang("/", "/es"),
  },
};

const reasons = [
  {
    title: "Tal como está",
    body: "Pintura descascarada, techo viejo, inquilino que no sale. Nada de eso tiene que arreglarse antes de llamar.",
  },
  {
    title: "Sin agente ni lista",
    body: "Sin cartel en el jardín, sin visitas de fin de semana, sin comisión de agente que salga del cierre.",
  },
  {
    title: "El préstamo queda pagado",
    body: "Una venta de contado busca pagar la hipoteca en una compañía de título y quitar su nombre de ella.",
  },
  {
    title: "La otra opción",
    body: "Si el contado no alcanza para pagar lo que debe, le explicamos tomar los pagos, incluyendo la parte en que su nombre puede quedar en el préstamo.",
  },
];

const steps = [
  {
    title: "Envíe la dirección",
    body: "El formulario tarda menos de un minuto. Agregue lo que debe si lo sabe, y la fecha del aviso si ya tiene una notificación.",
  },
  {
    title: "Hablamos con usted",
    body: "Patrick o Jaime preguntan sobre el saldo, el estado de la casa y quién está en el título. No hay que limpiar antes.",
  },
  {
    title: "Usted decide",
    body: "Recibe una oferta de contado, una explicación del pago compartido, o ambas. Decir que no es una respuesta completa.",
  },
];

const faqs = [
  {
    question: "¿Cuánto vale mi casa?",
    answer:
      "Depende de la dirección, lo que debe, el estado de la propiedad y quién tiene que firmar. No publicamos promedios de mercado en lugar de su dirección. Envíe la dirección y le damos un número real.",
  },
  {
    question: "¿Tengo que aceptar la oferta?",
    answer:
      "No. Pedir una oferta es una conversación. Puede decir que no y seguir hablando con su banco, un consejero de vivienda, o un abogado.",
  },
  {
    question: "¿En cuánto tiempo cierran?",
    answer:
      "Depende del título, el saldo y quién tiene que firmar. Algunas fechas alcanzan; otras no. Si hay una venta del fiduciario cercana, díganos esa fecha primero.",
  },
  {
    question: "¿Pagan los costos de cierre?",
    answer:
      "En una venta de contado normal, sí. El acuerdo específico siempre va por escrito antes de que usted firme.",
  },
  {
    question: "¿Debo limpiar o reparar algo antes?",
    answer:
      "No. Compramos tal como está. Las reparaciones necesarias salen del precio, no de su bolsillo.",
  },
];

export default async function SpanishHomePage() {
  "use cache";
  cacheLife("hours");

  return (
    <div lang="es">
      {/* Hero */}
      <section className="relative isolate min-h-[38rem] overflow-hidden bg-navy text-white">
        <Image
          src="/phoenix-street.jpg"
          alt="Casas unifamiliares en una calle tranquila de Phoenix al atardecer"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0c1c30]/74" />
        <div className="relative mx-auto flex min-h-[38rem] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            Phoenix y el condado de Maricopa
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">
            ¿Atrasado con la casa? Reciba una oferta de contado hoy.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/88">
            Sin reparaciones. Sin visitas. Patrick o Jaime le llaman el mismo día, incluyendo cuando ya hay una venta del fiduciario en el calendario.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={spanishForeclosurePath}
              className="inline-flex min-h-12 items-center justify-center bg-amber px-6 text-base font-semibold text-amber-ink"
            >
              Ejecución hipotecaria
            </Link>
            <Link
              href="/es/oferta-en-efectivo"
              className="inline-flex min-h-12 items-center justify-center border border-white/35 px-6 text-base font-semibold text-white"
            >
              Oferta de contado
            </Link>
          </div>
          <p className="mt-5 text-sm text-white/80">
            ¿Prefiere llamar? Marque o escriba a{" "}
            <a href={site.phoneTel} className="font-semibold text-amber">
              {site.phoneDisplay}
            </a>
            , de 8:00 a.m. a 7:00 p.m., los siete días.
          </p>
        </div>
      </section>

      {/* Why call */}
      <Section tone="mist">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Por qué llaman los dueños</p>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Una venta privada, con las desventajas dichas en voz alta.</h2>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {reasons.map((reason) => (
            <li key={reason.title} className="bg-panel p-6">
              <h3 className="text-xl font-semibold text-ink">{reason.title}</h3>
              <p className="mt-3 leading-7 text-muted">{reason.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Steps + lead form */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Qué sigue</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Tres pasos. Luego es su decisión.</h2>
            <ol className="mt-10 grid gap-8">
              {steps.map((step, index) => (
                <li key={step.title} className="border-t-2 border-navy pt-5">
                  <span className="text-sm font-semibold tracking-wide text-link">0{index + 1}</span>
                  <h3 className="mt-2 text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link href={spanishForeclosurePath} className="bg-panel p-5">
                <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-link">La mayoría de los casos</span>
                <span className="mt-2 block text-2xl font-semibold text-ink">Oferta de contado</span>
                <span className="mt-3 block leading-7 text-muted">
                  Compramos tal como está. El préstamo se paga en el cierre y su nombre sale de él.
                </span>
              </Link>
              <Link href="/es/tomar-los-pagos" className="bg-panel p-5">
                <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-link">Léalo primero</span>
                <span className="mt-2 block text-2xl font-semibold text-ink">Tomar los pagos</span>
                <span className="mt-3 block leading-7 text-muted">
                  Podemos poner al día un préstamo atrasado. Su nombre puede quedar en ese préstamo. Los riesgos están en la siguiente página.
                </span>
              </Link>
            </div>
          </div>
          <LeadForm sourcePath="/es" language="es" />
        </div>
      </Section>

      {/* About founders */}
      <Section tone="mist">
        <Founders linked />
      </Section>

      {/* FAQs */}
      <Section>
        <SituationLinks language="es" />
        <div className="mt-14">
          <CityLinks language="es" />
        </div>
      </Section>

      <Section>
        <FaqList faqs={faqs} heading="Preguntas frecuentes" />
      </Section>

      <ClosingBand
        title="Envíe la dirección. Le llamamos hoy."
        body="Si es después de las 7:00 p.m., Patrick o Jaime responden por la mañana. No tiene que decidir nada por teléfono."
        offerLabel="Pedir mi oferta"
      />
    </div>
  );
}
