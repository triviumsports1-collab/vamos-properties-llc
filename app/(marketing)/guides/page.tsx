import { cacheLife } from "next/cache";
import Link from "next/link";
import { ClosingBand } from "@/components/marketing/closing-band";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import { guides } from "@/lib/content/guides";

export const metadata = {
  title: "Guides for selling a Phoenix house",
  description:
    "Plain-language guides on a cash sale, an Arizona trustee sale, and selling during a divorce, probate, or job loss.",
  alternates: { canonical: "/guides" },
};

export default async function GuidesPage() {
  "use cache";
  cacheLife("hours");

  return (
    <>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Guides</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Read the part that matches your situation.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          These are short explanations, not a legal opinion. If you already know you want a person instead of a page, the form is on this screen.
        </p>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          Selling because of an inheritance, a divorce, a rental, repairs, or a move? Those have{" "}
          <Link href="/sell" className="font-semibold text-link">their own pages</Link>.
        </p>
        <ul className="mt-10 grid gap-4">
          {guides.map((guide) => (
            <li key={guide.slug} className="border border-line p-6">
              <h2 className="text-2xl font-semibold text-ink">
                <Link href={`/guides/${guide.slug}`} className="text-link">
                  {guide.title}
                </Link>
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted">{guide.blurb}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Or skip ahead to the address.</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
              A guide will not move a sale date. The address will. You can still say no after we call.
            </p>
          </div>
          <LeadForm sourcePath="/guides" language="en" />
        </div>
      </Section>

      <ClosingBand
        title="When you are ready, send the address."
        body="Patrick or Jaime read it. You are not signing anything by asking."
      />
    </>
  );
}
