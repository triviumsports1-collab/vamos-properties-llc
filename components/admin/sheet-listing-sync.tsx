"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/admin/status-form";
import { runSheetListingSync } from "@/lib/gdoc-listings/admin-actions";
import { idleSheetSync, type SheetSyncFormState } from "@/lib/gdoc-listings/types";

export function SheetListingSync({ ready }: { ready: boolean }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(runSheetListingSync, idleSheetSync);

  useEffect(() => {
    if (state.stamp) router.refresh();
  }, [state.stamp, router]);

  return (
    <form action={action} aria-busy={pending}>
      <SyncNotice state={state} />
      <button
        type="submit"
        disabled={pending || !ready}
        className="inline-flex min-h-12 items-center justify-center gap-2 bg-amber px-4 text-base font-semibold text-amber-ink disabled:opacity-60"
      >
        {pending ? <Spinner label="Copying the sheet…" /> : "Sync from Google Sheet"}
      </button>
      {ready ? null : (
        <p className="mt-3 text-sm text-muted">Google Sheets is not configured, so this desk cannot copy the catalog yet.</p>
      )}
    </form>
  );
}

function SyncNotice({ state }: { state: SheetSyncFormState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={`mb-4 border px-4 py-3 text-base text-ink ${state.ok ? "border-pine bg-mist" : "border-line bg-mist"}`}
    >
      {state.message}
    </p>
  );
}
