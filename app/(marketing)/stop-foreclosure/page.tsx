import { cacheLife } from "next/cache";
import Link from "next/link";
import { CityLinks } from "@/components/marketing/city-links";
import { SituationLinks } from "@/components/marketing/situation-links";
import { ClosingBand } from "@/components/marketing/closing-band";
import { FaqList } from "@/components/marketing/faq-list";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import { hreflang } from "@/lib/i18n/routes";
import { foreclosureFaqs } from "@/lib/content/faqs";
import { site, spanishForeclosurePath } from "@/lib/site";

export const metadata = {
  title: "Stop a foreclosure in Phoenix",
  description:
    "If you have a Notice of Trustee's Sale in Maricopa County, Vamos can talk through a cash sale before the auction date.",
  alternates: {
    canonical: "/stop-foreclosure",
    ...hreflang("/stop-foreclosure", spanishForeclosurePath),
  },
};

const needs = [
  ["The address", "Street, city, and whether anyone is living there."],
  ["The sale date", "The date printed on the notice, if you have one."],
  ["A real number", "A phone you actually answer during the day."],
];

const timeline = [
  {
    title: "The notice is recorded",
    body: "That recording date starts the count. The letter in the mail can arrive later. Do not measure from the day you opened it.",
  },
  {
    title: "The sale date is the deadline you can see",
    body: "In most Arizona cases the sale cannot be held before the 91st day after recording. Confirm your own notice. We are not your lawyer.",
  },
  {
    title: "Title needs the middle of that window",
    body: "A payoff, a spouse, or an heir can eat the last two weeks. Calling the week of the auction is often too late to open a file.",
  },
  {
    title: "Closing pays the loan, or we tell you it will not",
    body: "A cash sale is meant to pay the mortgage at a title company before the sale. If the balance is too high, we say so and explain the other path.",
  },
];

export default async function StopForeclosurePage() {
  "use cache";
  cacheLife("hours");

  return (
    <>
      <Section>
        <p className="text-sm font-semibold text-link">
          <Link href={spanishForeclosurePath}>Leer en español</Link>
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          If the trustee sale has a date, start with that date.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          A Notice of Trustee&apos;s Sale in Arizona is a clock. In most cases the sale cannot be held before the 91st day after the notice is recorded. The date on your paper is the one that counts.
        </p>
        <div className="mt-8 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            A cash sale is meant to pay the loan off at a title company before that date. Missed payments already on your credit stay there. We do not repair credit, and selling does not erase the months you were behind.
          </p>
          <p>
            You can still call your servicer, a housing counselor, or a lawyer. This page is a plain-language overview, not legal advice. Have someone who practices in Arizona read your notice before you rely on a timeline.
          </p>
        </div>
      </Section>

      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">What we need</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Three things. Then we can talk the same day.</h2>
            <ul className="mt-8 grid gap-4">
              {needs.map(([title, body]) => (
                <li key={title} className="bg-panel p-5">
                  <p className="text-lg font-semibold text-ink">{title}</p>
                  <p className="mt-1 leading-7 text-muted">{body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 leading-7 text-muted">
              Or call <a href={site.phoneTel} className="font-semibold text-link">{site.phoneDisplay}</a>. If a cash sale would not clear the loan, we will also explain{" "}
              <Link href="/take-over-payments" className="font-semibold text-link">taking over the payments</Link>, including the part where your name can stay on the mortgage.
            </p>
          </div>
          <LeadForm sourcePath="/stop-foreclosure" language="en" />
        </div>
      </Section>

      <Section>
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">How the weeks usually go.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          The longer explanation is <Link href="/guides/trustee-sale" className="font-semibold text-link">what to do after a Notice of Trustee&apos;s Sale</Link>.
          If the loan can be paid off, the sale itself is a <Link href="/cash-offer" className="font-semibold text-link">cash offer</Link>.
        </p>
        <ol className="mt-10 grid gap-6 md:grid-cols-2">
          {timeline.map((item, index) => (
            <li key={item.title} className="border-t-2 border-navy pt-5">
              <span className="text-sm font-semibold tracking-wide text-link">0{index + 1}</span>
              <h3 className="mt-2 text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 leading-7 text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="mist">
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">What selling before the auction does not fix.</h2>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>Missed payments already on your credit stay there. We do not repair credit, and we will not tell you a completed foreclosure is a small mark. It is not.</p>
          <p>
            Paying the loan off can keep the trustee sale from happening. It does not rewrite the months you were behind. If a cash price cannot cover the payoff,{" "}
            <Link href="/take-over-payments" className="font-semibold text-link">taking over the payments</Link> is a different deal, and your name can stay on the mortgage.
          </p>
        </div>
      </Section>

      <Section>
        <FaqList faqs={foreclosureFaqs} />
      </Section>

      <Section tone="mist">
        <SituationLinks />
        <div className="mt-14">
          <CityLinks heading="The date is the same across the Valley" />
        </div>
      </Section>

      <ClosingBand
        title="The date on the notice is the one that matters."
        body="Send the address and that date. Patrick or Jaime will tell you whether a cash closing can happen before it."
      />
    </>
  );
}
