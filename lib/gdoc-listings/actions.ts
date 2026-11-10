"use server";

import { getSheetListingById } from "@/lib/dal/gdoc-listings";
import { sheetListingHref } from "@/lib/gdoc-listings/display";
import { submitLead, type LeadFormState } from "@/lib/leads/actions";
import type { Locale } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function submitSheetListingLead(
  previous: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const listingId = field(formData, "listingId").trim().slice(0, 120);
  const language: Locale = field(formData, "language") === "es" ? "es" : "en";
  const listing = await getSheetListingById(listingId);
  if (!listing) {
    return {
      message:
        language === "es"
          ? `Esa casa ya no está en la lista. Llame al ${site.phoneDisplay}.`
          : `That home is no longer listed. Call ${site.phoneDisplay}.`,
      fieldErrors: { listingId: language === "es" ? "Este anuncio no está disponible." : "This listing is not available." },
    };
  }

  const note = field(formData, "message").trim();
  const propertyLine =
    language === "es"
      ? `Consulta sobre: ${listing.title} · ${listing.address}`
      : `Inquiring about: ${listing.title} · ${listing.address}`;
  formData.set("address", listing.address);
  formData.set("situation", "listing_inquiry");
  formData.set("preferredPath", field(formData, "preferredPath") || "unsure");
  formData.set("language", language);
  formData.set("sourcePath", sheetListingHref(listing.id, language));
  formData.set("trusteeSaleDate", "");
  formData.set("message", note ? `${propertyLine}\n\n${note}` : propertyLine);

  return submitLead(previous, formData);
}
