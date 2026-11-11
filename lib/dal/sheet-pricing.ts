import "server-only";

import { randomUUID } from "node:crypto";
import type { AdminActor } from "@/lib/dal/users";
import { requireAdmin } from "@/lib/admin/auth";
import {
  applyMarginRule,
  engineMatchReason,
  engineMatchRule,
  matchPricingEngine,
  pricingEngineIsArmed,
  sameMargin,
  type GlobalPricingRule,
  type PricingTier,
} from "@/lib/gdoc-listings/margin";
import type { SheetPricingRuleEventView, SheetPricingRuleView, SheetPricingTierView } from "@/lib/gdoc-listings/types";
import { getDb } from "@/src/prisma/db";

const CHUNK = 80;
const GLOBAL_SLUG = "__global__";

export async function getSheetPricingRule(): Promise<GlobalPricingRule> {
  const row = await ensureRule();
  return toEngine(row);
}

export async function getSheetPricingRuleAdmin(): Promise<SheetPricingRuleView> {
  await requireAdmin();
  const db = getDb();
  const [row, homes, customCount] = await Promise.all([
    ensureRule(),
    db.sheetListing.findMany({
      where: { marginOverride: false },
      select: { listPrice: true },
    }),
    db.sheetListing.count({ where: { marginOverride: true } }),
  ]);
  const engine = toEngine(row);
  const tiers: SheetPricingTierView[] = engine.tiers.map((tier) => ({ ...tier, matchCount: 0 }));
  let unmatchedCount = 0;
  let noPriceCount = 0;
  for (const home of homes) {
    if (home.listPrice == null) {
      noPriceCount += 1;
    }
    const match = matchPricingEngine(home.listPrice, { ...engine, enabled: true });
    if (match.kind === "tier") {
      tiers[match.index].matchCount += 1;
    } else if (engine.tiers.length > 0) {
      unmatchedCount += 1;
    }
  }
  return {
    ...engine,
    tiers,
    unmatchedCount,
    noPriceCount,
    updatedAt: row.updatedAt.toISOString(),
    updatedByEmail: row.updatedBy?.email ?? "",
    eligibleCount: homes.length,
    customCount,
  };
}

export async function listRecentSheetPricingRuleEvents(): Promise<SheetPricingRuleEventView[]> {
  await requireAdmin();
  const rows = await getDb().sheetPricingRuleEvent.findMany({
    orderBy: { id: "desc" },
    take: 8,
  });
  return rows.map((row) => ({
    actorEmail: row.actorEmail,
    action: row.action,
    nextEnabled: row.nextEnabled,
    nextMode: row.nextMode,
    nextFlatAmount: row.nextFlatAmount,
    nextPercentBps: row.nextPercentBps,
    updatedCount: row.updatedCount,
    skippedCount: row.skippedCount,
    heldCount: row.heldCount,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function saveSheetPricingRule(input: {
  actor: AdminActor;
  enabled: boolean;
  mode: "flat" | "percent";
  flatAmount: number | null;
  percentBps: number | null;
  tiers: PricingTier[];
}): Promise<{ ok: true } | { ok: false; message: string }> {
  await requireAdmin();
  const nextEngine: GlobalPricingRule = {
    enabled: input.enabled,
    mode: input.mode,
    flatAmount: input.mode === "flat" ? input.flatAmount : null,
    percentBps: input.mode === "percent" ? input.percentBps : null,
    tiers: input.tiers,
  };
  if (input.enabled && !pricingEngineIsArmed({ ...nextEngine, enabled: true })) {
    return { ok: false, message: "Add a default markup or at least one price bracket before turning the rule on." };
  }
  const previous = await ensureRule();
  const batchId = randomUUID();
  await getDb().$transaction(async (tx) => {
    const next = await tx.sheetPricingRule.update({
      where: { id: 1 },
      data: {
        enabled: nextEngine.enabled,
        mode: nextEngine.mode,
        flatAmount: nextEngine.flatAmount,
        percentBps: nextEngine.percentBps,
        updatedById: input.actor.id,
      },
    });
    await tx.sheetPricingTier.deleteMany({ where: { ruleId: 1 } });
    if (input.tiers.length > 0) {
      await tx.sheetPricingTier.createMany({
        data: input.tiers.map((tier, index) => ({
          ruleId: 1,
          sortOrder: index,
          minPrice: tier.minPrice,
          maxPrice: tier.maxPrice,
          mode: tier.mode,
          flatAmount: tier.mode === "flat" ? tier.flatAmount : null,
          percentBps: tier.mode === "percent" ? tier.percentBps : null,
        })),
      });
    }
    await tx.sheetPricingRuleEvent.create({
      data: {
        ruleId: 1,
        batchId,
        actorId: input.actor.id,
        actorEmail: input.actor.email,
        action: input.enabled === previous.enabled ? "update" : input.enabled ? "enable" : "disable",
        previousEnabled: previous.enabled,
        nextEnabled: next.enabled,
        previousMode: previous.mode,
        nextMode: next.mode,
        previousFlatAmount: previous.flatAmount,
        nextFlatAmount: next.flatAmount,
        previousPercentBps: previous.percentBps,
        nextPercentBps: next.percentBps,
        reason: JSON.stringify({
          fallback: { mode: next.mode, flatAmount: next.flatAmount, percentBps: next.percentBps },
          tiers: input.tiers,
        }),
      },
    });
    await tx.sheetListingMarginEvent.create({
      data: {
        listingId: null,
        listingCode: null,
        slug: GLOBAL_SLUG,
        batchId,
        actorId: input.actor.id,
        actorEmail: input.actor.email,
        action: "rule_save",
        mode: input.tiers.length > 0 ? "tiered" : next.mode,
        previousAmount: previous.flatAmount,
        nextAmount: next.flatAmount,
        previousPercentBps: previous.percentBps,
        nextPercentBps: next.percentBps,
        listPrice: null,
        previousDisplay: null,
        nextDisplay: null,
        reason: next.enabled ? `enabled;tiers:${input.tiers.length}` : "disabled",
      },
    });
  });
  return { ok: true };
}

export async function applyGlobalSheetPricingRule(actor: AdminActor): Promise<
  { ok: true; updated: number; skipped: number; held: number; unmatched: number; slugs: string[] } | { ok: false; message: string }
> {
  await requireAdmin();
  const rule = await ensureRule();
  const engine = toEngine(rule);
  if (!engine.enabled || !pricingEngineIsArmed(engine)) {
    return { ok: false, message: "Turn the global rule on and save a markup or price bracket first." };
  }

  const rows = await getDb().sheetListing.findMany({
    where: { marginOverride: false },
    select: {
      id: true,
      slug: true,
      listingCode: true,
      listPrice: true,
      marginAmount: true,
      marginPercentBps: true,
      finalDisplayPrice: true,
    },
    orderBy: { id: "asc" },
  });
  const held = await getDb().sheetListing.count({ where: { marginOverride: true } });
  if (rows.length === 0) {
    return { ok: false, message: held ? "Every home has a custom markup, so none were changed." : "No sheet homes to update." };
  }

  const now = new Date();
  const batchId = randomUUID();
  let updated = 0;
  let skipped = 0;
  let unmatched = 0;
  const slugs: string[] = [];

  for (let start = 0; start < rows.length; start += CHUNK) {
    const chunk = rows.slice(start, start + CHUNK);
    await getDb().$transaction(
      async (tx) => {
        for (const row of chunk) {
          const current = {
            marginAmount: row.marginAmount,
            marginPercentBps: row.marginPercentBps,
            finalDisplayPrice: row.finalDisplayPrice ?? row.listPrice,
          };
          const match = matchPricingEngine(row.listPrice, engine);
          const marginRule = engineMatchRule(match);
          if (!marginRule) {
            unmatched += 1;
            skipped += 1;
            continue;
          }
          const next = applyMarginRule(row.listPrice, marginRule);
          if (next.skipped || sameMargin(current, next)) {
            skipped += 1;
            continue;
          }
          await tx.sheetListing.update({
            where: { id: row.id },
            data: {
              marginAmount: next.marginAmount,
              marginPercentBps: next.marginPercentBps,
              finalDisplayPrice: next.finalDisplayPrice,
              marginOverride: false,
              marginUpdatedAt: now,
              marginUpdatedById: actor.id,
            },
          });
          await tx.sheetListingMarginEvent.create({
            data: {
              listingId: row.id,
              listingCode: row.listingCode,
              slug: row.slug,
              batchId,
              actorId: actor.id,
              actorEmail: actor.email,
              action: "global_set",
              mode: marginRule.type,
              previousAmount: row.marginAmount,
              nextAmount: next.marginAmount,
              previousPercentBps: row.marginPercentBps,
              nextPercentBps: next.marginPercentBps,
              listPrice: row.listPrice,
              previousDisplay: current.finalDisplayPrice,
              nextDisplay: next.finalDisplayPrice,
              reason: `apply_global;${engineMatchReason(match)}`,
            },
          });
          updated += 1;
          slugs.push(row.slug);
        }
      },
      { timeout: 20_000, maxWait: 5_000 },
    );
  }

  await getDb().sheetPricingRuleEvent.create({
    data: {
      ruleId: 1,
      batchId,
      actorId: actor.id,
      actorEmail: actor.email,
      action: "apply_all",
      previousEnabled: rule.enabled,
      nextEnabled: rule.enabled,
      previousMode: rule.mode,
      nextMode: rule.mode,
      previousFlatAmount: rule.flatAmount,
      nextFlatAmount: rule.flatAmount,
      previousPercentBps: rule.percentBps,
      nextPercentBps: rule.percentBps,
      updatedCount: updated,
      skippedCount: skipped,
      heldCount: held,
      reason: JSON.stringify({ unmatched, tiers: engine.tiers.length }),
    },
  });
  await getDb().sheetListingMarginEvent.create({
    data: {
      listingId: null,
      listingCode: null,
      slug: GLOBAL_SLUG,
      batchId,
      actorId: actor.id,
      actorEmail: actor.email,
      action: "rule_apply",
      mode: engine.tiers.length > 0 ? "tiered" : engine.mode,
      previousAmount: rule.flatAmount,
      nextAmount: engine.flatAmount,
      previousPercentBps: rule.percentBps,
      nextPercentBps: engine.percentBps,
      listPrice: null,
      previousDisplay: null,
      nextDisplay: null,
      reason: `updated:${updated};skipped:${skipped};unmatched:${unmatched};custom:${held}`,
    },
  });

  if (updated === 0) {
    if (unmatched && unmatched === skipped) {
      return { ok: false, message: "No unlocked homes matched a price bracket, and there is no default markup." };
    }
    return { ok: false, message: skipped ? "Those homes already match the global rule." : "No sheet homes were changed." };
  }
  return { ok: true, updated, skipped, held, unmatched, slugs };
}

async function ensureRule() {
  const db = getDb();
  return db.sheetPricingRule.upsert({
    where: { id: 1 },
    create: { id: 1, enabled: false, mode: "percent" },
    update: {},
    include: {
      updatedBy: { select: { email: true } },
      tiers: { orderBy: { sortOrder: "asc" } },
    },
  });
}

function toEngine(row: {
  enabled: boolean;
  mode: string;
  flatAmount: number | null;
  percentBps: number | null;
  tiers?: Array<{
    minPrice: number | null;
    maxPrice: number | null;
    mode: string;
    flatAmount: number | null;
    percentBps: number | null;
  }>;
}): GlobalPricingRule {
  return {
    enabled: row.enabled,
    mode: row.mode === "flat" ? "flat" : "percent",
    flatAmount: row.flatAmount,
    percentBps: row.percentBps,
    tiers: (row.tiers ?? []).map((tier) => ({
      minPrice: tier.minPrice,
      maxPrice: tier.maxPrice,
      mode: tier.mode === "flat" ? "flat" : "percent",
      flatAmount: tier.flatAmount,
      percentBps: tier.percentBps,
    })),
  };
}
