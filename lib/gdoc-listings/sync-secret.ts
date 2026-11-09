import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

export function sheetSyncReady() {
  const secret = process.env.SHEET_SYNC_SECRET?.trim();
  return Boolean(secret && secret.length >= 16);
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function sameSecret(provided: string, expected: string) {
  const left = digest(provided);
  const right = digest(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function secretFromRequest(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const named = request.headers.get("x-sheet-sync-secret")?.trim() || "";
  return bearer || named;
}

export function verifySheetSyncSecret(request: Request) {
  const expected = process.env.SHEET_SYNC_SECRET?.trim() ?? "";
  if (!expected || expected.length < 16) return false;
  const provided = secretFromRequest(request);
  if (!provided) return false;
  return sameSecret(provided, expected);
}

export function sheetSyncIpAllowed(request: Request) {
  const allow = (process.env.SHEET_SYNC_ALLOWLIST ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (allow.length === 0) return true;
  const ip = clientIp(request);
  if (!ip) return false;
  return allow.includes(ip);
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const real = request.headers.get("x-real-ip")?.trim() ?? "";
  return forwarded || real;
}
