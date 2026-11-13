import Link from "next/link";
import { situations } from "@/lib/content/situations";
import { situationsEs } from "@/lib/content/situations-es";

const copy = {
  en: {
    heading: "Selling for a specific reason?",
    body: "Each of these pages covers who has to sign, the Arizona rules that matter, and what to have ready for the first call.",
    all: "All situations we buy",
    hub: "/sell",
  },
  es: {
    heading: "¿Vende por una razón específica?",
    body: "Cada página explica quién tiene que firmar, qué reglas de Arizona importan y qué tener listo para la primera llamada.",
    all: "Todas las situaciones que compramos",
    hub: "/es/vender",
  },
};

export function SituationLinks({ heading, language = "en" }: { heading?: string; language?: "en" | "es" }) {
  const text = copy[language];
  const items =
    language === "es"
      ? situationsEs.map((item) => ({ href: `/es/vender/${item.slug}`, label: item.label, blurb: item.blurb }))
      : situations.map((item) => ({ href: `/sell/${item.slug}`, label: item.label, blurb: item.blurb }));

  return (
    <div>
      <h2 className="text-3xl font-semibold text-ink sm:text-4xl">{heading ?? text.heading}</h2>
      <p className="mt-3 max-w-2xl leading-7 text-muted">{text.body}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="block h-full border border-line bg-panel p-4">
              <span className="block font-semibold text-ink">{item.label}</span>
              <span className="mt-1 block text-sm leading-6 text-muted">{item.blurb}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href={text.hub}
            className="flex h-full min-h-12 items-center border border-navy bg-navy px-4 font-semibold text-white"
          >
            {text.all} →
          </Link>
        </li>
      </ul>
    </div>
  );
}
