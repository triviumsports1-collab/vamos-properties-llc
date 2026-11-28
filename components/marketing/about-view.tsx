import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/marketing/breadcrumb-json-ld";
import { ClosingBand } from "@/components/marketing/closing-band";
import { Founders } from "@/components/marketing/founders";
import { JsonLd } from "@/components/marketing/json-ld";
import { LeadForm } from "@/components/marketing/lead-form";
import { businessId, LocalBusinessJsonLd } from "@/components/marketing/local-business";
import { Section } from "@/components/marketing/section";
import type { Locale } from "@/lib/i18n/routes";
import { site, spanishForeclosurePath } from "@/lib/site";

/*
 * TODO(owner): The SEO plan asks for the founders' real story. Only facts we can verify are
 * published here (names, roles, photos, contact details, legal name). Before adding more, get
 * from Patrick and Jaime: the year Vamos Properties started, why they started it, their
 * background in the Valley, and the Arizona Corporation Commission entity number if they want
 * it shown. Do not publish deal counts, years of experience, or reviews until they are confirmed.
 */

type Block = { title: string; body: string };

type Copy = {
  path: string;
  homeLabel: string;
  homePath: string;
  crumb: string;
  eyebrow: string;
  h1: string;
  intro: string[];
  storyEyebrow: string;
  storyHeading: string;
  story: string[];
  factsHeading: string;
  facts: Array<{ label: string; value: string; href?: string; external?: boolean }>;
  dealEyebrow: string;
  dealHeading: string;
  dealBody: string;
  deal: Block[];
  pathsHeading: string;
  paths: Array<{ href: string; title: string; body: string }>;
  notHeading: string;
  not: Block[];
  formHeading: string;
  formBody: string;
  closingTitle: string;
  closingBody: string;
  closingOffer?: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    path: "/about",
    homeLabel: "Home",
    homePath: "/",
    crumb: "About us",
    eyebrow: "About Vamos Properties",
    h1: "A local team that buys houses in Maricopa County.",
    intro: [
      "Vamos Properties buys houses in Maricopa County, Arizona, from owners who need a private, as-is sale. That includes houses behind on the mortgage, houses facing a trustee sale, inherited houses, rentals, and houses that need more work than a listing can carry.",
      "We are not a national call center that sells your lead to the highest bidder. Our acquisitions team answers directly, works with you one-on-one, and the specialist you meet stays with your file through closing.",
      "A cash closing runs through a Maricopa County title company. You see the number before you sign, including the fact that a cash price is usually below a listed price. If taking over the payments fits better, we tell you what stays in your name before anyone celebrates.",
    ],
    storyEyebrow: "Who runs it",
    storyHeading: "Two co-founders who stay on every file.",
    story: [
      "Vamos Properties is led by its co-founders, Patrick Szymczak and Jaime Miranda. They split the work the way a sale splits: one side is the numbers, the other is the people.",
      "Patrick leads acquisitions: the loan, what the house needs, what similar houses nearby actually sell for, and the date on any notice. The offer is built from those facts.",
      "Jaime leads seller relations and closing, keeping the file moving from the first call to the title company so the seller understands every page before signing.",
      "Because the founders stay close to each file, you are not passed from an opener to a closer to a stranger at the title company. You can reach them directly at the emails below.",
    ],
    factsHeading: "Company facts",
    facts: [
      { label: "Legal name", value: site.legalName },
      { label: "Based in", value: "Phoenix, Arizona" },
      { label: "Service area", value: site.area },
      { label: "Languages", value: "English and Spanish" },
      { label: "Hours", value: site.hours },
      { label: "Phone and text", value: site.phoneDisplay, href: site.phoneTel },
      { label: "Email", value: site.email, href: `mailto:${site.email}` },
      { label: "Instagram", value: site.instagramHandle, href: site.instagramUrl, external: true },
    ],
    dealEyebrow: "How a deal works",
    dealHeading: "From the first call to the title company.",
    dealBody: "Every sale is a little different, but the order is always the same, and you can stop at any step before you sign.",
    deal: [
      {
        title: "You reach out",
        body: "Call, text, or send the address. A specialist reads it the same day and calls you back.",
      },
      {
        title: "A short call",
        body: "We ask what you owe, what the house needs, who is on the title, and whether a notice or a deadline is involved.",
      },
      {
        title: "One visit",
        body: "We see the house once, as it is. No cleaning, no staging, and no repairs before we come.",
      },
      {
        title: "A written number",
        body: "You get the offer and the math behind it. If listing would clearly net you more and you have the time, we say so. You can decline.",
      },
      {
        title: "Closing through title",
        body: "If you accept, a Maricopa County title company checks who must sign, pays the loan and any liens from the sale, and pays you the rest on the date you pick.",
      },
    ],
    pathsHeading: "Three ways we can help.",
    paths: [
      { href: "/cash-offer", title: "Cash offer", body: "As-is, through a title company, and you can say no." },
      { href: "/stop-foreclosure", title: "Stop a foreclosure", body: "Start with the date on the notice." },
      { href: "/take-over-payments", title: "Take over payments", body: "Read the part where your name can stay on the loan." },
    ],
    notHeading: "What we will not tell you.",
    not: [
      {
        title: "That every house has equity",
        body: "Some loans are larger than a cash price. We say that. We do not invent a number to get a signature.",
      },
      {
        title: "That we repair credit",
        body: "A sale before the auction can keep the sale from happening. It does not erase the late payments already on your report.",
      },
      {
        title: "That a takeover removes the loan",
        body: "It can leave the mortgage in your name. The risks are written on that page because they belong in the open.",
      },
      {
        title: "That a stranger's review is your result",
        body: "We do not publish seller names, star ratings, or a count of deals we did not do. You get a dedicated Vamos specialist and a number you can refuse.",
      },
    ],
    formHeading: "Tell us the address when you are ready.",
    formBody:
      "You will hear back from a dedicated Vamos specialist, not from a rotating closer. If you would rather talk first, call or text us. Messages after 7:00 p.m. are returned the next morning.",
    closingTitle: "The specialist on the first call stays with your file.",
    closingBody: "Leave the address. If we are with another homeowner, we still return it the same day.",
  },
  es: {
    path: "/es/nosotros",
    homeLabel: "Inicio",
    homePath: "/es",
    crumb: "Nosotros",
    eyebrow: "Quiénes somos",
    h1: "Un equipo local que compra casas en el condado de Maricopa.",
    intro: [
      "Vamos Properties compra casas en el condado de Maricopa, Arizona, a dueños que necesitan una venta privada y tal como está. Eso incluye casas atrasadas con la hipoteca, casas con una venta del fiduciario próxima, casas heredadas, casas de alquiler y casas que necesitan más trabajo del que una venta tradicional aguanta.",
      "No somos un centro de llamadas nacional que vende su información al mejor postor. Nuestro equipo de adquisiciones contesta directamente, trabaja con usted de manera personalizada y el especialista que conoce al principio sigue con su expediente hasta el cierre.",
      "Un cierre de contado se hace en una compañía de títulos del condado de Maricopa. Usted ve el número antes de firmar, y también sabe que un precio de contado suele ser menor que el de una casa listada. Si tomar los pagos le conviene más, le decimos qué queda a su nombre antes de celebrar.",
    ],
    storyEyebrow: "Quién la dirige",
    storyHeading: "Dos cofundadores que siguen cada expediente.",
    story: [
      "Vamos Properties está dirigida por sus cofundadores, Patrick Szymczak y Jaime Miranda. Se dividen el trabajo como se divide una venta: por un lado los números, por el otro las personas.",
      "Patrick dirige las adquisiciones. Revisa el préstamo, lo que necesita la casa, lo que de verdad se venden casas parecidas cerca y la fecha de cualquier aviso, y arma la oferta con esos datos.",
      "Jaime dirige la atención al vendedor y el cierre. Es quien mantiene el expediente en marcha desde la primera llamada hasta la compañía de títulos, y quien se asegura de que el vendedor entienda cada página antes de firmar.",
      "Como los fundadores siguen de cerca cada expediente, no lo pasan de un vendedor a otro ni a un desconocido en la compañía de títulos. Puede escribirles directamente a los correos de abajo.",
    ],
    factsHeading: "Datos de la empresa",
    facts: [
      { label: "Nombre legal", value: site.legalName },
      { label: "Con sede en", value: "Phoenix, Arizona" },
      { label: "Zona de servicio", value: "Condado de Maricopa, Arizona" },
      { label: "Idiomas", value: "Español e inglés" },
      { label: "Horario", value: "8:00 a.m. a 7:00 p.m., los siete días" },
      { label: "Teléfono y texto", value: site.phoneDisplay, href: site.phoneTel },
      { label: "Correo", value: site.email, href: `mailto:${site.email}` },
      { label: "Instagram", value: site.instagramHandle, href: site.instagramUrl, external: true },
    ],
    dealEyebrow: "Cómo funciona una venta",
    dealHeading: "De la primera llamada a la compañía de títulos.",
    dealBody: "Cada venta es un poco distinta, pero el orden es siempre el mismo, y puede detenerse en cualquier paso antes de firmar.",
    deal: [
      {
        title: "Usted se comunica",
        body: "Llame, escriba o envíe la dirección. Un especialista lo lee el mismo día y le devuelve la llamada.",
      },
      {
        title: "Una llamada corta",
        body: "Le preguntamos cuánto debe, qué necesita la casa, quién aparece en el título y si hay un aviso o una fecha límite.",
      },
      {
        title: "Una visita",
        body: "Vemos la casa una vez, tal como está. Sin limpiar, sin arreglar y sin reparaciones antes de que lleguemos.",
      },
      {
        title: "Un número por escrito",
        body: "Recibe la oferta y el cálculo. Si listar le dejaría claramente más y tiene tiempo, se lo decimos. Puede decir que no.",
      },
      {
        title: "Cierre en la compañía de títulos",
        body: "Si acepta, una compañía de títulos del condado de Maricopa revisa quién debe firmar, paga el préstamo y cualquier gravamen con la venta y le paga a usted el resto en la fecha que elija.",
      },
    ],
    pathsHeading: "Tres formas en que podemos ayudar.",
    paths: [
      { href: "/es/oferta-en-efectivo", title: "Oferta de contado", body: "Tal como está, con una compañía de títulos, y puede decir que no." },
      { href: spanishForeclosurePath, title: "Detener una ejecución", body: "Empiece por la fecha del aviso." },
      { href: "/es/tomar-los-pagos", title: "Tomar los pagos", body: "Lea la parte donde su nombre puede seguir en el préstamo." },
    ],
    notHeading: "Lo que no le vamos a decir.",
    not: [
      {
        title: "Que toda casa tiene valor a favor",
        body: "Algunos préstamos son mayores que un precio de contado. Se lo decimos. No inventamos un número para conseguir una firma.",
      },
      {
        title: "Que reparamos el crédito",
        body: "Una venta antes de la subasta puede evitar que la subasta ocurra. No borra los pagos atrasados que ya están en su reporte.",
      },
      {
        title: "Que tomar los pagos elimina el préstamo",
        body: "La hipoteca puede seguir a su nombre. Los riesgos están escritos en esa página porque deben estar a la vista.",
      },
      {
        title: "Que la reseña de un desconocido será su resultado",
        body: "No publicamos nombres de vendedores, estrellas ni un número de ventas que no hicimos. Usted recibe un especialista de Vamos y un número que puede rechazar.",
      },
    ],
    formHeading: "Envíe la dirección cuando esté listo.",
    formBody:
      "Le responde un especialista de Vamos, no un vendedor que cambia cada semana. Si prefiere hablar primero, llámenos o escríbanos. Lo que llegue después de las 7:00 p.m. se responde a la mañana siguiente.",
    closingTitle: "Mándenos la dirección. Le llamamos hoy.",
    closingBody: "Nuestros especialistas responden el mismo día. Pedir una oferta no lo obliga a vender.",
    closingOffer: "Pedir mi oferta",
  },
};

export function AboutView({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const pageUrl = `${site.url}${text.path}`;
  const person = (name: string, jobTitle: string, email: string, image: string) => ({
    "@type": "Person",
    name,
    jobTitle,
    email,
    image: `${site.url}${image}`,
    worksFor: { "@id": businessId },
  });

  return (
    <div lang={locale === "es" ? "es" : undefined}>
      <LocalBusinessJsonLd />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${pageUrl}#webpage`,
          url: pageUrl,
          name: text.eyebrow,
          inLanguage: locale === "es" ? "es-US" : "en-US",
          about: { "@id": businessId },
          mainEntity: {
            "@type": "Organization",
            "@id": businessId,
            name: site.name,
            legalName: site.legalName,
            url: site.url,
            logo: `${site.url}/brand/vamos-logo.jpg`,
            email: site.email,
            telephone: site.phoneE164,
            founder: [
              person("Patrick Szymczak", "Co-founder", site.patrickEmail, "/founders/patrick-szymczak.jpg"),
              person("Jaime Miranda", "Co-founder", site.jaimeEmail, "/founders/jaime-miranda.jpg"),
            ],
          },
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: text.homeLabel, path: text.homePath },
          { name: text.crumb, path: text.path },
        ]}
      />

      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">{text.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">{text.h1}</h1>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          {text.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>

      {/* Founders: story, then photos and direct contact */}
      <Section tone="mist">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">{text.storyEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">{text.storyHeading}</h2>
            <div className="mt-5 space-y-4 text-lg leading-8 text-ink">
              {text.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <aside className="self-start border-l-4 border-amber bg-panel p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-link">{text.factsHeading}</h3>
            <dl className="mt-4 grid gap-3">
              {text.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-sm text-muted">{fact.label}</dt>
                  <dd className="font-semibold text-ink">
                    {fact.href ? (
                      <a
                        href={fact.href}
                        className="inline-flex min-h-11 items-center break-all text-link"
                        {...(fact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {fact.value}
                      </a>
                    ) : (
                      fact.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
        <div className="mt-14">
          <Founders locale={locale} />
        </div>
      </Section>

      {/* How a deal works */}
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">{text.dealEyebrow}</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">{text.dealHeading}</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted">{text.dealBody}</p>
        <ol className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {text.deal.map((step, index) => (
            <li key={step.title} className="border-t-2 border-navy pt-5">
              <span className="text-sm font-semibold tracking-wide text-link">0{index + 1}</span>
              <h3 className="mt-2 text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-3 leading-7 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <h2 className="mt-16 text-2xl font-semibold text-ink">{text.pathsHeading}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {text.paths.map((item) => (
            <Link key={item.href} href={item.href} className="border border-line p-5">
              <h3 className="text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 leading-7 text-muted">{item.body}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="mist">
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">{text.notHeading}</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {text.not.map((item) => (
            <li key={item.title} className="bg-panel p-5">
              <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 leading-7 text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">{text.formHeading}</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">{text.formBody}</p>
            <p className="mt-6">
              <a href={site.phoneTel} className="text-2xl font-semibold text-ink">
                {site.phoneDisplay}
              </a>
            </p>
          </div>
          <LeadForm sourcePath={text.path} language={locale} />
        </div>
      </Section>

      <ClosingBand title={text.closingTitle} body={text.closingBody} {...(text.closingOffer ? { offerLabel: text.closingOffer } : {})} />
    </div>
  );
}
