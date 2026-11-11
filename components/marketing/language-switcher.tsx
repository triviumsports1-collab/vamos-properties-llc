"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcherFallback } from "@/components/marketing/language-switcher-fallback";
import { getAlternatePath, isSpanish } from "@/lib/i18n/routes";

export { LanguageSwitcherFallback };

/**
 * Compact language toggle that lives in the site header.
 * On English pages it shows "Español"; on Spanish pages it shows "English".
 * Rendered inside a Suspense boundary because it uses usePathname().
 */
export function LanguageSwitcher({
  className = "",
  fallbackAlternatePath,
}: {
  className?: string;
  /** Used during SSR (Suspense fallback). Pass the static alternate for the page. */
  fallbackAlternatePath?: string;
}) {
  const pathname = usePathname();
  const es = isSpanish(pathname);
  const alternatePath = getAlternatePath(pathname) || fallbackAlternatePath || (es ? "/" : "/es");

  return (
    <Link
      href={alternatePath}
      lang={es ? "en" : "es"}
      hrefLang={es ? "en" : "es-US"}
      aria-label={es ? "View this page in English" : "Ver esta página en español"}
      className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-white/75 transition-colors hover:text-white ${className}`}
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 1 0 20M12 2a14.5 14.5 0 0 0 0 20M2 12h20" />
      </svg>
      {es ? "English" : "Español"}
    </Link>
  );
}

