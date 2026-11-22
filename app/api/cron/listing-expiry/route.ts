import { connection } from "next/server";
import { cronAuthorized, cronSecret } from "@/lib/cron/auth";
import { expireOverdueListings } from "@/lib/dal/listing-lifecycle";
import { refreshSheetListingViews } from "@/lib/gdoc-listings/cache";

export const maxDuration = 60;

/**
 * Daily listing expiry sweep. Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET`.
 * Any other scheduler can call it the same way (GET or POST). Public pages already hide
 * overdue homes at query time; this writes the Inactive (expired) status and audit events.
 */
async function run(request: Request) {
  await connection();
  if (!cronSecret()) return Response.json({ ok: false, message: "Cron is not configured." }, { status: 503 });
  if (!cronAuthorized(request)) return Response.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  try {
    const result = await expireOverdueListings("cron");
    if (result.expired > 0) refreshSheetListingViews(result.slugs, { expireNow: true });
    console.log("[LISTING_EXPIRY_CRON]", { event: "ok", expired: result.expired, skipped: result.skipped });
    return Response.json({ ok: true, expired: result.expired, skipped: result.skipped });
  } catch (error) {
    console.error("[LISTING_EXPIRY_CRON]", { event: "failed", name: error instanceof Error ? error.name : "Error" });
    return Response.json({ ok: false, message: "Expiry check failed." }, { status: 500 });
  }
}

export function GET(request: Request) {
  return run(request);
}

export function POST(request: Request) {
  return run(request);
}
