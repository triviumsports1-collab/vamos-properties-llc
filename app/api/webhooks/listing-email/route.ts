import { randomUUID } from "node:crypto";
import { handleListingEmail } from "@/lib/listings/email-listing";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
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
