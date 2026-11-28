import { plainText, slugify } from "@/lib/blog/content";

export const SEO_TITLE_SUFFIX = " · Vamos Properties";
export const SEO_TITLE_MAX = 60;
export const META_DESCRIPTION_MIN = 120;
export const META_DESCRIPTION_MAX = 160;
const GOOD_WORD_COUNT = 800;
const MIN_WORD_COUNT = 300;

export type CheckStatus = "good" | "warn" | "bad";

export type SeoCheck = { id: string; status: CheckStatus; label: string };

export type SeoInput = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  slug: string;
  html: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  keyphrase: string;
  siteHost: string;
};

export type SeoReport = {
  seoTitle: string;
  description: string;
  wordCount: number;
  readingMinutes: number;
  h2Count: number;
  internalLinks: number;
  externalLinks: number;
  imagesMissingAlt: number;
  checks: SeoCheck[];
  score: number;
};

/** The <title> the public post page will render. */
export function effectiveSeoTitle(title: string, metaTitle: string) {
  const base = metaTitle.trim() || title.trim();
  return base ? `${base}${SEO_TITLE_SUFFIX}` : "";
}

/** The meta description the public post page will render (falls back to the excerpt, then the opening). */
export function effectiveDescription(metaDescription: string, excerpt: string, html: string) {
  return (metaDescription.trim() || excerpt.trim() || plainText(html).slice(0, 180)).trim();
}

function words(text: string) {
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word));
}

function normalize(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const STOP_WORDS = new Set(["a", "an", "the", "in", "of", "to", "for", "and", "or", "on", "at", "my", "your", "en", "de", "la", "el", "y", "su"]);

/** Exact phrase, or every meaningful word of the keyphrase in any order ("sell house fast Phoenix" ≈ "Sell a House Fast in Phoenix"). */
function contains(haystack: string, needle: string) {
  const n = normalize(needle);
  if (!n) return false;
  const hay = normalize(haystack);
  if (` ${hay} `.includes(` ${n} `)) return true;
  const hayWords = new Set(hay.split(" "));
  const keyWords = n.split(" ").filter((word) => !STOP_WORDS.has(word));
  return keyWords.length > 0 && keyWords.every((word) => hayWords.has(word));
}

function countOccurrences(text: string, phrase: string) {
  const n = normalize(phrase);
  if (!n) return 0;
  const hay = ` ${normalize(text)} `;
  let count = 0;
  let index = hay.indexOf(` ${n} `);
  while (index !== -1) {
    count += 1;
    index = hay.indexOf(` ${n} `, index + n.length + 1);
  }
  return count;
}

export function analyzePost(input: SeoInput): SeoReport {
  const text = plainText(input.html);
  const wordList = words(text);
  const wordCount = wordList.length;
  const seoTitle = effectiveSeoTitle(input.title, input.metaTitle);
  const description = effectiveDescription(input.metaDescription, input.excerpt, input.html);
  const h2s = [...input.html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((match) => plainText(match[1] ?? ""));
  const subheadings = [...input.html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)].map((match) => plainText(match[1] ?? ""));
  const hrefs = [...input.html.matchAll(/<a\s[^>]*href="([^"]*)"/gi)].map((match) => match[1] ?? "");
  const internalLinks = hrefs.filter((href) => href.startsWith("/") || href.includes(input.siteHost)).length;
  const externalLinks = hrefs.length - internalLinks;
  const images = [...input.html.matchAll(/<img\s[^>]*>/gi)].map((match) => match[0]);
  const imagesMissingAlt = images.filter((tag) => !/alt="[^"]+"/i.test(tag)).length;
  const firstParagraph = plainText(input.html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "");

  const checks: SeoCheck[] = [];
  const add = (id: string, status: CheckStatus, label: string) => checks.push({ id, status, label });

  // Title
  if (!seoTitle) add("title", "bad", "Add a title.");
  else if (seoTitle.length > SEO_TITLE_MAX)
    add("title", "warn", `SEO title is ${seoTitle.length} characters with the site name. Google may cut it after about ${SEO_TITLE_MAX}.`);
  else if (seoTitle.length < 35) add("title", "warn", `SEO title is short (${seoTitle.length} characters). Add a place or a benefit.`);
  else add("title", "good", `SEO title length is good (${seoTitle.length} characters).`);

  // Meta description
  if (!input.metaDescription.trim())
    add("meta", "warn", "No meta description. Google will use the excerpt or the opening text instead. Write one to control the snippet.");
  else if (input.metaDescription.trim().length < META_DESCRIPTION_MIN)
    add("meta", "warn", `Meta description is ${input.metaDescription.trim().length} characters. Aim for ${META_DESCRIPTION_MIN}-${META_DESCRIPTION_MAX}.`);
  else if (input.metaDescription.trim().length > META_DESCRIPTION_MAX)
    add("meta", "warn", `Meta description is ${input.metaDescription.trim().length} characters. Google may cut it after ${META_DESCRIPTION_MAX}.`);
  else add("meta", "good", "Meta description length is good.");

  // Slug
  const slug = input.slug || slugify(input.title);
  const slugWords = slug.split("-").filter(Boolean).length;
  if (slug.length > 60 || slugWords > 8) add("slug", "warn", "The web address is long. Keep it to a few words that match the search.");
  else add("slug", "good", "The web address is short and readable.");

  // Length and structure
  if (wordCount < MIN_WORD_COUNT) add("length", "bad", `${wordCount} words. Posts under ${MIN_WORD_COUNT} words rarely rank. Aim for ${GOOD_WORD_COUNT}+.`);
  else if (wordCount < GOOD_WORD_COUNT) add("length", "warn", `${wordCount} words. Competitive local topics usually need ${GOOD_WORD_COUNT}+.`);
  else add("length", "good", `${wordCount} words. Good depth.`);

  if (wordCount >= MIN_WORD_COUNT && subheadings.length === 0) add("headings", "warn", "Break the article up with H2 subheadings.");
  else if (subheadings.length > 0) add("headings", "good", `${subheadings.length} subheading${subheadings.length === 1 ? "" : "s"}.`);

  // Links
  if (internalLinks === 0) add("internal", "warn", "No internal links. Link to /cash-offer, a /sell page, or a related guide.");
  else add("internal", "good", `${internalLinks} internal link${internalLinks === 1 ? "" : "s"}.`);

  // Images
  if (!input.featuredImageUrl) add("featured", "warn", "No featured image. It is used on the blog index and when the post is shared.");
  else if (!input.featuredImageAlt.trim()) add("featured", "warn", "Featured image needs alt text.");
  else add("featured", "good", "Featured image has alt text.");
  if (imagesMissingAlt > 0) add("alt", "warn", `${imagesMissingAlt} image${imagesMissingAlt === 1 ? "" : "s"} in the article ${imagesMissingAlt === 1 ? "has" : "have"} no alt text.`);

  // Focus keyphrase
  const keyphrase = input.keyphrase.trim();
  if (!keyphrase) {
    add("keyphrase", "warn", "Set a focus keyphrase to check the title, description, and opening against it.");
  } else {
    add("kp-title", contains(seoTitle, keyphrase) ? "good" : "bad", contains(seoTitle, keyphrase) ? "Keyphrase is in the SEO title." : "Put the keyphrase in the SEO title.");
    add("kp-meta", contains(description, keyphrase) ? "good" : "warn", contains(description, keyphrase) ? "Keyphrase is in the meta description." : "Use the keyphrase in the meta description.");
    add("kp-slug", contains(slug.replace(/-/g, " "), keyphrase) ? "good" : "warn", contains(slug.replace(/-/g, " "), keyphrase) ? "Keyphrase is in the web address." : "Use the keyphrase in the web address.");
    add("kp-intro", contains(firstParagraph, keyphrase) ? "good" : "warn", contains(firstParagraph, keyphrase) ? "Keyphrase appears in the first paragraph." : "Use the keyphrase in the first paragraph.");
    add("kp-heading", h2s.some((heading) => contains(heading, keyphrase)) ? "good" : "warn", h2s.some((heading) => contains(heading, keyphrase)) ? "Keyphrase is in a subheading." : "Use the keyphrase (or a close variant) in at least one H2.");
    const occurrences = countOccurrences(text, keyphrase);
    const density = wordCount ? (occurrences * words(keyphrase).length * 100) / wordCount : 0;
    if (occurrences === 0) add("kp-density", "bad", "The keyphrase does not appear in the article.");
    else if (density > 3) add("kp-density", "warn", `Keyphrase density is ${density.toFixed(1)}%. That reads as stuffing; use variants.`);
    else add("kp-density", "good", `Keyphrase used ${occurrences} time${occurrences === 1 ? "" : "s"} (${density.toFixed(1)}%).`);
  }

  const weights = { good: 1, warn: 0.5, bad: 0 } as const;
  const score = checks.length ? Math.round((checks.reduce((sum, check) => sum + weights[check.status], 0) / checks.length) * 100) : 0;

  return {
    seoTitle,
    description,
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / 200)),
    h2Count: h2s.length,
    internalLinks,
    externalLinks,
    imagesMissingAlt,
    checks,
    score,
  };
}
