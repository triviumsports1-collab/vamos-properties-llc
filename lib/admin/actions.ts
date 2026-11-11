"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  assignSchema,
  loginSchema,
  noteSchema,
  statusSchema,
  touchSchema,
  type AdminFormState,
  type LoginState,
} from "@/lib/admin/schema";
import { ADMIN_COOKIE, sealSession, sessionCookieOptions } from "@/lib/admin/session";
import { dummyPasswordHash, verifyPassword } from "@/lib/admin/password";
import { isLeadStatus } from "@/lib/admin/pipeline";
import { sendSellerFollowUp } from "@/lib/admin/mail";
import { allowLead } from "@/lib/leads/rate-limit";
import { addLeadNote, assignLead, changeLeadStatus, logLeadTouch, recordEmailEvent } from "@/lib/dal/admin";
import { bootstrapAdminIfEmpty, findUserForLogin } from "@/lib/dal/users";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function failed(message: string): AdminFormState {
  return { ok: false, message, stamp: Date.now() };
}

function saved(message: string): AdminFormState {
  return { ok: true, message, stamp: Date.now() };
}

function refreshLead(leadId: number) {
  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/bank");
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function loginAdmin(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: field(formData, "email"),
    password: field(formData, "password"),
  });
  if (!parsed.success) {
    return { message: "Enter the email and password for this desk." };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowLead(`login:${ip}`, 8, 15 * 60 * 1000)) {
    return { message: "Too many sign-in tries. Wait a few minutes and try again." };
  }

  try {
    await bootstrapAdminIfEmpty();
    const user = await findUserForLogin(parsed.data.email);
    const passwordOk = verifyPassword(parsed.data.password, user?.passwordHash ?? dummyPasswordHash);
    if (!user || !passwordOk) {
      return { message: "That email or password is not right." };
    }
    const token = sealSession(user.id);
    if (!token) {
      return { message: "Sign-in is not configured on this server." };
    }
    const jar = await cookies();
    jar.set(ADMIN_COOKIE, token, sessionCookieOptions());
  } catch (error) {
    console.error("admin_login_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
      message: error instanceof Error ? error.message : String(error),
    });
    return { message: "Sign-in did not complete. Try again in a moment." };
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function updateLeadStatus(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const parsed = statusSchema.safeParse({
    leadId: field(formData, "leadId"),
    status: field(formData, "status"),
    lostReason: field(formData, "lostReason"),
  });
  if (!parsed.success || !isLeadStatus(parsed.data.status)) {
    return failed("Check the status and try again.");
  }

  try {
    const result = await changeLeadStatus(parsed.data.leadId, parsed.data.status, parsed.data.lostReason);
    if (result.ok) refreshLead(parsed.data.leadId);
    return result.ok ? saved(result.message) : failed(result.message);
  } catch (error) {
    console.error("admin_status_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return failed("That status did not save. Try again.");
  }
}

export async function saveLeadNote(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const parsed = noteSchema.safeParse({
    leadId: field(formData, "leadId"),
    body: field(formData, "body"),
  });
  if (!parsed.success) {
    return failed(parsed.error.issues[0]?.message ?? "Write a short note.");
  }

  try {
    const result = await addLeadNote(parsed.data.leadId, parsed.data.body);
    if (result.ok) refreshLead(parsed.data.leadId);
    return result.ok ? saved(result.message) : failed(result.message);
  } catch (error) {
    console.error("admin_note_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return failed("That note did not save. Try again.");
  }
}

export async function saveLeadAssignment(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const parsed = assignSchema.safeParse({
    leadId: field(formData, "leadId"),
    assignedToId: field(formData, "assignedToId"),
  });
  if (!parsed.success) {
    return failed("Pick a person on the team.");
  }

  const raw = parsed.data.assignedToId;
  const assignedToId = raw === "" ? null : Number(raw);
  if (assignedToId !== null && (!Number.isInteger(assignedToId) || assignedToId < 1)) {
    return failed("Pick a person on the team.");
  }

  try {
    const result = await assignLead(parsed.data.leadId, assignedToId);
    if (result.ok) refreshLead(parsed.data.leadId);
    return result.ok ? saved(result.message) : failed(result.message);
  } catch (error) {
    console.error("admin_assign_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return failed("That assignment did not save. Try again.");
  }
}

export async function saveLeadTouch(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const parsed = touchSchema.safeParse({
    leadId: field(formData, "leadId"),
    channel: field(formData, "channel"),
    direction: field(formData, "direction") || "out",
    subject: field(formData, "subject"),
    body: field(formData, "body"),
  });
  if (!parsed.success) {
    return failed(parsed.error.issues[0]?.message ?? "Check the message and try again.");
  }

  try {
    const result = await logLeadTouch(parsed.data.leadId, parsed.data);
    if (!result.ok) return failed(result.message);
    if (result.kind === "email") {
      const delivery = await sendSellerFollowUp({
        to: result.email,
        subject: parsed.data.subject,
        text: `${parsed.data.body}\n\nVamos Properties LLC\nAbout: ${result.address}`,
      });
      const note =
        delivery === "sent"
          ? `Sent to ${result.email}. Subject: ${parsed.data.subject}\n\n${parsed.data.body}`
          : delivery === "skipped"
            ? `Draft saved. Resend is not configured, so this was not sent.\nSubject: ${parsed.data.subject}\n\n${parsed.data.body}`
            : `Could not send to ${result.email}. Draft kept.\nSubject: ${parsed.data.subject}\n\n${parsed.data.body}`;
      await recordEmailEvent(parsed.data.leadId, note, delivery === "sent");
      refreshLead(parsed.data.leadId);
      return saved(delivery === "sent" ? "Email sent." : delivery === "skipped" ? "Draft saved. Email is not configured." : "Draft saved. The email did not send.");
    }
    refreshLead(parsed.data.leadId);
    return saved(result.message);
  } catch (error) {
    console.error("admin_touch_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return failed("That did not save. Try again.");
  }
}
