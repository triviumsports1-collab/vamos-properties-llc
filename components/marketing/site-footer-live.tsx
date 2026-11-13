"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcherFallback } from "@/components/marketing/language-switcher-fallback";
import { footerStrings } from "@/lib/i18n/dictionaries";
import { getAlternatePath, isSpanish } from "@/lib/i18n/routes";
import { areas } from "@/lib/content/areas";
import { site } from "@/lib/site";

export function SiteFooterLive() {
  const pathname = usePathname();
  const spanish = isSpanish(pathname);
  const alternatePath = getAlternatePath(pathname);
  const locale = spanish ? "es" : "en";
  const strings = footerStrings[locale];

  return (
    <footer className="bg-navy text-white" lang={spanish ? "es" : undefined}>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1fr_1fr_1fr_auto]">
        <div>
          <p className="text-2xl font-semibold tracking-tight">{site.name}</p>
          <p className="mt-3 leading-7 text-white/75">{strings.tagline}</p>
          <a href={site.phoneTel} className="mt-3 inline-flex min-h-11 items-center font-semibold text-amber">
            {site.phoneDisplay}
          </a>
          <a href={`mailto:${site.email}`} className="mt-1 inline-flex min-h-11 items-center break-all text-white/80 hover:text-white">
            {site.email}
          </a>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/60">{strings.helpHeading}</p>
          <ul className="mt-4 space-y-2">
            {strings.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-11 items-center text-white/80 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/60">{strings.citiesHeading}</p>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {areas.map((area) => (
              <li key={area.slug}>
                <Link href={spanish ? `/es/zonas/${area.slug}` : `/areas/${area.slug}`} className="inline-flex min-h-11 items-center text-white/80 hover:text-white">
                  {area.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/60">{strings.langHeading}</p>
          <LanguageSwitcherFallback spanish={spanish} alternatePath={alternatePath} />
        </div>
      </div>

      <p className="mx-auto max-w-6xl px-4 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] text-sm leading-6 text-white/60 md:pb-10">
        {strings.disclaimer}
      </p>
    </footer>
  );
}
