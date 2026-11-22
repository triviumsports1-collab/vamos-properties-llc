/**
 * Listing lifecycle rules shared by the admin desk, the sheet sync, the expiry sweep,
 * and the public queries. Pure functions only (safe for client components).
 *
 * Model:
 * - An Active home has an active window `activatedAt → expiresAt`. `expiresAt = null` with a
 *   set `activatedAt` means "no expiry" (an admin choice). `activatedAt = null` means the
 *   window was never started (legacy rows) and the home does not expire until it is.
 * - When the window ends the home becomes Inactive with `inactiveReason = "expired"`. Public
 *   queries hide it at once (query-time check) even before the sweep writes the status.
 * - `statusOverride` means an admin set the status by hand. The sheet sync never changes the
 *   status of an overridden or expired home; every other sheet field still updates.
 */

export const DEFAULT_EXPIRY_DAYS = 14;
export const DEFAULT_EXPIRING_SOON_DAYS = 3;
export const MIN_EXPIRY_DAYS = 1;
export const MAX_EXPIRY_DAYS = 365;
export const EXPIRY_DAY_PRESETS = [7, 14, 30, 60, 90] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export type InactiveReason = "expired" | "admin" | "sheet" | "left_sheet";

export const inactiveReasons: InactiveReason[] = ["expired", "admin", "sheet", "left_sheet"];

export type LifecycleSettings = {
  autoExpire: boolean;
  expiryDays: number;
  expiringSoonDays: number;
};

export const defaultLifecycleSettings: LifecycleSettings = {
  autoExpire: true,
  expiryDays: DEFAULT_EXPIRY_DAYS,
  expiringSoonDays: DEFAULT_EXPIRING_SOON_DAYS,
};

/** How long the new active window should run when a home is (re)activated. */
export type ActiveWindow = { kind: "default" } | { kind: "days"; days: number } | { kind: "never" };

export function addDays(from: Date, days: number) {
  return new Date(from.getTime() + days * DAY_MS);
}

export function clampExpiryDays(days: number) {
  if (!Number.isFinite(days)) return DEFAULT_EXPIRY_DAYS;
  return Math.min(MAX_EXPIRY_DAYS, Math.max(MIN_EXPIRY_DAYS, Math.round(days)));
}

/** Window start/end for a home activated at `now`. */
export function activeWindowFields(now: Date, window: ActiveWindow, settings: LifecycleSettings) {
  if (window.kind === "never") return { activatedAt: now, expiresAt: null };
  const days = window.kind === "days" ? clampExpiryDays(window.days) : settings.expiryDays;
  return { activatedAt: now, expiresAt: addDays(now, days) };
}

/** True when the active window has ended and auto-expiry is on. */
export function isPastExpiry(expiresAt: Date | null | undefined, settings: LifecycleSettings, now: Date) {
  return settings.autoExpire && expiresAt != null && expiresAt.getTime() <= now.getTime();
}

/** Whole days left in the window, rounded up (0 once it has ended). */
export function daysLeft(expiresAt: Date | string | null, now: Date) {
  if (!expiresAt) return null;
  const end = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / DAY_MS));
}

export function parseInactiveReason(value: string | null | undefined): InactiveReason | null {
  return inactiveReasons.includes(value as InactiveReason) ? (value as InactiveReason) : null;
}

/** Sync must not change the status of homes an admin locked or that expired. */
export function sheetStatusProtected(row: { statusOverride: boolean; inactiveReason: string | null }) {
  return row.statusOverride || row.inactiveReason === "expired";
}

export type LifecycleBadge = {
  key: "active" | "expiring" | "overdue" | "no_expiry" | "expired" | "admin" | "sheet" | "left_sheet" | "other";
  label: string;
  detail: string;
  tone: "good" | "warn" | "muted" | "strong";
};

/** One badge describing where the home is in its lifecycle, for the admin desk. */
export function lifecycleBadge(
  row: {
    status: string;
    removed: boolean;
    expiresAt: string | null;
    activatedAt: string | null;
    inactiveReason: string | null;
    statusOverride: boolean;
  },
  settings: LifecycleSettings,
  now: Date,
): LifecycleBadge {
  const lock = row.statusOverride ? " · locked by desk" : "";
  if (row.status === "active" && !row.removed) {
    if (!row.expiresAt) {
      return row.activatedAt
        ? { key: "no_expiry", label: "Active", detail: `No expiry${lock}`, tone: "good" }
        : { key: "no_expiry", label: "Active", detail: `Window not started${lock}`, tone: "good" };
    }
    const end = new Date(row.expiresAt);
    if (!settings.autoExpire) {
      return { key: "active", label: "Active", detail: `Auto-expiry off${lock}`, tone: "good" };
    }
    if (end.getTime() <= now.getTime()) {
      return { key: "overdue", label: "Expired", detail: "Hidden from the public; run the expiry check", tone: "warn" };
    }
    const left = daysLeft(end, now) ?? 0;
    const dayText = left === 1 ? "1 day left" : `${left} days left`;
    if (left <= settings.expiringSoonDays) {
      return { key: "expiring", label: "Expiring soon", detail: `${dayText}${lock}`, tone: "warn" };
    }
    return { key: "active", label: "Active", detail: `${dayText}${lock}`, tone: "good" };
  }
  if (row.status === "sold") return { key: "other", label: "Sold", detail: lock.slice(3), tone: "strong" };
  if (row.status === "under_contract") {
    return { key: "other", label: "Under contract", detail: lock.slice(3), tone: "warn" };
  }
  const reason = parseInactiveReason(row.inactiveReason);
  if (reason === "expired") return { key: "expired", label: "Inactive · Expired", detail: "Renew to show it again", tone: "muted" };
  if (reason === "admin") return { key: "admin", label: "Inactive · Manual", detail: "Turned off on this desk", tone: "muted" };
  if (reason === "left_sheet") return { key: "left_sheet", label: "Inactive · Left sheet", detail: "No longer in the Google Sheet", tone: "muted" };
  if (reason === "sheet") return { key: "sheet", label: "Inactive · Sheet", detail: "Marked inactive in the Google Sheet", tone: "muted" };
  return { key: "other", label: "Inactive", detail: lock.slice(3), tone: "muted" };
}

export function statusEventLabel(event: { action: string; actorEmail: string; reason: string | null }) {
  const who = event.actorEmail || "Admin";
  switch (event.action) {
    case "expired":
      return event.actorEmail === "cron" ? "Expired automatically (daily check)" : `Expired (${who === "sheet-sync" ? "sheet copy" : who})`;
    case "activated":
      return `${who} set Active`;
    case "renewed":
      return `${who} renewed the active window`;
    case "deactivated":
      return `${who} set Inactive`;
    case "released":
      return `${who} let the Google Sheet control status again`;
    case "sheet_activated":
      return "Sheet copy set Active and started a new window";
    case "window_recomputed":
      return `${who} changed the default expiry`;
    case "window_started":
      return "Active window started";
    default:
      return `${who}: ${event.action.replaceAll("_", " ")}`;
  }
}
