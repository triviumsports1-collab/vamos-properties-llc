"use server";

import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin/auth";
import { applySheetListingMargins } from "@/lib/dal/sheet-listings";
import { getSheetPricingRule } from "@/lib/dal/sheet-pricing";
import { refreshSheetListingViews } from "@/lib/gdoc-listings/cache";
import { parseSheetListingView } from "@/lib/gdoc-listings/status";
import { parseDollars } from "@/lib/listings/money";
import {
  MAX_MARGIN_BATCH,
  parseMarginDollars,
  parseMarginPercentBps,
  type MarginRule,
} from "@/lib/gdoc-listings/margin";
import { sheetMarginActionSchema } from "@/lib/gdoc-listings/margin-schema";
import { idleSheetMargin, type SheetListingAdminFilters, type SheetMarginFormState } from "@/lib/gdoc-listings/types";
import { allowLead } from "@/lib/leads/rate-limit";

export async function applySheetListingMarginForm(
  _previous: SheetMarginFormState,
  formData: FormData,
): Promise<SheetMarginFormState> {
  const actor = await requireAdmin();
  const parsed = sheetMarginActionSchema.safeParse({
    scope: field(formData, "scope"),
    intent: field(formData, "intent"),
    mode: field(formData, "mode") || "flat",
    amount: field(formData, "amount"),
    slug: field(formData, "slug"),
    slugs: formData.getAll("slugs").filter((value): value is string => typeof value === "string"),
    view: field(formData, "view") || "all",
    q: field(formData, "q"),
    min: field(formData, "min"),
    max: field(formData, "max"),
    city: field(formData, "city"),
    region: field(formData, "region"),
    margin: field(formData, "margin") || "all",
  });
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Check the markup and try again.");
  }

  const limitKey = parsed.data.scope === "one" ? "admin-sheet-margin-one" : "admin-sheet-margin-bulk";
  const limit = parsed.data.scope === "one" ? 20 : 8;
  if (!allowLead(limitKey, limit, 60_000)) {
    return fail("Wait a minute and try again.");
  }

  const follow = parsed.data.intent === "follow";
  const engine = follow ? await getSheetPricingRule() : undefined;
  const rule = follow ? { type: "clear" as const } : toRule(parsed.data.intent, parsed.data.mode, parsed.data.amount);
  if ("message" in rule) return fail(rule.message);

  const slugs =
    parsed.data.scope === "one"
      ? parsed.data.slug
        ? [parsed.data.slug]
        : []
      : parsed.data.slugs.slice(0, MAX_MARGIN_BATCH);
  if (parsed.data.scope !== "filtered" && slugs.length === 0) {
    return fail("Choose at least one home.");
  }

  try {
    const result = await applySheetListingMargins({
      actor,
      scope: parsed.data.scope,
      slugs,
      filters: toFilters(parsed.data),
      rule,
      override: !follow,
      engine,
    });
    if (!result.ok) return fail(result.message);
    refreshSheetListingViews(result.slugs);
    return {
      ok: true,
      message: follow
        ? summarizeFollow(result.updated, result.skipped)
        : summarize(result.updated, result.skipped, rule.type === "clear"),
      stamp: Date.now(),
      updated: result.updated,
      skipped: result.skipped,
    };
  } catch (error) {
    console.error("[SHEET_LISTINGS_MARGIN]", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return fail("That markup did not save. Try again.");
  }
}

function toFilters(input: {
  view: string;
  q: string;
  min: string;
  max: string;
  city: string;
  region: string;
  margin: "all" | "with" | "without";
}): SheetListingAdminFilters {
  let minPrice = input.min ? parseDollars(input.min) : null;
  let maxPrice = input.max ? parseDollars(input.max) : null;
  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    const swap = minPrice;
    minPrice = maxPrice;
    maxPrice = swap;
  }
  return {
    view: parseSheetListingView(input.view),
    query: input.q.trim().slice(0, 80),
    minPrice,
    maxPrice,
    city: input.city.trim(),
    region: input.region.trim(),
    margin: input.margin,
  };
}

function toRule(
  intent: "set" | "clear" | "follow",
  mode: "flat" | "percent",
  amount: string,
): MarginRule | { message: string } {
  if (intent === "follow") return { type: "clear" };
  if (intent === "clear") return { type: "clear" };
  if (mode === "percent") {
    const bps = parseMarginPercentBps(amount);
    if (bps == null) return { message: "Enter a percent between 0.01 and 100." };
    return { type: "percent", bps };
  }
  const dollars = parseMarginDollars(amount);
  if (dollars == null) return { message: "Enter the markup in dollars, like 25000." };
  if (dollars === 0) return { type: "clear" };
  return { type: "flat", amount: dollars };
}

function summarize(updated: number, skipped: number, cleared: boolean) {
  const verb = cleared ? "cleared" : "updated";
  const homes = updated === 1 ? "1 home" : `${updated} homes`;
  const skip = skipped ? ` ${skipped} left unchanged.` : "";
  return `Markup ${verb} on ${homes}.${skip}`;
}

function summarizeFollow(updated: number, skipped: number) {
  const homes = updated === 1 ? "1 home now follows" : `${updated} homes now follow`;
  const skip = skipped ? ` ${skipped} already matched.` : "";
  return `${homes} the global rule.${skip}`;
}

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function fail(message: string): SheetMarginFormState {
  return { ...idleSheetMargin, message, stamp: Date.now() };
}
