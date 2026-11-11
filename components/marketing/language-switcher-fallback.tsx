import Link from "next/link";

export function LanguageSwitcherFallback({
  spanish,
  alternatePath,
  className = "",
}: {
  spanish: boolean;
  alternatePath: string;
  className?: string;
}) {
  return (
    <Link
      href={alternatePath}
      lang={spanish ? "en" : "es"}
      hrefLang={spanish ? "en" : "es-US"}
      className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-white/75 hover:text-white ${className}`}
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
      {spanish ? "English" : "Español"}
    </Link>
  );
}
