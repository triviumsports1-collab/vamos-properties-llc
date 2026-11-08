import { connection } from "next/server";
import { allowLead } from "@/lib/leads/rate-limit";
import { googleSheetsConfigured } from "@/lib/gdoc-listings/google";
import { sheetSyncReady, verifySheetSyncSecret } from "@/lib/gdoc-listings/sync-secret";
import { syncSheetListings } from "@/lib/gdoc-listings/sync";

export const maxDuration = 60;

function deny(status: number, message: string) {
  return Response.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  await connection();

  if (!sheetSyncReady()) {
    return deny(503, "Sheet sync is not configured.");
  }
  if (!verifySheetSyncSecret(request)) {
    return deny(401, "Unauthorized.");
  }
  if (!allowLead("sheet-listings-sync", 10, 60_000)) {
    return deny(429, "Too many sync requests.");
  }
  if (!googleSheetsConfigured()) {
    return deny(503, "Google Sheets is not configured.");
  }

  try {
    const result = await syncSheetListings();
    return Response.json(result);
  } catch (error) {
    const name = error instanceof Error ? error.name : "Error";
    const message = error instanceof Error ? error.message : "";
    console.error("[SHEET_LISTINGS_SYNC]", { name });
    if (message === "missing_credentials") {
      return deny(503, "Google Sheets is not configured.");
    }
    return deny(500, "Sheet sync failed.");
  }
}
