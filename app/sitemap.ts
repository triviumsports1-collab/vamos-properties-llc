import type { MetadataRoute } from "next";
import { areas } from "@/lib/content/areas";
import { guides } from "@/lib/content/guides";
import { blogSitemapEntries } from "@/lib/dal/blog";
import { listSheetListingSitemapEntries } from "@/lib/dal/gdoc-listings";
import { listPublicSlugs } from "@/lib/dal/listings";
import { site, spanishForeclosurePath } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [homes, blog] = await Promise.all([listPublicSlugs(), blogSitemapEntries()]);
  const sheets = await listSheetListingSitemapEntries();
  const blogPaths = [...blog.posts, ...blog.categories, ...blog.tags];
  const paths = [
    "",
    "/cash-offer",
    "/stop-foreclosure",
    "/take-over-payments",
    "/about",
    "/contact",
    "/listings",
    "/sheet-listings",
    "/blog",
    "/guides",
    ...guides.map((guide) => `/guides/${guide.slug}`),
    spanishForeclosurePath,
    ...areas.map((area) => `/areas/${area.slug}`),
    ...homes.map((home) => `/listings/${home.slug}`),
    ...sheets.map((home) => `/sheet-listings/${home.slug}`),
    ...blogPaths.map((entry) => entry.path),
  ];

  return paths.map((path) => ({
    url: path === "" ? site.url : `${site.url}${path}`,
    lastModified:
      sheets.find((home) => path === `/sheet-listings/${home.slug}`)?.updatedAt.slice(0, 10) ??
      homes.find((home) => path === `/listings/${home.slug}`)?.updatedAt.slice(0, 10) ??
      blogPaths.find((entry) => entry.path === path)?.updatedAt.slice(0, 10) ??
      "2026-10-18",
  }));
}
