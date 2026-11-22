import { formatWhen } from "@/lib/admin/clock";
import { sheetSyncEventLabel, sheetSyncRunLabel, sheetSyncTriggerLabel } from "@/lib/gdoc-listings/display";
import type { SheetSyncRunView } from "@/lib/gdoc-listings/types";

const errorLabels: Record<string, string> = {
  busy: "another copy was already running",
  empty_sheet: "sheet came back empty; homes left alone",
  rate_limited: "Google asked us to wait",
  abandoned: "stopped before finishing",
  missing_credentials: "Google Sheets not configured",
  google_auth: "Google sign-in failed",
  google_not_found: "sheet not found",
  google_timeout: "Google Sheets timed out",
  google_failed: "Google Sheets error",
  sync_failed: "copy failed",
};

function errorText(code: string) {
  return errorLabels[code] ?? code.replaceAll("_", " ");
}

function duration(ms: number | null) {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`;
}

export function SheetSyncHistory({
  runs,
  title = "Recent copies",
  defaultOpen = false,
}: {
  runs: SheetSyncRunView[];
  title?: string;
  defaultOpen?: boolean;
}) {
  if (runs.length === 0) return null;
  const latest = runs[0];

  return (
    <details className="border border-line bg-panel" open={defaultOpen}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm text-ink [&::-webkit-details-marker]:hidden">
        <span className="font-semibold">{title}</span>
        <span className="text-muted">
          {sheetSyncRunLabel(latest.status)} · {formatWhen(latest.startedAt)}
        </span>
      </summary>
      <div className="overflow-x-auto border-t border-line px-4 py-3 touch-scroll">
        <table className="w-full min-w-[48rem] text-left text-sm text-ink">
          <thead>
            <tr className="text-muted">
              <th className="py-2 pr-3 font-medium">When</th>
              <th className="py-2 pr-3 font-medium">Trigger</th>
              <th className="py-2 pr-3 font-medium">Result</th>
              <th className="py-2 pr-3 font-medium">Rows</th>
              <th className="py-2 pr-3 font-medium">Changes</th>
              <th className="py-2 pr-3 font-medium">Skipped</th>
              <th className="py-2 pr-3 font-medium">Time</th>
              <th className="py-2 font-medium">Trace</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => {
              const skipped = Object.values(run.skipped).reduce((sum, count) => sum + count, 0);
              return (
                <tr key={run.errorId} className="border-t border-line align-top">
                  <td className="py-2 pr-3 whitespace-nowrap">{formatWhen(run.startedAt)}</td>
                  <td className="py-2 pr-3">
                    {sheetSyncTriggerLabel(run.trigger)}
                    {run.actorEmail ? <span className="block text-xs text-muted">{run.actorEmail}</span> : null}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={
                        run.status === "failed" ? "font-semibold text-ink" : run.status === "ok" ? "text-pine" : "text-muted"
                      }
                    >
                      {run.status === "ok" ? "Success" : sheetSyncRunLabel(run.status)}
                    </span>
                    {run.error ? <span className="block text-xs text-muted">{errorText(run.error)}</span> : null}
                  </td>
                  <td className="py-2 pr-3">{run.status === "ok" ? `${run.rows} read · ${run.uniqueCount} homes` : "—"}</td>
                  <td className="py-2 pr-3">
                    {run.status === "ok"
                      ? `${run.createdCount} new, ${run.updatedCount} updated, ${run.unchangedCount} same, ${run.heldCount} kept, ${run.inactivatedCount} off page`
                      : "—"}
                  </td>
                  <td className="py-2 pr-3">{run.status === "ok" ? skipped : "—"}</td>
                  <td className="py-2 pr-3">{duration(run.durationMs)}</td>
                  <td className="py-2 font-mono text-xs text-muted">{run.errorId.slice(0, 8)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {latest.events.length ? (
          <ul className="mt-3 grid gap-1 text-sm text-muted">
            {latest.events.slice(0, 6).map((event, index) => (
              <li key={`${event.createdAt}-${index}`}>
                {sheetSyncEventLabel(event.action, event.reason)}
                {event.listingCode ? ` · ${event.listingCode}` : event.slug ? ` · ${event.slug}` : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
}
