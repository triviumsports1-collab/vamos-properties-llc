import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AssignForm } from "@/components/admin/assign-form";
import { LeadAlertList } from "@/components/admin/lead-alerts";
import { NoteForm } from "@/components/admin/note-form";
import { ReplyBadge } from "@/components/admin/reply-badge";
import { StatusForm } from "@/components/admin/status-form";
import { TouchForm } from "@/components/admin/touch-form";
import { formatPhone, formatSaleDate, formatWhen, languageLabel, phoneHref, saleHint } from "@/lib/admin/clock";
import { lostReasonLabel, statusLabel } from "@/lib/admin/pipeline";
import { getLeadDetail, listStaff } from "@/lib/dal/admin";
import { leadSituations, paths } from "@/lib/site";
import { listLeadAlerts } from "@/lib/notifications/lead-alerts";

export const metadata: Metadata = {
  title: "Lead",
};

type DetailProps = {
  params: Promise<{ id: string }>;
};

export default function LeadPage({ params }: DetailProps) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-base text-muted">Loading the lead…</p>}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: DetailProps) {
  const { id } = await params;
  const leadId = Number(id);
  if (!Number.isInteger(leadId) || leadId < 1) notFound();

  const [{ lead }, staff, alerts] = await Promise.all([getLeadDetail(leadId), listStaff(), listLeadAlerts(leadId)]);
  if (!lead) notFound();

  const hint = saleHint(lead.daysUntilSale);
  const campaign = [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" / ");

  return (
    <AdminShell current="/admin/pipeline">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/admin/pipeline" className="inline-flex min-h-11 items-center text-sm text-pine">
          Back to the pipeline
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-ink">{lead.address}</h1>
            <p className="mt-2 text-base text-muted">
              {lead.city ? `${lead.city} · ` : ""}
              {lead.unit ? `Unit ${lead.unit} · ` : ""}
              Submitted {formatWhen(lead.createdAt)} · {lead.minutesSinceSubmit} min ago
            </p>
          </div>
          <ReplyBadge mark={lead.reply} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="border border-line bg-panel p-5">
            <h2 className="text-lg font-semibold text-ink">Seller</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Fact label="Name" value={lead.name} />
              <Fact label="Phone">
                <a href={phoneHref(lead.phone)} className="text-pine">
                  {formatPhone(lead.phone)}
                </a>
              </Fact>
              <Fact label="Email">
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="text-pine">
                    {lead.email}
                  </a>
                ) : (
                  "None"
                )}
              </Fact>
              <Fact label="Language" value={languageLabel(lead.language)} />
              <Fact label="Situation" value={optionLabel(leadSituations, lead.situation)} />
              <Fact label="Preferred path" value={optionLabel(paths, lead.preferredPath)} />
              <Fact label="Trustee sale" value={lead.trusteeSaleDate ? `${formatSaleDate(lead.trusteeSaleDate)}${hint ? ` · ${hint}` : ""}` : "None"} />
              <Fact label="Status" value={statusLabel(lead.status)} />
              {lead.lostReason ? <Fact label="Lost reason" value={lostReasonLabel(lead.lostReason)} /> : null}
              <Fact label="Working" value={lead.assignedToName ?? "Unassigned"} />
              <Fact label="Source page" value={lead.sourcePath} />
              {campaign ? <Fact label="Campaign" value={campaign} /> : null}
            </dl>
            <h3 className="mt-6 text-sm font-medium text-ink">What they wrote</h3>
            <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-ink">{lead.message || "No message on this lead."}</p>

            <h3 className="mt-6 text-sm font-medium text-ink">Consent</h3>
            {lead.consents.length === 0 ? (
              <p className="mt-2 text-base text-muted">No consent rows stored.</p>
            ) : (
              <ul className="mt-3 grid gap-3">
                {lead.consents.map((consent) => (
                  <li key={consent.id} className="border border-line bg-paper px-3 py-3">
                    <p className="text-sm font-medium text-ink">
                      {consent.channel === "sms" ? "Text" : consent.channel === "call" ? "Call" : consent.channel}
                      {" · "}
                      {formatWhen(consent.grantedAt)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">{consent.textVersion}</p>
                    <p className="mt-2 text-sm text-ink">Page: {consent.pageUrl}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="grid content-start gap-6">
            <section className={`border border-line bg-panel p-5 ${lead.urgent ? "border-l-4 border-l-amber" : ""}`}>
              <h2 className="text-lg font-semibold text-ink">Pipeline</h2>
              <StatusForm leadId={lead.id} status={lead.status} lostReason={lead.lostReason} />
              <AssignForm leadId={lead.id} assignedToId={lead.assignedToId} staff={staff} />
            </section>
            <section className="border border-line bg-panel p-5">
              <h2 className="text-lg font-semibold text-ink">Lead email</h2>
              <p className="mt-1 text-sm text-muted">Founder email sent through Resend when this lead came in.</p>
              <LeadAlertList alerts={alerts} />
            </section>
            <section className="border border-line bg-panel p-5">
              <h2 className="text-lg font-semibold text-ink">Calls, texts, and email</h2>
              <TouchForm leadId={lead.id} hasEmail={Boolean(lead.email)} />
            </section>
            <section className="border border-line bg-panel p-5">
              <h2 className="text-lg font-semibold text-ink">Notes and history</h2>
              <NoteForm leadId={lead.id} />
              <ol className="mt-6 grid gap-4">
                {lead.events.map((event) => (
                  <li key={event.id} className="border-t border-line pt-4">
                    <p className="text-sm text-muted">
                      {eventLabel(event.type)} · {event.author} · {formatWhen(event.createdAt)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-base leading-7 text-ink">{event.body}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}

function Fact({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 text-base text-ink">{children ?? value}</dd>
    </div>
  );
}

function optionLabel(list: readonly { value: string; label: string }[], value: string) {
  return list.find((item) => item.value === value)?.label ?? value;
}

function eventLabel(type: string) {
  if (type === "created") return "Created";
  if (type === "status") return "Status";
  if (type === "note") return "Note";
  if (type === "email_out") return "Email";
  if (type === "email_status") return "Email";
  if (type === "call") return "Call";
  if (type === "sms_out") return "Text";
  return type;
}
