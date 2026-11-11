"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormNotice, Spinner } from "@/components/admin/status-form";
import { idleForm, type AdminFormState } from "@/lib/admin/schema";
import {
  deleteSheetListingForm,
  inactivateSheetListingForm,
  restoreSheetListingForm,
} from "@/lib/gdoc-listings/admin-actions";
import { sheetListingHref } from "@/lib/gdoc-listings/display";

export function SheetListingRowActions({
  slug,
  title,
  removed,
  publicVisible,
  compact = false,
}: {
  slug: string;
  title: string;
  removed: boolean;
  publicVisible: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const offRef = useRef<HTMLDialogElement>(null);
  const onRef = useRef<HTMLDialogElement>(null);
  const delRef = useRef<HTMLDialogElement>(null);
  const [offState, offAction, offPending] = useActionState(inactivateSheetListingForm, idleForm);
  const [onState, onAction, onPending] = useActionState(restoreSheetListingForm, idleForm);
  const [delState, delAction, delPending] = useActionState(deleteSheetListingForm, idleForm);
  const stamp = Math.max(offState.stamp, onState.stamp, delState.stamp);
  const notice = latestNotice([offState, onState, delState]);

  useEffect(() => {
    if (!stamp) return;
    offRef.current?.close();
    onRef.current?.close();
    delRef.current?.close();
    router.refresh();
  }, [stamp, router]);

  const editLink = (
    <Link
      href={`/admin/sheet-listings/${encodeURIComponent(slug)}`}
      className="inline-flex min-h-11 items-center border border-line bg-paper px-3 text-sm text-ink"
    >
      Edit
    </Link>
  );
  const extraActions = (
    <>
      {publicVisible ? (
        <Link href={sheetListingHref(slug)} className="inline-flex min-h-11 items-center px-3 text-sm text-pine">
          Public page
        </Link>
      ) : null}
      {removed ? (
        <button
          type="button"
          className="inline-flex min-h-11 items-center border border-line bg-paper px-3 text-sm text-ink"
          onClick={() => onRef.current?.showModal()}
        >
          Restore
        </button>
      ) : (
        <button
          type="button"
          className="inline-flex min-h-11 items-center border border-line bg-paper px-3 text-sm text-ink"
          onClick={() => offRef.current?.showModal()}
        >
          Take off page
        </button>
      )}
      <button
        type="button"
        className="inline-flex min-h-11 items-center border border-line bg-paper px-3 text-sm text-ink"
        onClick={() => delRef.current?.showModal()}
      >
        Remove
      </button>
    </>
  );

  return (
    <div className={`${compact ? "mt-1" : "mt-3"} flex flex-wrap items-center gap-2`}>
      {compact ? (
        <>
          {editLink}
          <details className="relative">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center px-3 text-sm text-pine [&::-webkit-details-marker]:hidden">
              More
            </summary>
            <div className="absolute right-0 z-20 mt-1 flex min-w-40 max-w-[calc(100vw-2rem)] flex-col border border-line bg-panel p-2 shadow-lg">
              {extraActions}
            </div>
          </details>
        </>
      ) : (
        <>
          {editLink}
          {extraActions}
        </>
      )}
      {notice ? <div className="basis-full">{notice}</div> : null}

      <ConfirmDialog
        dialogRef={offRef}
        title="Take this home off the public page?"
        body={`${title} will show as Inactive on this desk. It stays in the database. A later sheet copy can bring it back unless you keep the desk copy.`}
        confirmLabel="Take it off"
        pendingLabel="Hiding…"
        action={offAction}
        pending={offPending}
        slug={slug}
        state={offState}
      />
      <ConfirmDialog
        dialogRef={onRef}
        title="Restore this home to Active?"
        body={`${title} will show on the public sheet catalog again.`}
        confirmLabel="Restore"
        pendingLabel="Restoring…"
        action={onAction}
        pending={onPending}
        slug={slug}
        state={onState}
      />
      <ConfirmDialog
        dialogRef={delRef}
        title="Remove this home from the desk?"
        body={`${title} will be deleted from Postgres. This does not change the Google Sheet. The next copy can recreate it.`}
        confirmLabel="Remove from desk"
        pendingLabel="Removing…"
        action={delAction}
        pending={delPending}
        slug={slug}
        state={delState}
        danger
      />
    </div>
  );
}

function latestNotice(states: AdminFormState[]) {
  const current = [...states].sort((left, right) => right.stamp - left.stamp)[0];
  if (!current?.message || !current.stamp) return null;
  return <FormNotice state={current} />;
}

function ConfirmDialog({
  dialogRef,
  title,
  body,
  confirmLabel,
  pendingLabel,
  action,
  pending,
  slug,
  state,
  danger,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  title: string;
  body: string;
  confirmLabel: string;
  pendingLabel: string;
  action: (formData: FormData) => void;
  pending: boolean;
  slug: string;
  state: AdminFormState;
  danger?: boolean;
}) {
  return (
    <dialog
      ref={dialogRef}
      className="dialog-box"
      aria-labelledby={`${slug}-${confirmLabel}`}
    >
      <form action={action} aria-busy={pending}>
        <h3 id={`${slug}-${confirmLabel}`} className="text-lg font-semibold text-ink">
          {title}
        </h3>
        <p className="mt-3 text-base leading-7 text-muted">{body}</p>
        <FormNotice state={state} />
        <input type="hidden" name="slug" value={slug} />
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className={`inline-flex min-h-12 items-center justify-center gap-2 px-4 text-base font-semibold disabled:opacity-60 ${
              danger ? "bg-navy text-white" : "bg-amber text-amber-ink"
            }`}
          >
            {pending ? <Spinner label={pendingLabel} /> : confirmLabel}
          </button>
          <button
            type="button"
            className="inline-flex min-h-12 items-center border border-line bg-paper px-4 text-base text-ink"
            onClick={() => dialogRef.current?.close()}
          >
            Keep it
          </button>
        </div>
      </form>
    </dialog>
  );
}
