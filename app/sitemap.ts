import type { MetadataRoute } from "next";
import { areas } from "@/lib/content/areas";
import { guides } from "@/lib/content/guides";
import { blogSitemapEntries } from "@/lib/dal/blog";
import { listSheetListingSitemapEntries } from "@/lib/dal/gdoc-listings";
import { sitemapLanguages } from "@/lib/i18n/routes";
import { site, spanishForeclosurePath } from "@/lib/site";

const STATIC_LAST_MODIFIED = "2026-10-18";

const pairedPaths: Array<{ en: string; es: string }> = [
  { en: "/", es: "/es" },
  { en: "/cash-offer", es: "/es/oferta-en-efectivo" },
  { en: "/stop-foreclosure", es: spanishForeclosurePath },
  { en: "/take-over-payments", es: "/es/tomar-los-pagos" },
  { en: "/about", es: "/es/nosotros" },
  { en: "/contact", es: "/es/contacto" },
  { en: "/properties", es: "/es/propiedades" },
];

function abs(path: string) {
  if (!path || path === "/") return site.url;
  return `${site.url}${path}`;
}

function entry(
  path: string,
  lastModified: string,
  languages?: { en: string; es: string },
): MetadataRoute.Sitemap[number] {
  return {
    url: abs(path),
    lastModified,
    ...(languages ? { alternates: sitemapLanguages(abs(languages.en), abs(languages.es)) } : {}),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blog, sheets] = await Promise.all([blogSitemapEntries(), listSheetListingSitemapEntries()]);
  const blogPaths = [...blog.posts, ...blog.categories, ...blog.tags];

  const paired = pairedPaths.flatMap((pair) => [
    entry(pair.en, STATIC_LAST_MODIFIED, pair),
    entry(pair.es, STATIC_LAST_MODIFIED, pair),
  ]);

  const listings = sheets.flatMap((home) => {
    const languages = { en: `/properties/${home.slug}`, es: `/es/propiedades/${home.slug}` };
    const lastModified = home.updatedAt.slice(0, 10);
    return [entry(languages.en, lastModified, languages), entry(languages.es, lastModified, languages)];
  });

  const englishOnly = [
    "/blog",
    "/guides",
    ...guides.map((guide) => `/guides/${guide.slug}`),
    ...areas.map((area) => `/areas/${area.slug}`),
    ...blogPaths.map((item) => item.path),
  ].map((path) =>
    entry(path, blogPaths.find((item) => item.path === path)?.updatedAt.slice(0, 10) ?? STATIC_LAST_MODIFIED),
  );

  return [...paired, ...listings, ...englishOnly];
}
