import "server-only";

import { Resend } from "resend";
import { leadSituations, paths, site } from "@/lib/site";
import { getDb } from "@/src/prisma/db";

/**
 * Founder email alert for every new lead (Resend). Visitors who prefer texting use the
 * site's `sms:` links, which go straight to the Google Voice line; no SMS is sent from here.
 *
 * Guarantees:
 * 1. The lead is already saved in Postgres before anything here runs.
 * 2. `prepareLeadAlerts` (inside the request, a few ms) writes the email row, so an alert can
 *    never silently vanish: it is pending, sent, failed, or skipped (Resend not configured).
 * 3. `deliverLeadAlerts` runs in `after()` (post-response) with a timeout, so the form never waits.
 * 4. Pending/failed emails are retried by the scheduler tick and from the admin lead page.
 *    A conditional "claim" update makes every attempt exclusive, so retries never double-send.
 */

const CHANNEL = "email";
const EMAIL_TIMEOUT_MS = 8_000;
const MAX_ATTEMPTS = 4;
const SENDING_STALE_MS = 2 * 60_000;
const PENDING_GRACE_MS = 2 * 60_000;

type SendOutcome = { status: "sent"; providerId?: string } | { status: "skipped" | "failed"; error: string };

type LeadEmailInput = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  unit: string | null;
  city: string | null;
  situation: string;
  preferredPath: string;
  trusteeSaleDate: string | null;
  message: string | null;
  sourcePath: string;
  language: string;
};

function emailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  const to = (process.env.LEAD_NOTIFY_EMAIL ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!apiKey || !from || to.length === 0) return null;
  return { apiKey, from, to };
}

function emailTargets() {
  return (emailConfig()?.to ?? []).map(maskEmail).join(", ") || "not set";
}

/** Non-secret snapshot for the admin settings page. */
export function leadAlertConfig() {
  return { email: emailConfig() !== null, emailTargets: emailTargets() };
}

/** Writes the email alert row (pending, or skipped when Resend is not configured). Fast. */
export async function prepareLeadAlerts(leadId: number) {
  const ready = emailConfig() !== null;
  const data = {
    target: emailTargets(),
    status: ready ? "pending" : "skipped",
    attempts: 0,
    error: ready ? null : "not_configured",
    providerId: null,
    sentAt: null,
    lastAttemptAt: null,
  };
  // A repeat submission from the same phone reuses the lead; email again for the new note.
  await getDb().leadNotification.upsert({
    where: { leadId_channel: { leadId, channel: CHANNEL } },
    create: { leadId, channel: CHANNEL, ...data },
    update: data,
  });
  if (!ready) console.error("[LEAD_ALERTS]", { event: "email_not_configured", leadId });
}

/** Sends the pending email for a lead. Never throws. Safe to call from `after()`. */
export async function deliverLeadAlerts(leadId: number) {
  try {
    const row = await getDb().leadNotification.findFirst({
      where: { leadId, channel: CHANNEL, status: "pending" },
      select: { id: true },
    });
    if (row) await deliverNotification(row.id);
  } catch (error) {
    console.error("[LEAD_ALERTS]", { event: "deliver_failed", leadId, name: errorName(error) });
  }
}

/**
 * One exclusive attempt for one alert. Returns the new status, or null when another worker
 * holds the claim / the alert is already sent.
 */
export async function deliverNotification(notificationId: number, options: { force?: boolean } = {}) {
  const db = getDb();
  const now = new Date();
  const claimable = [
    { status: { in: ["pending", "failed"] }, ...(options.force ? {} : { attempts: { lt: MAX_ATTEMPTS } }) },
    { status: "sending", lastAttemptAt: { lt: new Date(now.getTime() - SENDING_STALE_MS) } },
    ...(options.force ? [{ status: "skipped" }] : []),
  ];
  const claim = await db.leadNotification.updateMany({
    where: { id: notificationId, channel: CHANNEL, OR: claimable },
    data: { status: "sending", lastAttemptAt: now, attempts: { increment: 1 } },
  });
  if (claim.count !== 1) return null;

  const row = await db.leadNotification.findUnique({ where: { id: notificationId }, include: { lead: true } });
  if (!row) return null;

  let outcome: SendOutcome;
  try {
    outcome = await sendFounderEmail(row.lead);
  } catch (error) {
    outcome = { status: "failed", error: errorName(error) };
  }

  await db.leadNotification.update({
    where: { id: notificationId },
    data:
      outcome.status === "sent"
        ? { status: "sent", error: null, providerId: outcome.providerId ?? null, sentAt: new Date(), target: emailTargets() }
        : { status: outcome.status, error: outcome.error },
  });
  await db.leadEvent.create({
    data: {
      leadId: row.lead.id,
      author: "system",
      type: outcome.status === "sent" ? "email_out" : "email_status",
      body: eventBody(outcome, row.attempts),
    },
  });
  if (outcome.status === "failed") {
    console.error("[LEAD_ALERTS]", { event: "send_failed", leadId: row.lead.id, error: outcome.error });
  }
  return outcome.status;
}

/** Scheduler sweep: emails stuck pending (after() never ran) or failed with attempts left. */
export async function retryDueLeadAlerts(limit = 20) {
  const now = Date.now();
  const rows = await getDb().leadNotification.findMany({
    where: {
      channel: CHANNEL,
      OR: [
        { status: "pending", updatedAt: { lt: new Date(now - PENDING_GRACE_MS) } },
        { status: "failed", attempts: { lt: MAX_ATTEMPTS } },
        { status: "sending", lastAttemptAt: { lt: new Date(now - SENDING_STALE_MS) } },
      ],
    },
    orderBy: { updatedAt: "asc" },
    take: limit,
    select: { id: true, status: true, attempts: true, lastAttemptAt: true },
  });
  let sent = 0;
  let failed = 0;
  for (const row of rows) {
    // Back off failed sends: 5, 10, 20 minutes after the last attempt.
    if (row.status === "failed" && row.lastAttemptAt) {
      const wait = 5 * 60_000 * 2 ** Math.max(0, row.attempts - 1);
      if (now - row.lastAttemptAt.getTime() < wait) continue;
    }
    const status = await deliverNotification(row.id);
    if (status === "sent") sent += 1;
    else if (status === "failed") failed += 1;
  }
  return { checked: rows.length, sent, failed };
}

async function sendFounderEmail(lead: LeadEmailInput): Promise<SendOutcome> {
  const config = emailConfig();
  if (!config) return { status: "skipped", error: "not_configured" };
  try {
    const resend = new Resend(config.apiKey);
    const result = await Promise.race([
      resend.emails.send({
        from: config.from,
        to: config.to,
        subject: `New Vamos lead: ${lead.address}`,
        text: founderEmailText(lead),
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), EMAIL_TIMEOUT_MS)),
    ]);
    if (result.error) return { status: "failed", error: `resend_${result.error.name ?? "error"}` };
    return { status: "sent", providerId: result.data?.id };
  } catch (error) {
    return { status: "failed", error: error instanceof Error && error.message === "timeout" ? "timeout" : "network" };
  }
}

function founderEmailText(lead: LeadEmailInput) {
  const situation = leadSituations.find((item) => item.value === lead.situation)?.label ?? lead.situation;
  const path = paths.find((item) => item.value === lead.preferredPath)?.label ?? lead.preferredPath;
  return [
    "A homeowner just asked for a conversation.",
    "",
    `Address: ${[lead.address, lead.unit ? `#${lead.unit}` : "", lead.city ?? ""].filter(Boolean).join(", ")}`,
    `Name: ${lead.name}`,
    `Phone: ${formatUsPhone(lead.phone)}`,
    `Email: ${lead.email || "none"}`,
    `Situation: ${situation}`,
    `Trustee sale date: ${lead.trusteeSaleDate || "none"}`,
    `Preferred path: ${path}`,
    `Language: ${lead.language}`,
    `Page: ${absoluteUrl(lead.sourcePath)}`,
    "",
    "Message:",
    lead.message || "(none)",
    "",
    `Open the lead: ${site.url}/admin/leads/${lead.id}`,
    `Call or text back from the business line ${site.phoneDisplay} (Google Voice) so the seller sees the same number.`,
  ].join("\n");
}

export function leadAlertChannelName(channel: string) {
  return channel === CHANNEL ? "Founder email" : channel;
}

function eventBody(outcome: SendOutcome, previousAttempts: number) {
  const attempt = previousAttempts > 0 ? ` (attempt ${previousAttempts + 1})` : "";
  if (outcome.status === "sent") return `Founder email sent${attempt}.`;
  if (outcome.status === "skipped") return "Founder email skipped. Resend is not configured.";
  return `Founder email failed${attempt}: ${outcome.error}.`;
}

function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

function formatUsPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : value;
}

function maskEmail(value: string) {
  const [user, domain] = value.split("@");
  if (!user || !domain) return value ? "•••" : "";
  return `${user.slice(0, 2)}••@${domain}`;
}

function errorName(error: unknown) {
  return error instanceof Error ? error.name : "Error";
}

export type LeadAlertView = {
  id: number;
  channel: string;
  channelName: string;
  target: string;
  status: string;
  attempts: number;
  error: string | null;
  lastAttemptAt: string | null;
  sentAt: string | null;
};

export async function listLeadAlerts(leadId: number): Promise<LeadAlertView[]> {
  const rows = await getDb().leadNotification.findMany({ where: { leadId, channel: CHANNEL }, orderBy: { id: "asc" } });
  return rows.map((row) => ({
    id: row.id,
    channel: row.channel,
    channelName: leadAlertChannelName(row.channel),
    target: row.target,
    status: row.status,
    attempts: row.attempts,
    error: row.error,
    lastAttemptAt: row.lastAttemptAt?.toISOString() ?? null,
    sentAt: row.sentAt?.toISOString() ?? null,
  }));
}

/** Last-7-days founder email counts by status, for the settings page. */
export async function leadAlertStats() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60_000);
  const rows = await getDb().leadNotification.groupBy({
    by: ["status"],
    where: { channel: CHANNEL, createdAt: { gte: since } },
    _count: { _all: true },
  });
  return Object.fromEntries(rows.map((row) => [row.status, row._count._all])) as Record<string, number>;
}
