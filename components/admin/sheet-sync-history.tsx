import { formatWhen } from "@/lib/admin/clock";
import { sheetSyncEventLabel, sheetSyncRunLabel, sheetSyncTriggerLabel } from "@/lib/gdoc-listings/display";
import type { SheetSyncRunView } from "@/lib/gdoc-listings/types";

export function SheetSyncHistory({ runs }: { runs: SheetSyncRunView[] }) {
  if (runs.length === 0) return null;
  const latest = runs[0];

  return (
    <details className="border border-line bg-panel">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm text-ink [&::-webkit-details-marker]:hidden">
        <span className="font-semibold">Recent copies</span>
        <span className="text-muted">
          {sheetSyncRunLabel(latest.status)} · {formatWhen(latest.startedAt)}
        </span>
      </summary>
      <div className="overflow-x-auto border-t border-line px-4 py-3 touch-scroll">
        <table className="w-full min-w-[36rem] text-left text-sm text-ink">
          <thead>
            <tr className="text-muted">
              <th className="py-2 pr-3 font-medium">When</th>
              <th className="py-2 pr-3 font-medium">Source</th>
              <th className="py-2 pr-3 font-medium">Result</th>
              <th className="py-2 pr-3 font-medium">Changes</th>
              <th className="py-2 font-medium">Trace</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.errorId} className="border-t border-line">
                <td className="py-2 pr-3">{formatWhen(run.startedAt)}</td>
                <td className="py-2 pr-3">{sheetSyncTriggerLabel(run.trigger)}</td>
                <td className="py-2 pr-3">
                  {sheetSyncRunLabel(run.status)}
                  {run.error ? ` · ${run.error.replaceAll("_", " ")}` : ""}
                </td>
                <td className="py-2 pr-3">
                  {run.status === "ok"
                    ? `${run.createdCount} new, ${run.updatedCount} updated, ${run.inactivatedCount} off page`
                    : "—"}
                </td>
                <td className="py-2 font-mono text-xs text-muted">{run.errorId.slice(0, 8)}</td>
              </tr>
            ))}
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
