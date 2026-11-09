"use client";

import { useState } from "react";

export function ShareListing({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const text = `${title} — ${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={copy} className="inline-flex min-h-11 items-center rounded-lg border border-line bg-panel px-3 text-sm text-ink">
        {copied ? "Link copied" : "Copy link"}
      </button>
      <a href={`sms:?&body=${encodeURIComponent(text)}`} className="inline-flex min-h-11 items-center rounded-lg border border-line bg-panel px-3 text-sm text-ink">
        Text this home
      </a>
      <a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`} className="inline-flex min-h-11 items-center rounded-lg border border-line bg-panel px-3 text-sm text-ink">
        Email this home
      </a>
    </div>
  );
}
