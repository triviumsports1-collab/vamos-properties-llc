import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Shared secret for scheduler endpoints. Vercel Cron sends `Authorization: Bearer $CRON_SECRET`
 * automatically; external schedulers must send the same header. Falls back to
 * SHEET_SYNC_SECRET so an existing setup keeps working.
 */
export function cronSecret() {
  const secret = process.env.CRON_SECRET?.trim() || process.env.SHEET_SYNC_SECRET?.trim() || "";
  return secret.length >= 16 ? secret : "";
}

export function cronAuthorized(request: Request) {
  const expected = cronSecret();
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const provided = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!provided) return false;
  const left = createHash("sha256").update(provided).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}
