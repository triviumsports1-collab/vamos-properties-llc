import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/marketing/breadcrumb-json-ld";
import { ClosingBand } from "@/components/marketing/closing-band";
import { FaqList } from "@/components/marketing/faq-list";
import { JsonLd } from "@/components/marketing/json-ld";
import { LeadForm } from "@/components/marketing/lead-form";
import { businessId, LocalBusinessJsonLd } from "@/components/marketing/local-business";
import { Section } from "@/components/marketing/section";
import type { Faq } from "@/lib/content/faqs";
import { areas } from "@/lib/content/areas";
import type { Locale } from "@/lib/i18n/routes";
import { site, smsHref, spanishForeclosurePath, textUsBody } from "@/lib/site";

type Copy = {
  path: string;
  homeLabel: string;
  homePath: string;
  crumb: string;
  eyebrow: string;
  h1: string;
  lead: string;
  phoneLabel: string;
  textUs: string;
  emailLabel: string;
  hoursLabel: string;
  hours: string;
  languagesLabel: string;
  languages: string;
  formNote: string;
  stepsHeading: string;
  steps: Array<{ title: string; body: string }>;
  bringHeading: string;
  bringBody: string;
  bring: string[];
  areaEyebrow: string;
  areaHeading: string;
  areaBody: string;
  areaPath: (slug: string) => string;
  areaOutside: string;
  readHeading: string;
  read: Array<{ href: string; label: string }>;
  faqHeading: string;
  faqs: Faq[];
  closingTitle: string;
  closingBody: string;
  closingOffer?: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    path: "/contact",
    homeLabel: "Home",
    homePath: "/",
    crumb: "Contact",
    eyebrow: "Contact Vamos Properties",
    h1: "Call, text, or send the address for a cash offer.",
    lead:
      "The most useful things you can give us are the address and, if there is one, the date on a trustee sale notice. A person on our team reads every message and replies the same day.",
    phoneLabel: "Call or text",
    textUs: "Text us instead",
    emailLabel: "Email",
    hoursLabel: "Hours",
    hours: site.hours,
    languagesLabel: "Languages",
    languages: "English and Spanish",
    formNote: "Asking for a number does not put the house under contract.",
    stepsHeading: "What happens after you reach out.",
    steps: [
      {
        title: "We read it the same day",
        body: "A specialist on our team reads the form, the text, or the voicemail and calls you back. Messages after 7:00 p.m. are returned the next morning.",
      },
      {
        title: "A short call about the house",
        body: "We ask what you owe, what the house needs, who is on the title, and whether a notice or a deadline is involved. Ten minutes is usually enough.",
      },
      {
        title: "A number you can refuse",
        body: "If a cash offer makes sense, you see the number and the math behind it. If listing or another path would serve you better, we say so. Nothing is signed by asking.",
      },
    ],
    bringHeading: "What makes the first call faster.",
    bringBody: "None of this is required to reach out. It just helps us give you a real answer instead of a guess.",
    bring: [
      "The property address",
      "The latest mortgage statement, or a rough balance",
      "Any notice of trustee's sale, HOA letter, or tax bill",
      "Names of everyone on the title",
      "The date you need to be out, if there is one",
    ],
    areaEyebrow: "Service area",
    areaHeading: "Where we buy houses.",
    areaBody:
      "We buy houses across Maricopa County, Arizona, as-is and in any condition. Each city page covers the neighborhoods, the kinds of houses, and the situations we hear about most there.",
    areaPath: (slug) => `/areas/${slug}`,
    areaOutside: "Not sure your address is in our area? Call or text and ask. If we cannot help, we will tell you right away.",
    readHeading: "Prefer to read first?",
    read: [
      { href: "/cash-offer", label: "How a cash offer is priced" },
      { href: "/stop-foreclosure", label: "Stop a foreclosure" },
      { href: "/take-over-payments", label: "Take over the payments" },
      { href: "/sell", label: "Situations we buy" },
      { href: "/guides", label: "Selling guides" },
    ],
    faqHeading: "Questions about contacting us",
    faqs: [
      {
        question: "How fast will someone get back to me?",
        answer:
          "The same day, during our hours of 8:00 a.m. to 7:00 p.m., seven days a week. A form or text sent after 7:00 p.m. is returned the next morning. If a trustee sale date is close, call instead of using the form.",
      },
      {
        question: "Does contacting you mean I have to sell?",
        answer:
          "No. Asking for a number does not put your house under contract and does not cost anything. You can hear the offer, ask questions, and say no.",
      },
      {
        question: "Can I talk to someone in Spanish?",
        answer: "Yes. Our team speaks English and Spanish, and the site has Spanish pages for every main service.",
      },
      {
        question: "Is there a fee to ask for an offer?",
        answer:
          "No. There is no fee to call, text, or send the address, and no fee to hear the number. If you accept, the sale closes through a Maricopa County title company and you see the settlement statement before you sign.",
      },
      {
        question: "What areas do you buy in?",
        answer:
          "All of Maricopa County, Arizona, including Phoenix, Mesa, Glendale, Chandler, Gilbert, Scottsdale, Peoria, Surprise, Tempe, and the West Valley cities.",
      },
    ],
    closingTitle: "Send the address. Then decide.",
    closingBody: "Our specialists read it and call you. You are not signing anything by asking.",
  },
  es: {
    path: "/es/contacto",
    homeLabel: "Inicio",
    homePath: "/es",
    crumb: "Contacto",
    eyebrow: "Contacto con Vamos Properties",
    h1: "Llame, escriba o envíe la dirección para una oferta de contado.",
    lead:
      "Lo más útil que puede darnos es la dirección y, si existe, la fecha del aviso de venta del fiduciario. Una persona de nuestro equipo lee cada mensaje y responde el mismo día.",
    phoneLabel: "Llame o escriba",
    textUs: "O envíenos un texto",
    emailLabel: "Correo",
    hoursLabel: "Horario",
    hours: "8:00 a.m. a 7:00 p.m., los siete días",
    languagesLabel: "Idiomas",
    languages: "Español e inglés",
    formNote: "Pedir un número no pone la casa bajo contrato.",
    stepsHeading: "Qué pasa después de comunicarse.",
    steps: [
      {
        title: "Lo leemos el mismo día",
        body: "Un especialista de nuestro equipo lee el formulario, el texto o el mensaje de voz y le devuelve la llamada. Lo que llegue después de las 7:00 p.m. se responde a la mañana siguiente.",
      },
      {
        title: "Una llamada corta sobre la casa",
        body: "Le preguntamos cuánto debe, qué necesita la casa, quién aparece en el título y si hay un aviso o una fecha límite. Por lo general bastan diez minutos.",
      },
      {
        title: "Un número que puede rechazar",
        body: "Si una oferta de contado tiene sentido, ve el número y el cálculo. Si listar u otra opción le conviene más, se lo decimos. Preguntar no lo obliga a firmar nada.",
      },
    ],
    bringHeading: "Lo que hace más rápida la primera llamada.",
    bringBody: "Nada de esto es obligatorio para comunicarse. Solo nos ayuda a darle una respuesta real en lugar de un cálculo al aire.",
    bring: [
      "La dirección de la propiedad",
      "El último estado de cuenta de la hipoteca, o un saldo aproximado",
      "Cualquier aviso de venta del fiduciario, carta de la HOA o factura de impuestos",
      "Los nombres de todos los que aparecen en el título",
      "La fecha en que necesita salir, si la hay",
    ],
    areaEyebrow: "Zona de servicio",
    areaHeading: "Dónde compramos casas.",
    areaBody:
      "Compramos casas en todo el condado de Maricopa, Arizona, tal como están y en cualquier condición. Cada página de ciudad explica los vecindarios, el tipo de casas y las situaciones que más escuchamos ahí.",
    areaPath: (slug) => `/es/zonas/${slug}`,
    areaOutside: "¿No sabe si su dirección está en nuestra zona? Llame o escriba y pregunte. Si no podemos ayudar, se lo decimos de inmediato.",
    readHeading: "¿Prefiere leer primero?",
    read: [
      { href: "/es/oferta-en-efectivo", label: "Cómo se calcula una oferta de contado" },
      { href: spanishForeclosurePath, label: "Detener una ejecución hipotecaria" },
      { href: "/es/tomar-los-pagos", label: "Tomar los pagos" },
      { href: "/es/vender", label: "Situaciones que compramos" },
    ],
    faqHeading: "Preguntas sobre cómo comunicarse",
    faqs: [
      {
        question: "¿Qué tan rápido me responden?",
        answer:
          "El mismo día, dentro de nuestro horario de 8:00 a.m. a 7:00 p.m., los siete días. Un formulario o texto enviado después de las 7:00 p.m. se responde a la mañana siguiente. Si la fecha de una venta del fiduciario está cerca, mejor llame.",
      },
      {
        question: "¿Comunicarme con ustedes me obliga a vender?",
        answer:
          "No. Pedir un número no pone su casa bajo contrato y no cuesta nada. Puede escuchar la oferta, hacer preguntas y decir que no.",
      },
      {
        question: "¿Puedo hablar con alguien en español?",
        answer: "Sí. Nuestro equipo habla español e inglés, y el sitio tiene páginas en español para cada servicio principal.",
      },
      {
        question: "¿Cobran algo por pedir una oferta?",
        answer:
          "No. Llamar, escribir o enviar la dirección no cuesta nada, y escuchar el número tampoco. Si acepta, la venta se cierra en una compañía de títulos del condado de Maricopa y usted ve la hoja de liquidación antes de firmar.",
      },
      {
        question: "¿En qué zonas compran?",
        answer:
          "En todo el condado de Maricopa, Arizona, incluidos Phoenix, Mesa, Glendale, Chandler, Gilbert, Scottsdale, Peoria, Surprise, Tempe y las ciudades del West Valley.",
      },
    ],
    closingTitle: "Envíe la dirección. Luego decida.",
    closingBody: "Nuestros especialistas la revisan y le llaman. Preguntar no lo obliga a nada.",
    closingOffer: "Pedir mi oferta",
  },
};

export function ContactView({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const pageUrl = `${site.url}${text.path}`;

  return (
    <div lang={locale === "es" ? "es" : undefined}>
      <LocalBusinessJsonLd />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "@id": `${pageUrl}#webpage`,
          url: pageUrl,
          name: text.eyebrow,
          inLanguage: locale === "es" ? "es-US" : "en-US",
          about: { "@id": businessId },
          mainEntity: { "@id": businessId },
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: text.homeLabel, path: text.homePath },
          { name: text.crumb, path: text.path },
        ]}
      />

      {/* Hero: phone, text, and the form are all above the fold. */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">{text.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">{text.h1}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{text.lead}</p>
            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted">{text.phoneLabel}</dt>
                <dd className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <a href={site.phoneTel} className="text-3xl font-semibold text-ink sm:text-4xl">
                    {site.phoneDisplay}
                  </a>
                  <a
                    href={smsHref(textUsBody[locale])}
                    className="inline-flex min-h-11 items-center border border-navy px-4 text-base font-semibold text-link"
                  >
                    {text.textUs}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted">{text.emailLabel}</dt>
                <dd className="mt-2">
                  <a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center break-all text-lg font-semibold text-ink">
                    {site.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted">{text.hoursLabel}</dt>
                <dd className="mt-2 text-lg leading-8 text-ink">{text.hours}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">{text.languagesLabel}</dt>
                <dd className="mt-2 text-lg leading-8 text-ink">{text.languages}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Instagram</dt>
                <dd className="mt-2">
                  <a
                    href={site.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-lg font-semibold text-ink"
                  >
                    {site.instagramHandle}
                  </a>
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-sm text-muted">{text.formNote}</p>
          </div>
          <LeadForm sourcePath={text.path} language={locale} />
        </div>
      </Section>

      {/* What happens next */}
      <Section tone="mist">
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">{text.stepsHeading}</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {text.steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-navy pt-5">
              <span className="text-sm font-semibold tracking-wide text-link">0{index + 1}</span>
              <h3 className="mt-2 text-2xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-3 leading-7 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* What to have ready */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">{text.bringHeading}</h2>
            <p className="mt-4 leading-7 text-muted">{text.bringBody}</p>
            <h3 className="mt-8 text-lg font-semibold text-ink">{text.readHeading}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {text.read.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-11 items-center border border-line bg-panel px-4 font-semibold text-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <ul className="grid gap-3 self-start">
            {text.bring.map((thing) => (
              <li key={thing} className="flex gap-3 border border-line bg-panel p-4 leading-7 text-ink">
                <span aria-hidden="true" className="font-semibold text-link">✓</span>
                <span>{thing}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Service area */}
      <Section tone="mist">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">{text.areaEyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">{text.areaHeading}</h2>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{text.areaBody}</p>
        <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {areas.map((area) => (
            <li key={area.slug}>
              <Link href={text.areaPath(area.slug)} className="flex min-h-11 items-center border border-line bg-panel px-4 font-semibold text-link">
                {area.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-2xl leading-7 text-muted">{text.areaOutside}</p>
      </Section>

      <Section>
        <FaqList faqs={text.faqs} heading={text.faqHeading} />
      </Section>

      <ClosingBand title={text.closingTitle} body={text.closingBody} {...(text.closingOffer ? { offerLabel: text.closingOffer } : {})} />
    </div>
  );
}
