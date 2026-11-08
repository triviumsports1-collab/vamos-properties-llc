"use server";

import { getSheetListingById } from "@/lib/dal/gdoc-listings";
import { submitLead, type LeadFormState } from "@/lib/leads/actions";
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
  const listing = await getSheetListingById(listingId);
  if (!listing) {
    return {
      message: `That home is no longer on the sheet. Call ${site.phoneDisplay}.`,
      fieldErrors: { listingId: "This listing is not available." },
    };
  }

  const note = field(formData, "message").trim();
  const propertyLine = `Inquiring about: ${listing.title} · ${listing.address}`;
  formData.set("address", listing.address);
  formData.set("situation", "listing_inquiry");
  formData.set("preferredPath", field(formData, "preferredPath") || "unsure");
  formData.set("language", "en");
  formData.set("sourcePath", `/sheet-listings/${listing.id}`);
  formData.set("trusteeSaleDate", "");
  formData.set("message", note ? `${propertyLine}\n\n${note}` : propertyLine);

  return submitLead(previous, formData);
}
