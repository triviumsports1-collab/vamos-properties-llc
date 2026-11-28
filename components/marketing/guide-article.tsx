import Link from "next/link";
import type { ReactNode } from "react";
import { BreadcrumbJsonLd } from "@/components/marketing/breadcrumb-json-ld";
import { JsonLd } from "@/components/marketing/json-ld";
import { businessRef } from "@/components/marketing/local-business";
import { site } from "@/lib/site";

/** Article + BreadcrumbList JSON-LD for a page under /guides. */
export function GuideJsonLd({
  slug,
  headline,
  description,
  dateModified,
}: {
  slug: string;
  headline: string;
  description: string;
  dateModified: string;
}) {
  const url = `${site.url}/guides/${slug}`;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          "@id": `${url}#article`,
          headline,
          description,
          url,
          mainEntityOfPage: url,
          inLanguage: "en-US",
          dateModified,
          image: `${site.url}${site.ogImagePath}`,
          author: businessRef(),
          publisher: businessRef(),
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: headline, path: `/guides/${slug}` },
        ]}
      />
    </>
  );
}

/** Inline link styled like the rest of the guide prose. */
export function GuideLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-link">
      {children}
    </Link>
  );
}

/** Visible breadcrumb for guide pages. */
export function GuideBreadcrumb({ label }: { label: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-ink">Home</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href="/guides" className="hover:text-ink">Guides</Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-ink">{label}</li>
      </ol>
    </nav>
  );
}
