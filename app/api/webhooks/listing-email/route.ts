import { randomUUID } from "node:crypto";
import { handleListingEmail } from "@/lib/listings/email-listing";
import { isListingEmailPing } from "@/lib/listings/webhook-ping";

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
