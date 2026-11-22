"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import type { AdminFormState } from "@/lib/admin/schema";
import { getSheetSyncStatus, saveSheetSyncSchedule, type SheetSyncStatusView } from "@/lib/dal/sheet-sync-schedule";
import {
  MAX_SYNC_INTERVAL_MINUTES,
  MIN_SYNC_INTERVAL_MINUTES,
  syncIntervalLabel,
} from "@/lib/gdoc-listings/sync-schedule";

const scheduleSchema = z.object({
  mode: z.enum(["manual", "auto"]),
  intervalMinutes: z.coerce
    .number({ message: "Pick how often to sync." })
    .int("Use whole minutes.")
    .min(MIN_SYNC_INTERVAL_MINUTES, `Sync at most every ${MIN_SYNC_INTERVAL_MINUTES} minutes.`)
    .max(MAX_SYNC_INTERVAL_MINUTES, "Sync at least once every 30 days."),
});

const unitMinutes: Record<string, number> = { minutes: 1, hours: 60, days: 24 * 60 };

export async function saveSheetSyncScheduleForm(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const actor = await requireAdmin();
  const preset = field(formData, "interval");
  let minutes: string | number = preset;
  if (preset === "custom") {
    const amount = Number(field(formData, "customAmount"));
    const unit = unitMinutes[field(formData, "customUnit")] ?? 1;
    minutes = Number.isFinite(amount) ? Math.round(amount * unit) : Number.NaN;
  }
  const parsed = scheduleSchema.safeParse({ mode: field(formData, "mode"), intervalMinutes: minutes });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Check the sync settings.", stamp: Date.now() };
  try {
    const result = await saveSheetSyncSchedule({ ...parsed.data, actorEmail: actor.email });
    revalidatePath("/admin/sheet-listings");
    const message =
      parsed.data.mode === "manual"
        ? "Saved. The sheet copies only when someone presses Sync now (or the sheet pushes a change)."
        : `Saved. ${syncIntervalLabel(parsed.data.intervalMinutes)}; ${
            result.nextSyncAt && result.nextSyncAt.getTime() > Date.now() + 60_000 ? "next copy is scheduled" : "the next scheduler check will copy"
          }.`;
    return { ok: true, message, stamp: Date.now() };
  } catch (error) {
    console.error("[SHEET_SYNC_SCHEDULE]", { id: randomUUID(), name: error instanceof Error ? error.name : "Error" });
    return { ok: false, message: "The sync settings did not save. Try again.", stamp: Date.now() };
  }
}

/** Polled by the desk's sync panel for live status. */
export async function readSheetSyncStatus(): Promise<SheetSyncStatusView> {
  await requireAdmin();
  return getSheetSyncStatus();
}

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
