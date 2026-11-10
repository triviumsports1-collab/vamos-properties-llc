import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/routes";
import { formatMoney } from "@/lib/listings/money";

export function SheetListingFlags({
  priceDropped,
  updated,
  locale,
}: {
  priceDropped: boolean;
  updated: boolean;
  locale: Locale;
}) {
  if (!priceDropped && !updated) return null;
  const copy = propertyListingStrings[locale];

  return (
    <div className="flex flex-wrap gap-2">
      {priceDropped ? <Flag tone="amber">{copy.priceDropped}</Flag> : null}
      {updated && !priceDropped ? <Flag tone="navy">{copy.updated}</Flag> : null}
    </div>
  );
}

export function SheetListingPriceChange({
  listPrice,
  previousPrice,
  drop,
  locale,
}: {
  listPrice: number | null;
  previousPrice: number | null;
  drop: number | null;
  locale: Locale;
}) {
  if (drop == null || previousPrice == null || listPrice == null) return null;
  const copy = propertyListingStrings[locale];

  return (
    <p className="mt-2 text-base text-muted">
      <span className="line-through">{formatMoney(previousPrice)}</span>
      {` · ${copy.down} ${formatMoney(drop)}`}
    </p>
  );
}

function Flag({ children, tone }: { children: string; tone: "navy" | "amber" }) {
  const className = tone === "amber" ? "bg-amber text-amber-ink" : "bg-navy text-white";
  return <span className={`inline-flex min-h-7 items-center rounded-md px-2 text-xs font-semibold ${className}`}>{children}</span>;
}
