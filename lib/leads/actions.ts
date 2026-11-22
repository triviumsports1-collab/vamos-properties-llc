"use server";

import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { saveLead } from "@/lib/dal/leads";
import { allowLead } from "@/lib/leads/rate-limit";
import { deliverLeadAlerts, prepareLeadAlerts } from "@/lib/notifications/lead-alerts";
import { leadSchema } from "@/lib/leads/schema";
import { site } from "@/lib/site";

export type LeadFormState = {
  message: string;
  fieldErrors: Record<string, string>;
};

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function submitLead(
  _previous: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  if (field(formData, "company").trim() !== "") {
    redirect("/thank-you");
  }

  const parsed = leadSchema.safeParse({
    address: field(formData, "address"),
    name: field(formData, "name"),
    phone: field(formData, "phone"),
    email: field(formData, "email"),
    message: field(formData, "message"),
    situation: field(formData, "situation"),
    trusteeSaleDate: field(formData, "trusteeSaleDate"),
    preferredPath: field(formData, "preferredPath"),
    language: field(formData, "language"),
    sourcePath: field(formData, "sourcePath"),
    utmSource: field(formData, "utmSource"),
    utmMedium: field(formData, "utmMedium"),
    utmCampaign: field(formData, "utmCampaign"),
    consent: field(formData, "consent"),
    company: "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { message: "Check the highlighted fields, then send it again.", fieldErrors };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowLead(`${ip}:${parsed.data.phone}`)) {
    return {
      message: `Call ${site.phoneDisplay}. We already have a few notes from this number today.`,
      fieldErrors: {},
    };
  }

  let saved: { id: number };
  try {
    saved = await saveLead({
      ...parsed.data,
      consentText: parsed.data.language === "es" ? site.consentTextEs : site.consentText,
      pageUrl: parsed.data.sourcePath,
      ipHash: createHash("sha256")
        .update(`${process.env.IP_HASH_SALT ?? "vamos-dev"}:${ip}`)
        .digest("hex"),
    });
  } catch (error) {
    console.error("lead_write_failed", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
      message: error instanceof Error ? error.message : String(error),
    });
    return {
      message: `We could not save that just now. Call ${site.phoneDisplay} and tell us the address.`,
      fieldErrors: {},
    };
  }

  // Alerts (Google Voice text + founder email) never block or fail the submission: the lead
  // is already saved, the pending alert rows are written here, and sending happens after the
  // response. Anything that does not go out is retried by the scheduler and from the admin.
  try {
    await prepareLeadAlerts(saved.id);
    after(() => deliverLeadAlerts(saved.id));
  } catch (error) {
    console.error("lead_alerts_prepare_failed", {
      id: saved.id,
      name: error instanceof Error ? error.name : "Error",
    });
  }

  redirect("/thank-you");
}
