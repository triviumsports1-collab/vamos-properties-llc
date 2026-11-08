import { randomUUID } from "node:crypto";
import { handleListingEmail } from "@/lib/listings/email-listing";
import { maskSecret } from "@/lib/listings/email-extract";
import { isListingEmailPing } from "@/lib/listings/webhook-ping";

export const maxDuration = 30;

const RESPOND_BY_MS = 22_000;

function pingOk() {
  return Response.json({ success: true }, { status: 200 });
}

function failJson(message = "The listing could not be saved.") {
  return Response.json({ success: false, ok: false, message }, { status: 500 });
}

function withDeadline(work: Promise<Response>, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<Response>((resolve) => {
    timer = setTimeout(() => {
      console.error("listing_email_webhook_timeout");
      resolve(failJson("The listing could not be saved in time."));
    }, ms);
  });
  return Promise.race([work, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

async function handlePost(request: Request) {
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
      return pingOk();
    }

    const result = await handleListingEmail(request);
    return Response.json(
      { success: result.ok, ...result.body },
      { status: result.status },
    );
  } catch (error) {
    console.error("listing_email_webhook_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return failJson();
  }
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

export async function POST(req: Request) {
  let body: unknown = null;
  try {
    body = await req.clone().json();
  } catch {
    try {
      body = await req.clone().text();
    } catch {
      body = null;
    }
  }
  console.log("[WEBHOOK_HIT]", {
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
    query: Object.fromEntries(new URL(req.url).searchParams.entries()),
    body,
    anthropicKey: maskSecret(process.env.ANTHROPIC_API_KEY),
  });
  try {
    return await withDeadline(handlePost(req), RESPOND_BY_MS);
  } catch (error) {
    console.error("listing_email_webhook_crashed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return failJson();
  }
}
