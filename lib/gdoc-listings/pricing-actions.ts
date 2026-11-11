"use server";

import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin/auth";
import { applyGlobalSheetPricingRule, saveSheetPricingRule } from "@/lib/dal/sheet-pricing";
import { refreshSheetListingViews } from "@/lib/gdoc-listings/cache";
import {
  normalizeAndValidateTiers,
  parseMarginDollars,
  parseMarginPercentBps,
  parsePriceBound,
  type PricingTier,
} from "@/lib/gdoc-listings/margin";
import { sheetPricingRuleSchema } from "@/lib/gdoc-listings/margin-schema";
import { idleSheetPricing, type SheetPricingFormState } from "@/lib/gdoc-listings/types";
import { allowLead } from "@/lib/leads/rate-limit";

export async function saveSheetPricingRuleForm(
  _previous: SheetPricingFormState,
  formData: FormData,
): Promise<SheetPricingFormState> {
  const actor = await requireAdmin();
  const parsed = sheetPricingRuleSchema.safeParse({
    enabled: field(formData, "enabled") || "off",
    mode: field(formData, "mode") || "percent",
    amount: field(formData, "amount"),
    intent: field(formData, "intent"),
    tierMin: fields(formData, "tierMin"),
    tierMax: fields(formData, "tierMax"),
    tierMode: fields(formData, "tierMode"),
    tierAmount: fields(formData, "tierAmount"),
  });
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Check the global rule and try again.");
  }

  const apply = parsed.data.intent === "apply";
  if (!allowLead(apply ? "admin-sheet-pricing-apply" : "admin-sheet-pricing-save", apply ? 4 : 12, 60_000)) {
    return fail("Wait a minute and try again.");
  }

  try {
    if (apply) {
      const result = await applyGlobalSheetPricingRule(actor);
      if (!result.ok) return fail(result.message);
      refreshSheetListingViews(result.slugs);
      return {
        ok: true,
        message: summarizeApply(result.updated, result.skipped, result.held, result.unmatched),
        stamp: Date.now(),
        updated: result.updated,
        skipped: result.skipped,
        held: result.held,
      };
    }

    const mode = parsed.data.mode === "flat" ? "flat" : "percent";
    const enabled = parsed.data.enabled === "on";
    const rawAmount = typeof parsed.data.amount === "string" ? parsed.data.amount : "";
    const amounts = toAmounts(mode, rawAmount, enabled && parsed.data.tierMin.length === 0);
    if ("message" in amounts) return fail(amounts.message);
    const tiers = toTiers(
      parsed.data.tierMin,
      parsed.data.tierMax,
      parsed.data.tierMode,
      parsed.data.tierAmount,
    );
    if ("message" in tiers) return fail(tiers.message);

    const saved = await saveSheetPricingRule({
      actor,
      enabled,
      mode,
      flatAmount: amounts.flatAmount,
      percentBps: amounts.percentBps,
      tiers,
    });
    if (!saved.ok) return fail(saved.message);
    refreshSheetListingViews();
    return {
      ok: true,
      message: enabled
        ? tiers.length
          ? "Price brackets saved. New sheet copies pick them up. Use Apply to update homes already in the desk."
          : "Global rule saved. New sheet copies pick it up. Use Apply to update homes already in the desk."
        : "Global rule turned off. Existing markups stay until you change them.",
      stamp: Date.now(),
      updated: 0,
      skipped: 0,
      held: 0,
    };
  } catch (error) {
    console.error("[SHEET_PRICING_RULE]", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return fail("That global rule did not save. Try again.");
  }
}

function toTiers(
  mins: string[],
  maxes: string[],
  modes: Array<"flat" | "percent" | string>,
  amounts: string[],
): PricingTier[] | { message: string } {
  const count = Math.max(mins.length, maxes.length, modes.length, amounts.length);
  if (count === 0) return [];
  const draft: PricingTier[] = [];
  for (let index = 0; index < count; index += 1) {
    const min = parsePriceBound(mins[index] ?? "");
    const max = parsePriceBound(maxes[index] ?? "");
    if (typeof min === "object" && min) {
      return { message: `Bracket ${index + 1} needs a whole-dollar min asking price, or leave it blank.` };
    }
    if (typeof max === "object" && max) {
      return { message: `Bracket ${index + 1} needs a whole-dollar max asking price, or leave it blank.` };
    }
    const mode = modes[index] === "flat" ? "flat" : "percent";
    const parsed = toAmounts(mode, amounts[index] ?? "", true);
    if ("message" in parsed) return { message: `Bracket ${index + 1}: ${parsed.message}` };
    draft.push({
      minPrice: typeof min === "number" ? min : null,
      maxPrice: typeof max === "number" ? max : null,
      mode,
      flatAmount: parsed.flatAmount,
      percentBps: parsed.percentBps,
    });
  }
  const valid = normalizeAndValidateTiers(draft);
  if (!valid.ok) return { message: valid.message };
  return valid.tiers;
}

function toAmounts(
  mode: "flat" | "percent",
  rawAmount: string | undefined,
  required: boolean,
): { message: string } | { flatAmount: number | null; percentBps: number | null } {
  const amount = rawAmount ?? "";
  if (mode === "percent") {
    if (!amount.trim()) {
      if (required) return { message: "Enter a percent between 0.01 and 100." };
      return { flatAmount: null, percentBps: null };
    }
    const bps = parseMarginPercentBps(amount);
    if (bps == null) return { message: "Enter a percent between 0.01 and 100." };
    return { flatAmount: null, percentBps: bps };
  }
  if (!amount.trim()) {
    if (required) return { message: "Enter the markup in dollars, like 25000." };
    return { flatAmount: null, percentBps: null };
  }
  const dollars = parseMarginDollars(amount);
  if (dollars == null) return { message: "Enter the markup in dollars, like 25000." };
  if (dollars === 0 && required) return { message: "Enter a markup above $0, or turn the rule off." };
  return { flatAmount: dollars === 0 ? null : dollars, percentBps: null };
}

function summarizeApply(updated: number, skipped: number, held: number, unmatched: number) {
  const homes = updated === 1 ? "1 home" : `${updated} homes`;
  const skip = skipped ? ` ${skipped} already matched.` : "";
  const miss = unmatched ? ` ${unmatched} did not match a bracket.` : "";
  const custom = held ? ` ${held} custom markup${held === 1 ? " was" : "s were"} left alone.` : "";
  return `Global rule applied to ${homes}.${skip}${miss}${custom}`;
}

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function fields(formData: FormData, name: string) {
  return formData.getAll(name).filter((value): value is string => typeof value === "string");
}

function fail(message: string): SheetPricingFormState {
  return { ...idleSheetPricing, message, stamp: Date.now() };
}
