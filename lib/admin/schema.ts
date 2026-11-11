import { z } from "zod";
import { leadStatuses, lostReasons } from "@/lib/admin/pipeline";

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
