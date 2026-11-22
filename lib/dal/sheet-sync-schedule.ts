import "server-only";

import {
  addMinutes,
  clampSyncInterval,
  defaultSheetSyncSettings,
  nextSlotAfter,
  parseSyncMode,
  retryAfterFailure,
  SCHEDULE_GRACE_MS,
  type SheetSyncMode,
  type SheetSyncSettings,
} from "@/lib/gdoc-listings/sync-schedule";
import { SYNC_LOCK_STALE_MS } from "@/lib/dal/sheet-listings";
import { getDb } from "@/src/prisma/db";

const SETTINGS_ID = 1;
const BUSY_RETRY_MINUTES = 2;

export type SheetSyncScheduleState = SheetSyncSettings & {
  nextSyncAt: Date | null;
  consecutiveFailures: number;
  lastAutoRunAt: Date | null;
  lastTickAt: Date | null;
  updatedAt: Date | null;
  updatedByEmail: string;
};

async function ensureRow() {
  return getDb().sheetSyncSetting.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, mode: defaultSheetSyncSettings.mode, intervalMinutes: defaultSheetSyncSettings.intervalMinutes },
    update: {},
  });
}

export async function getSheetSyncSchedule(): Promise<SheetSyncScheduleState> {
  const row = await getDb().sheetSyncSetting.findUnique({ where: { id: SETTINGS_ID } });
  if (!row) {
    return {
      ...defaultSheetSyncSettings,
      nextSyncAt: null,
      consecutiveFailures: 0,
      lastAutoRunAt: null,
      lastTickAt: null,
      updatedAt: null,
      updatedByEmail: "",
    };
  }
  return {
    mode: parseSyncMode(row.mode),
    intervalMinutes: clampSyncInterval(row.intervalMinutes),
    nextSyncAt: row.nextSyncAt,
    consecutiveFailures: row.consecutiveFailures,
    lastAutoRunAt: row.lastAutoRunAt,
    lastTickAt: row.lastTickAt,
    updatedAt: row.updatedAt,
    updatedByEmail: row.updatedByEmail ?? "",
  };
}

async function lastSuccessfulSyncAt() {
  const run = await getDb().sheetSyncRun.findFirst({
    where: { status: "ok" },
    orderBy: { startedAt: "desc" },
    select: { finishedAt: true, startedAt: true },
  });
  return run ? (run.finishedAt ?? run.startedAt) : null;
}

/**
 * Saves mode + interval. Turning auto on (or changing the interval) schedules the next run
 * one interval after the last good copy, or on the next tick when that time already passed.
 */
export async function saveSheetSyncSchedule(input: { mode: SheetSyncMode; intervalMinutes: number; actorEmail: string }) {
  const now = new Date();
  const intervalMinutes = clampSyncInterval(input.intervalMinutes);
  let nextSyncAt: Date | null = null;
  if (input.mode === "auto") {
    const lastOk = await lastSuccessfulSyncAt();
    const fromLast = lastOk ? addMinutes(lastOk, intervalMinutes) : now;
    nextSyncAt = fromLast.getTime() > now.getTime() ? fromLast : now;
  }
  await getDb().sheetSyncSetting.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, mode: input.mode, intervalMinutes, nextSyncAt, updatedByEmail: input.actorEmail },
    update: { mode: input.mode, intervalMinutes, nextSyncAt, consecutiveFailures: 0, updatedByEmail: input.actorEmail },
  });
  return { nextSyncAt };
}

/** Heartbeat so the desk can tell whether a scheduler is actually calling the endpoint. */
export async function recordSchedulerTick(now: Date) {
  await ensureRow();
  await getDb().sheetSyncSetting.update({ where: { id: SETTINGS_ID }, data: { lastTickAt: now } });
}

/**
 * Atomically claims the due auto-sync slot. Optimistic concurrency on `nextSyncAt`: of two
 * overlapping ticks, only the one whose conditional update matches wins; the other sees
 * count 0 and skips. Moving `nextSyncAt` forward at claim time also means a crash mid-run
 * cannot cause a tight retry loop.
 */
export async function claimDueSyncSlot(now: Date): Promise<{ claimed: true; scheduledFor: Date | null } | { claimed: false; reason: "manual" | "not_due" | "raced"; nextSyncAt: Date | null }> {
  const state = await getSheetSyncSchedule();
  if (state.mode !== "auto") return { claimed: false, reason: "manual", nextSyncAt: null };
  const due = !state.nextSyncAt || state.nextSyncAt.getTime() - SCHEDULE_GRACE_MS <= now.getTime();
  if (!due) return { claimed: false, reason: "not_due", nextSyncAt: state.nextSyncAt };
  const next = nextSlotAfter(state.nextSyncAt, state.intervalMinutes, now);
  const result = await getDb().sheetSyncSetting.updateMany({
    where: { id: SETTINGS_ID, mode: "auto", nextSyncAt: state.nextSyncAt },
    data: { nextSyncAt: next, lastAutoRunAt: now },
  });
  if (result.count !== 1) return { claimed: false, reason: "raced", nextSyncAt: state.nextSyncAt };
  return { claimed: true, scheduledFor: state.nextSyncAt };
}

/** Bookkeeping after a claimed auto run. */
export async function recordAutoSyncResult(outcome: "ok" | "busy" | "failed", now: Date) {
  const state = await getSheetSyncSchedule();
  if (outcome === "ok") {
    await getDb().sheetSyncSetting.update({ where: { id: SETTINGS_ID }, data: { consecutiveFailures: 0 } });
    return;
  }
  if (outcome === "busy") {
    // Another copy (usually a manual one) holds the lock; it will reschedule on success.
    await getDb().sheetSyncSetting.update({
      where: { id: SETTINGS_ID },
      data: { nextSyncAt: addMinutes(now, BUSY_RETRY_MINUTES) },
    });
    return;
  }
  const failures = state.consecutiveFailures + 1;
  await getDb().sheetSyncSetting.update({
    where: { id: SETTINGS_ID },
    data: { consecutiveFailures: failures, nextSyncAt: retryAfterFailure(failures, state.intervalMinutes, now) },
  });
}

/** Any good copy (manual, webhook) pushes the next auto run a full interval out. */
export async function rescheduleAfterSuccessfulSync(now: Date) {
  const state = await getSheetSyncSchedule();
  if (state.mode !== "auto") return;
  await getDb().sheetSyncSetting.update({
    where: { id: SETTINGS_ID },
    data: { nextSyncAt: addMinutes(now, state.intervalMinutes), consecutiveFailures: 0 },
  });
}

export type SheetSyncStatusView = {
  mode: SheetSyncMode;
  intervalMinutes: number;
  health: "idle" | "syncing" | "error";
  syncingSince: string | null;
  runningTrigger: string | null;
  lastSyncedAt: string | null;
  lastAttemptAt: string | null;
  lastError: string | null;
  nextSyncAt: string | null;
  consecutiveFailures: number;
  lastTickAt: string | null;
  updatedAt: string | null;
  updatedByEmail: string;
};

/** Live snapshot for the desk's sync panel (polled while a copy runs). */
export async function getSheetSyncStatus(): Promise<SheetSyncStatusView> {
  const db = getDb();
  const now = Date.now();
  const [state, lock, lastRun, lastOk] = await Promise.all([
    getSheetSyncSchedule(),
    db.sheetSyncLock.findUnique({ where: { id: 1 } }),
    db.sheetSyncRun.findFirst({
      where: { status: { not: "running" } },
      orderBy: { startedAt: "desc" },
      select: { status: true, error: true, startedAt: true, finishedAt: true },
    }),
    db.sheetSyncRun.findFirst({
      where: { status: "ok" },
      orderBy: { startedAt: "desc" },
      select: { startedAt: true, finishedAt: true },
    }),
  ]);
  const lockFresh = Boolean(lock?.holder && lock.lockedAt && now - lock.lockedAt.getTime() < SYNC_LOCK_STALE_MS);
  const running = lockFresh
    ? await db.sheetSyncRun.findFirst({
        where: { errorId: lock!.holder!, status: "running" },
        select: { trigger: true, startedAt: true },
      })
    : null;
  const failed = lastRun != null && lastRun.status === "failed";
  return {
    mode: state.mode,
    intervalMinutes: state.intervalMinutes,
    health: lockFresh ? "syncing" : failed ? "error" : "idle",
    syncingSince: lockFresh ? (running?.startedAt ?? lock!.lockedAt!).toISOString() : null,
    runningTrigger: running?.trigger ?? null,
    lastSyncedAt: lastOk ? (lastOk.finishedAt ?? lastOk.startedAt).toISOString() : null,
    lastAttemptAt: lastRun ? (lastRun.finishedAt ?? lastRun.startedAt).toISOString() : null,
    lastError: failed ? (lastRun.error ?? "sync_failed") : null,
    nextSyncAt: state.mode === "auto" ? (state.nextSyncAt?.toISOString() ?? null) : null,
    consecutiveFailures: state.consecutiveFailures,
    lastTickAt: state.lastTickAt?.toISOString() ?? null,
    updatedAt: state.updatedAt?.toISOString() ?? null,
    updatedByEmail: state.updatedByEmail,
  };
}
