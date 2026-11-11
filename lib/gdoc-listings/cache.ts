import { revalidatePath, revalidateTag } from "next/cache";
import { SHEET_LISTINGS_TAG } from "@/lib/gdoc-listings/types";

export function refreshSheetListingViews(slugs: string[] = []) {
  revalidateTag(SHEET_LISTINGS_TAG, "max");
  revalidatePath("/admin");
  revalidatePath("/admin/sheet-listings");
  revalidatePath("/properties");
  revalidatePath("/es/propiedades");
  revalidatePath("/sitemap.xml");
  revalidatePath("/api/listings/sheet");
  const seen = new Set<string>();
  for (const slug of slugs) {
    const key = slug.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    revalidatePath(`/admin/sheet-listings/${key}`);
    revalidatePath(`/properties/${key}`);
    revalidatePath(`/es/propiedades/${key}`);
  }
}
