import "server-only";

import sanitizeHtml from "sanitize-html";
import { editorHtml } from "@/lib/blog/content";

function kept(tagName: string, attribs: Record<string, string>) {
  return { tagName, attribs };
}

function dropped() {
  return { tagName: "span", attribs: {} };
}

function safeHttpUrl(value: string) {
  const href = value.trim();
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    if (url.protocol === "https:" || url.protocol === "http:") return href;
  } catch {
    return "";
  }
  return "";
}

export function sanitizePostHtml(raw: string) {
  return sanitizeHtml(editorHtml(raw), {
    allowedTags: ["p", "h2", "h3", "strong", "em", "u", "s", "ul", "ol", "li", "blockquote", "pre", "code", "a", "img", "figure", "figcaption", "video", "br", "hr"],
    allowedAttributes: {
      a: ["href", "rel", "target", "download"],
      img: ["src", "alt", "title"],
      video: ["src", "controls", "preload"],
      figure: ["data-video"],
      p: ["data-file"],
      code: ["class"],
    },
    allowedSchemes: ["http", "https"],
    transformTags: {
      a: (tagName, attribs) => {
        const href = safeHttpUrl(attribs.href ?? "");
        if (!href) return { tagName: "span", attribs: {} };
        const newTab = attribs.target === "_blank";
        return {
          tagName,
          attribs: {
            href,
            rel: "noopener noreferrer",
            ...(newTab ? { target: "_blank" } : {}),
            ...(attribs.download != null ? { download: "" } : {}),
          },
        };
      },
      img: (tagName, attribs) => {
        const src = safeHttpUrl(attribs.src ?? "");
        if (!src) return dropped();
        const title = (attribs.title ?? "").slice(0, 240);
        return kept(tagName, { src, alt: (attribs.alt ?? "").slice(0, 180), ...(title ? { title } : {}) });
      },
      video: (tagName, attribs) => {
        const src = safeHttpUrl(attribs.src ?? "");
        if (!src) return dropped();
        return kept(tagName, { src, controls: "true", preload: "metadata" });
      },
      code: (tagName, attribs) => {
        const match = (attribs.class ?? "").match(/language-[a-z0-9-]+/i);
        return kept(tagName, match ? { class: match[0] } : {});
      },
    },
  });
}
