import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { SHEET_LISTINGS_TAG } from "@/lib/gdoc-listings/types";

/**
 * Invalidates every view of the sheet catalog.
 *
 * `immediate: true` uses `updateTag`, so the next request waits for fresh data instead of
 * being served the stale copy (read-your-own-writes after an admin edit). `updateTag` only
 * works inside Server Actions, so Route Handlers (the sheet webhook) keep the default
 * stale-while-revalidate `revalidateTag(tag, "max")`.
 */
export function refreshSheetListingViews(
  slugs: string[] = [],
  options: { immediate?: boolean; expireNow?: boolean } = {},
) {
  // immediate: Server Actions (read-your-own-writes). expireNow: Route Handlers that must not
  // serve stale data afterwards (e.g. the expiry cron), where updateTag is not allowed.
  if (options.immediate) updateTag(SHEET_LISTINGS_TAG);
  else if (options.expireNow) revalidateTag(SHEET_LISTINGS_TAG, { expire: 0 });
  else revalidateTag(SHEET_LISTINGS_TAG, "max");
  revalidatePath("/");
  revalidatePath("/es");
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
