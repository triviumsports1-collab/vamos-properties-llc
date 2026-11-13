import Link from "next/link";
import { areas } from "@/lib/content/areas";

const copy = {
  en: {
    heading: "Cities we buy in",
    body: "The offer follows the block. Open the city closest to the house, then send the address.",
    item: (name: string) => `Sell a house in ${name}`,
    href: (slug: string) => `/areas/${slug}`,
  },
  es: {
    heading: "Ciudades donde compramos",
    body: "La oferta depende de la cuadra. Abra la ciudad más cercana a la casa y luego envíe la dirección.",
    item: (name: string) => `Vender una casa en ${name}`,
    href: (slug: string) => `/es/zonas/${slug}`,
  },
};

export function CityLinks({ heading, language = "en" }: { heading?: string; language?: "en" | "es" }) {
  const text = copy[language];
  return (
    <div>
      <h2 className="text-3xl font-semibold text-ink sm:text-4xl">{heading ?? text.heading}</h2>
      <p className="mt-3 max-w-2xl leading-7 text-muted">{text.body}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <li key={area.slug}>
            <Link
              href={text.href(area.slug)}
              className="flex min-h-12 items-center border border-line bg-panel px-4 font-semibold text-ink"
            >
              {text.item(area.name)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
