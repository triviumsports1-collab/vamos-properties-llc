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
  "fromaddress",
  "to",
  "toaddress",
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
  "summary",
  "message",
  "message_id",
  "messageid",
  "messageidstring",
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

export function isZohoWebhookRequest(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (/zoho|zohoflow|deluge/i.test(ua)) return true;
  if (/apache-httpclient/i.test(ua)) return true;
  if (request.headers.get("x-hook-signature")?.trim()) return true;
  for (const [key, value] of request.headers) {
    if (/^x-zoho/i.test(key) || /zoho/i.test(key)) return true;
    if (/zoho\.com/i.test(value)) return true;
  }
  return false;
}

function hasEmailPayload(record: Record<string, unknown> | null) {
  if (!record) return false;
  return Object.keys(record).some((key) => EMAIL_KEYS.has(key.toLowerCase()));
}

function emailBodyText(record: Record<string, unknown>) {
  return (
    asString(record.text) ||
    asString(record.summary) ||
    asString(record.body) ||
    asString(record["body-plain"]) ||
    asString(record.html)
  );
}

/** Real Zoho Mail / listing emails have a subject plus html, summary, or fromAddress. */
export function hasSubstantialEmail(record: Record<string, unknown> | null) {
  if (!record) return false;
  const subject = asString(record.subject);
  const html = asString(record.html);
  const text = emailBodyText(record);
  const from =
    asString(record.fromAddress) ||
    asString(record.fromaddress) ||
    asString(record.from) ||
    asString(record.sender);
  if (html.length > 40 || text.length > 40) return true;
  if (subject && (from || html || text)) return true;
  return false;
}

function looksLikePingRecord(record: Record<string, unknown>) {
  const keys = Object.keys(record);
  if (keys.length === 0) return true;
  if (hasSubstantialEmail(record) || hasEmailPayload(record)) return false;

  const lower = keys.map((key) => key.toLowerCase());
  if (record.ping === true || record.test === true) return true;

  const kind = String(record.type ?? record.event ?? record.mode ?? record.action ?? "");
  if (/ping|test|verif|handshake|challenge/i.test(kind)) return true;
  if (lower.every((key) => PING_KEYS.has(key))) return true;
  if (lower.some((key) => /^(ping|verify|verification|handshake|challenge)$/.test(key))) return true;

  return false;
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
 * Only empty or handshake verification POSTs are pings.
 * Zoho Mail listing emails (subject + html/summary) must be processed.
 */
export async function isListingEmailPing(request: Request) {
  try {
    const method = request.method.toUpperCase();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;

    const { empty, record } = await peekBody(request);
    if (hasSubstantialEmail(record)) {
      console.log("[WEBHOOK_GATE]", { ping: false, reason: "substantial_email" });
      return false;
    }
    if (empty) return true;
    if (record && looksLikePingRecord(record)) return true;
    if (!hasEmailPayload(record)) return true;

    return false;
  } catch (error) {
    console.error("listing_email_ping_check_failed", {
      name: error instanceof Error ? error.name : "Error",
    });
    return false;
  }
}
