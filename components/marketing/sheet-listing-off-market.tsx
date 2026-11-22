import Link from "next/link";
import { SheetListingSimilar } from "@/components/marketing/sheet-listing-similar";
import { sheetListingCatalogHref } from "@/lib/gdoc-listings/display";
import type { SheetListingCardView, SheetListingOffMarketView } from "@/lib/gdoc-listings/types";
import type { Locale } from "@/lib/i18n/routes";

const copy = {
  en: {
    eyebrow: "Off market",
    sold: "This home has sold.",
    pending: "This home is under contract.",
    unavailable: "This listing is no longer available.",
    body: "It is not on our active list right now. Browse the homes that are available today, or call us and we will tell you what is coming up nearby.",
    browse: "Browse available homes",
  },
  es: {
    eyebrow: "Fuera del mercado",
    sold: "Esta casa ya se vendió.",
    pending: "Esta casa está bajo contrato.",
    unavailable: "Esta propiedad ya no está disponible.",
    body: "No está en nuestra lista activa en este momento. Vea las casas disponibles hoy o llámenos y le diremos qué viene pronto en la zona.",
    browse: "Ver casas disponibles",
  },
} as const;

/**
 * Shown for links to homes that exist but are not public. Rendered with `noindex` metadata so
 * search engines drop the URL without a soft-404, and visitors still reach live inventory.
 */
export function SheetListingOffMarket({
  listing,
  similar,
  locale,
}: {
  listing: SheetListingOffMarketView;
  similar: SheetListingCardView[];
  locale: Locale;
}) {
  const text = copy[locale];
  const headline =
    listing.status === "sold" ? text.sold : listing.status === "under_contract" ? text.pending : text.unavailable;
  return (
    <div className="bg-paper" lang={locale === "es" ? "es" : undefined}>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">{text.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink md:text-4xl">{listing.title}</h1>
        {listing.city ? <p className="mt-2 text-base text-muted">{listing.city}</p> : null}
        <div className="mt-6 max-w-2xl border border-line bg-mist p-5">
          <p className="text-lg font-semibold text-ink">{headline}</p>
          <p className="mt-2 text-base leading-7 text-muted">{text.body}</p>
          <Link
            href={sheetListingCatalogHref(locale)}
            className="mt-4 inline-flex min-h-12 items-center bg-amber px-4 text-base font-semibold text-amber-ink"
          >
            {text.browse}
          </Link>
        </div>
        <SheetListingSimilar listings={similar} locale={locale} />
      </div>
    </div>
  );
}
