import { sheetListingStatusLabel } from "@/lib/gdoc-listings/display";
import { lifecycleBadge, type LifecycleBadge, type LifecycleSettings } from "@/lib/gdoc-listings/lifecycle";
import type { SheetListingAdminRow } from "@/lib/gdoc-listings/types";

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

const lifecycleTones: Record<LifecycleBadge["tone"], string> = {
  good: "border-pine bg-mist text-pine",
  warn: "border-amber bg-amber text-amber-ink",
  muted: "border-line bg-mist text-muted",
  strong: "border-navy bg-navy text-white",
};

/** Status plus where the home is in its active window (days left, expired, manual, …). */
export function SheetListingLifecycleBadge({
  listing,
  settings,
  nowIso,
  showDetail = true,
}: {
  listing: Pick<SheetListingAdminRow, "status" | "removed" | "expiresAt" | "activatedAt" | "inactiveReason" | "statusOverride">;
  settings: LifecycleSettings;
  nowIso: string;
  showDetail?: boolean;
}) {
  const badge = lifecycleBadge(listing, settings, new Date(nowIso));
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <span
        className={`inline-flex min-h-8 items-center border px-2 text-xs font-semibold uppercase tracking-[0.08em] ${lifecycleTones[badge.tone]}`}
      >
        {badge.label}
      </span>
      {showDetail && badge.detail ? <span className="text-xs text-muted">{badge.detail}</span> : null}
    </span>
  );
}
