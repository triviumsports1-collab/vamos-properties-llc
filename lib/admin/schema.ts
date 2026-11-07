import { z } from "zod";
import { leadStatuses, listingStatuses, lostReasons } from "@/lib/admin/pipeline";

export type LoginState = {
  message: string;
};

export type AdminFormState = {
  ok: boolean;
  message: string;
  stamp: number;
};

export const idleForm: AdminFormState = { ok: false, message: "", stamp: 0 };

const statusValues = leadStatuses.map((item) => item.value) as [
  (typeof leadStatuses)[number]["value"],
  ...(typeof leadStatuses)[number]["value"][],
];

const reasonValues = lostReasons.map((item) => item.value) as [
  (typeof lostReasons)[number]["value"],
  ...(typeof lostReasons)[number]["value"][],
];

export const loginSchema = z.object({
  email: z.string().trim().email("Enter the email on the account."),
  password: z.string().min(10, "Enter the password."),
});

export const statusSchema = z
  .object({
    leadId: z.coerce.number().int().positive(),
    status: z.enum(statusValues),
    lostReason: z.string().trim().optional().default(""),
  })
  .superRefine((value, context) => {
    if (value.status === "lost" && !reasonValues.includes(value.lostReason as (typeof reasonValues)[number])) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lostReason"],
        message: "Pick why this file is lost.",
      });
    }
  });

export const noteSchema = z.object({
  leadId: z.coerce.number().int().positive(),
  body: z.string().trim().min(2, "Write a short note.").max(2000, "Keep the note under 2,000 characters."),
});

export const assignSchema = z.object({
  leadId: z.coerce.number().int().positive(),
  assignedToId: z.string().trim(),
});

export const touchSchema = z
  .object({
    leadId: z.coerce.number().int().positive(),
    channel: z.enum(["call", "sms", "email"]),
    direction: z.enum(["in", "out"]).optional().default("out"),
    subject: z.string().trim().max(120, "Keep the subject short.").optional().default(""),
    body: z.string().trim().min(2, "Write what was said.").max(2000, "Keep it under 2,000 characters."),
  })
  .superRefine((value, context) => {
    if (value.channel === "email" && value.subject.length < 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subject"],
        message: "Add a subject.",
      });
    }
  });

const listingStatusValues = listingStatuses.map((item) => item.value) as [
  (typeof listingStatuses)[number]["value"],
  ...(typeof listingStatuses)[number]["value"][],
];

const propertyTypeValues = ["", "house", "townhouse", "condo", "manufactured", "land"] as const;

function photoLine(line: string) {
  return /^https?:\/\/\S+$/.test(line) || /^\/listing-photos\/[a-z0-9-]+\.(jpg|png|webp)$/i.test(line);
}

export const listingSchema = z.object({
  listingId: z.string().trim().optional().default(""),
  title: z.string().trim().min(3, "Add a title.").max(120),
  address: z.string().trim().min(5, "Add the address.").max(200),
  city: z.string().trim().max(80).optional().default(""),
  beds: z.string().trim().refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) <= 20), "Beds should be a number up to 20."),
  baths: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d+(\.\d)?$/.test(value), "Baths should look like 2 or 2.5."),
  sqft: z.string().trim().refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) <= 20000), "Square feet should be a number."),
  yearBuilt: z
    .string()
    .trim()
    .refine((value) => value === "" || (/^\d{4}$/.test(value) && Number(value) >= 1800 && Number(value) <= 2035), "Use a four-digit year."),
  propertyType: z.enum(propertyTypeValues),
  price: z.string().trim().max(80).optional().default(""),
  monthlyPayment: z
    .string()
    .trim()
    .refine((value) => value === "" || (/^\d+$/.test(value.replace(/[$,]/g, "")) && Number(value.replace(/[$,]/g, "")) <= 100000), "Monthly payment should be a dollar amount."),
  terms: z.string().trim().max(2000).optional().default(""),
  status: z.enum(listingStatusValues),
  featured: z.string().optional().default(""),
  summary: z.string().trim().max(300).optional().default(""),
  description: z.string().trim().max(8000).optional().default(""),
  features: z.string().trim().max(2000).optional().default(""),
  neighborhood: z.string().trim().max(2000).optional().default(""),
  schools: z.string().trim().max(2000).optional().default(""),
  metaTitle: z.string().trim().max(120).optional().default(""),
  metaDescription: z.string().trim().max(320).optional().default(""),
  keywords: z.string().trim().max(400).optional().default(""),
  localTags: z.string().trim().max(400).optional().default(""),
  photos: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .default("")
    .refine((value) => {
      const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);
      return lines.length <= 12 && lines.every(photoLine);
    }, "Use up to 12 photo links, one http(s) URL per line."),
  arv: z.string().trim().max(80).optional().default(""),
  driveFolderUrl: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .default("")
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        if (url.protocol !== "https:") return false;
        const host = url.hostname.toLowerCase();
        return host === "drive.google.com" || host === "docs.google.com";
      } catch {
        return false;
      }
    }, "Use a Google Drive folder link."),
});
