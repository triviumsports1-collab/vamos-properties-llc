import type { MetadataRoute } from "next";
import { areas } from "@/lib/content/areas";
import { guides } from "@/lib/content/guides";
import { blogSitemapEntries } from "@/lib/dal/blog";
import { listSheetListingSitemapEntries } from "@/lib/dal/gdoc-listings";
import { site, spanishForeclosurePath } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blog, sheets] = await Promise.all([blogSitemapEntries(), listSheetListingSitemapEntries()]);
  const blogPaths = [...blog.posts, ...blog.categories, ...blog.tags];
  const paths = [
    "",
    "/cash-offer",
    "/stop-foreclosure",
    "/take-over-payments",
    "/about",
    "/contact",
    "/properties",
    "/es/propiedades",
    "/blog",
    "/guides",
    ...guides.map((guide) => `/guides/${guide.slug}`),
    spanishForeclosurePath,
    ...areas.map((area) => `/areas/${area.slug}`),
    ...sheets.map((home) => `/properties/${home.slug}`),
    ...sheets.map((home) => `/es/propiedades/${home.slug}`),
    ...blogPaths.map((entry) => entry.path),
  ];

  return paths.map((path) => ({
    url: path === "" ? site.url : `${site.url}${path}`,
    lastModified:
      sheets.find((home) => path === `/properties/${home.slug}` || path === `/es/propiedades/${home.slug}`)?.updatedAt.slice(0, 10) ??
      blogPaths.find((entry) => entry.path === path)?.updatedAt.slice(0, 10) ??
      "2026-10-18",
  }));
}
