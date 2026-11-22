"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import type { AdminFormState } from "@/lib/admin/schema";
import { allowLead } from "@/lib/leads/rate-limit";
import { deliverNotification, leadAlertChannelName } from "@/lib/notifications/lead-alerts";
import { getDb } from "@/src/prisma/db";

export async function retryLeadAlertForm(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const id = Number(formData.get("notificationId"));
  if (!Number.isInteger(id) || id < 1) return fail("That alert is missing.");
  if (!allowLead(`admin-lead-alert-retry:${id}`, 4, 60_000)) return fail("Wait a minute and try again.");
  const row = await getDb().leadNotification.findUnique({ where: { id }, select: { leadId: true, channel: true, status: true } });
  if (!row) return fail("That alert is missing.");
  if (row.status === "sent") return fail("Already sent.");
  const status = await deliverNotification(id, { force: true });
  revalidatePath(`/admin/leads/${row.leadId}`);
  const name = leadAlertChannelName(row.channel);
  if (status === "sent") return saved(`${name} sent.`);
  if (status === "skipped") return fail(`${name} is not configured on this server.`);
  if (status === null) return fail("Another attempt is already running. Refresh in a moment.");
  return fail(`${name} failed again. See the error on the alert.`);
}

function fail(message: string): AdminFormState {
  return { ok: false, message, stamp: Date.now() };
}

function saved(message: string): AdminFormState {
  return { ok: true, message, stamp: Date.now() };
}
