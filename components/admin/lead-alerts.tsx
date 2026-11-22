"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormNotice, Spinner } from "@/components/admin/status-form";
import { formatWhen } from "@/lib/admin/clock";
import { idleForm } from "@/lib/admin/schema";
import { retryLeadAlertForm } from "@/lib/notifications/alert-actions";
import type { LeadAlertView } from "@/lib/notifications/lead-alerts";

const statusStyles: Record<string, string> = {
  sent: "border-pine bg-mist text-pine",
  failed: "border-navy bg-navy text-white",
  pending: "border-amber bg-amber text-amber-ink",
  sending: "border-amber bg-amber text-amber-ink",
  skipped: "border-line bg-mist text-muted",
};

const errorText: Record<string, string> = {
  not_configured: "Resend is not configured on this server",
  timeout: "provider timed out",
  network: "could not reach Resend",
};

/** Founder email status on the lead page, with a retry when it did not go out. */
export function LeadAlertList({ alerts }: { alerts: LeadAlertView[] }) {
  if (alerts.length === 0) {
    return <p className="mt-3 text-sm text-muted">No email alert was recorded for this lead (it came in before alerts were tracked).</p>;
  }
  return (
    <ul className="mt-3 grid gap-3">
      {alerts.map((alert) => (
        <li key={alert.id} className="border-t border-line pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">
              {alert.channelName} <span className="font-normal text-muted">→ {alert.target}</span>
            </p>
            <span
              className={`inline-flex min-h-7 items-center border px-2 text-xs font-semibold uppercase tracking-[0.08em] ${statusStyles[alert.status] ?? statusStyles.skipped}`}
            >
              {alert.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {alert.sentAt
              ? `Sent ${formatWhen(alert.sentAt)}`
              : alert.lastAttemptAt
                ? `Last try ${formatWhen(alert.lastAttemptAt)}`
                : "Not tried yet"}
            {alert.attempts > 1 ? ` · ${alert.attempts} attempts` : ""}
            {alert.error ? ` · ${errorText[alert.error] ?? alert.error.replaceAll("_", " ")}` : ""}
          </p>
          {alert.status !== "sent" && alert.status !== "sending" ? <RetryButton id={alert.id} /> : null}
        </li>
      ))}
    </ul>
  );
}

function RetryButton({ id }: { id: number }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(retryLeadAlertForm, idleForm);
  useEffect(() => {
    if (state.stamp) router.refresh();
  }, [state.stamp, router]);
  return (
    <form action={action} className="mt-2" aria-busy={pending}>
      <input type="hidden" name="notificationId" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-10 items-center gap-2 border border-line bg-paper px-3 text-sm text-ink disabled:opacity-60"
      >
        {pending ? <Spinner label="Sending…" /> : "Retry now"}
      </button>
      <FormNotice state={state} />
    </form>
  );
}
