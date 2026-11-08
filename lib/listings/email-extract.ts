import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { isPropertyType, type PropertyType } from "@/lib/listings/catalog";
import { isDriveFolderUrl, safeHttpUrl } from "@/lib/listings/address";
import { parseFlexiblePrice } from "@/lib/listings/money";
import type { InboundEmail } from "@/lib/listings/email-payload";

const rawExtract = z.object({
  title: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  askingPrice: z.union([z.string(), z.number()]).nullable().optional(),
  arv: z.union([z.string(), z.number()]).nullable().optional(),
  bedrooms: z.union([z.string(), z.number()]).nullable().optional(),
  bathrooms: z.union([z.string(), z.number()]).nullable().optional(),
  sqft: z.union([z.string(), z.number()]).nullable().optional(),
  description: z.string().nullable().optional(),
  driveFolderUrl: z.string().nullable().optional(),
  photoUrls: z.array(z.string()).nullable().optional(),
  propertyType: z.string().nullable().optional(),
});

export type ExtractedListing = {
  title: string;
  address: string;
  city: string;
  listPrice: number | null;
  arv: number | null;
  beds: number | null;
  baths: string;
  sqft: number | null;
  description: string;
  driveFolderUrl: string;
  photoUrls: string[];
  propertyType: PropertyType | "";
};

const extractTool: Anthropic.Tool = {
  name: "extract_listing",
  description: "Extract a single Arizona property listing from an inbound email. Use null when a field is not clearly present. Do not invent an address, price, or square footage.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: ["string", "null"] },
      address: { type: ["string", "null"] },
      city: { type: ["string", "null"] },
      askingPrice: { type: ["string", "number", "null"] },
      arv: { type: ["string", "number", "null"] },
      bedrooms: { type: ["string", "number", "null"] },
      bathrooms: { type: ["string", "number", "null"] },
      sqft: { type: ["string", "number", "null"] },
      description: { type: ["string", "null"] },
      driveFolderUrl: { type: ["string", "null"] },
      photoUrls: { type: ["array", "null"], items: { type: "string" } },
      propertyType: { type: ["string", "null"] },
    },
    required: [
      "title",
      "address",
      "city",
      "askingPrice",
      "arv",
      "bedrooms",
      "bathrooms",
      "sqft",
      "description",
      "driveFolderUrl",
      "photoUrls",
      "propertyType",
    ],
  },
};

function wholeNumber(value: string | number | null | undefined, min: number, max: number) {
  if (value == null || value === "") return null;
  const amount = typeof value === "number" ? value : Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(amount)) return null;
  const rounded = Math.round(amount);
  if (rounded < min || rounded > max) return null;
  return rounded;
}

function bathsText(value: string | number | null | undefined) {
  if (value == null || value === "") return "";
  const text = String(value).trim();
  if (!/^\d+(\.\d)?$/.test(text)) return "";
  return text.slice(0, 8);
}

function driveFolder(value: string | null | undefined) {
  const url = safeHttpUrl(value ?? "");
  if (!url || !isDriveFolderUrl(url)) return "";
  return url;
}

function photos(values: string[] | null | undefined) {
  const unique: string[] = [];
  for (const item of values ?? []) {
    const url = safeHttpUrl(item);
    if (!url || isDriveFolderUrl(url)) continue;
    if (unique.includes(url)) continue;
    unique.push(url);
    if (unique.length >= 12) break;
  }
  return unique;
}

function cityFromAddress(address: string, city: string) {
  if (city) return city;
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const maybe = parts[parts.length - 2] ?? "";
    if (maybe && !/^\d/.test(maybe) && maybe.length <= 80) return maybe;
  }
  return "";
}

function asListing(raw: unknown): ExtractedListing | null {
  const parsed = rawExtract.safeParse(raw);
  if (!parsed.success) return null;
  const address = parsed.data.address?.replace(/\s+/g, " ").trim() ?? "";
  if (address.length < 5 || address.length > 200) return null;
  const city = (parsed.data.city ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  const title = (parsed.data.title ?? "").replace(/\s+/g, " ").trim().slice(0, 120) || address;
  const type = (parsed.data.propertyType ?? "").trim().toLowerCase();
  return {
    title,
    address: address.slice(0, 200),
    city: cityFromAddress(address, city),
    listPrice: parseFlexiblePrice(parsed.data.askingPrice ?? null),
    arv: parseFlexiblePrice(parsed.data.arv ?? null),
    beds: wholeNumber(parsed.data.bedrooms, 0, 20),
    baths: bathsText(parsed.data.bathrooms),
    sqft: wholeNumber(parsed.data.sqft, 100, 20_000),
    description: (parsed.data.description ?? "").trim().slice(0, 8000),
    driveFolderUrl: driveFolder(parsed.data.driveFolderUrl),
    photoUrls: photos(parsed.data.photoUrls),
    propertyType: isPropertyType(type) ? type : "",
  };
}

export function maskSecret(value: string | undefined | null) {
  const secret = value?.trim() ?? "";
  if (!secret) return { present: false, length: 0, masked: "" };
  const tail = secret.slice(-4);
  return {
    present: true,
    length: secret.length,
    masked: secret.length <= 4 ? "*".repeat(secret.length) : `${"*".repeat(Math.max(0, secret.length - 4))}${tail}`,
  };
}

function claudeErrorDetail(error: unknown) {
  const err = error as {
    name?: string;
    message?: string;
    status?: number;
    type?: string;
    code?: string;
    error?: { type?: string; message?: string };
  };
  let serialized = "";
  try {
    serialized = JSON.stringify(error, Object.getOwnPropertyNames(Object(error)));
  } catch {
    serialized = String(error);
  }
  return {
    name: err?.name || (error instanceof Error ? error.name : "Error"),
    message: err?.message || (error instanceof Error ? error.message : String(error)),
    status: err?.status ?? null,
    type: err?.type || err?.error?.type || null,
    code: err?.code ?? null,
    apiMessage: err?.error?.message ?? null,
    serialized,
  };
}

export async function extractListingFromEmail(email: InboundEmail): Promise<ExtractedListing | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  console.log("[ANTHROPIC_KEY]", maskSecret(apiKey));
  if (!apiKey) {
    console.error("[CLAUDE_SKIP]", { reason: "ANTHROPIC_API_KEY is missing" });
    return null;
  }

  const prompt =
    "Extract one property listing from this email. Arizona / Maricopa County wholesale and seller emails are common. If the message is not about a property for sale, set address to null.\n\n" +
    [
      email.subject ? `Subject: ${email.subject}` : "",
      email.from ? `From: ${email.from}` : "",
      email.to ? `To: ${email.to}` : "",
      "",
      email.text || "(no plain text)",
    ]
      .filter((line, index, lines) => !(line === "" && lines[index - 1] === ""))
      .join("\n");

  try {
    const client = new Anthropic({ apiKey, timeout: 15_000, maxRetries: 0 });
    console.log("[CLAUDE_REQUEST]", {
      model: "claude-sonnet-4-5",
      tool: "extract_listing",
      promptChars: prompt.length,
      payloadBytes: Buffer.byteLength(prompt, "utf8"),
      prompt,
    });
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      tools: [extractTool],
      tool_choice: { type: "tool", name: "extract_listing" },
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const block = message.content.find((item) => item.type === "tool_use");
    const toolInput = block && block.type === "tool_use" ? block.input : null;
    let extracted: ExtractedListing | null = null;
    try {
      extracted = toolInput ? asListing(toolInput) : null;
    } catch (error) {
      console.error("[CLAUDE_PARSE_FAILED]", claudeErrorDetail(error));
      extracted = null;
    }

    console.log("[CLAUDE_RESPONSE]", {
      id: message.id,
      model: message.model,
      stopReason: message.stop_reason,
      usage: message.usage,
      rawContent: message.content,
      toolInput,
      extracted,
    });

    return extracted;
  } catch (error) {
    console.error("[CLAUDE_FAILED]", claudeErrorDetail(error));
    throw new Error("listing_email_claude_failed");
  }
}
