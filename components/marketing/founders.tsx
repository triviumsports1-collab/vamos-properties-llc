import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

type Person = {
  name: string;
  src: string;
  role: Record<Locale, string>;
  line: Record<Locale, string>;
  email: string;
  phoneDisplay?: string;
  phoneTel?: string;
};

const people: Person[] = [
  {
    name: "Patrick Szymczak",
    src: "/founders/patrick-szymczak.jpg",
    role: { en: "Co-founder", es: "Cofundador" },
    line: {
      en: "Leads acquisitions: the numbers, the loan, and the date on the notice.",
      es: "Dirige las adquisiciones: los números, el préstamo y la fecha del aviso.",
    },
    email: site.patrickEmail,
  },
  {
    name: "Jaime Miranda",
    src: "/founders/jaime-miranda.jpg",
    role: { en: "Co-founder", es: "Cofundador" },
    line: {
      en: "Leads seller relations and closing, from the first call to the title company.",
      es: "Dirige la atención al vendedor y el cierre, desde la primera llamada hasta la compañía de título.",
    },
    email: site.jaimeEmail,
    phoneDisplay: site.jaimePhoneDisplay,
    phoneTel: site.jaimePhoneTel,
  },
];

const copy = {
  en: {
    eyebrow: "Leadership",
    title: "Led by local founders, backed by a dedicated team.",
    body: "Vamos Properties is run by its founders, who stay close to every file. You work one-on-one with a dedicated Vamos specialist, not a call center or a rotating closer.",
    about: "About Vamos Properties",
    aboutHref: "/about",
    phone: "Phone:",
    email: "Email:",
  },
  es: {
    eyebrow: "Dirección",
    title: "Dirigida por fundadores locales, con un equipo dedicado.",
    body: "Vamos Properties está dirigida por sus fundadores, que siguen de cerca cada expediente. Usted trabaja de manera personalizada con un especialista de Vamos, no con un centro de llamadas.",
    about: "Conozca Vamos Properties",
    aboutHref: "/es/nosotros",
    phone: "Teléfono:",
    email: "Correo:",
  },
} as const;

export function Founders({ linked = false, locale = "en" }: { linked?: boolean; locale?: Locale }) {
  const text = copy[locale];
  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">{text.eyebrow}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">{text.title}</h2>
        {linked ? (
          <Link href={text.aboutHref} className="inline-flex min-h-11 items-center text-sm text-pine">
            {text.about}
          </Link>
        ) : null}
      </div>
      <p className="mt-3 max-w-2xl leading-7 text-muted">{text.body}</p>
      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        {people.map((person) => (
          <figure key={person.name}>
            <div className="relative aspect-[3/4] max-w-sm overflow-hidden bg-line">
              <Image
                src={person.src}
                alt={`${person.name}, ${person.role[locale].toLowerCase()} ${locale === "es" ? "de" : "of"} Vamos Properties`}
                fill
                sizes="(min-width: 640px) 320px, 80vw"
                className="object-cover object-top"
              />
            </div>
            <figcaption className="mt-3">
              <span className="block font-serif text-2xl text-ink">{person.name}</span>
              <span className="mt-1 block text-sm font-semibold uppercase tracking-[0.08em] text-muted">
                {person.role[locale]}, Vamos Properties
              </span>
              <span className="mt-2 block text-sm leading-6 text-muted">{person.line[locale]}</span>
              {/* Labeled, stacked contact rows: never run the phone and email together. */}
              <dl className="mt-3 grid gap-1 text-sm">
                {person.phoneTel ? (
                  <div className="flex flex-wrap items-center gap-x-2">
                    <dt className="text-muted">{text.phone}</dt>
                    <dd>
                      <a href={person.phoneTel} className="inline-flex min-h-11 items-center font-semibold text-link">
                        {person.phoneDisplay}
                      </a>
                    </dd>
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-x-2">
                  <dt className="text-muted">{text.email}</dt>
                  <dd className="min-w-0">
                    <a
                      href={`mailto:${person.email}`}
                      className="inline-flex min-h-11 items-center break-all font-semibold text-link"
                    >
                      {person.email}
                    </a>
                  </dd>
                </div>
              </dl>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
