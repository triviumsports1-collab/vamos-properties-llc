import { randomUUID } from "node:crypto";
import { handleListingEmail } from "@/lib/listings/email-listing";
import { isListingEmailPing, isZohoWebhookRequest } from "@/lib/listings/webhook-ping";
import { verifyListingEmailSecret } from "@/lib/listings/webhook-secret";

export const maxDuration = 30;

function pingOk() {
  return Response.json({ success: true }, { status: 200 });
}

export async function GET() {
  return pingOk();
}

export async function HEAD() {
  return pingOk();
}

export async function OPTIONS() {
  return pingOk();
}

export async function POST(request: Request) {
  try {
    // Zoho Flow tests with User-Agent Apache-HttpClient (Java) and a sample body.
    // During setup that request has no secret — acknowledge it instead of 401.
    if (isZohoWebhookRequest(request) && !verifyListingEmailSecret(request)) {
      return pingOk();
    }
    if (await isListingEmailPing(request)) {
      return pingOk();
    }
    const result = await handleListingEmail(request);
    return Response.json(result.body, { status: result.status });
  } catch (error) {
    console.error("listing_email_webhook_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return Response.json({ ok: false, message: "The listing could not be saved." }, { status: 500 });
  }
}
