import "server-only";

import { revalidatePath } from "next/cache";
import { createListingFromEmail } from "@/lib/dal/listings";
import { extractListingFromEmail, maskSecret } from "@/lib/listings/email-extract";
import { readInboundEmail, type InboundEmail } from "@/lib/listings/email-payload";
import { isListingEmailPing, isZohoWebhookRequest } from "@/lib/listings/webhook-ping";
import { listingEmailAiReady, listingEmailWebhookReady, verifyListingEmailSecret } from "@/lib/listings/webhook-secret";
import { allowLead } from "@/lib/leads/rate-limit";

export type ListingEmailResult =
  | { ok: true; status: number; body: Record<string, unknown> }
  | { ok: false; status: number; body: Record<string, unknown> };

function json(status: number, body: Record<string, unknown>): ListingEmailResult {
  return { ok: status < 400, status, body };
}

function fail(status: number, message: string): ListingEmailResult {
  return json(status, { success: false, ok: false, message });
}

function messageKey(email: InboundEmail) {
  const basis = email.messageId || `${email.from}|${email.subject}|${email.text.slice(0, 180)}`;
  return basis.slice(0, 180);
}

function refreshListingPages(id: number, slug: string) {
  try {
    revalidatePath("/listings");
    revalidatePath("/homes");
    revalidatePath(`/listings/${slug}`);
    revalidatePath("/admin/listings");
    revalidatePath(`/admin/listings/${id}`);
    revalidatePath("/sitemap.xml");
  } catch (error) {
    console.error("listing_email_revalidate_failed", {
      name: error instanceof Error ? error.name : "Error",
    });
  }
}

export async function handleListingEmail(request: Request): Promise<ListingEmailResult> {
  try {
    let ping = false;
    try {
      ping = await isListingEmailPing(request);
    } catch (error) {
      console.error("listing_email_ping_failed", {
        name: error instanceof Error ? error.name : "Error",
      });
    }
    if (ping) {
      console.log("[WEBHOOK_GATE]", { skipped: "ping" });
      return json(200, { success: true });
    }
    console.log("[ANTHROPIC_KEY]", maskSecret(process.env.ANTHROPIC_API_KEY));
    if (!listingEmailWebhookReady()) {
      console.error("[WEBHOOK_GATE]", { skipped: "webhook_secret_missing" });
      return fail(503, "Listing email intake is not configured.");
    }
    if (!verifyListingEmailSecret(request)) {
      if (!isZohoWebhookRequest(request)) {
        console.error("[WEBHOOK_GATE]", { skipped: "unauthorized" });
        return fail(401, "Unauthorized.");
      }
      console.log("[WEBHOOK_GATE]", { auth: "zoho_mail_without_shared_secret" });
    }
    if (!listingEmailAiReady()) {
      console.error("[WEBHOOK_GATE]", { skipped: "anthropic_key_missing" });
      return fail(503, "Listing email intake is not configured.");
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (!allowLead(`listing-email:${ip}`, 30, 60 * 60 * 1000)) {
      return fail(429, "Too many requests.");
    }

    let email: InboundEmail | null = null;
    try {
      email = await readInboundEmail(request);
    } catch (error) {
      console.error("listing_email_payload_failed", {
        name: error instanceof Error ? error.name : "Error",
      });
      return fail(500, "The email payload was empty or malformed.");
    }
    if (!email) {
      return fail(400, "The email payload was empty or malformed.");
    }

    let extracted;
    try {
      extracted = await extractListingFromEmail(email);
    } catch (error) {
      console.error("listing_email_extract_failed", {
        name: error instanceof Error ? error.name : "Error",
      });
      return fail(500, "The email could not be read.");
    }

    if (!extracted) {
      return fail(422, "No property address was found in that email.");
    }

    try {
      const saved = await createListingFromEmail({
        title: extracted.title,
        address: extracted.address,
        city: extracted.city,
        beds: extracted.beds,
        baths: extracted.baths,
        sqft: extracted.sqft,
        propertyType: extracted.propertyType,
        listPrice: extracted.listPrice,
        arv: extracted.arv,
        description: extracted.description,
        driveFolderUrl: extracted.driveFolderUrl,
        photos: extracted.photoUrls.join("\n"),
        sourceMessageId: messageKey(email),
      });
      console.log("[LISTING_DB_RESULT]", {
        duplicate: saved.duplicate,
        listingId: saved.id,
        slug: saved.slug,
      });
      if (!saved.duplicate) {
        refreshListingPages(saved.id, saved.slug);
      }
      return json(200, {
        success: true,
        ok: true,
        duplicate: saved.duplicate,
        listingId: saved.id,
        slug: saved.slug,
      });
    } catch (error) {
      console.error("listing_email_write_failed", {
        name: error instanceof Error ? error.name : "Error",
      });
      return fail(500, "The listing could not be saved.");
    }
  } catch (error) {
    console.error("listing_email_unhandled", {
      name: error instanceof Error ? error.name : "Error",
    });
    return fail(500, "The listing could not be saved.");
  }
}
