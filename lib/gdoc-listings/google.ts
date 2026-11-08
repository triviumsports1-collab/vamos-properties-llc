import "server-only";

import { google, type sheets_v4 } from "googleapis";

const READONLY_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const DEFAULT_SHEET_ID = "1Y-yKApzZxga27DKdRWCwGKs4Yju31hODJud048pcURg";

export function getGoogleSheetId() {
  return process.env.GOOGLE_SHEET_ID?.trim() || DEFAULT_SHEET_ID;
}

export function getGoogleSheetTab() {
  return process.env.GOOGLE_SHEET_TAB?.trim() || "";
}

export function googleSheetsConfigured() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() && readPrivateKey());
}

export function sheetA1Range(a1: string) {
  const tab = getGoogleSheetTab();
  if (!tab) return a1;
  const escaped = tab.replaceAll("'", "''");
  return `'${escaped}'!${a1}`;
}

export function getGoogleSheetsClient(): sheets_v4.Sheets {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ?? "";
  const key = readPrivateKey();
  if (!email || !key) {
    throw new Error("Google Sheets is not configured.");
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: [READONLY_SCOPE],
  });

  return google.sheets({ version: "v4", auth });
}

function readPrivateKey() {
  const raw = process.env.GOOGLE_PRIVATE_KEY?.replaceAll("\r", "") ?? "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const unquoted = isQuoted(trimmed) ? trimmed.slice(1, -1) : trimmed;
  return unquoted.replaceAll("\\n", "\n");
}

function isQuoted(value: string) {
  return (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"));
}
