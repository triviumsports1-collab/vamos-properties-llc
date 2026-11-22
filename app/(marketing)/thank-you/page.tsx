import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/marketing/section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "We saved your request",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <Section>
      <article className="max-w-xl">
        <p className="border border-line bg-panel px-4 py-4 text-base leading-7 text-ink" role="status">
          Saved. Our team has your address and will call or text the number you gave us.
        </p>
        <h1 className="mt-8 text-4xl font-semibold leading-tight text-ink">We have it.</h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          During the day that usually happens within a few minutes. If it is after hours, it will be in the morning. You do not have to decide anything on that call.
        </p>
        <p className="mt-4 leading-7 text-ink">
          If you would rather not wait, call{" "}
          <a href={site.phoneTel} className="text-pine">
            {site.phoneDisplay}
          </a>
          .
        </p>
        <Link href="/" className="mt-8 inline-flex min-h-11 items-center text-pine">
          Back to the home page
        </Link>
      </article>
    </Section>
  );
}
