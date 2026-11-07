import "server-only";

export type InboundEmail = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  messageId: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function firstString(value: unknown): string {
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = firstString(item);
      if (text) return text;
    }
    return "";
  }
  const record = asRecord(value);
  if (record) {
    return asString(record.email) || asString(record.address) || asString(record.text);
  }
  return asString(value);
}

function htmlToText(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function clip(value: string, max = 80_000) {
  return value.length > max ? value.slice(0, max) : value;
}

function fromParts(raw: Record<string, unknown>): InboundEmail | null {
  const data = asRecord(raw.data) ?? raw;
  const from = firstString(data.from) || firstString(data.sender) || firstString(data.envelope_from);
  const to = firstString(data.to) || firstString(data.recipient) || firstString(data.envelope_to);
  const subject = asString(data.subject);
  const html = asString(data.html) || asString(data["body-html"]);
  const text = asString(data.text) || asString(data["body-plain"]) || htmlToText(html);
  const messageId =
    asString(data.message_id) ||
    asString(data.messageId) ||
    asString(data.email_id) ||
    asString(data["Message-Id"]) ||
    asString(raw.svix_id);

  if (!text && !html && !subject) return null;

  return {
    from: from.slice(0, 320),
    to: to.slice(0, 320),
    subject: subject.slice(0, 300),
    text: clip(text || htmlToText(html)),
    html: clip(html, 20_000),
    messageId: messageId.slice(0, 200),
  };
}

export async function readInboundEmail(request: Request): Promise<InboundEmail | null> {
  const type = request.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/json")) {
      const body = (await request.json()) as unknown;
      const record = asRecord(body);
      if (!record) return null;
      return fromParts(record);
    }
    if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
      const form = await request.formData();
      const record: Record<string, unknown> = {};
      for (const [key, value] of form.entries()) {
        if (typeof value === "string") record[key] = value;
      }
      return fromParts(record);
    }
  } catch {
    return null;
  }
  return null;
}
