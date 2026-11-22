"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import type { AdminFormState } from "@/lib/admin/schema";
import {
  expireOverdueListings,
  saveLifecycleSettings,
  setListingLifecycle,
  type LifecycleIntent,
} from "@/lib/dal/listing-lifecycle";
import { refreshSheetListingViews } from "@/lib/gdoc-listings/cache";
import { MAX_EXPIRY_DAYS, MIN_EXPIRY_DAYS, type ActiveWindow } from "@/lib/gdoc-listings/lifecycle";
import { allowLead } from "@/lib/leads/rate-limit";

const lifecycleSchema = z.object({
  slug: z.string().trim().min(1, "That sheet home is missing.").max(120),
  intent: z.enum(["activate", "renew", "deactivate", "release"]),
  window: z
    .string()
    .trim()
    .refine((value) => value === "" || value === "default" || value === "never" || /^\d{1,3}$/.test(value), "Pick how long it stays active."),
  lock: z.string().optional().default(""),
});

const daysField = z.coerce
  .number({ message: "Enter the number of days." })
  .int("Use whole days.")
  .min(MIN_EXPIRY_DAYS, `Use at least ${MIN_EXPIRY_DAYS} day.`)
  .max(MAX_EXPIRY_DAYS, `Use ${MAX_EXPIRY_DAYS} days or fewer.`);

const settingsSchema = z.object({
  expiryDays: daysField,
  expiringSoonDays: z.coerce.number().int().min(0, "Use 0 or more days.").max(30, "Use 30 days or fewer."),
  autoExpire: z.boolean(),
  applyToActive: z.boolean(),
});

export async function setSheetListingLifecycleForm(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const actor = await requireAdmin();
  const parsed = lifecycleSchema.safeParse({
    slug: field(formData, "slug"),
    intent: field(formData, "intent"),
    window: field(formData, "window"),
    lock: field(formData, "lock"),
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Check the status change.");
  const window = parseWindow(parsed.data.window);
  if (!window) return fail(`Pick between ${MIN_EXPIRY_DAYS} and ${MAX_EXPIRY_DAYS} days.`);

  const intent: LifecycleIntent =
    parsed.data.intent === "activate"
      ? { kind: "activate", window, lock: parsed.data.lock === "yes" }
      : parsed.data.intent === "renew"
        ? { kind: "renew", window }
        : { kind: parsed.data.intent };
  try {
    const result = await setListingLifecycle(parsed.data.slug, intent, actor.email);
    if (!result.ok) return fail(result.message);
    refreshSheetListingViews(result.slugs, { immediate: true });
    return saved(result.message);
  } catch (error) {
    logError(error);
    return fail("That status change did not save. Try again.");
  }
}

export async function saveLifecycleSettingsForm(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const actor = await requireAdmin();
  const parsed = settingsSchema.safeParse({
    expiryDays: field(formData, "expiryDays"),
    expiringSoonDays: field(formData, "expiringSoonDays") || "3",
    autoExpire: field(formData, "autoExpire") === "yes",
    applyToActive: field(formData, "applyToActive") === "yes",
  });
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Check the expiry settings.");
  try {
    const result = await saveLifecycleSettings({
      settings: {
        autoExpire: parsed.data.autoExpire,
        expiryDays: parsed.data.expiryDays,
        expiringSoonDays: parsed.data.expiringSoonDays,
      },
      applyToActive: parsed.data.applyToActive,
      actorEmail: actor.email,
    });
    refreshSheetListingViews([], { immediate: true });
    const days = parsed.data.expiryDays === 1 ? "1 day" : `${parsed.data.expiryDays} days`;
    const base = parsed.data.autoExpire
      ? `Saved. New and renewed homes stay active for ${days}.`
      : "Saved. Auto-expiry is off; homes stay active until you change them.";
    const extra = parsed.data.applyToActive ? ` Updated ${result.recomputed} running windows.` : "";
    return saved(base + extra);
  } catch (error) {
    logError(error);
    return fail("The expiry settings did not save. Try again.");
  }
}

export async function runListingExpiryCheckForm(_previous: AdminFormState, _formData: FormData): Promise<AdminFormState> {
  const actor = await requireAdmin();
  if (!allowLead("admin-listing-expiry", 6, 60_000)) return fail("Wait a minute and try again.");
  try {
    const result = await expireOverdueListings(actor.email);
    if (result.skipped === "auto_expire_off") return fail("Auto-expiry is off. Turn it on in the expiry settings first.");
    refreshSheetListingViews(result.slugs, { immediate: true });
    if (result.expired === 0) return saved("No overdue homes. Everything active is inside its window.");
    return saved(result.expired === 1 ? "Set 1 expired home to Inactive." : `Set ${result.expired} expired homes to Inactive.`);
  } catch (error) {
    logError(error);
    return fail("The expiry check did not finish. Try again.");
  }
}

function parseWindow(value: string): ActiveWindow | null {
  if (value === "" || value === "default") return { kind: "default" };
  if (value === "never") return { kind: "never" };
  const days = Number(value);
  if (!Number.isInteger(days) || days < MIN_EXPIRY_DAYS || days > MAX_EXPIRY_DAYS) return null;
  return { kind: "days", days };
}

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function fail(message: string): AdminFormState {
  return { ok: false, message, stamp: Date.now() };
}

function saved(message: string): AdminFormState {
  return { ok: true, message, stamp: Date.now() };
}

function logError(error: unknown) {
  console.error("[SHEET_LISTINGS_LIFECYCLE]", { id: randomUUID(), name: error instanceof Error ? error.name : "Error" });
}
