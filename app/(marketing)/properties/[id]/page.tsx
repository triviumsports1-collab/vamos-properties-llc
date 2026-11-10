import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SheetListingDetailView } from "@/components/marketing/sheet-listing-detail-view";
import { getSheetListingById, listPublicSheetListingSlugs } from "@/lib/dal/gdoc-listings";
import { sheetListingHref } from "@/lib/gdoc-listings/display";
import { sheetListingMetadata } from "@/lib/gdoc-listings/seo";
import { SHEET_LISTINGS_TAG } from "@/lib/gdoc-listings/types";

type DetailProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await listPublicSheetListingSlugs();
    if (slugs.length === 0) return [{ id: "_" }];
    return slugs.map((id) => ({ id }));
  } catch {
    return [{ id: "_" }];
  }
}

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  const { id } = await params;
  const listing = await getSheetListingById(id);
  if (!listing) return { title: "Home", robots: { index: false, follow: false } };
  return sheetListingMetadata(listing, "en");
}

export default async function PropertyDetailPage({ params }: DetailProps) {
  "use cache";
  cacheLife("hours");
  cacheTag(SHEET_LISTINGS_TAG);
  const { id } = await params;
  const listing = await getSheetListingById(id);
  if (!listing) notFound();
  if (id !== listing.id) permanentRedirect(sheetListingHref(listing.id, "en"));
  return <SheetListingDetailView listing={listing} locale="en" />;
}
