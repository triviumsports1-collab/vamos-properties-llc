"use server";

import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { recordLeadEvent, saveLead } from "@/lib/dal/leads";
import { allowLead } from "@/lib/leads/rate-limit";
import { notifyFounders } from "@/lib/leads/notify";
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

  try {
    const delivery = await notifyFounders({
      address: parsed.data.address,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      message: parsed.data.message,
      situation: parsed.data.situation,
      trusteeSaleDate: parsed.data.trusteeSaleDate ?? "",
      preferredPath: parsed.data.preferredPath,
      sourcePath: parsed.data.sourcePath,
      language: parsed.data.language,
    });
    const note =
      delivery === "sent"
        ? "Founder email sent."
        : delivery === "skipped"
          ? "Founder email skipped. Resend is not configured."
          : "Founder email failed.";
    await recordLeadEvent(saved.id, delivery === "sent" ? "email_out" : "email_status", note);
  } catch (error) {
    console.error("lead_email_failed", {
      id: saved.id,
      name: error instanceof Error ? error.name : "Error",
    });
  }

  redirect("/thank-you");
}
