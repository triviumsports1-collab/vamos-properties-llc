import "server-only";

import { revalidatePath } from "next/cache";
import { createListingFromEmail } from "@/lib/dal/listings";
import { extractListingFromEmail } from "@/lib/listings/email-extract";
import { readInboundEmail, type InboundEmail } from "@/lib/listings/email-payload";
import { isListingEmailPing } from "@/lib/listings/webhook-ping";
import { listingEmailAiReady, listingEmailWebhookReady, verifyListingEmailSecret } from "@/lib/listings/webhook-secret";
import { allowLead } from "@/lib/leads/rate-limit";

export type ListingEmailResult =
  | { ok: true; status: number; body: Record<string, unknown> }
  | { ok: false; status: number; body: Record<string, unknown> };

function json(status: number, body: Record<string, unknown>): ListingEmailResult {
  return { ok: status < 400, status, body };
}

function messageKey(email: InboundEmail) {
  const basis = email.messageId || `${email.from}|${email.subject}|${email.text.slice(0, 180)}`;
  return basis.slice(0, 180);
}

export async function handleListingEmail(request: Request): Promise<ListingEmailResult> {
  if (await isListingEmailPing(request)) {
    return json(200, { success: true });
  }
  if (!listingEmailWebhookReady()) {
    return json(503, { ok: false, message: "Listing email intake is not configured." });
  }
  if (!verifyListingEmailSecret(request)) {
    return json(401, { ok: false, message: "Unauthorized." });
  }
  if (!listingEmailAiReady()) {
    return json(503, { ok: false, message: "Listing email intake is not configured." });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowLead(`listing-email:${ip}`, 30, 60 * 60 * 1000)) {
    return json(429, { ok: false, message: "Too many requests." });
  }

  const email = await readInboundEmail(request);
  if (!email) {
    return json(400, { ok: false, message: "The email payload was empty or malformed." });
  }

  let extracted;
  try {
    extracted = await extractListingFromEmail(email);
  } catch (error) {
    console.error("listing_email_extract_failed", {
      name: error instanceof Error ? error.name : "Error",
    });
    return json(502, { ok: false, message: "The email could not be read." });
  }

  if (!extracted) {
    return json(422, { ok: false, message: "No property address was found in that email." });
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
    if (!saved.duplicate) {
      revalidatePath("/listings");
      revalidatePath("/homes");
      revalidatePath(`/listings/${saved.slug}`);
      revalidatePath("/admin/listings");
      revalidatePath(`/admin/listings/${saved.id}`);
      revalidatePath("/sitemap.xml");
    }
    return json(200, {
      ok: true,
      duplicate: saved.duplicate,
      listingId: saved.id,
      slug: saved.slug,
    });
  } catch (error) {
    console.error("listing_email_write_failed", {
      name: error instanceof Error ? error.name : "Error",
    });
    return json(500, { ok: false, message: "The listing could not be saved." });
  }
}
