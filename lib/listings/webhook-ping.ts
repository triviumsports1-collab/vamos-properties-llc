import "server-only";

const PING_KEYS = new Set([
  "ping",
  "test",
  "challenge",
  "verification",
  "verify",
  "echo",
  "handshake",
  "success",
  "status",
  "type",
  "event",
  "mode",
  "action",
]);

const EMAIL_KEYS = new Set([
  "from",
  "to",
  "subject",
  "text",
  "html",
  "sender",
  "recipient",
  "body",
  "body-plain",
  "body-html",
  "body_plain",
  "body_html",
  "message",
  "message_id",
  "messageid",
  "email",
  "mail",
  "data",
]);

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function hasSecretHeader(request: Request) {
  const header = request.headers.get("authorization")?.trim() ?? "";
  const named = request.headers.get("x-webhook-secret")?.trim() ?? "";
  return Boolean(header || named);
}

export function isZohoWebhookRequest(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (/zoho/i.test(ua)) return true;
  for (const [key, value] of request.headers) {
    if (/zoho/i.test(key) || /zoho/i.test(value)) return true;
  }
  return false;
}

function hasEmailPayload(record: Record<string, unknown> | null) {
  if (!record) return false;
  return Object.keys(record).some((key) => EMAIL_KEYS.has(key.toLowerCase()));
}

function looksLikePingRecord(record: Record<string, unknown>) {
  const keys = Object.keys(record);
  if (keys.length === 0) return true;
  if (hasEmailPayload(record)) return false;

  const lower = keys.map((key) => key.toLowerCase());
  if (record.ping === true || record.test === true) return true;

  const kind = String(record.type ?? record.event ?? record.mode ?? record.action ?? "");
  if (/ping|test|verif|handshake|challenge/i.test(kind)) return true;
  if (lower.every((key) => PING_KEYS.has(key))) return true;
  if (lower.some((key) => /ping|test|verif|challenge|handshake/.test(key))) return true;

  return false;
}

function isTinyZohoTestEmail(record: Record<string, unknown> | null) {
  if (!record) return false;
  const from = asString(record.from) || asString(record.sender);
  const subject = asString(record.subject);
  const text = asString(record.text) || asString(record.body) || asString(record["body-plain"]);
  const zohoFrom = /zoho\.com/i.test(from);
  const testSubject = /^(test|ping|verify|verification|webhook)/i.test(subject);
  return (zohoFrom || testSubject) && text.length < 240;
}

async function peekBody(request: Request): Promise<{ empty: boolean; record: Record<string, unknown> | null }> {
  const clone = request.clone();
  const type = clone.headers.get("content-type") ?? "";
  const length = clone.headers.get("content-length");
  if (length === "0") return { empty: true, record: {} };

  try {
    if (type.includes("application/json")) {
      const body = (await clone.json()) as unknown;
      if (body == null) return { empty: true, record: {} };
      const record = asRecord(body);
      if (!record) return { empty: false, record: null };
      return { empty: Object.keys(record).length === 0, record };
    }
    if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
      const form = await clone.formData();
      const record: Record<string, unknown> = {};
      for (const [key, value] of form.entries()) {
        if (typeof value === "string") record[key] = value;
      }
      return { empty: Object.keys(record).length === 0, record };
    }
    const text = (await clone.text()).trim();
    if (!text) return { empty: true, record: {} };
    try {
      const parsed = JSON.parse(text) as unknown;
      const record = asRecord(parsed);
      if (!record) return { empty: false, record: null };
      return { empty: Object.keys(record).length === 0, record };
    } catch {
      return { empty: false, record: { text } };
    }
  } catch {
    return { empty: true, record: {} };
  }
}

/**
 * Zoho Flow / CRM / Mail verify a webhook URL with GET or an empty/test POST
 * that often omits our secret. Those pings must return 200, not 401.
 */
export async function isListingEmailPing(request: Request) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;

  const secretPresent = hasSecretHeader(request);
  const zoho = isZohoWebhookRequest(request);
  const { empty, record } = await peekBody(request);

  if (empty) return true;
  if (record && looksLikePingRecord(record)) return true;
  if (!secretPresent && !hasEmailPayload(record)) return true;
  if ((zoho || !secretPresent) && isTinyZohoTestEmail(record)) return true;

  return false;
}
