import "server-only";

import type { Prisma } from "@prisma/client";
import { normalizeAddress } from "@/lib/listings/address";
import {
  activeWindowFields,
  addDays,
  clampExpiryDays,
  defaultLifecycleSettings,
  type ActiveWindow,
  type LifecycleSettings,
} from "@/lib/gdoc-listings/lifecycle";
import { getDb } from "@/src/prisma/db";

const PUBLIC_STATUS = "active";
const SETTINGS_ID = 1;
const SWEEP_BATCH = 500;

export type SheetListingStatusEventView = {
  action: string;
  reason: string | null;
  actorEmail: string;
  previousStatus: string | null;
  nextStatus: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type LifecycleSettingsView = LifecycleSettings & {
  updatedAt: string | null;
  updatedByEmail: string;
};

/** Settings row, or the defaults when it was never saved. No auth: public queries and cron read it. */
export async function getLifecycleSettings(): Promise<LifecycleSettings> {
  const row = await getDb().listingLifecycleSetting.findUnique({ where: { id: SETTINGS_ID } });
  if (!row) return { ...defaultLifecycleSettings };
  return {
    autoExpire: row.autoExpire,
    expiryDays: clampExpiryDays(row.expiryDays),
    expiringSoonDays: Math.max(0, Math.min(30, row.expiringSoonDays)),
  };
}

export async function getLifecycleSettingsView(): Promise<LifecycleSettingsView> {
  const row = await getDb().listingLifecycleSetting.findUnique({ where: { id: SETTINGS_ID } });
  const settings = await getLifecycleSettings();
  return { ...settings, updatedAt: row?.updatedAt.toISOString() ?? null, updatedByEmail: row?.updatedByEmail ?? "" };
}

/**
 * Where-clause for homes the public may see. The expiry check runs at query time, so a home
 * disappears the moment its window ends even if the sweep has not run yet.
 */
export function publicListingWhere(settings: LifecycleSettings, now: Date = new Date()): Prisma.SheetListingWhereInput {
  const base: Prisma.SheetListingWhereInput = { status: PUBLIC_STATUS, removedAt: null };
  if (!settings.autoExpire) return base;
  return { ...base, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] };
}

export async function saveLifecycleSettings(input: {
  settings: LifecycleSettings;
  applyToActive: boolean;
  actorEmail: string;
}): Promise<{ recomputed: number }> {
  const db = getDb();
  const expiryDays = clampExpiryDays(input.settings.expiryDays);
  const data = {
    autoExpire: input.settings.autoExpire,
    expiryDays,
    expiringSoonDays: Math.max(0, Math.min(30, Math.round(input.settings.expiringSoonDays))),
    updatedByEmail: input.actorEmail,
  };
  return db.$transaction(async (tx) => {
    await tx.listingLifecycleSetting.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...data },
      update: data,
    });
    if (!input.applyToActive) return { recomputed: 0 };
    // Re-base every running window (not "no expiry" ones) on the new length.
    const recomputed = await tx.$executeRaw`
      UPDATE "SheetListing"
      SET "expiresAt" = "activatedAt" + make_interval(days => ${expiryDays}::int), "updatedAt" = NOW()
      WHERE "status" = 'active' AND "removedAt" IS NULL
        AND "activatedAt" IS NOT NULL AND "expiresAt" IS NOT NULL`;
    if (recomputed > 0) {
      await tx.sheetListingStatusEvent.create({
        data: {
          slug: "*",
          action: "window_recomputed",
          reason: `expiry_days=${expiryDays};rows=${recomputed}`,
          actorEmail: input.actorEmail,
        },
      });
    }
    return { recomputed };
  });
}

/**
 * Marks every Active home whose window has ended as Inactive (expired). Safe to call often:
 * it only touches overdue rows. Returns the slugs it changed so callers can revalidate.
 */
export async function expireOverdueListings(actorEmail: string, now: Date = new Date()) {
  const settings = await getLifecycleSettings();
  if (!settings.autoExpire) return { expired: 0, slugs: [] as string[], skipped: "auto_expire_off" as const };
  const db = getDb();
  const slugs: string[] = [];
  let expired = 0;
  for (;;) {
    const rows = await db.sheetListing.findMany({
      where: { status: PUBLIC_STATUS, expiresAt: { lte: now } },
      select: { id: true, slug: true, listingCode: true, expiresAt: true },
      take: SWEEP_BATCH,
    });
    if (rows.length === 0) break;
    await db.$transaction([
      db.sheetListing.updateMany({
        where: { id: { in: rows.map((row) => row.id) }, status: PUBLIC_STATUS },
        data: { status: "inactive", inactiveReason: "expired", removedAt: now, statusChangedAt: now },
      }),
      db.sheetListingStatusEvent.createMany({
        data: rows.map((row) => ({
          listingId: row.id,
          slug: row.slug,
          action: "expired",
          reason: "window_ended",
          actorEmail,
          previousStatus: PUBLIC_STATUS,
          nextStatus: "inactive",
          expiresAt: row.expiresAt,
        })),
      }),
    ]);
    expired += rows.length;
    for (const row of rows) {
      slugs.push(row.slug);
      if (row.listingCode) slugs.push(row.listingCode, row.listingCode.toLowerCase());
    }
    if (rows.length < SWEEP_BATCH) break;
  }
  return { expired, slugs, skipped: null };
}

export type LifecycleIntent =
  | { kind: "activate"; window: ActiveWindow; lock: boolean }
  | { kind: "renew"; window: ActiveWindow }
  | { kind: "deactivate" }
  | { kind: "release" };

export async function setListingLifecycle(
  slug: string,
  intent: LifecycleIntent,
  actorEmail: string,
): Promise<{ ok: true; slugs: string[]; message: string } | { ok: false; message: string }> {
  const db = getDb();
  const needle = slug.trim();
  if (!needle) return { ok: false, message: "That sheet home is missing." };
  const existing = await db.sheetListing.findFirst({
    where: { OR: [{ slug: needle }, { listingCode: needle.toUpperCase() }, { sheetKey: normalizeAddress(needle) }] },
  });
  if (!existing) return { ok: false, message: "That sheet home is not on this desk." };
  const settings = await getLifecycleSettings();
  const now = new Date();
  let data: Prisma.SheetListingUpdateInput;
  let action: string;
  let message: string;

  if (intent.kind === "activate" || intent.kind === "renew") {
    const window = activeWindowFields(now, intent.window, settings);
    data = {
      status: PUBLIC_STATUS,
      removedAt: null,
      inactiveReason: null,
      statusChangedAt: existing.status === PUBLIC_STATUS && !existing.removedAt ? existing.statusChangedAt : now,
      ...window,
      ...(intent.kind === "activate" ? { statusOverride: intent.lock } : {}),
    };
    action = intent.kind === "activate" ? "activated" : "renewed";
    message = window.expiresAt
      ? `Active until ${window.expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}.`
      : "Active with no expiry.";
  } else if (intent.kind === "deactivate") {
    data = {
      status: "inactive",
      removedAt: existing.removedAt ?? now,
      inactiveReason: "admin",
      statusOverride: true,
      statusChangedAt: now,
    };
    action = "deactivated";
    message = "Set Inactive. The sheet copy will keep it off the public page.";
  } else {
    data = { statusOverride: false };
    action = "released";
    message =
      existing.inactiveReason === "expired"
        ? "Unlocked. It stays expired until you renew it."
        : "Unlocked. The next sheet copy sets the status from the Google Sheet.";
  }

  const updated = await db.$transaction(async (tx) => {
    const row = await tx.sheetListing.update({ where: { id: existing.id }, data });
    await tx.sheetListingStatusEvent.create({
      data: {
        listingId: existing.id,
        slug: existing.slug,
        action,
        reason: intent.kind === "activate" || intent.kind === "renew" ? `window=${describeWindow(intent.window, settings)}` : null,
        actorEmail,
        previousStatus: existing.removedAt ? "inactive" : existing.status,
        nextStatus: row.removedAt ? "inactive" : row.status,
        expiresAt: row.expiresAt,
      },
    });
    return row;
  });
  const slugs = [updated.slug, ...(updated.listingCode ? [updated.listingCode, updated.listingCode.toLowerCase()] : [])];
  return { ok: true, slugs, message };
}

function describeWindow(window: ActiveWindow, settings: LifecycleSettings) {
  if (window.kind === "never") return "never";
  if (window.kind === "days") return `${clampExpiryDays(window.days)}d`;
  return `${settings.expiryDays}d_default`;
}

export async function listSheetListingStatusEvents(slug: string, limit = 12): Promise<SheetListingStatusEventView[]> {
  const rows = await getDb().sheetListingStatusEvent.findMany({
    where: { listing: { slug } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((row) => ({
    action: row.action,
    reason: row.reason,
    actorEmail: row.actorEmail,
    previousStatus: row.previousStatus,
    nextStatus: row.nextStatus,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function lifecycleCounts(settings: LifecycleSettings, now: Date = new Date()) {
  const db = getDb();
  const soon = addDays(now, settings.expiringSoonDays);
  const [expiringSoon, overdue, expired] = await Promise.all([
    settings.autoExpire
      ? db.sheetListing.count({ where: { status: PUBLIC_STATUS, removedAt: null, expiresAt: { gt: now, lte: soon } } })
      : Promise.resolve(0),
    settings.autoExpire ? db.sheetListing.count({ where: { status: PUBLIC_STATUS, expiresAt: { lte: now } } }) : Promise.resolve(0),
    db.sheetListing.count({ where: { status: "inactive", inactiveReason: "expired" } }),
  ]);
  return { expiringSoon, overdue, expired };
}
