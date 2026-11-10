"use client";

import { useState } from "react";
import { propertyListingStrings } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/routes";

export function ShareListing({
  title,
  url,
  locale,
}: {
  title: string;
  url: string;
  locale: Locale;
}) {
  const [copied, setCopied] = useState(false);
  const copy = propertyListingStrings[locale];
  const text = `${title} — ${url}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={copyLink} className="inline-flex min-h-11 items-center rounded-lg border border-line bg-panel px-3 text-sm text-ink">
        {copied ? copy.linkCopied : copy.copyLink}
      </button>
      <a href={`sms:?&body=${encodeURIComponent(text)}`} className="inline-flex min-h-11 items-center rounded-lg border border-line bg-panel px-3 text-sm text-ink">
        {copy.textHome}
      </a>
      <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`} className="inline-flex min-h-11 items-center rounded-lg border border-line bg-panel px-3 text-sm text-ink">
        {copy.emailHome}
      </a>
    </div>
  );
}
