import { z } from "zod";
import { sheetListingViews } from "@/lib/gdoc-listings/status";

const viewValues = sheetListingViews.map((item) => item.value) as [
  (typeof sheetListingViews)[number]["value"],
  ...(typeof sheetListingViews)[number]["value"][],
];

export const sheetMarginFilterSchema = z.object({
  view: z.enum(viewValues).optional().default("all"),
  q: z.string().trim().max(80).optional().default(""),
  min: z.string().trim().max(20).optional().default(""),
  max: z.string().trim().max(20).optional().default(""),
  city: z.string().trim().max(80).optional().default(""),
  region: z.string().trim().max(160).optional().default(""),
  margin: z.enum(["all", "with", "without"]).optional().default("all"),
});

export const sheetMarginActionSchema = sheetMarginFilterSchema.extend({
  scope: z.enum(["one", "selected", "filtered"]),
  intent: z.enum(["set", "clear", "follow"]),
  mode: z.enum(["flat", "percent"]).optional().default("flat"),
  amount: z.string().trim().max(20).optional().default(""),
  slug: z.string().trim().max(120).optional().default(""),
  slugs: z.array(z.string().trim().min(1).max(120)).max(250).optional().default([]),
});

export const sheetPricingRuleSchema = z.object({
  enabled: z.enum(["on", "off"]).default("off"),
  mode: z.enum(["flat", "percent"]).default("percent"),
  amount: z.string().trim().max(20).default(""),
  intent: z.enum(["save", "apply"]),
  tierMin: z.array(z.string().trim().max(20)).max(12).default([]),
  tierMax: z.array(z.string().trim().max(20)).max(12).default([]),
  tierMode: z.array(z.enum(["flat", "percent"])).max(12).default([]),
  tierAmount: z.array(z.string().trim().max(20)).max(12).default([]),
});
