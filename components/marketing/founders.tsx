import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

const people = [
  {
    name: "Patrick Szymczak",
    src: "/founders/patrick-szymczak.jpg",
    alt: "Patrick Szymczak",
    line: "Talks through the numbers and the date on the notice.",
    email: site.patrickEmail,
  },
  {
    name: "Jaime Miranda",
    src: "/founders/jaime-miranda.jpg",
    alt: "Jaime Miranda, co-founder of Vamos Properties",
    line: "Stays on the paperwork from the first call to the title company.",
    email: site.jaimeEmail,
  },
];

export function Founders({ linked = false }: { linked?: boolean }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Patrick Szymczak and Jaime Miranda</h2>
        {linked ? (
          <Link href="/about" className="text-sm text-pine">
            About us
          </Link>
        ) : null}
      </div>
      <p className="mt-3 max-w-2xl leading-7 text-muted">
        You will talk to one of them. Not a call center, and not a rotating closer.
      </p>
      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        {people.map((person) => (
          <figure key={person.name}>
            <div className="relative aspect-[3/4] max-w-sm overflow-hidden bg-line">
              <Image
                src={person.src}
                alt={person.alt}
                fill
                sizes="(min-width: 640px) 320px, 80vw"
                className="object-cover object-top"
              />
            </div>
            <figcaption className="mt-3">
              <span className="block font-serif text-2xl text-ink">{person.name}</span>
              <span className="mt-1 block text-sm leading-6 text-muted">{person.line}</span>
              <a
                href={`mailto:${person.email}`}
                className="mt-2 inline-flex min-h-11 items-center break-all text-sm font-semibold text-link"
              >
                {person.email}
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
