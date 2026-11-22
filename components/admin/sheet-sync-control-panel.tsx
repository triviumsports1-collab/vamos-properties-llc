"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SheetListingSync } from "@/components/admin/sheet-listing-sync";
import { FormNotice, Spinner } from "@/components/admin/status-form";
import { formatWhen } from "@/lib/admin/clock";
import { idleForm } from "@/lib/admin/schema";
import type { SheetSyncStatusView } from "@/lib/dal/sheet-sync-schedule";
import { readSheetSyncStatus, saveSheetSyncScheduleForm } from "@/lib/gdoc-listings/sync-schedule-actions";
import {
  MAX_SYNC_INTERVAL_MINUTES,
  MIN_SYNC_INTERVAL_MINUTES,
  schedulerLooksStale,
  syncIntervalLabel,
  syncIntervalPresets,
  syncTriggerLabel,
} from "@/lib/gdoc-listings/sync-schedule";

const FAST_POLL_MS = 4_000;
const SLOW_POLL_MS = 60_000;

const healthStyles = {
  idle: { label: "Idle", tone: "border-pine bg-mist text-pine" },
  syncing: { label: "Syncing", tone: "border-amber bg-amber text-amber-ink" },
  error: { label: "Error", tone: "border-navy bg-navy text-white" },
} as const;

export function SheetSyncControlPanel({
  initialStatus,
  sheetsReady,
  cronConfigured,
  nowIso,
}: {
  initialStatus: SheetSyncStatusView;
  sheetsReady: boolean;
  cronConfigured: boolean;
  nowIso: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [now, setNow] = useState(() => new Date(nowIso));
  const [state, action, pending] = useActionState(saveSheetSyncScheduleForm, idleForm);
  const [mode, setMode] = useState(initialStatus.mode);
  const isPreset = syncIntervalPresets.some((item) => item.minutes === initialStatus.intervalMinutes);
  const [interval, setIntervalChoice] = useState(isPreset ? String(initialStatus.intervalMinutes) : "custom");
  const initialCustom = customParts(initialStatus.intervalMinutes);

  // Live status: poll quickly while a copy runs, slowly otherwise. Refresh the page data when
  // a copy finishes so the inventory and the logs below update without a manual reload.
  useEffect(() => {
    let alive = true;
    const delay = status.health === "syncing" ? FAST_POLL_MS : SLOW_POLL_MS;
    const timer = window.setTimeout(async () => {
      try {
        const next = await readSheetSyncStatus();
        if (!alive) return;
        const finished = status.health === "syncing" && next.health !== "syncing";
        setStatus(next);
        setNow(new Date());
        if (finished) router.refresh();
      } catch {
        if (alive) setNow(new Date());
      }
    }, delay);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [status, router]);

  useEffect(() => {
    if (state.stamp && state.ok) router.refresh();
  }, [state.stamp, state.ok, router]);

  // Server data changed (after a save or refresh): adopt it.
  const [seen, setSeen] = useState(initialStatus);
  if (seen !== initialStatus) {
    setSeen(initialStatus);
    setStatus(initialStatus);
  }

  const health = healthStyles[status.health];
  const stale = schedulerLooksStale(
    status.lastTickAt ? new Date(status.lastTickAt) : null,
    { mode: status.mode, intervalMinutes: status.intervalMinutes },
    now,
  );

  return (
    <div className="grid gap-4">
      <section className="border border-line bg-panel p-5" aria-labelledby="sync-status-heading">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="sync-status-heading" className="text-lg font-semibold text-ink">
              Google Sheet sync
            </h2>
            <p className="mt-1 text-sm text-muted">
              {status.mode === "auto" ? `Automatic · ${syncIntervalLabel(status.intervalMinutes).toLowerCase()}` : "Manual only"}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span
              role="status"
              className={`inline-flex min-h-8 items-center gap-2 border px-2 text-xs font-semibold uppercase tracking-[0.08em] ${health.tone}`}
            >
              {status.health === "syncing" ? <Spinner label="Syncing" /> : health.label}
            </span>
            <SheetListingSync ready={sheetsReady} />
          </div>
        </div>
        <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Last synced" value={status.lastSyncedAt ? formatWhen(status.lastSyncedAt) : "Never"} hint={relative(status.lastSyncedAt, now)} />
          <Stat
            label="Next scheduled sync"
            value={
              status.mode !== "auto"
                ? "Not scheduled (manual)"
                : status.nextSyncAt
                  ? formatWhen(status.nextSyncAt)
                  : "On the next scheduler check"
            }
            hint={status.mode === "auto" ? relative(status.nextSyncAt, now) : ""}
          />
          <Stat
            label="Status"
            value={
              status.health === "syncing"
                ? `Copying now${status.runningTrigger ? ` (${syncTriggerLabel(status.runningTrigger).toLowerCase()})` : ""}`
                : status.health === "error"
                  ? "Last copy failed"
                  : "Idle"
            }
            hint={
              status.health === "syncing"
                ? `Started ${relative(status.syncingSince, now)}`
                : status.lastError
                  ? `${status.lastError.replaceAll("_", " ")}${status.consecutiveFailures > 1 ? ` · ${status.consecutiveFailures} failures in a row, retrying with backoff` : ""}`
                  : ""
            }
          />
          <Stat
            label="Scheduler"
            value={status.lastTickAt ? `Checked in ${formatWhen(status.lastTickAt)}` : "Not connected yet"}
            hint={status.lastTickAt ? relative(status.lastTickAt, now) : "See setup below"}
          />
        </dl>
        {stale ? (
          <p role="alert" className="mt-4 border border-amber bg-amber/10 px-3 py-2 text-sm text-ink">
            Automatic sync is on, but the scheduler has not checked in recently enough for “
            {syncIntervalLabel(status.intervalMinutes).toLowerCase()}”. Copies run only when the scheduler calls the
            site, so check the scheduler setup below. Sync now always works.
          </p>
        ) : null}
        {!sheetsReady ? (
          <p className="mt-4 text-sm text-muted">Google Sheets is not configured on this server, so no copy can run yet.</p>
        ) : null}
      </section>

      <section className="border border-line bg-panel p-5" aria-labelledby="sync-mode-heading">
        <h2 id="sync-mode-heading" className="text-lg font-semibold text-ink">
          Sync mode
        </h2>
        <form action={action} className="mt-4 grid gap-4" aria-busy={pending}>
          <FormNotice state={state} />
          <fieldset>
            <legend className="sr-only">Mode</legend>
            <div className="inline-flex border border-line bg-paper p-1" role="radiogroup">
              {(["manual", "auto"] as const).map((value) => (
                <label
                  key={value}
                  className={`inline-flex min-h-11 cursor-pointer items-center px-4 text-sm font-semibold ${
                    mode === value ? "bg-navy text-white" : "text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={value}
                    checked={mode === value}
                    onChange={() => setMode(value)}
                    className="sr-only"
                  />
                  {value === "manual" ? "Manual only" : "Automatic"}
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">
              {mode === "manual"
                ? "The sheet copies only when someone presses Sync now, or when the sheet pushes a change."
                : "The scheduler copies the sheet on the interval below. Sync now still works at any time and resets the timer."}
            </p>
          </fieldset>
          <div className={mode === "auto" ? "grid gap-3" : "grid gap-3 opacity-60"}>
            <label className="block text-sm text-ink" htmlFor="sync-interval">
              How often
            </label>
            <select
              id="sync-interval"
              name="interval"
              value={interval}
              onChange={(event) => setIntervalChoice(event.target.value)}
              className="min-h-12 w-full max-w-xs border border-line bg-paper px-3 text-base text-ink"
            >
              {syncIntervalPresets.map((item) => (
                <option key={item.minutes} value={String(item.minutes)}>
                  {item.label}
                </option>
              ))}
              <option value="custom">Custom…</option>
            </select>
            {interval === "custom" ? (
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label className="block text-sm text-ink" htmlFor="sync-custom-amount">
                    Every
                  </label>
                  <input
                    id="sync-custom-amount"
                    name="customAmount"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    defaultValue={initialCustom.amount}
                    className="mt-1 min-h-12 w-28 border border-line bg-paper px-3 text-base text-ink"
                  />
                </div>
                <select
                  name="customUnit"
                  aria-label="Unit"
                  defaultValue={initialCustom.unit}
                  className="min-h-12 border border-line bg-paper px-3 text-base text-ink"
                >
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                  <option value="days">days</option>
                </select>
                <p className="basis-full text-sm text-muted">
                  Between {MIN_SYNC_INTERVAL_MINUTES} minutes and {MAX_SYNC_INTERVAL_MINUTES / (24 * 60)} days.
                </p>
              </div>
            ) : null}
            {mode === "auto" && interval === "10" ? (
              <p className="text-sm text-muted">Every 10 minutes needs a scheduler that calls the site at least that often.</p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-60 sm:justify-self-start"
          >
            {pending ? <Spinner label="Saving…" /> : "Save sync settings"}
          </button>
          {status.updatedAt ? (
            <p className="text-xs text-muted">
              Last changed {formatWhen(status.updatedAt)}
              {status.updatedByEmail ? ` by ${status.updatedByEmail}` : ""}.
            </p>
          ) : null}
        </form>
      </section>

      <details className="border border-line bg-panel">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
          Scheduler setup
          <span className="font-normal text-muted">{cronConfigured ? "Secret set" : "CRON_SECRET missing"}</span>
        </summary>
        <div className="grid gap-3 border-t border-line px-4 py-4 text-sm leading-6 text-ink">
          <p>
            Automatic sync runs when a scheduler calls <code className="bg-mist px-1">/api/cron/sync-sheets</code> with the
            header <code className="bg-mist px-1">Authorization: Bearer &lt;CRON_SECRET&gt;</code>. Each call checks
            whether a copy is due, so calling it more often than the interval is safe. The same call also runs the
            listing expiry check.
          </p>
          <ul className="grid list-disc gap-1 pl-5">
            <li>Vercel Cron is set up in vercel.json for once a day, which works on every Vercel plan.</li>
            <li>For hourly or 10-minute syncs, add a scheduler that calls the URL every 10 minutes (Vercel Pro cron, or an external cron service).</li>
            <li>Set CRON_SECRET (16+ characters) in the hosting environment and in the scheduler.</li>
          </ul>
          {!cronConfigured ? (
            <p className="font-semibold">CRON_SECRET is not set on this server, so scheduled calls are refused.</p>
          ) : null}
        </div>
      </details>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-[0.08em] text-muted">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
      {hint ? <dd className="text-xs text-muted">{hint}</dd> : null}
    </div>
  );
}

function relative(iso: string | null, now: Date) {
  if (!iso) return "";
  const diff = new Date(iso).getTime() - now.getTime();
  const minutes = Math.round(Math.abs(diff) / 60_000);
  const text =
    minutes < 1
      ? "less than a minute"
      : minutes < 60
        ? `${minutes} min`
        : minutes < 48 * 60
          ? `${Math.round(minutes / 60)} h`
          : `${Math.round(minutes / (24 * 60))} days`;
  return diff >= 0 ? `in ${text}` : `${text} ago`;
}

function customParts(minutes: number) {
  if (minutes % (24 * 60) === 0) return { amount: minutes / (24 * 60), unit: "days" };
  if (minutes % 60 === 0) return { amount: minutes / 60, unit: "hours" };
  return { amount: minutes, unit: "minutes" };
}
