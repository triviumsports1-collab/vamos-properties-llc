import { connection } from "next/server";
import { allowLead } from "@/lib/leads/rate-limit";
import { sheetSyncErrorCode } from "@/lib/gdoc-listings/errors";
import { googleSheetsConfigured } from "@/lib/gdoc-listings/google";
import { sheetSyncIpAllowed, sheetSyncReady, verifySheetSyncSecret } from "@/lib/gdoc-listings/sync-secret";
import { syncSheetListings } from "@/lib/gdoc-listings/sync";

export const maxDuration = 60;

function deny(status: number, message: string) {
  return Response.json({ ok: false, message }, { status });
}

export function GET() {
  return deny(405, "Use POST.");
}

export async function POST(request: Request) {
  await connection();

  if (!sheetSyncReady()) {
    return deny(503, "Sheet sync is not configured.");
  }
  if (!sheetSyncIpAllowed(request)) {
    console.error("[SHEET_LISTINGS_SYNC]", { event: "denied", reason: "ip" });
    return deny(401, "Unauthorized.");
  }
  if (!verifySheetSyncSecret(request)) {
    console.error("[SHEET_LISTINGS_SYNC]", { event: "denied", reason: "secret" });
    return deny(401, "Unauthorized.");
  }
  if (!allowLead("sheet-listings-sync", 10, 60_000)) {
    return deny(429, "Too many sync requests.");
  }
  if (!googleSheetsConfigured()) {
    return deny(503, "Google Sheets is not configured.");
  }

  try {
    const result = await syncSheetListings("webhook");
    return Response.json(result);
  } catch (error) {
    const code = sheetSyncErrorCode(error);
    console.error("[SHEET_LISTINGS_SYNC]", {
      event: "http_failed",
      code: code || "sync_failed",
      name: error instanceof Error ? error.name : "Error",
    });
    if (code === "busy") return deny(409, "A sheet copy is already running.");
    if (code === "rate_limited") return deny(429, "Google Sheets asked us to wait.");
    if (code === "empty_sheet") return deny(422, "The sheet copy was empty, so existing homes were left alone.");
    if (code === "missing_credentials" || code === "google_auth" || code === "google_not_found") {
      return deny(503, "Google Sheets is not configured.");
    }
    if (code === "google_timeout" || code === "google_failed") return deny(503, "Google Sheets could not be read.");
    return deny(500, "Sheet sync failed.");
  }
}
