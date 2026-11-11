import Image from "next/image";
import Link from "next/link";
import { LanguageSwitcherFallback } from "@/components/marketing/language-switcher-fallback";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import { navLinks, navStrings } from "@/lib/i18n/dictionaries";
import { site } from "@/lib/site";

export function SiteHeader({
  spanish,
  alternatePath,
}: {
  spanish: boolean;
  /** Pre-computed alternate-language path for the static fallback. */
  alternatePath: string;
}) {
  const locale = spanish ? "es" : "en";
  const strings = navStrings[locale];
  const links = navLinks[locale];

  return (
    <header className="bg-navy text-white">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-panel focus:px-3 focus:py-2"
      >
        {strings.skip}
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        {/* Logo */}
        <Link
          href={spanish ? "/es" : "/"}
          className="inline-flex h-11 shrink-0 items-center gap-2"
        >
          <Image
            src="/brand/vamos-bull.webp"
            alt=""
            width={336}
            height={168}
            sizes="72px"
            className="h-9 w-[4.5rem] object-contain"
          />
          <span className="flex flex-col justify-center leading-none">
            <span className="text-[0.95rem] font-semibold tracking-[0.16em] text-amber">VAMOS</span>
            <span className="mt-1 text-[0.58rem] font-medium tracking-[0.2em] text-white/70">PROPERTIES LLC</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center justify-end gap-x-3 lg:flex" aria-label={strings.navLabel}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center whitespace-nowrap text-sm text-white/85 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <LanguageSwitcherFallback spanish={spanish} alternatePath={alternatePath} />
          <a
            href={site.phoneTel}
            className="inline-flex min-h-11 items-center whitespace-nowrap bg-amber px-4 text-sm font-semibold text-amber-ink"
          >
            {site.phoneDisplay}
          </a>
          <ThemeToggle spanish={spanish} />
        </nav>

        {/* Mobile: theme + hamburger */}
        <div className="flex items-center lg:hidden">
          <ThemeToggle spanish={spanish} />
          <details className="relative">
            <summary className="inline-flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center px-3 text-sm text-white [&::-webkit-details-marker]:hidden">
              {strings.menu}
            </summary>
            <nav
              className="absolute right-0 z-30 mt-1 max-h-[calc(100dvh-5rem)] w-[min(18rem,calc(100vw-1.5rem))] overflow-y-auto bg-navy-soft p-3 shadow-lg"
              aria-label={strings.mobileNavLabel}
            >
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="block min-h-11 py-2 text-white">
                  {link.label}
                </Link>
              ))}
              <LanguageSwitcherFallback spanish={spanish} alternatePath={alternatePath} className="py-2" />
              <a href={site.phoneTel} className="block min-h-11 py-2 font-semibold text-amber">
                {site.phoneDisplay}
              </a>
              <a href={`mailto:${site.email}`} className="block min-h-11 break-all py-2 text-white/85">
                {site.email}
              </a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
