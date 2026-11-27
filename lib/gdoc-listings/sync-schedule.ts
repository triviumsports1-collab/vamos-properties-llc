/**
 * Google Sheets sync schedule rules. Pure functions (safe for client components).
 *
 * The scheduler endpoint is hit on a fixed cadence (e.g. every 10 minutes) by an external
 * trigger. Each hit is a "tick": the endpoint runs a sync only when the configured interval
 * has elapsed, so the tick cadence and the sync interval are independent.
 */

export type SheetSyncMode = "manual" | "auto";

export const MIN_SYNC_INTERVAL_MINUTES = 10;
/** Minutes without a scheduler heartbeat before the admin desk reports the cron as stale. */
export const SCHEDULER_TICK_ALLOWANCE_MINUTES = 45;
export const MAX_SYNC_INTERVAL_MINUTES = 30 * 24 * 60;
export const DEFAULT_SYNC_INTERVAL_MINUTES = 60;

/** A tick that lands this close before the due time still runs, so cadence jitter never skips a slot. */
export const SCHEDULE_GRACE_MS = 90_000;

/** Retries after a failure: 5, 10, 20 … minutes, never later than the interval or 6 hours. */
const BACKOFF_BASE_MINUTES = 5;
const BACKOFF_CAP_MINUTES = 6 * 60;

export const syncIntervalPresets = [
  { minutes: 10, label: "Every 10 minutes" },
  { minutes: 60, label: "Every hour" },
  { minutes: 12 * 60, label: "Every 12 hours" },
  { minutes: 24 * 60, label: "Every day" },
  { minutes: 2 * 24 * 60, label: "Every 2 days" },
  { minutes: 30 * 24 * 60, label: "Every month (30 days)" },
] as const;

export type SheetSyncSettings = {
  mode: SheetSyncMode;
  intervalMinutes: number;
};

export const defaultSheetSyncSettings: SheetSyncSettings = {
  mode: "manual",
  intervalMinutes: DEFAULT_SYNC_INTERVAL_MINUTES,
};

export function parseSyncMode(value: string | null | undefined): SheetSyncMode {
  return value === "auto" ? "auto" : "manual";
}

export function clampSyncInterval(minutes: number) {
  if (!Number.isFinite(minutes)) return DEFAULT_SYNC_INTERVAL_MINUTES;
  return Math.min(MAX_SYNC_INTERVAL_MINUTES, Math.max(MIN_SYNC_INTERVAL_MINUTES, Math.round(minutes)));
}

export function addMinutes(from: Date, minutes: number) {
  return new Date(from.getTime() + minutes * 60_000);
}

/** True when an auto sync should start on a tick at `now`. */
export function syncIsDue(settings: SheetSyncSettings, nextSyncAt: Date | null, now: Date) {
  if (settings.mode !== "auto") return false;
  if (!nextSyncAt) return true;
  return nextSyncAt.getTime() - SCHEDULE_GRACE_MS <= now.getTime();
}

/**
 * Next slot after a run that was due at `scheduledFor`. Anchored to the schedule (no drift);
 * if the scheduler was down long enough to miss slots, start over from `now`.
 */
export function nextSlotAfter(scheduledFor: Date | null, intervalMinutes: number, now: Date) {
  const interval = clampSyncInterval(intervalMinutes);
  if (scheduledFor) {
    const anchored = addMinutes(scheduledFor, interval);
    if (anchored.getTime() > now.getTime() + SCHEDULE_GRACE_MS) return anchored;
  }
  return addMinutes(now, interval);
}

/** When to retry after `failures` consecutive failed auto runs. */
export function retryAfterFailure(failures: number, intervalMinutes: number, now: Date) {
  const step = BACKOFF_BASE_MINUTES * 2 ** Math.max(0, Math.min(10, failures - 1));
  return addMinutes(now, Math.min(step, BACKOFF_CAP_MINUTES, clampSyncInterval(intervalMinutes)));
}

export function syncIntervalLabel(minutes: number) {
  const preset = syncIntervalPresets.find((item) => item.minutes === minutes);
  if (preset) return preset.label;
  if (minutes % (24 * 60) === 0) return `Every ${minutes / (24 * 60)} days`;
  if (minutes % 60 === 0) return `Every ${minutes / 60} hours`;
  return `Every ${minutes} minutes`;
}

export function syncTriggerLabel(trigger: string) {
  if (trigger === "admin") return "Manual";
  if (trigger === "auto") return "Scheduled";
  return "Sheet push";
}

export type SheetSyncHealth = "idle" | "syncing" | "error";

/**
 * True when auto mode has not seen a scheduler tick for longer than the interval allows,
 * i.e. syncs are not actually running as often as the admin asked (cron not wired, or the
 * trigger runs less often than the interval, such as a once-a-day cron with a 10-minute interval).
 */
export function schedulerLooksStale(lastTickAt: Date | null, settings: SheetSyncSettings, now: Date) {
  if (settings.mode !== "auto") return false;
  if (!lastTickAt) return true;
  // Every scheduler tick writes the heartbeat, whatever the sync interval. Vercel Schedules
  // fire every 15 min with up to 15 min jitter, so 3 missed windows (45 min) means it is down.
  const allowance = SCHEDULER_TICK_ALLOWANCE_MINUTES;
  return now.getTime() - lastTickAt.getTime() > allowance * 60_000;
}
