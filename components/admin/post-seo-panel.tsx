"use client";

import { useState } from "react";
import {
  META_DESCRIPTION_MAX,
  META_DESCRIPTION_MIN,
  SEO_TITLE_MAX,
  SEO_TITLE_SUFFIX,
  type CheckStatus,
  type SeoReport,
} from "@/lib/blog/seo-check";

const fieldClass = "mt-2 w-full border border-line bg-paper px-3 py-3 text-base text-ink";

const dot: Record<CheckStatus, string> = {
  good: "bg-green-600",
  warn: "bg-amber",
  bad: "bg-red-600",
};

const statusWord: Record<CheckStatus, string> = { good: "Good", warn: "Improve", bad: "Problem" };

function Counter({ length, min, max }: { length: number; min: number; max: number }) {
  const tone = length === 0 ? "text-muted" : length > max ? "text-red-700 dark:text-red-300" : length < min ? "text-orange-700 dark:text-orange-300" : "text-green-700 dark:text-green-300";
  return (
    <span className={`text-xs font-semibold ${tone}`}>
      {length} / {max}
    </span>
  );
}

function Meter({ length, min, max }: { length: number; min: number; max: number }) {
  const percent = Math.min(100, Math.round((length / max) * 100));
  const tone = length > max ? "bg-red-600" : length < min ? "bg-amber" : "bg-green-600";
  return (
    <div className="mt-1 h-1.5 w-full bg-line" aria-hidden="true">
      <div className={`h-full ${tone}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

export function PostSeoPanel({
  report,
  siteHost,
  slug,
  keyphrase,
  onKeyphrase,
  metaTitle,
  onMetaTitle,
  metaDescription,
  onMetaDescription,
  titlePlaceholder,
  socialImageUrl,
  publishedAt,
}: {
  report: SeoReport;
  siteHost: string;
  slug: string;
  keyphrase: string;
  onKeyphrase: (value: string) => void;
  metaTitle: string;
  onMetaTitle: (value: string) => void;
  metaDescription: string;
  onMetaDescription: (value: string) => void;
  titlePlaceholder: string;
  socialImageUrl: string;
  publishedAt: string | null;
}) {
  const [view, setView] = useState<"google" | "social">("google");
  const order: Record<CheckStatus, number> = { bad: 0, warn: 1, good: 2 };
  const checks = [...report.checks].sort((a, b) => order[a.status] - order[b.status]);
  const scoreTone = report.score >= 80 ? "text-green-700 dark:text-green-300" : report.score >= 55 ? "text-orange-700 dark:text-orange-300" : "text-red-700 dark:text-red-300";
  const titleBudget = SEO_TITLE_MAX - SEO_TITLE_SUFFIX.length;
  const date = publishedAt
    ? new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", month: "short", day: "numeric", year: "numeric" }).format(new Date(publishedAt))
    : null;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">SEO score</p>
        <p className={`text-2xl font-semibold ${scoreTone}`}>{report.score}</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-muted" htmlFor="seo-keyphrase">
          Focus keyphrase
        </label>
        <input
          id="seo-keyphrase"
          value={keyphrase}
          onChange={(event) => onKeyphrase(event.target.value)}
          placeholder="sell house fast Phoenix"
          className={fieldClass}
        />
        <p className="mt-1 text-xs leading-5 text-muted">The search you want this post to rank for. Kept on this device.</p>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2">
          <label className="block text-sm font-semibold text-muted" htmlFor="meta-title">
            SEO title
          </label>
          <Counter length={metaTitle.trim().length} min={20} max={titleBudget} />
        </div>
        <input
          id="meta-title"
          value={metaTitle}
          onChange={(event) => onMetaTitle(event.target.value)}
          placeholder={titlePlaceholder || "Defaults to the post title"}
          className={fieldClass}
        />
        <Meter length={report.seoTitle.length} min={35} max={SEO_TITLE_MAX} />
        <p className="mt-1 text-xs leading-5 text-muted">
          &ldquo;{SEO_TITLE_SUFFIX.trim()}&rdquo; is added after it. Keep the whole title under {SEO_TITLE_MAX} characters.
        </p>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2">
          <label className="block text-sm font-semibold text-muted" htmlFor="meta-description">
            Meta description
          </label>
          <Counter length={metaDescription.trim().length} min={META_DESCRIPTION_MIN} max={META_DESCRIPTION_MAX} />
        </div>
        <textarea
          id="meta-description"
          value={metaDescription}
          onChange={(event) => onMetaDescription(event.target.value)}
          rows={4}
          placeholder="One or two sentences that make someone click. Include the keyphrase."
          className={fieldClass}
        />
        <Meter length={metaDescription.trim().length} min={META_DESCRIPTION_MIN} max={META_DESCRIPTION_MAX} />
      </div>

      <div>
        <div className="flex border border-line text-sm font-semibold" role="tablist" aria-label="Search and social preview">
          {(["google", "social"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={view === tab}
              onClick={() => setView(tab)}
              className={`min-h-11 flex-1 px-3 ${view === tab ? "bg-navy text-white" : "text-ink"}`}
            >
              {tab === "google" ? "Google preview" : "Social preview"}
            </button>
          ))}
        </div>
        {view === "google" ? (
          <div className="border border-t-0 border-line bg-white p-3 font-sans">
            <p className="truncate text-xs text-[#4d5156]">
              {siteHost} › blog › {slug || "your-post"}
            </p>
            <p className="mt-1 line-clamp-2 text-lg leading-6 text-[#1a0dab]">{report.seoTitle || "Your post title · Vamos Properties"}</p>
            <p className="mt-1 line-clamp-3 text-sm leading-5 text-[#4d5156]">
              {date ? <span className="text-[#70757a]">{date} — </span> : null}
              {report.description || "Add a meta description to control this text."}
            </p>
          </div>
        ) : (
          <div className="border border-t-0 border-line bg-white">
            {socialImageUrl ? (
              <img src={socialImageUrl} alt="" className="aspect-[1.91/1] w-full object-cover" />
            ) : (
              <div className="flex aspect-[1.91/1] w-full items-center justify-center bg-mist text-sm text-muted">No social image</div>
            )}
            <div className="border-t border-line p-3">
              <p className="text-xs uppercase text-muted">{siteHost}</p>
              <p className="mt-1 line-clamp-2 font-semibold leading-6 text-ink">{report.seoTitle || "Your post title"}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{report.description}</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-muted">Checklist</p>
        <ul className="mt-2 grid gap-2">
          {checks.map((check) => (
            <li key={check.id} className="flex gap-2 text-sm leading-5 text-ink">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot[check.status]}`} aria-hidden="true" />
              <span>
                <span className="sr-only">{statusWord[check.status]}: </span>
                {check.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
