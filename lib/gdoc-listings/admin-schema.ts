import { z } from "zod";
import { sheetListingStatuses } from "@/lib/gdoc-listings/status";

const statusValues = sheetListingStatuses.map((item) => item.value) as [
  (typeof sheetListingStatuses)[number]["value"],
  ...(typeof sheetListingStatuses)[number]["value"][],
];

export const sheetListingAdminSchema = z.object({
  slug: z.string().trim().min(1, "That sheet home is missing.").max(120),
  title: z.string().trim().min(3, "Add a title.").max(120),
  address: z.string().trim().min(5, "Add the address.").max(200),
  city: z.string().trim().max(80).optional().default(""),
  price: z.string().trim().max(80).optional().default(""),
  arv: z.string().trim().max(80).optional().default(""),
  beds: z
    .string()
    .trim()
    .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) <= 20), "Beds should be a number up to 20."),
  baths: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d+(\.\d)?$/.test(value), "Baths should look like 2 or 2.5."),
  sqft: z
    .string()
    .trim()
    .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 100 && Number(value) <= 50000), "Square feet should be a number."),
  propertyType: z.string().trim().max(40).optional().default(""),
  status: z.enum(statusValues),
  description: z.string().trim().max(8000).optional().default(""),
  hoa: z.string().trim().max(80).optional().default(""),
  ac: z.string().trim().max(80).optional().default(""),
  roof: z.string().trim().max(80).optional().default(""),
  waterHeater: z.string().trim().max(80).optional().default(""),
  titleCompany: z.string().trim().max(80).optional().default(""),
  listingCode: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((value) => value === "" || /^[A-Z]{2,4}-[A-Z]{2}-[A-Z]{2,6}-\d{4,8}$/i.test(value), "Listing ID should look like VP-AZ-PHX-000001."),
  listedAt: z.string().trim().max(80).optional().default(""),
  sheetUpdatedAt: z.string().trim().max(80).optional().default(""),
  priceHistory: z.string().trim().max(4000).optional().default(""),
  updateNotes: z.string().trim().max(4000).optional().default(""),
  metaTitle: z.string().trim().max(120).optional().default(""),
  metaDescription: z.string().trim().max(320).optional().default(""),
  metaKeywords: z.string().trim().max(400).optional().default(""),
  localTargetArea: z.string().trim().max(160).optional().default(""),
  canonicalUrl: z.string().trim().max(300).optional().default(""),
  schemaJsonLd: z.string().trim().max(20000).optional().default(""),
  latitude: z.string().trim().max(20).optional().default(""),
  longitude: z.string().trim().max(20).optional().default(""),
  manualHold: z.string().optional().default(""),
});

export const sheetListingSlugSchema = z.object({
  slug: z.string().trim().min(1, "That sheet home is missing.").max(120),
});
