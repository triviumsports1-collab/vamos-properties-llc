import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

export function listingEmailWebhookReady() {
  const secret = process.env.LISTING_EMAIL_WEBHOOK_SECRET?.trim();
  return Boolean(secret && secret.length >= 16);
}

export function listingEmailAiReady() {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
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
  const named =
    request.headers.get("x-webhook-secret")?.trim() ||
    request.headers.get("x-api-key")?.trim() ||
    "";
  let query = "";
  try {
    const url = new URL(request.url);
    query =
      url.searchParams.get("secret")?.trim() ||
      url.searchParams.get("token")?.trim() ||
      url.searchParams.get("webhook_secret")?.trim() ||
      "";
  } catch {
    query = "";
  }
  return bearer || named || query;
}

export function verifyListingEmailSecret(request: Request) {
  const expected = process.env.LISTING_EMAIL_WEBHOOK_SECRET?.trim() ?? "";
  if (!expected || expected.length < 16) return false;
  const provided = secretFromRequest(request);
  if (!provided) return false;
  return sameSecret(provided, expected);
}
