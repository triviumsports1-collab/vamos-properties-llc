import { formatMoney } from "@/lib/listings/money";

export function SheetListingFlags({
  priceDropped,
  updated,
}: {
  priceDropped: boolean;
  updated: boolean;
}) {
  if (!priceDropped && !updated) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {priceDropped ? <Flag tone="amber">Price dropped</Flag> : null}
      {updated && !priceDropped ? <Flag tone="navy">Updated</Flag> : null}
    </div>
  );
}

export function SheetListingPriceChange({
  listPrice,
  previousPrice,
  drop,
}: {
  listPrice: number | null;
  previousPrice: number | null;
  drop: number | null;
}) {
  if (drop == null || previousPrice == null || listPrice == null) return null;

  return (
    <p className="mt-2 text-base text-muted">
      <span className="line-through">{formatMoney(previousPrice)}</span>
      {` · Down ${formatMoney(drop)}`}
    </p>
  );
}

function Flag({ children, tone }: { children: string; tone: "navy" | "amber" }) {
  const className = tone === "amber" ? "bg-amber text-amber-ink" : "bg-navy text-white";
  return <span className={`inline-flex min-h-7 items-center px-2 text-xs font-semibold ${className}`}>{children}</span>;
}
