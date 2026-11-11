import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { MoveLead } from "@/components/admin/move-lead";
import { ReplyBadge } from "@/components/admin/reply-badge";
import { formatPhone, formatSaleDate, languageLabel, saleHint } from "@/lib/admin/clock";
import { isLeadStatus, leadStatuses, statusLabel } from "@/lib/admin/pipeline";
import { listLeadQueue, type QueueLead } from "@/lib/dal/admin";
import { leadSituations, paths } from "@/lib/site";

export const metadata: Metadata = {
  title: "Lead pipeline",
};

type PipelineProps = {
  searchParams: Promise<{ status?: string | string[]; view?: string | string[] }>;
};

export default function PipelinePage({ searchParams }: PipelineProps) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-base text-muted">Loading the pipeline…</p>}>
      <Pipeline searchParams={searchParams} />
    </Suspense>
  );
}

async function Pipeline({ searchParams }: PipelineProps) {
  const params = await searchParams;
  const requested = Array.isArray(params.status) ? params.status[0] : params.status;
  const viewParam = Array.isArray(params.view) ? params.view[0] : params.view;
  const status = requested && isLeadStatus(requested) ? requested : null;
  const view = viewParam === "table" ? "table" : "board";
  const { leads } = await listLeadQueue(status);

  return (
    <AdminShell current="/admin/pipeline">
      <main className="px-4 py-8">
        <h1 className="text-3xl font-semibold text-ink">Lead pipeline</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          Move a file when the conversation changes. A trustee sale inside 21 days, or one that has already passed, stays at the top of each list.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <FilterLink href={`/admin/pipeline?view=${view}`} active={status === null}>
            All
          </FilterLink>
          {leadStatuses.map((item) => (
            <FilterLink key={item.value} href={`/admin/pipeline?view=${view}&status=${item.value}`} active={status === item.value}>
              {item.label}
            </FilterLink>
          ))}
          <FilterLink href={`/admin/pipeline?view=board${status ? `&status=${status}` : ""}`} active={view === "board"}>
            Board
          </FilterLink>
          <FilterLink href={`/admin/pipeline?view=table${status ? `&status=${status}` : ""}`} active={view === "table"}>
            Table
          </FilterLink>
        </div>
        {leads.length === 0 ? (
          <p className="mt-8 border border-line bg-panel px-4 py-6 text-base text-ink">No leads in this view.</p>
        ) : view === "board" ? (
          <Board leads={leads} />
        ) : (
          <Table leads={leads} />
        )}
      </main>
    </AdminShell>
  );
}

function Board({ leads }: { leads: QueueLead[] }) {
  return (
    <div className="mt-6 flex gap-3 overflow-x-auto pb-4 touch-scroll">
      {leadStatuses.map((column) => {
        const cards = leads.filter((lead) => lead.status === column.value);
        return (
          <section key={column.value} className="w-72 shrink-0 border border-line bg-mist p-3">
            <h2 className="text-sm font-semibold text-ink">
              {column.label}
              <span className="ml-2 text-muted">{cards.length}</span>
            </h2>
            <ul className="mt-3 grid gap-3">
              {cards.map((lead) => (
                <li key={lead.id} className={`border border-line bg-panel p-3 ${lead.urgent ? "border-l-4 border-l-amber" : ""}`}>
                  <Link href={`/admin/leads/${lead.id}`} className="text-base font-semibold text-ink">
                    {lead.address}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {lead.name} · {formatPhone(lead.phone)}
                  </p>
                  <div className="mt-2">
                    <ReplyBadge mark={lead.reply} />
                  </div>
                  <p className="mt-2 text-sm text-muted">{lead.minutesSinceSubmit} min</p>
                  <MoveLead leadId={lead.id} status={lead.status} lostReason={null} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Table({ leads }: { leads: QueueLead[] }) {
  return (
    <ul className="mt-6 grid gap-3">
      {leads.map((lead) => {
        const hint = saleHint(lead.daysUntilSale);
        return (
          <li key={lead.id} className={`border border-line bg-panel px-4 py-4 ${lead.urgent ? "border-l-4 border-l-amber" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link href={`/admin/leads/${lead.id}`} className="text-lg font-semibold text-ink">
                  {lead.address}
                </Link>
                <p className="mt-1 text-base text-ink">
                  {lead.name} · {formatPhone(lead.phone)}
                </p>
              </div>
              <p className="text-sm font-medium text-ink">{lead.minutesSinceSubmit} min</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              {optionLabel(leadSituations, lead.situation)} · {languageLabel(lead.language)} · {optionLabel(paths, lead.preferredPath)} · {statusLabel(lead.status)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ReplyBadge mark={lead.reply} />
              <span className="text-sm text-ink">
                {lead.trusteeSaleDate ? `${formatSaleDate(lead.trusteeSaleDate)}${hint ? ` · ${hint}` : ""}` : "No sale date"}
              </span>
            </div>
            <MoveLead leadId={lead.id} status={lead.status} lostReason={null} />
          </li>
        );
      })}
    </ul>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-11 items-center border px-3 text-sm ${active ? "border-navy bg-navy text-white" : "border-line bg-panel text-ink"}`}
    >
      {children}
    </Link>
  );
}

function optionLabel(list: readonly { value: string; label: string }[], value: string) {
  return list.find((item) => item.value === value)?.label ?? value;
}
