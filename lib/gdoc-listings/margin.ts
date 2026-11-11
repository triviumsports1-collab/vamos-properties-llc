export const MAX_MARGIN_FLAT = 5_000_000;
export const MAX_MARGIN_PERCENT_BPS = 10_000;
export const MAX_MARGIN_BATCH = 250;
export const MAX_PRICING_TIERS = 12;

export type MarginRule =
  | { type: "clear" }
  | { type: "flat"; amount: number }
  | { type: "percent"; bps: number };

export type MarginFields = {
  marginAmount: number | null;
  marginPercentBps: number | null;
  finalDisplayPrice: number | null;
};

export function publicDisplayPrice(
  listPrice: number | null,
  finalDisplayPrice: number | null,
  marginAmount: number | null,
) {
  if (finalDisplayPrice != null) return finalDisplayPrice;
  if (listPrice != null && marginAmount != null) return listPrice + marginAmount;
  return listPrice;
}

export function applyMarginRule(listPrice: number | null, rule: MarginRule): MarginFields & { skipped: boolean } {
  if (rule.type === "clear") {
    return { marginAmount: null, marginPercentBps: null, finalDisplayPrice: listPrice, skipped: false };
  }
  if (listPrice == null) {
    if (rule.type === "flat") {
      return { marginAmount: rule.amount, marginPercentBps: null, finalDisplayPrice: null, skipped: false };
    }
    return { marginAmount: null, marginPercentBps: null, finalDisplayPrice: null, skipped: true };
  }
  if (rule.type === "flat") {
    const display = listPrice + rule.amount;
    if (display < 0 || display > 100_000_000) {
      return { marginAmount: null, marginPercentBps: null, finalDisplayPrice: listPrice, skipped: true };
    }
    return { marginAmount: rule.amount, marginPercentBps: null, finalDisplayPrice: display, skipped: false };
  }
  const amount = Math.round((listPrice * rule.bps) / 10_000);
  const display = listPrice + amount;
  if (display < 0 || display > 100_000_000) {
    return { marginAmount: null, marginPercentBps: null, finalDisplayPrice: listPrice, skipped: true };
  }
  return { marginAmount: amount, marginPercentBps: rule.bps, finalDisplayPrice: display, skipped: false };
}

export type PricingTier = {
  minPrice: number | null;
  maxPrice: number | null;
  mode: "flat" | "percent";
  flatAmount: number | null;
  percentBps: number | null;
};

export type GlobalPricingRule = {
  enabled: boolean;
  mode: "flat" | "percent";
  flatAmount: number | null;
  percentBps: number | null;
  tiers: PricingTier[];
};

export type EngineMatch =
  | { kind: "off" }
  | { kind: "tier"; rule: MarginRule; index: number }
  | { kind: "fallback"; rule: MarginRule }
  | { kind: "none" };

export function tierToMarginRule(tier: PricingTier): MarginRule | null {
  if (tier.mode === "flat" && tier.flatAmount != null && tier.flatAmount > 0) {
    return { type: "flat", amount: tier.flatAmount };
  }
  if (tier.mode === "percent" && tier.percentBps != null && tier.percentBps > 0) {
    return { type: "percent", bps: tier.percentBps };
  }
  return null;
}

export function globalRuleToMarginRule(rule: GlobalPricingRule | null | undefined): MarginRule | null {
  if (!rule?.enabled) return null;
  if (rule.mode === "flat" && rule.flatAmount != null && rule.flatAmount > 0) {
    return { type: "flat", amount: rule.flatAmount };
  }
  if (rule.mode === "percent" && rule.percentBps != null && rule.percentBps > 0) {
    return { type: "percent", bps: rule.percentBps };
  }
  return null;
}

export function pricingEngineIsArmed(rule: GlobalPricingRule | null | undefined) {
  if (!rule) return false;
  if (globalRuleToMarginRule({ ...rule, enabled: true })) return true;
  return (rule.tiers ?? []).some((tier) => tierToMarginRule(tier) != null);
}

export function priceInTier(listPrice: number, tier: PricingTier) {
  if (tier.minPrice != null && listPrice < tier.minPrice) return false;
  if (tier.maxPrice != null && listPrice >= tier.maxPrice) return false;
  return true;
}

export function matchPricingEngine(listPrice: number | null, engine: GlobalPricingRule | null | undefined): EngineMatch {
  if (!engine?.enabled) return { kind: "off" };
  const tiers = engine.tiers ?? [];
  if (listPrice != null && tiers.length > 0) {
    const index = tiers.findIndex((tier) => priceInTier(listPrice, tier));
    if (index >= 0) {
      const rule = tierToMarginRule(tiers[index]);
      if (rule) return { kind: "tier", rule, index };
    }
  }
  const fallback = globalRuleToMarginRule(engine);
  if (fallback) return { kind: "fallback", rule: fallback };
  return { kind: "none" };
}

export function engineMatchRule(match: EngineMatch): MarginRule | null {
  if (match.kind === "tier" || match.kind === "fallback") return match.rule;
  return null;
}

export function engineMatchReason(match: EngineMatch) {
  if (match.kind === "tier") return `tier:${match.index}`;
  if (match.kind === "fallback") return "fallback";
  if (match.kind === "off") return "engine_off";
  return "unmatched";
}

export function normalizeAndValidateTiers(
  raw: PricingTier[],
): { ok: true; tiers: PricingTier[] } | { ok: false; message: string } {
  if (raw.length > MAX_PRICING_TIERS) {
    return { ok: false, message: `Use up to ${MAX_PRICING_TIERS} price brackets.` };
  }
  for (let index = 0; index < raw.length; index += 1) {
    const tier = raw[index];
    if (tier.minPrice != null && tier.maxPrice != null && tier.minPrice >= tier.maxPrice) {
      return { ok: false, message: `Bracket ${index + 1} needs a max asking price above its min.` };
    }
    if (!tierToMarginRule(tier)) {
      return { ok: false, message: `Bracket ${index + 1} needs a markup amount.` };
    }
  }
  const sorted = [...raw].sort((left, right) => {
    const leftMin = left.minPrice ?? 0;
    const rightMin = right.minPrice ?? 0;
    if (leftMin !== rightMin) return leftMin - rightMin;
    const leftMax = left.maxPrice ?? Number.POSITIVE_INFINITY;
    const rightMax = right.maxPrice ?? Number.POSITIVE_INFINITY;
    return leftMax - rightMax;
  });
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      if (tiersOverlap(sorted[i], sorted[j])) {
        return { ok: false, message: "Price brackets cannot overlap. Make the max exclusive, like under 100000 then 100000 and up." };
      }
    }
  }
  return { ok: true, tiers: sorted };
}

function tiersOverlap(left: PricingTier, right: PricingTier) {
  const leftMin = left.minPrice ?? 0;
  const leftMax = left.maxPrice ?? Number.POSITIVE_INFINITY;
  const rightMin = right.minPrice ?? 0;
  const rightMax = right.maxPrice ?? Number.POSITIVE_INFINITY;
  return leftMin < rightMax && rightMin < leftMax;
}

export function resolveSyncMargin(
  listPrice: number | null,
  existing:
    | {
        marginOverride: boolean;
        marginAmount: number | null;
        marginPercentBps: number | null;
      }
    | undefined,
  engine: GlobalPricingRule | MarginRule | null,
): MarginFields & { marginOverride: boolean } {
  if (existing?.marginOverride) {
    return { ...recomputeStoredMargin(listPrice, existing.marginAmount, existing.marginPercentBps), marginOverride: true };
  }
  const rule = isMarginRule(engine) ? engine : engineMatchRule(matchPricingEngine(listPrice, engine));
  if (rule) {
    const next = applyMarginRule(listPrice, rule);
    if (next.skipped) {
      return {
        marginAmount: null,
        marginPercentBps: null,
        finalDisplayPrice: listPrice,
        marginOverride: false,
      };
    }
    return {
      marginAmount: next.marginAmount,
      marginPercentBps: next.marginPercentBps,
      finalDisplayPrice: next.finalDisplayPrice,
      marginOverride: false,
    };
  }
  if (existing) {
    return { ...recomputeStoredMargin(listPrice, existing.marginAmount, existing.marginPercentBps), marginOverride: false };
  }
  return { marginAmount: null, marginPercentBps: null, finalDisplayPrice: listPrice, marginOverride: false };
}

function isMarginRule(value: GlobalPricingRule | MarginRule | null | undefined): value is MarginRule {
  return Boolean(value && "type" in value);
}

export function formatGlobalRule(rule: GlobalPricingRule) {
  if (!rule.enabled) return "Off";
  if ((rule.tiers ?? []).length > 0) {
    const count = rule.tiers.length === 1 ? "1 bracket" : `${rule.tiers.length} brackets`;
    const fallback = globalRuleToMarginRule({ ...rule, enabled: true, tiers: [] });
    if (fallback?.type === "percent") return `On · ${count} · default ${formatMarginPercent(fallback.bps)}`;
    if (fallback?.type === "flat") {
      const grouped = fallback.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `On · ${count} · default $${grouped}`;
    }
    return `On · ${count}`;
  }
  const applied = globalRuleToMarginRule(rule);
  if (!applied) return "On, value missing";
  if (applied.type === "flat") {
    const grouped = applied.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `On · $${grouped} flat`;
  }
  if (applied.type === "percent") {
    return `On · ${formatMarginPercent(applied.bps)}`;
  }
  return "On, value missing";
}

export function formatTierRange(tier: PricingTier) {
  if (tier.minPrice == null && tier.maxPrice == null) return "Any asking price";
  if (tier.minPrice == null) return `Under ${formatAsking(tier.maxPrice)}`;
  if (tier.maxPrice == null) return `${formatAsking(tier.minPrice)} and up`;
  return `${formatAsking(tier.minPrice)} – under ${formatAsking(tier.maxPrice)}`;
}

function formatAsking(amount: number | null) {
  if (amount == null) return "";
  const grouped = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${grouped}`;
}

export function parsePriceBound(value: string): number | null | { error: true } {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\$?\d{1,3}(,\d{3})*$|^\$?\d+$/.test(trimmed)) return { error: true };
  const amount = Number(trimmed.replace(/[$,]/g, ""));
  if (!Number.isInteger(amount) || amount < 0 || amount > 100_000_000) return { error: true };
  return amount;
}

export function recomputeStoredMargin(
  listPrice: number | null,
  marginAmount: number | null | undefined,
  marginPercentBps: number | null | undefined,
): MarginFields {
  if (marginPercentBps != null && marginPercentBps > 0) {
    const next = applyMarginRule(listPrice, { type: "percent", bps: marginPercentBps });
    return { marginAmount: next.marginAmount, marginPercentBps: next.marginPercentBps, finalDisplayPrice: next.finalDisplayPrice };
  }
  if (marginAmount != null) {
    const next = applyMarginRule(listPrice, { type: "flat", amount: marginAmount });
    return { marginAmount: next.marginAmount, marginPercentBps: next.marginPercentBps, finalDisplayPrice: next.finalDisplayPrice };
  }
  return { marginAmount: null, marginPercentBps: null, finalDisplayPrice: listPrice };
}

export function sameMargin(left: MarginFields, right: MarginFields) {
  return (
    left.marginAmount === right.marginAmount &&
    left.marginPercentBps === right.marginPercentBps &&
    left.finalDisplayPrice === right.finalDisplayPrice
  );
}

export function parseMarginDollars(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\$?\d{1,3}(,\d{3})*$|^\$?\d+$/.test(trimmed)) return null;
  const amount = Number(trimmed.replace(/[$,]/g, ""));
  if (!Number.isInteger(amount) || amount < 0 || amount > MAX_MARGIN_FLAT) return null;
  return amount;
}

export function parseMarginPercentBps(value: string) {
  const compact = value.trim().replace(/%/g, "");
  if (!compact) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(compact)) return null;
  const percent = Number(compact);
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) return null;
  return Math.round(percent * 100);
}

export function formatMarginPercent(bps: number | null | undefined) {
  if (bps == null) return "";
  const percent = bps / 100;
  return Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}%`;
}

export function marginLabel(marginAmount: number | null, marginPercentBps: number | null) {
  if (marginAmount == null) return "None";
  if (marginPercentBps != null) return formatMarginPercent(marginPercentBps);
  return null;
}
