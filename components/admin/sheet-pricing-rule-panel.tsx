"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormNotice, Spinner } from "@/components/admin/status-form";
import { formatWhen } from "@/lib/admin/clock";
import { sheetPricingRuleEventLabel } from "@/lib/gdoc-listings/display";
import { formatGlobalRule, formatMarginPercent, formatTierRange, MAX_PRICING_TIERS } from "@/lib/gdoc-listings/margin";
import { saveSheetPricingRuleForm } from "@/lib/gdoc-listings/pricing-actions";
import {
  idleSheetPricing,
  type SheetPricingRuleEventView,
  type SheetPricingRuleView,
  type SheetPricingTierView,
} from "@/lib/gdoc-listings/types";

type DraftTier = {
  min: string;
  max: string;
  mode: "flat" | "percent";
  amount: string;
};

export function SheetPricingRulePanel({
  rule,
  events,
}: {
  rule: SheetPricingRuleView;
  events: SheetPricingRuleEventView[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveSheetPricingRuleForm, idleSheetPricing);
  const applyRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"flat" | "percent">(rule.mode);
  const [enabled, setEnabled] = useState(rule.enabled);
  const [tiers, setTiers] = useState<DraftTier[]>(() => toDraftTiers(rule.tiers));

  useEffect(() => {
    setMode(rule.mode);
    setEnabled(rule.enabled);
    setTiers(toDraftTiers(rule.tiers));
  }, [rule.mode, rule.enabled, rule.updatedAt]);

  useEffect(() => {
    if (!state.stamp) return;
    if (state.ok) {
      applyRef.current?.close();
      router.refresh();
    }
  }, [state.stamp, state.ok, router]);

  const canApply = rule.enabled && rule.eligibleCount > 0;
  const defaultAmount =
    mode === "percent"
      ? rule.percentBps != null
        ? String(rule.percentBps / 100)
        : ""
      : rule.flatAmount != null
        ? String(rule.flatAmount)
        : "";

  function addTier() {
    if (tiers.length >= MAX_PRICING_TIERS) return;
    const previous = tiers[tiers.length - 1];
    setTiers([
      ...tiers,
      {
        min: previous?.max || "",
        max: "",
        mode: previous?.mode || mode,
        amount: previous?.amount || defaultAmount,
      },
    ]);
  }

  function updateTier(index: number, patch: Partial<DraftTier>) {
    setTiers((current) => current.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));
  }

  function removeTier(index: number) {
    setTiers((current) => current.filter((_, i) => i !== index));
  }

  return (
    <section className="border border-line bg-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Global default markup</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            When this rule is on, new and updated sheet copies get markup from a matching asking-price bracket, or from
            the default if no bracket matches. Custom markups stay locked.
          </p>
        </div>
        <p className="inline-flex min-h-8 items-center bg-navy px-2 text-xs font-semibold uppercase tracking-[0.08em] text-white">
          {formatGlobalRule(rule)}
        </p>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted">Homes that follow this rule</dt>
          <dd className="mt-1 text-base font-semibold text-ink">{rule.eligibleCount}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Custom markups</dt>
          <dd className="mt-1 text-base font-semibold text-ink">{rule.customCount}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Last saved</dt>
          <dd className="mt-1 text-base font-semibold text-ink">
            {rule.updatedAt ? formatWhen(rule.updatedAt) : "Not saved yet"}
            {rule.updatedByEmail ? <span className="block text-sm font-normal text-muted">{rule.updatedByEmail}</span> : null}
          </dd>
        </div>
      </dl>
      {rule.tiers.length > 0 ? (
        <ul className="mt-4 grid gap-2 text-sm text-ink">
          {rule.tiers.map((tier, index) => (
            <li key={`${tier.minPrice}-${tier.maxPrice}-${index}`} className="border border-line bg-mist px-3 py-2">
              {formatTierRange(tier)}
              {" · "}
              {tier.mode === "percent" && tier.percentBps != null
                ? formatMarginPercent(tier.percentBps)
                : tier.flatAmount != null
                  ? `$${tier.flatAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
                  : "No markup"}
              <span className="text-muted">
                {" · "}
                {tier.matchCount === 1 ? "1 home" : `${tier.matchCount} homes`}
              </span>
            </li>
          ))}
          {rule.unmatchedCount > 0 ? (
            <li className="text-muted">
              {rule.unmatchedCount === 1 ? "1 unlocked home" : `${rule.unmatchedCount} unlocked homes`} sit outside these
              brackets
              {rule.noPriceCount ? `, including ${rule.noPriceCount} with no asking price` : ""}. They use the default
              markup if you set one.
            </li>
          ) : null}
        </ul>
      ) : null}
      <form action={action} className="mt-5 grid gap-4" aria-busy={pending} key={rule.updatedAt ?? "new"}>
        <FormNotice state={{ ok: state.ok, message: state.message, stamp: state.stamp }} />
        <fieldset>
          <legend className="text-sm text-ink">Rule</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            <label className="inline-flex min-h-11 items-center gap-2 text-base text-ink">
              <input
                type="radio"
                name="enabled"
                value="on"
                checked={enabled}
                onChange={() => setEnabled(true)}
                className="size-4"
              />
              On
            </label>
            <label className="inline-flex min-h-11 items-center gap-2 text-base text-ink">
              <input
                type="radio"
                name="enabled"
                value="off"
                checked={!enabled}
                onChange={() => setEnabled(false)}
                className="size-4"
              />
              Off
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm text-ink">Default markup</legend>
          <p className="mt-1 text-sm leading-6 text-muted">
            Used when a home has no asking price or sits outside every bracket. Leave blank if every home should match a
            bracket.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <label className="inline-flex min-h-11 items-center gap-2 text-base text-ink">
              <input type="radio" name="mode" value="flat" checked={mode === "flat"} onChange={() => setMode("flat")} className="size-4" />
              Flat dollars
            </label>
            <label className="inline-flex min-h-11 items-center gap-2 text-base text-ink">
              <input
                type="radio"
                name="mode"
                value="percent"
                checked={mode === "percent"}
                onChange={() => setMode("percent")}
                className="size-4"
              />
              Percent of asking
            </label>
          </div>
        </fieldset>
        <div>
          <label className="block text-sm text-ink" htmlFor="global-amount">
            {mode === "percent" ? "Default percent" : "Default markup dollars"}
          </label>
          <input
            id="global-amount"
            name="amount"
            defaultValue={defaultAmount}
            inputMode="decimal"
            placeholder={mode === "percent" ? "10" : "25000"}
            className="mt-1 min-h-12 w-full max-w-xs border border-line bg-paper px-3 text-base text-ink"
          />
        </div>
        <fieldset>
          <legend className="text-sm text-ink">Price brackets</legend>
          <p className="mt-1 text-sm leading-6 text-muted">
            Max asking price is exclusive. A home listed at $100,000 uses the bracket that starts at 100000, not the one
            that ends there.
          </p>
          <div className="mt-3 grid gap-4">
            {tiers.map((tier, index) => (
              <div key={index} className="grid gap-3 border border-line bg-paper p-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-ink" htmlFor={`tier-min-${index}`}>
                    Min asking
                  </label>
                  <input
                    id={`tier-min-${index}`}
                    name="tierMin"
                    value={tier.min}
                    onChange={(event) => updateTier(index, { min: event.target.value })}
                    inputMode="numeric"
                    placeholder="0"
                    className="mt-1 min-h-12 w-full border border-line bg-panel px-3 text-base text-ink"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink" htmlFor={`tier-max-${index}`}>
                    Max asking (exclusive)
                  </label>
                  <input
                    id={`tier-max-${index}`}
                    name="tierMax"
                    value={tier.max}
                    onChange={(event) => updateTier(index, { max: event.target.value })}
                    inputMode="numeric"
                    placeholder="Leave blank for no ceiling"
                    className="mt-1 min-h-12 w-full border border-line bg-panel px-3 text-base text-ink"
                  />
                </div>
                <fieldset className="sm:col-span-2">
                  <legend className="text-sm text-ink">Markup type</legend>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <label className="inline-flex min-h-11 items-center gap-2 text-base text-ink">
                      <input
                        type="radio"
                        name={`tierModeChoice-${index}`}
                        checked={tier.mode === "flat"}
                        onChange={() => updateTier(index, { mode: "flat" })}
                        className="size-4"
                      />
                      Flat dollars
                    </label>
                    <label className="inline-flex min-h-11 items-center gap-2 text-base text-ink">
                      <input
                        type="radio"
                        name={`tierModeChoice-${index}`}
                        checked={tier.mode === "percent"}
                        onChange={() => updateTier(index, { mode: "percent" })}
                        className="size-4"
                      />
                      Percent of asking
                    </label>
                  </div>
                  <input type="hidden" name="tierMode" value={tier.mode} />
                </fieldset>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-ink" htmlFor={`tier-amount-${index}`}>
                    {tier.mode === "percent" ? "Percent" : "Markup dollars"}
                  </label>
                  <input
                    id={`tier-amount-${index}`}
                    name="tierAmount"
                    value={tier.amount}
                    onChange={(event) => updateTier(index, { amount: event.target.value })}
                    inputMode="decimal"
                    placeholder={tier.mode === "percent" ? "10" : "25000"}
                    className="mt-1 min-h-12 w-full max-w-xs border border-line bg-panel px-3 text-base text-ink"
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center text-sm text-pine"
                  onClick={() => removeTier(index)}
                >
                  Remove this bracket
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 inline-flex min-h-11 items-center border border-line bg-paper px-3 text-sm text-ink disabled:opacity-60"
            onClick={addTier}
            disabled={tiers.length >= MAX_PRICING_TIERS}
          >
            Add a price bracket
          </button>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="intent"
            value="save"
            disabled={pending}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-60"
          >
            {pending ? <Spinner label="Saving…" /> : "Save global rule"}
          </button>
          <button
            type="button"
            disabled={pending || !canApply}
            className="inline-flex min-h-12 items-center border border-line bg-paper px-4 text-base text-ink disabled:opacity-60"
            onClick={() => applyRef.current?.showModal()}
          >
            Apply global rule to all listings
          </button>
        </div>
      </form>
      <dialog ref={applyRef} className="dialog-box">
        <form action={action} aria-busy={pending}>
          <h3 className="text-lg font-semibold text-ink">Apply the saved brackets to every matching home?</h3>
          <p className="mt-3 text-base leading-7 text-muted">
            This recalculates display price on {rule.eligibleCount === 1 ? "1 home" : `${rule.eligibleCount} homes`} that
            follow the global rule, using the saved price brackets.{" "}
            {rule.customCount === 1 ? "1 custom markup stays" : `${rule.customCount} custom markups stay`} as set. Homes
            that do not match a bracket keep their current markup unless you also saved a default.
          </p>
          <FormNotice state={{ ok: state.ok, message: state.message, stamp: state.stamp }} />
          <input type="hidden" name="enabled" value={rule.enabled ? "on" : "off"} />
          <input type="hidden" name="mode" value={rule.mode} />
          <input type="hidden" name="amount" value={defaultAmount} />
          <input type="hidden" name="intent" value="apply" />
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending || !canApply}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-navy px-4 text-base font-semibold text-white disabled:opacity-60"
            >
              {pending ? <Spinner label="Applying…" /> : "Apply to all listings"}
            </button>
            <button type="button" className="inline-flex min-h-11 items-center px-4 text-base text-pine" onClick={() => applyRef.current?.close()}>
              Cancel
            </button>
          </div>
        </form>
      </dialog>
      {events.length > 0 ? (
        <details className="mt-6 border-t border-line pt-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            Rule history
          </summary>
          <ul className="mt-3 grid gap-1 text-sm text-muted">
            {events.map((event) => (
              <li key={`${event.createdAt}-${event.action}`}>
                {sheetPricingRuleEventLabel(event)}
                {event.actorEmail ? ` · ${event.actorEmail}` : ""}
                {" · "}
                {formatWhen(event.createdAt)}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

function toDraftTiers(tiers: SheetPricingTierView[]): DraftTier[] {
  return tiers.map((tier) => ({
    min: tier.minPrice != null ? String(tier.minPrice) : "",
    max: tier.maxPrice != null ? String(tier.maxPrice) : "",
    mode: tier.mode,
    amount:
      tier.mode === "percent" && tier.percentBps != null
        ? String(tier.percentBps / 100)
        : tier.flatAmount != null
          ? String(tier.flatAmount)
          : "",
  }));
}
