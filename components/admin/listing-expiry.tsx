"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormNotice, Spinner } from "@/components/admin/status-form";
import { idleForm } from "@/lib/admin/schema";
import {
  EXPIRY_DAY_PRESETS,
  MAX_EXPIRY_DAYS,
  MIN_EXPIRY_DAYS,
  type LifecycleSettings,
} from "@/lib/gdoc-listings/lifecycle";
import { runListingExpiryCheckForm, saveLifecycleSettingsForm } from "@/lib/gdoc-listings/lifecycle-actions";

function useRefreshOnSave(state: { stamp: number; ok: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (state.stamp && state.ok) router.refresh();
  }, [state.stamp, state.ok, router]);
}

/** Inventory strip: expiry rule summary, counts, and the one-click expiry check. */
export function ListingExpiryBar({
  settings,
  expiringSoon,
  overdue,
  expiringHref,
  expiredHref,
  settingsHref,
}: {
  settings: LifecycleSettings;
  expiringSoon: number;
  overdue: number;
  expiringHref: string;
  expiredHref: string;
  settingsHref: string;
}) {
  const [state, action, pending] = useActionState(runListingExpiryCheckForm, idleForm);
  const confirmRef = useRef<HTMLDialogElement>(null);
  useRefreshOnSave(state);
  useEffect(() => {
    if (state.stamp) confirmRef.current?.close();
  }, [state.stamp]);

  return (
    <section className="border border-line bg-panel p-4" aria-labelledby="expiry-bar-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="expiry-bar-heading" className="text-base font-semibold text-ink">
            Listing expiry
          </h2>
          <p className="mt-1 text-sm text-muted">
            {settings.autoExpire
              ? `Active homes expire ${settings.expiryDays} ${settings.expiryDays === 1 ? "day" : "days"} after they go live. Expired homes leave the public site right away and stay Inactive through sheet copies.`
              : "Auto-expiry is off. Homes stay active until you or the sheet change them."}{" "}
            <Link href={settingsHref} className="text-pine">
              Change
            </Link>
          </p>
          <p className="mt-2 flex flex-wrap gap-3 text-sm">
            <Link href={expiringHref} className="text-ink">
              <span className="font-semibold">{expiringSoon}</span> expiring within {settings.expiringSoonDays}{" "}
              {settings.expiringSoonDays === 1 ? "day" : "days"}
            </Link>
            <Link href={expiredHref} className={overdue > 0 ? "font-semibold text-ink" : "text-ink"}>
              <span className="font-semibold">{overdue}</span> overdue (hidden, not yet marked Inactive)
            </Link>
          </p>
        </div>
        <button
          type="button"
          disabled={!settings.autoExpire}
          onClick={() => confirmRef.current?.showModal()}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-50"
        >
          Deactivate expired listings{overdue > 0 ? ` (${overdue})` : ""}
        </button>
      </div>
      <FormNotice state={state} />
      <dialog ref={confirmRef} className="dialog-box" aria-labelledby="expiry-confirm-heading">
        <form action={action} aria-busy={pending}>
          <h3 id="expiry-confirm-heading" className="text-lg font-semibold text-ink">
            Deactivate expired listings?
          </h3>
          <p className="mt-3 text-base leading-7 text-muted">
            {overdue === 0
              ? "No homes are overdue right now. Running the check is safe and changes nothing."
              : `${overdue} ${overdue === 1 ? "home" : "homes"} past the active window will be set to Inactive (expired). Renew a home to show it again.`}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-60"
            >
              {pending ? <Spinner label="Checking…" /> : "Run expiry check"}
            </button>
            <button
              type="button"
              className="inline-flex min-h-12 items-center border border-line bg-paper px-4 text-base text-ink"
              onClick={() => confirmRef.current?.close()}
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}

/** Rules tab: default window length, expiring-soon threshold, auto-expiry switch. */
export function ListingExpirySettingsForm({
  settings,
  updatedLabel,
}: {
  settings: LifecycleSettings;
  updatedLabel: string;
}) {
  const [state, action, pending] = useActionState(saveLifecycleSettingsForm, idleForm);
  const [days, setDays] = useState(String(settings.expiryDays));
  useRefreshOnSave(state);
  const preset = EXPIRY_DAY_PRESETS.some((item) => String(item) === days);

  return (
    <section id="expiry" className="border border-line bg-panel p-5" aria-labelledby="expiry-settings-heading">
      <h2 id="expiry-settings-heading" className="text-lg font-semibold text-ink">
        Listing expiry
      </h2>
      <p className="mt-1 text-sm text-muted">
        How long a home stays on the public site after it goes live, is restored, or is renewed.
        {updatedLabel ? ` ${updatedLabel}` : ""}
      </p>
      <form action={action} className="mt-4 grid gap-4" aria-busy={pending}>
        <FormNotice state={state} />
        <label className="flex min-h-12 items-center gap-3 text-base text-ink">
          <input type="checkbox" name="autoExpire" value="yes" defaultChecked={settings.autoExpire} className="size-5" />
          Expire active homes automatically
        </label>
        <fieldset>
          <legend className="text-sm text-ink">Default active window</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXPIRY_DAY_PRESETS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDays(String(item))}
                aria-pressed={days === String(item)}
                className={`inline-flex min-h-11 items-center border px-3 text-sm ${
                  days === String(item) ? "border-navy bg-navy text-white" : "border-line bg-paper text-ink"
                }`}
              >
                {item} days
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm text-ink" htmlFor="expiryDays">
            {preset ? "Or enter days" : "Days"}
          </label>
          <input
            id="expiryDays"
            name="expiryDays"
            type="number"
            inputMode="numeric"
            min={MIN_EXPIRY_DAYS}
            max={MAX_EXPIRY_DAYS}
            required
            value={days}
            onChange={(event) => setDays(event.target.value)}
            className="mt-1 min-h-12 w-40 border border-line bg-paper px-3 text-base text-ink"
          />
        </fieldset>
        <div>
          <label className="block text-sm text-ink" htmlFor="expiringSoonDays">
            Flag as “expiring soon” this many days before
          </label>
          <input
            id="expiringSoonDays"
            name="expiringSoonDays"
            type="number"
            inputMode="numeric"
            min={0}
            max={30}
            defaultValue={settings.expiringSoonDays}
            className="mt-1 min-h-12 w-40 border border-line bg-paper px-3 text-base text-ink"
          />
        </div>
        <label className="flex min-h-12 items-start gap-3 text-base text-ink">
          <input type="checkbox" name="applyToActive" value="yes" className="mt-1 size-5" />
          <span>
            Also re-time homes that are active now
            <span className="block text-sm text-muted">
              Off: only homes that go live or are renewed from now on use the new length. On: every running window is
              recalculated from its start date, which can expire some homes right away. Homes set to “no expiry” are not
              changed.
            </span>
          </span>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-60 sm:justify-self-start"
        >
          {pending ? <Spinner label="Saving…" /> : "Save expiry settings"}
        </button>
      </form>
    </section>
  );
}
