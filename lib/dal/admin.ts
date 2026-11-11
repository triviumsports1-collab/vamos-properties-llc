import "server-only";

import type { Prisma } from "@prisma/client";
import { getDb } from "@/src/prisma/db";
import { requireAdmin } from "@/lib/admin/auth";
import {
  daysUntilSale,
  minutesSince,
  replyMark,
  saleIsUrgent,
  type ReplyMark,
} from "@/lib/admin/clock";
import {
  canonicalStatus,
  isLeadStatus,
  isLostReason,
  lostReasonLabel,
  statusLabel,
  type LeadStatus,
} from "@/lib/admin/pipeline";
import type { AdminActor } from "@/lib/dal/users";

export type QueueLead = {
  id: number;
  address: string;
  name: string;
  phone: string;
  situation: string;
  preferredPath: string;
  language: string;
  trusteeSaleDate: string | null;
  status: string;
  createdAt: string;
  minutesSinceSubmit: number;
  daysUntilSale: number | null;
  urgent: boolean;
  reply: ReplyMark;
};

export type LeadConsentView = {
  id: number;
  channel: string;
  textVersion: string;
  pageUrl: string;
  grantedAt: string;
};

export type LeadEventView = {
  id: number;
  author: string;
  type: string;
  body: string;
  createdAt: string;
};

export type LeadDetail = {
  id: number;
  address: string;
  unit: string | null;
  city: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  situation: string;
  trusteeSaleDate: string | null;
  preferredPath: string;
  language: string;
  status: string;
  lostReason: string | null;
  sourcePath: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  assignedToId: number | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
  minutesSinceSubmit: number;
  daysUntilSale: number | null;
  urgent: boolean;
  reply: ReplyMark;
  consents: LeadConsentView[];
  events: LeadEventView[];
};

type EventStamp = { type: string; author: string; createdAt: string };

function toIso(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : d;
}

function queueFromRow(
  lead: {
    id: number;
    address: string;
    name: string;
    phone: string;
    situation: string;
    preferredPath: string;
    language: string;
    trusteeSaleDate: string | null;
    status: string;
    createdAt: string;
    events: EventStamp[];
  },
  now: number,
): QueueLead {
  const days = daysUntilSale(lead.trusteeSaleDate);
  return {
    id: lead.id,
    address: lead.address,
    name: lead.name,
    phone: lead.phone,
    situation: lead.situation,
    preferredPath: lead.preferredPath,
    language: lead.language,
    trusteeSaleDate: lead.trusteeSaleDate,
    status: canonicalStatus(lead.status),
    createdAt: lead.createdAt,
    minutesSinceSubmit: minutesSince(lead.createdAt, now),
    daysUntilSale: days,
    urgent: saleIsUrgent(days),
    reply: replyMark(lead.createdAt, canonicalStatus(lead.status), lead.events, now),
  };
}

export async function listStaff() {
  await requireAdmin();
  const db = getDb();
  const users = await db.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return users.map((user) => ({ id: user.id, name: user.name }));
}

const CONTACTED_STATUSES = ["contacted", "no_answer", "talking", "visited", "offer_sent"];
const CONTRACT_STATUSES = ["under_contract", "contract"];
const CLOSED_OR_LOST = ["closed", "lost"];

function leadQueueWhere(status: string | null): Prisma.LeadWhereInput | undefined {
  if (!status) return undefined;
  if (status === "contacted") return { status: { in: CONTACTED_STATUSES } };
  if (status === "under_contract") return { status: { in: CONTRACT_STATUSES } };
  if (status === "new") {
    return {
      NOT: { status: { in: [...CONTACTED_STATUSES, ...CONTRACT_STATUSES, ...CLOSED_OR_LOST] } },
    };
  }
  return { status };
}

export async function listLeadQueue(status: string | null): Promise<{ actor: AdminActor; leads: QueueLead[] }> {
  const actor = await requireAdmin();
  const db = getDb();
  const rows = await db.lead.findMany({
    where: leadQueueWhere(status),
    select: {
      id: true,
      address: true,
      name: true,
      phone: true,
      situation: true,
      preferredPath: true,
      language: true,
      trusteeSaleDate: true,
      status: true,
      createdAt: true,
      events: {
        select: { type: true, author: true, createdAt: true },
      },
    },
  });

  const now = Date.now();
  const leads = rows
    .map((lead) =>
      queueFromRow(
        {
          ...lead,
          createdAt: lead.createdAt.toISOString(),
          events: lead.events.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
        },
        now,
      ),
    )
    .filter((lead) => (status ? lead.status === status : true))
    .sort((left, right) => {
      if (left.urgent !== right.urgent) return left.urgent ? -1 : 1;
      if (left.urgent && right.urgent) {
        return (left.daysUntilSale ?? 0) - (right.daysUntilSale ?? 0);
      }
      return right.createdAt.localeCompare(left.createdAt);
    });

  return { actor, leads };
}

export async function getLeadDetail(id: number): Promise<{ actor: AdminActor; lead: LeadDetail | null }> {
  const actor = await requireAdmin();
  const db = getDb();
  const row = await db.lead.findFirst({
    where: { id },
    include: {
      consents: {
        select: { id: true, channel: true, textVersion: true, pageUrl: true, grantedAt: true },
        orderBy: { grantedAt: "asc" },
      },
      events: {
        select: { id: true, author: true, type: true, body: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      assignedTo: {
        select: { id: true, name: true },
      },
    },
  });

  if (!row) return { actor, lead: null };

  const days = daysUntilSale(row.trusteeSaleDate);
  const createdAtIso = row.createdAt.toISOString();
  const updatedAtIso = row.updatedAt.toISOString();
  const events: LeadEventView[] = row.events.map((event) => ({
    id: event.id,
    author: event.author,
    type: event.type,
    body: event.body,
    createdAt: event.createdAt.toISOString(),
  }));

  return {
    actor,
    lead: {
      id: row.id,
      address: row.address,
      unit: row.unit,
      city: row.city,
      name: row.name,
      phone: row.phone,
      email: row.email,
      message: row.message,
      situation: row.situation,
      trusteeSaleDate: row.trusteeSaleDate,
      preferredPath: row.preferredPath,
      language: row.language,
      status: canonicalStatus(row.status),
      lostReason: row.lostReason,
      sourcePath: row.sourcePath,
      utmSource: row.utmSource,
      utmMedium: row.utmMedium,
      utmCampaign: row.utmCampaign,
      assignedToId: row.assignedTo?.id ?? null,
      assignedToName: row.assignedTo?.name ?? null,
      createdAt: createdAtIso,
      updatedAt: updatedAtIso,
      minutesSinceSubmit: minutesSince(createdAtIso),
      daysUntilSale: days,
      urgent: saleIsUrgent(days),
      reply: replyMark(createdAtIso, canonicalStatus(row.status), events),
      consents: row.consents.map((consent) => ({
        id: consent.id,
        channel: consent.channel,
        textVersion: consent.textVersion,
        pageUrl: consent.pageUrl,
        grantedAt: consent.grantedAt.toISOString(),
      })),
      events,
    },
  };
}

export async function changeLeadStatus(leadId: number, status: LeadStatus, lostReason: string) {
  const actor = await requireAdmin();
  if (!isLeadStatus(status)) {
    return { ok: false as const, message: "That status is not in the pipeline." };
  }
  const reason = status === "lost" ? lostReason : "";
  if (status === "lost" && !isLostReason(reason)) {
    return { ok: false as const, message: "Pick why this file is lost." };
  }

  const db = getDb();
  const result = await db.$transaction(async (tx) => {
    const current = await tx.lead.findFirst({
      where: { id: leadId },
      select: { id: true, status: true, lostReason: true },
    });
    if (!current) return { ok: false as const, message: "That lead is not in the queue." };
    const nextReason = status === "lost" ? reason : null;
    if (current.status === status && (current.lostReason ?? null) === nextReason) {
      return { ok: true as const, message: `Already ${statusLabel(status)}.` };
    }
    await tx.lead.update({
      where: { id: leadId },
      data: { status, lostReason: nextReason },
    });
    const reasonText = nextReason ? ` Reason: ${lostReasonLabel(nextReason)}.` : "";
    await tx.leadEvent.create({
      data: {
        leadId,
        author: actor.name,
        authorId: actor.id,
        type: "status",
        body: `Status set to ${statusLabel(status)}.${reasonText}`,
      },
    });
    return { ok: true as const, message: `Status saved as ${statusLabel(status)}.` };
  });

  return result;
}

export async function addLeadNote(leadId: number, body: string) {
  const actor = await requireAdmin();
  const db = getDb();
  const saved = await db.$transaction(async (tx) => {
    const current = await tx.lead.findFirst({ where: { id: leadId }, select: { id: true } });
    if (!current) return { ok: false as const, message: "That lead is not in the queue." };
    await tx.leadEvent.create({
      data: {
        leadId,
        author: actor.name,
        authorId: actor.id,
        type: "note",
        body,
      },
    });
    return { ok: true as const, message: "Note saved." };
  });
  return saved;
}

export async function assignLead(leadId: number, assignedToId: number | null) {
  const actor = await requireAdmin();
  const db = getDb();
  return db.$transaction(async (tx) => {
    const current = await tx.lead.findFirst({
      where: { id: leadId },
      select: { id: true, assignedToId: true },
    });
    if (!current) return { ok: false as const, message: "That lead is not in the queue." };

    let assigneeName: string | null = null;
    if (assignedToId !== null) {
      const assignee = await tx.user.findFirst({
        where: { id: assignedToId },
        select: { id: true, name: true },
      });
      if (!assignee) return { ok: false as const, message: "That person is not on the team." };
      assigneeName = assignee.name;
    }

    if ((current.assignedToId ?? null) === assignedToId) {
      return { ok: true as const, message: assigneeName ? `Already with ${assigneeName}.` : "Already unassigned." };
    }

    await tx.lead.update({ where: { id: leadId }, data: { assignedToId } });
    await tx.leadEvent.create({
      data: {
        leadId,
        author: actor.name,
        authorId: actor.id,
        type: "note",
        body: assigneeName ? `Assigned to ${assigneeName}.` : "Assignment cleared.",
      },
    });
    return {
      ok: true as const,
      message: assigneeName ? `Assigned to ${assigneeName}.` : "Assignment cleared.",
    };
  });
}

export async function logLeadTouch(
  leadId: number,
  input: { channel: "call" | "sms" | "email"; direction: "in" | "out"; subject: string; body: string },
) {
  const actor = await requireAdmin();
  const db = getDb();
  return db.$transaction(async (tx) => {
    const current = await tx.lead.findFirst({
      where: { id: leadId },
      select: { id: true, email: true, address: true, name: true },
    });
    if (!current) return { ok: false as const, message: "That lead is not in the queue." };

    if (input.channel === "call") {
      await tx.leadEvent.create({
        data: {
          leadId,
          author: actor.name,
          authorId: actor.id,
          type: "call",
          body: input.body,
        },
      });
      return { ok: true as const, kind: "log" as const, message: "Call logged." };
    }

    if (input.channel === "sms") {
      const direction = input.direction === "in" ? "Incoming text" : "Outgoing text";
      await tx.leadEvent.create({
        data: {
          leadId,
          author: actor.name,
          authorId: actor.id,
          type: "sms_out",
          body: `${direction}. ${input.body}`,
        },
      });
      return { ok: true as const, kind: "log" as const, message: "Text logged." };
    }

    if (!current.email) {
      return { ok: false as const, message: "This lead has no email address." };
    }
    return {
      ok: true as const,
      kind: "email" as const,
      email: current.email,
      address: current.address,
      name: current.name,
    };
  });
}

export async function recordEmailEvent(leadId: number, body: string, sent: boolean) {
  const actor = await requireAdmin();
  const db = getDb();
  await db.leadEvent.create({
    data: {
      leadId,
      author: actor.name,
      authorId: actor.id,
      type: sent ? "email_out" : "email_status",
      body,
    },
  });
}

export type BankLead = {
  id: number;
  address: string;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  situation: string;
  createdAt: string;
};

export async function searchBank(query: string): Promise<{ actor: AdminActor; leads: BankLead[] }> {
  const actor = await requireAdmin();
  const db = getDb();
  const needle = query.trim().toLowerCase();
  const rows = await db.lead.findMany({
    select: {
      id: true,
      address: true,
      name: true,
      phone: true,
      email: true,
      status: true,
      situation: true,
      message: true,
      city: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const leads = rows
    .filter((lead) => {
      if (needle.length < 2) return true;
      const haystack = [lead.address, lead.name, lead.phone, lead.email, lead.city, lead.message, lead.situation]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    })
    .map((lead) => ({
      id: lead.id,
      address: lead.address,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      status: canonicalStatus(lead.status),
      situation: lead.situation,
      createdAt: lead.createdAt.toISOString(),
    }));

  return { actor, leads };
}

export async function recentActivity() {
  await requireAdmin();
  const db = getDb();
  const events = await db.leadEvent.findMany({
    select: { id: true, leadId: true, type: true, author: true, body: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return events.map((event) => ({
    id: event.id,
    leadId: event.leadId,
    type: event.type,
    author: event.author,
    body: event.body,
    createdAt: event.createdAt.toISOString(),
  }));
}
