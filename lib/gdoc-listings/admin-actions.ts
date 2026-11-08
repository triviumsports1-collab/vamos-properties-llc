"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { SHEET_LISTINGS_TAG } from "@/lib/gdoc-listings/types";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import type { AdminFormState } from "@/lib/admin/schema";
import {
  deleteAdminSheetListing,
  getAdminSheetListingById,
  inactivateAdminSheetListing,
  restoreAdminSheetListing,
  updateAdminSheetListing,
} from "@/lib/dal/sheet-listings";
import { sheetListingAdminSchema, sheetListingSlugSchema } from "@/lib/gdoc-listings/admin-schema";
import { googleSheetsConfigured } from "@/lib/gdoc-listings/google";
import { syncSheetListings, type SheetSyncResult } from "@/lib/gdoc-listings/sync";
import type { SheetSyncFormState } from "@/lib/gdoc-listings/types";
import { allowLead } from "@/lib/leads/rate-limit";
import { parseDollars } from "@/lib/listings/money";

export async function runSheetListingSync(
  _previous: SheetSyncFormState,
  _formData: FormData,
): Promise<SheetSyncFormState> {
  await requireAdmin();
  if (!googleSheetsConfigured()) {
    return fail("Google Sheets is not configured on this server.");
  }
  if (!allowLead("admin-sheet-listings-sync", 4, 60_000)) {
    return fail("Wait a minute and try again.");
  }

  try {
    const result = await syncSheetListings();
    revalidatePath("/admin");
    revalidatePath("/admin/sheet-listings");
    return { ok: true, message: summarize(result), stamp: Date.now() };
  } catch (error) {
    const name = error instanceof Error ? error.name : "Error";
    const message = error instanceof Error ? error.message : "";
    console.error("[SHEET_LISTINGS_SYNC]", { id: randomUUID(), name });
    if (message === "missing_credentials") {
      return fail("Google Sheets is not configured on this server.");
    }
    return fail("The sheet could not be copied. Try again in a minute.");
  }
}

export async function saveSheetListingForm(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = sheetListingAdminSchema.safeParse({
    slug: field(formData, "slug"),
    title: field(formData, "title"),
    address: field(formData, "address"),
    city: field(formData, "city"),
    price: field(formData, "price"),
    arv: field(formData, "arv"),
    beds: field(formData, "beds"),
    baths: field(formData, "baths"),
    sqft: field(formData, "sqft"),
    propertyType: field(formData, "propertyType"),
    status: field(formData, "status"),
    description: field(formData, "description"),
    hoa: field(formData, "hoa"),
    ac: field(formData, "ac"),
    roof: field(formData, "roof"),
    waterHeater: field(formData, "waterHeater"),
    titleCompany: field(formData, "titleCompany"),
    listingCode: field(formData, "listingCode"),
    listedAt: field(formData, "listedAt"),
    sheetUpdatedAt: field(formData, "sheetUpdatedAt"),
    priceHistory: field(formData, "priceHistory"),
    updateNotes: field(formData, "updateNotes"),
    metaTitle: field(formData, "metaTitle"),
    metaDescription: field(formData, "metaDescription"),
    metaKeywords: field(formData, "metaKeywords"),
    localTargetArea: field(formData, "localTargetArea"),
    canonicalUrl: field(formData, "canonicalUrl"),
    schemaJsonLd: field(formData, "schemaJsonLd"),
    latitude: field(formData, "latitude"),
    longitude: field(formData, "longitude"),
    manualHold: field(formData, "manualHold"),
  });
  if (!parsed.success) {
    return formFail(parsed.error.issues[0]?.message || "Check the home details.");
  }

  const priceText = parsed.data.price.trim();
  const listPrice = priceText ? parseDollars(priceText) : null;
  if (priceText && listPrice == null) {
    return formFail("Enter the asking price in dollars, like 325000.");
  }
  const arvText = parsed.data.arv.trim();
  const arv = arvText ? parseDollars(arvText) : null;
  if (arvText && arv == null) {
    return formFail("Enter the ARV in dollars, like 325000.");
  }

  const latitude = parseCoord(parsed.data.latitude, -90, 90);
  if (parsed.data.latitude && latitude == null) return formFail("Latitude should be a number between -90 and 90.");
  const longitude = parseCoord(parsed.data.longitude, -180, 180);
  if (parsed.data.longitude && longitude == null) return formFail("Longitude should be a number between -180 and 180.");
  if (parsed.data.schemaJsonLd) {
    try {
      const parsedJson = JSON.parse(parsed.data.schemaJsonLd) as unknown;
      if (!parsedJson || typeof parsedJson !== "object" || Array.isArray(parsedJson)) {
        return formFail("JSON-LD should be a JSON object.");
      }
    } catch {
      return formFail("JSON-LD is not valid JSON.");
    }
  }

  try {
    const result = await updateAdminSheetListing(parsed.data.slug, {
      title: parsed.data.title,
      address: parsed.data.address,
      city: parsed.data.city,
      listPrice,
      arv,
      beds: parsed.data.beds ? Number(parsed.data.beds) : null,
      baths: parsed.data.baths,
      sqft: parsed.data.sqft ? Number(parsed.data.sqft) : null,
      propertyType: parsed.data.propertyType,
      status: parsed.data.status,
      description: parsed.data.description,
      hoa: parsed.data.hoa,
      ac: parsed.data.ac,
      roof: parsed.data.roof,
      waterHeater: parsed.data.waterHeater,
      titleCompany: parsed.data.titleCompany,
      listingCode: parsed.data.listingCode.trim().toUpperCase(),
      listedAt: parsed.data.listedAt,
      sheetUpdatedAt: parsed.data.sheetUpdatedAt,
      priceHistory: parsed.data.priceHistory,
      updateNotes: parsed.data.updateNotes,
      metaTitle: parsed.data.metaTitle,
      metaDescription: parsed.data.metaDescription,
      metaKeywords: parsed.data.metaKeywords,
      localTargetArea: parsed.data.localTargetArea,
      canonicalUrl: parsed.data.canonicalUrl,
      schemaJsonLd: parsed.data.schemaJsonLd,
      latitude,
      longitude,
      manualHold: parsed.data.manualHold === "yes",
    });
    if (!result.ok) return formFail(result.message);
    refreshSheetDesk(result.slug);
    return formSaved("Saved. The public sheet catalog will use this copy.");
  } catch (error) {
    console.error("[SHEET_LISTINGS_ADMIN]", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return formFail("That sheet home did not save. Try again.");
  }
}

export async function inactivateSheetListingForm(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  return runSlugMutation(formData, inactivateAdminSheetListing, "Taken off the public page.");
}

export async function restoreSheetListingForm(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  return runSlugMutation(formData, restoreAdminSheetListing, "Restored to Active on the public page.");
}

export async function deleteSheetListingForm(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = sheetListingSlugSchema.safeParse({ slug: field(formData, "slug") });
  if (!parsed.success) return formFail(parsed.error.issues[0]?.message || "That sheet home is missing.");
  if (!allowLead("admin-sheet-listings-delete", 8, 60_000)) {
    return formFail("Wait a minute and try again.");
  }
  const current = await getAdminSheetListingById(parsed.data.slug);
  if (!current) return formFail("That sheet home is not on this desk.");
  try {
    const result = await deleteAdminSheetListing(parsed.data.slug);
    if (!result.ok) return formFail(result.message);
    refreshSheetDesk(parsed.data.slug);
    redirect("/admin/sheet-listings");
  } catch (error) {
    console.error("[SHEET_LISTINGS_ADMIN]", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return formFail("That sheet home could not be removed. Try again.");
  }
}

async function runSlugMutation(
  formData: FormData,
  work: (slug: string) => Promise<{ ok: true; slug: string } | { ok: false; message: string }>,
  saved: string,
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = sheetListingSlugSchema.safeParse({ slug: field(formData, "slug") });
  if (!parsed.success) return formFail(parsed.error.issues[0]?.message || "That sheet home is missing.");
  try {
    const result = await work(parsed.data.slug);
    if (!result.ok) return formFail(result.message);
    refreshSheetDesk(result.slug);
    return formSaved(saved);
  } catch (error) {
    console.error("[SHEET_LISTINGS_ADMIN]", {
      id: randomUUID(),
      name: error instanceof Error ? error.name : "Error",
    });
    return formFail("That change did not save. Try again.");
  }
}

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function fail(message: string): SheetSyncFormState {
  return { ok: false, message, stamp: Date.now() };
}

function formFail(message: string): AdminFormState {
  return { ok: false, message, stamp: Date.now() };
}

function formSaved(message: string): AdminFormState {
  return { ok: true, message, stamp: Date.now() };
}

function refreshSheetDesk(slug: string) {
  revalidateTag(SHEET_LISTINGS_TAG, "max");
  revalidatePath("/admin");
  revalidatePath("/admin/sheet-listings");
  revalidatePath(`/admin/sheet-listings/${slug}`);
  revalidatePath("/sheet-listings");
  revalidatePath(`/sheet-listings/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/api/listings/sheet");
}

function parseCoord(value: string, min: number, max: number) {
  const compact = value.trim();
  if (!compact) return null;
  if (!/^-?\d+(\.\d+)?$/.test(compact)) return null;
  const amount = Number(compact);
  if (!Number.isFinite(amount) || amount < min || amount > max) return null;
  return amount;
}

function summarize(result: SheetSyncResult) {
  const homes = result.unique === 1 ? "1 home" : `${result.unique} homes`;
  const rows = result.rows === 1 ? "1 sheet row" : `${result.rows} sheet rows`;
  const skipped = Object.entries(result.skipped)
    .filter(([, count]) => count > 0)
    .map(([reason, count]) => `${count} ${reason.replaceAll("_", " ")}`)
    .join(", ");
  const skipBit = skipped ? ` Skipped ${skipped}.` : "";
  const heldBit = result.held ? ` ${result.held} kept on this desk.` : "";
  return `Copied ${homes} from ${rows}. ${result.created} new, ${result.updated} updated, ${result.unchanged} unchanged, ${result.inactivated} taken off the public page.${heldBit}${skipBit}`;
}
