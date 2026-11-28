import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import { ClosingBand } from "@/components/marketing/closing-band";
import { FaqList } from "@/components/marketing/faq-list";
import { GuideBreadcrumb, GuideJsonLd, GuideLink } from "@/components/marketing/guide-article";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import type { Faq } from "@/lib/content/faqs";
import { getGuide } from "@/lib/content/guides";
import { site } from "@/lib/site";

const slug = "trustee-sale";
const title = "Arizona Trustee Sale Timeline & Options";
const description =
  "The Arizona trustee sale timeline in plain words: the 91-day clock, the reinstatement deadline, your options before the sale, and what to do this week.";
const headline = "Arizona trustee sale timeline: what happens after the notice";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `/guides/${slug}` },
  openGraph: {
    type: "article",
    siteName: site.name,
    locale: "en_US",
    url: `/guides/${slug}`,
    title: `${title} · Vamos Properties`,
    description,
    images: [{ url: site.ogImagePath, alt: site.ogImageAlt }],
  },
};

const timeline = [
  {
    when: "Missed payments",
    what: "Late fees start and the servicer calls and writes. Under federal rules, a servicer generally cannot start a foreclosure until the loan is more than 120 days delinquent.",
  },
  {
    when: "Day 0",
    what: "The trustee records a Notice of Trustee's Sale with the Maricopa County Recorder. This recording date starts the clock, and it is usually not the date you received the letter.",
  },
  {
    when: "Within 5 business days",
    what: "The trustee mails a copy of the notice by certified or registered mail to the owner and others with an interest in the house (A.R.S. § 33-809).",
  },
  {
    when: "Weeks before the sale",
    what: "The notice is published in a newspaper once a week for four weeks in a row and posted on the property at least 20 days before the sale (A.R.S. § 33-808).",
  },
  {
    when: "Last business day before the sale",
    what: "Your deadline to reinstate: pay the past-due amount plus allowed fees and costs by 5:00 p.m. Arizona time, and the sale is cancelled (A.R.S. § 33-813).",
  },
  {
    when: "Day 91 or later",
    what: "The earliest the sale can be held: a public auction run by the trustee at the place named in the notice. The trustee can postpone it, and a new date is announced.",
  },
  {
    when: "After the sale",
    what: "The winning bidder receives a trustee's deed and can ask a court to remove anyone still in the house. Money above what was owed goes to junior lienholders, then the former owner, who has to claim it.",
  },
];

const options = [
  {
    title: "Reinstate the loan",
    body: "Pay what is past due, plus the fees and costs the law allows, before the reinstatement deadline. The loan continues as if the default had not happened. Ask the trustee for a written reinstatement figure.",
  },
  {
    title: "Ask the servicer for help",
    body: "A loan modification, a repayment plan, or a forbearance can stop or postpone the sale. Under federal rules, a complete application received more than 37 days before the sale generally has to be decided before the sale goes forward. Send it in writing and keep proof.",
  },
  {
    title: "Talk to a free housing counselor",
    body: "HUD-approved housing counseling agencies help with foreclosure at no cost and can talk to the servicer with you. Be wary of anyone who charges an upfront fee to save your house.",
  },
  {
    title: "Sell before the sale date",
    body: "If the house is worth more than what is owed, a sale that closes before the auction pays the loan off and keeps the equity yours. A listing needs time a 91-day notice may not leave. A cash sale can close in about two weeks on a clean file.",
  },
  {
    title: "Short sale or deed in lieu",
    body: "If you owe more than the house is worth, the lender may accept less than the full balance or take the deed back. Both need the lender's approval, which takes time, so start early.",
  },
  {
    title: "Take over payments, or talk to an attorney",
    body: "Someone can take over the payments with the loan left in place, which carries real risk for you. A bankruptcy filing can pause a sale. Both are decisions to make with an Arizona attorney.",
  },
];

const faqs: Faq[] = [
  {
    question: "How long does a trustee sale take in Arizona?",
    answer:
      "The sale cannot be held before the 91st day after the Notice of Trustee's Sale is recorded. The date printed on your notice is the one that counts, and it can be postponed. The whole process, from the first missed payment, often takes several months.",
  },
  {
    question: "Can I stop a trustee sale in Arizona?",
    answer:
      "Often, yes, if you act before the sale: reinstate by paying the past-due amount by 5:00 p.m. on the last business day before the sale, get a modification or other agreement with the servicer, pay the loan off through a sale or refinance, or file bankruptcy with an attorney's advice.",
  },
  {
    question: "Can I sell my house after the Notice of Trustee's Sale is recorded?",
    answer:
      "Yes. You own the house until the sale. A sale that closes before the auction pays the loan off through the title company. The tighter the date, the more it matters to start right away, because title has to open a file and get a payoff.",
  },
  {
    question: "Will I owe money after a trustee sale in Arizona?",
    answer:
      "It depends. Arizona's anti-deficiency rules protect many owners of a one- or two-family home on two and a half acres or less from owing the difference after a trustee sale, but not every loan or property qualifies. Ask an Arizona attorney about your loan.",
  },
  {
    question: "What happens to extra money if the house sells for more than I owe at auction?",
    answer:
      "After the trustee pays the costs and the loan that foreclosed, extra money goes to junior lienholders, then to the former owner. It is not sent automatically, so watch for a notice from the trustee and claim it.",
  },
  {
    question: "Does selling before the auction fix my credit?",
    answer:
      "It keeps the foreclosure sale from happening, which matters. It does not erase the late payments already reported. We do not repair credit.",
  },
];

export default async function TrusteeSaleGuidePage() {
  "use cache";
  cacheLife("hours");
  const guide = getGuide(slug);

  return (
    <>
      <GuideJsonLd slug={slug} headline={headline} description={description} dateModified={guide?.updatedAt ?? "2026-11-28"} />

      <Section>
        <GuideBreadcrumb label="After a Notice of Trustee's Sale" />
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">{headline}.</h1>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            Most Arizona home loans use a deed of trust, so a foreclosure usually happens outside of court through a trustee
            sale. A Notice of Trustee&apos;s Sale is the clock. In most cases the sale cannot be held before the 91st day after
            the notice is recorded, and the date printed on your paper is the one that counts.
          </p>
          <p>
            This guide lays out the timeline step by step, the options you still have before the sale, and what to do this
            week. It is a plain-language overview, not legal advice. Have an Arizona attorney read your notice if you need advice
            on your own case.
          </p>
          <p>
            You can still call the servicer, a housing counselor, or that attorney. Talking to Vamos does not cancel those
            options, and it does not pause the date by itself.
          </p>
        </div>
      </Section>

      <Section tone="mist">
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">The Arizona trustee sale timeline.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          From the recording of the notice to the earliest sale date is about 90 days. Everything before and after that window
          varies by servicer.
        </p>
        <ol className="mt-8 grid border-y border-line bg-panel">
          {timeline.map((row) => (
            <li key={row.when} className="grid gap-2 border-b border-line p-5 last:border-b-0 sm:grid-cols-[14rem_1fr]">
              <span className="font-semibold text-link">{row.when}</span>
              <span className="leading-7 text-ink">{row.what}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Your options before the sale date.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          None of these is right for everyone. The earlier you start, the more of them are still available.
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {options.map((option) => (
            <li key={option.title} className="border border-line p-5">
              <h3 className="text-lg font-semibold text-ink">{option.title}</h3>
              <p className="mt-2 leading-7 text-muted">{option.body}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl leading-7 text-muted">
          The short version of the selling options is on the <GuideLink href="/stop-foreclosure">stop foreclosure page</GuideLink>.
          If keeping the loan in place is the only way the numbers work, read{" "}
          <GuideLink href="/take-over-payments">taking over the payments</GuideLink> and the risks it leaves in your name.
        </p>
      </Section>

      <Section tone="mist">
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">What to do this week.</h2>
        <ol className="mt-8 max-w-2xl space-y-6">
          <li>
            <h3 className="text-xl font-semibold text-ink">Find the sale date and the recording date</h3>
            <p className="mt-2 leading-7 text-muted">
              They are not the same day. The recording date starts the count. The sale date is the deadline you can see. Put
              both on the form if you have them.
            </p>
          </li>
          <li>
            <h3 className="text-xl font-semibold text-ink">Pull a mortgage statement and ask for a reinstatement figure</h3>
            <p className="mt-2 leading-7 text-muted">
              We need a real balance, not a guess from memory. A second mortgage, unpaid{" "}
              <GuideLink href="/sell/behind-on-hoa-dues">HOA dues</GuideLink>, or{" "}
              <GuideLink href="/sell/behind-on-property-taxes">delinquent property taxes</GuideLink> change whether a{" "}
              <GuideLink href="/cash-offer">cash offer</GuideLink> can clear the debt.
            </p>
          </li>
          <li>
            <h3 className="text-xl font-semibold text-ink">List everyone who must sign</h3>
            <p className="mt-2 leading-7 text-muted">
              A spouse, an heir, or a co-owner who has moved out can still be required at title. Finding them late is how a date
              gets missed. If the owner has died, see <GuideLink href="/sell/inherited-house">selling an inherited house</GuideLink>.
            </p>
          </li>
          <li>
            <h3 className="text-xl font-semibold text-ink">Ask whether the date is even workable</h3>
            <p className="mt-2 leading-7 text-muted">
              Title has to open a file and order a payoff. Some sales can still be beaten. Some cannot. The phone is faster than
              the form if the date is close:{" "}
              <a href={site.phoneTel} className="font-semibold text-link">{site.phoneDisplay}</a>.
            </p>
          </li>
        </ol>
      </Section>

      <Section>
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">What a sale before the auction does not do.</h2>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            Paying the loan off at closing can keep the trustee sale itself from happening. It does not erase the months you
            were already behind. We do not repair credit.
          </p>
          <p>
            If the cash price will not cover the payoff, say so when we ask. Taking over the payments can be discussed, and your
            name can stay on the loan. That is not a quieter way of saying the foreclosure is over.
          </p>
          <p>
            The house can be in <GuideLink href="/areas/phoenix">Phoenix</GuideLink>, <GuideLink href="/areas/mesa">Mesa</GuideLink>,{" "}
            <GuideLink href="/areas/glendale">Glendale</GuideLink>, <GuideLink href="/areas/surprise">Surprise</GuideLink>, or
            anywhere else in Maricopa County. The timeline does not add days because the house is farther from downtown.
          </p>
        </div>
      </Section>

      <Section tone="mist">
        <FaqList faqs={faqs} heading="Trustee sale questions" />
      </Section>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Send the date with the address.</h2>
            <p className="mt-4 leading-7 text-muted">
              Include the sale date from the notice if you have it. If you want the Spanish explanation, it lives at{" "}
              <GuideLink href="/es/ejecucion-hipotecaria">ejecución hipotecaria</GuideLink>.
            </p>
          </div>
          <LeadForm sourcePath={`/guides/${slug}`} language="en" />
        </div>
      </Section>

      <ClosingBand
        title="Do not wait until the week of the sale."
        body="If the date is close, call. A form at 7:00 p.m. still gets a morning reply, and some dates cannot spare a morning."
      />
    </>
  );
}
