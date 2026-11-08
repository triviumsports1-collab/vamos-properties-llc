import { z } from "zod";

export const sheetListingLeadSchema = z.object({
  listingId: z.string().trim().min(1, "That listing is missing.").max(120),
  name: z.string().trim().min(2, "Enter your name."),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 10 || value.length === 11, "Enter a 10-digit mobile number."),
  email: z.string().trim().min(1, "Enter your email.").email("That email does not look right."),
  message: z
    .string()
    .trim()
    .min(5, "Tell us what you want to know.")
    .max(2000, "Keep the note under 2,000 characters."),
  consent: z.literal("yes", { errorMap: () => ({ message: "Consent is required before we can call or text." }) }),
  company: z.string().optional(),
});
