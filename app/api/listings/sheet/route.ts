import { listSheetListings } from "@/lib/dal/gdoc-listings";

export const maxDuration = 30;

export async function GET() {
  const listings = await listSheetListings();
  return Response.json({ listings });
}
