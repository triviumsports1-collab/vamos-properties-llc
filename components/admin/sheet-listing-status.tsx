import { sheetListingStatusLabel } from "@/lib/gdoc-listings/display";

export function SheetListingStatusBadge({ status, removed }: { status: string; removed: boolean }) {
  const label = sheetListingStatusLabel(status, removed);
  const tone =
    removed || status === "inactive"
      ? "border-line bg-mist text-muted"
      : status === "sold"
        ? "border-navy bg-navy text-white"
        : status === "under_contract"
          ? "border-amber bg-amber text-amber-ink"
          : "border-pine bg-mist text-pine";
  return (
    <span className={`inline-flex min-h-8 items-center border px-2 text-xs font-semibold uppercase tracking-[0.08em] ${tone}`}>
      {label}
    </span>
  );
}
