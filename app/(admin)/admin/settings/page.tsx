import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { resendReady } from "@/lib/admin/mail";
import { requireAdmin } from "@/lib/admin/auth";
import { site } from "@/lib/site";
import { leadAlertConfig, leadAlertStats } from "@/lib/notifications/lead-alerts";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-base text-muted">Loading settings…</p>}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  const actor = await requireAdmin();
  const emailReady = resendReady();
  const alertConfig = leadAlertConfig();
  const stats = await leadAlertStats();

  return (
    <AdminShell current="/admin/settings">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-semibold text-ink">Settings</h1>
        <dl className="mt-8 grid gap-4 border border-line bg-panel p-5">
          <div>
            <dt className="text-sm text-muted">Signed in</dt>
            <dd className="mt-1 text-base text-ink">
              {actor.name} · {actor.email}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Role</dt>
            <dd className="mt-1 text-base text-ink">{actor.role === "owner" ? "Owner" : "Staff"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Public phone</dt>
            <dd className="mt-1 text-base text-ink">{site.jaimePhoneDisplay}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Public emails</dt>
            <dd className="mt-1 text-base text-ink">
              {site.email}
              <span className="text-muted"> · </span>
              {site.patrickEmail}
              <span className="text-muted"> · </span>
              {site.jaimeEmail}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Desk hours</dt>
            <dd className="mt-1 text-base text-ink">{site.hours}. First reply target is 5 minutes during 8:00 a.m. to 7:00 p.m. Phoenix time.</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Seller email</dt>
            <dd className="mt-1 text-base text-ink">
              {emailReady
                ? "Resend is configured. Follow-ups from a lead can send."
                : "Resend is not configured. Follow-ups are saved on the lead and are not sent."}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Public inventory</dt>
            <dd className="mt-1 text-base text-ink">The public catalog is /properties. The seller header and footer link there.</dd>
          </div>
        </dl>

        <section className="mt-8 border border-line bg-panel p-5" aria-labelledby="leads-heading">
          <h2 id="leads-heading" className="text-lg font-semibold text-ink">
            Lead notifications
          </h2>
          <dl className="mt-4 grid gap-4">
            <div>
              <dt className="text-sm text-muted">Founder email on every lead (Resend)</dt>
              <dd className="mt-1 text-base text-ink">
                <span className="font-semibold">
                  {alertConfig.email
                    ? `On. To ${alertConfig.emailTargets}.`
                    : "Off. Set RESEND_API_KEY, RESEND_FROM, and LEAD_NOTIFY_EMAIL. Leads are still saved here."}
                </span>
                <span className="block text-sm text-muted">
                  Last 7 days: {stats.sent ?? 0} sent
                  {stats.failed ? `, ${stats.failed} failed` : ""}
                  {(stats.pending ?? 0) + (stats.sending ?? 0) ? `, ${(stats.pending ?? 0) + (stats.sending ?? 0)} waiting` : ""}.
                  Emails that do not go out are retried automatically and from the lead page.
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Texts from visitors</dt>
              <dd className="mt-1 text-base text-ink">
                The site&rsquo;s Text buttons open the visitor&rsquo;s messaging app addressed to {site.phoneDisplay}. Texts
                arrive in Google Voice.
              </dd>
            </div>
          </dl>
        </section>
      </main>
    </AdminShell>
  );
}
