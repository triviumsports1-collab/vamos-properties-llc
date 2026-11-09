import "server-only";

import { SheetSyncError } from "@/lib/gdoc-listings/errors";
import { getGoogleSheetId, getGoogleSheetsClient, googleSheetsConfigured, sheetA1Range } from "@/lib/gdoc-listings/google";

const ATTEMPTS = 3;
const TIMEOUT_MS = 15_000;
const RETRY_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

export async function fetchSheetValueRows(): Promise<string[][]> {
  if (!googleSheetsConfigured()) {
    throw new SheetSyncError("missing_credentials", "Google Sheets is not configured.");
  }

  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getGoogleSheetId();
  let lastError: unknown;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    try {
      const response = await sheets.spreadsheets.values.get(
        {
          spreadsheetId,
          range: sheetA1Range("A1:AZ"),
          majorDimension: "ROWS",
          valueRenderOption: "FORMATTED_VALUE",
        },
        { timeout: TIMEOUT_MS },
      );
      return (response.data.values ?? []).map((row) => row.map((cell) => String(cell ?? "")));
    } catch (error) {
      lastError = error;
      const status = googleStatus(error);
      const retryable = status == null ? isNetworkError(error) : RETRY_STATUSES.has(status);
      console.error("[SHEET_LISTINGS_SYNC]", {
        event: "google_fetch_failed",
        attempt,
        status,
        retryable,
        name: error instanceof Error ? error.name : "Error",
      });
      if (!retryable || attempt === ATTEMPTS) break;
      await wait(backoffMs(attempt));
    }
  }

  throw toSheetFetchError(lastError);
}

function toSheetFetchError(error: unknown) {
  const status = googleStatus(error);
  if (status === 429) return new SheetSyncError("rate_limited", "Google Sheets asked us to wait.");
  if (status === 401 || status === 403) return new SheetSyncError("google_auth", "Google Sheets rejected the service account.");
  if (status === 404) return new SheetSyncError("google_not_found", "The listing sheet was not found.");
  if (isTimeout(error)) return new SheetSyncError("google_timeout", "Google Sheets did not answer in time.");
  return new SheetSyncError("google_failed", "Google Sheets could not be read.");
}

function googleStatus(error: unknown) {
  if (!error || typeof error !== "object") return null;
  const record = error as { code?: unknown; response?: { status?: unknown } };
  const code = Number(record.code);
  if (Number.isInteger(code) && code >= 100) return code;
  const status = Number(record.response?.status);
  if (Number.isInteger(status) && status >= 100) return status;
  return null;
}

function isNetworkError(error: unknown) {
  if (isTimeout(error)) return true;
  const code = error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code) : "";
  return /ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|ECONNREFUSED|UND_ERR/i.test(code);
}

function isTimeout(error: unknown) {
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : "";
  return name === "AbortError" || /timeout/i.test(message);
}

function backoffMs(attempt: number) {
  const base = 400 * 2 ** (attempt - 1);
  const jitter = Math.floor(Math.random() * 200);
  return base + jitter;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
