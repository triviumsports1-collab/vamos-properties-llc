import { connection } from "next/server";
import { cronAuthorized, cronSecret } from "@/lib/cron/auth";
import { expireOverdueListings } from "@/lib/dal/listing-lifecycle";
import { claimDueSyncSlot, recordAutoSyncResult, recordSchedulerTick } from "@/lib/dal/sheet-sync-schedule";
import { refreshSheetListingViews } from "@/lib/gdoc-listings/cache";
import { sheetSyncErrorCode } from "@/lib/gdoc-listings/errors";
import { googleSheetsConfigured } from "@/lib/gdoc-listings/google";
import { syncSheetListings } from "@/lib/gdoc-listings/sync";
import { retryDueLeadAlerts } from "@/lib/notifications/lead-alerts";

export const maxDuration = 60;

/**
 * Scheduler tick. Call it on a fixed cadence (every 10 minutes is ideal) with
 * `Authorization: Bearer $CRON_SECRET`; it is safe to call as often as you like.
 *
 * Each tick:
 * 1. Records a heartbeat (the desk shows whether the scheduler is wired).
 * 2. Runs the listing expiry sweep and retries lead alerts that did not go out (idempotent).
 * 3. If sync mode is Automatic and the interval has elapsed, atomically claims the slot and
 *    runs the same sync as the desk button. Overlap with a manual copy is prevented by the
 *    DB sync lock; overlapping ticks are prevented by the slot claim.
 */
async function tick(request: Request) {
  await connection();
  if (!cronSecret()) return Response.json({ ok: false, message: "Cron is not configured." }, { status: 503 });
  if (!cronAuthorized(request)) return Response.json({ ok: false, message: "Unauthorized." }, { status: 401 });

  const now = new Date();
  try {
    await recordSchedulerTick(now);
  } catch (error) {
    log("tick_failed", { name: errorName(error) });
    return Response.json({ ok: false, message: "Scheduler could not reach the database." }, { status: 500 });
  }

  let expired = 0;
  try {
    const sweep = await expireOverdueListings("cron", now);
    expired = sweep.expired;
    if (sweep.expired > 0) refreshSheetListingViews(sweep.slugs, { expireNow: true });
  } catch (error) {
    // A failed sweep must not block the sync; public pages still hide overdue homes at query time.
    log("expiry_failed", { name: errorName(error) });
  }

  let alerts: { checked: number; sent: number; failed: number } | null = null;
  try {
    alerts = await retryDueLeadAlerts();
  } catch (error) {
    log("alerts_failed", { name: errorName(error) });
  }

  if (!googleSheetsConfigured()) {
    return Response.json({ ok: true, expired, alerts, sync: { ran: false, reason: "sheets_not_configured" } });
  }

  const slot = await claimDueSyncSlot(now);
  if (!slot.claimed) {
    return Response.json({
      ok: true,
      expired,
      alerts,
      sync: { ran: false, reason: slot.reason, nextSyncAt: slot.nextSyncAt?.toISOString() ?? null },
    });
  }

  try {
    const result = await syncSheetListings("auto");
    await recordAutoSyncResult("ok", new Date());
    log("synced", { errorId: result.errorId, created: result.created, updated: result.updated, held: result.held });
    return Response.json({
      ok: true,
      expired,
      sync: {
        ran: true,
        errorId: result.errorId,
        created: result.created,
        updated: result.updated,
        unchanged: result.unchanged,
        held: result.held,
        inactivated: result.inactivated,
      },
    });
  } catch (error) {
    const code = sheetSyncErrorCode(error) || "sync_failed";
    const outcome = code === "busy" ? "busy" : "failed";
    await recordAutoSyncResult(outcome, new Date()).catch(() => undefined);
    log("sync_not_run", { code });
    // 200 for "busy": the scheduler did its job; the copy simply runs on a later tick.
    return Response.json(
      { ok: outcome === "busy", expired, sync: { ran: false, reason: code } },
      { status: outcome === "busy" ? 200 : 502 },
    );
  }
}

function log(event: string, details: Record<string, unknown>) {
  const line = { event, ...details };
  if (event.endsWith("failed") || event === "sync_not_run") console.error("[SHEET_SYNC_SCHEDULER]", line);
  else console.log("[SHEET_SYNC_SCHEDULER]", line);
}

function errorName(error: unknown) {
  return error instanceof Error ? error.name : "Error";
}

export function GET(request: Request) {
  return tick(request);
}

export function POST(request: Request) {
  return tick(request);
}
