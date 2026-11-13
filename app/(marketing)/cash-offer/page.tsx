import { cacheLife } from "next/cache";
import Link from "next/link";
import { CityLinks } from "@/components/marketing/city-links";
import { SituationLinks } from "@/components/marketing/situation-links";
import { ClosingBand } from "@/components/marketing/closing-band";
import { Comparison } from "@/components/marketing/comparison";
import { FaqList } from "@/components/marketing/faq-list";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import { hreflang } from "@/lib/i18n/routes";
import { cashFaqs } from "@/lib/content/faqs";
import { site } from "@/lib/site";

export const metadata = {
  title: "Get a cash offer on your Phoenix house",
  description:
    "Vamos buys Maricopa County houses as-is. No repairs, no showings, and no fee to ask. Patrick or Jaime call the same day.",
  alternates: { canonical: "/cash-offer", ...hreflang("/cash-offer", "/es/oferta-en-efectivo") },
};

const steps = [
  {
    title: "Send the address",
    body: "The form takes a minute. Add what you owe if you know it, and the trustee sale date if a notice is already on the counter.",
  },
  {
    title: "We call and look",
    body: "Patrick or Jaime ask about the loan, the condition, and who is on the title. If the numbers can work, we walk the house. You do not have to clean it first.",
  },
  {
    title: "You get a number",
    body: "The offer is in writing enough for you to compare it with staying, listing, or calling your lender. Saying no is a complete answer.",
  },
  {
    title: "Title closes it, or it stops",
    body: "If you accept, a title company handles the deed and the payoff. You see the settlement statement before you sign. If a fact changes the number, we say so before closing, not after.",
  },
];

const included = [
  ["No repair list", "A tired roof, old carpet, or a kitchen from another decade comes out of the price. You do not hire the contractor first."],
  ["No weekend showings", "Strangers are not walking through the house while you are still deciding. One walkthrough with us is the usual visit."],
  ["No agent commission from you", "A listed sale usually pays a commission out of the price. A cash sale with us is not built that way."],
  ["A date you can plan around", "We close on a day title can actually meet. We will not promise Friday if an heir or a lien still has to be found."],
];

export default async function CashOfferPage() {
  "use cache";
  cacheLife("hours");

  return (
    <>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Cash offer</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Get a cash offer on the house, as it sits.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Vamos buys houses in Maricopa County from owners who want a private sale. No listing, no repair checklist, and no fee to hear a number.
        </p>
        <div className="mt-8 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            A cash price is usually below what a patient retail listing might bring. That gap is the cost of skipping repairs, showings, and months of maybe. We show the math before you decide. If listing would clearly net you more and you have the time, we will say that too.
          </p>
          <p>
            The cleaner version of this sale pays your loan off at a title company and takes your name off it. If the balance is too high for that, the honest next page is{" "}
            <Link href="/take-over-payments" className="font-semibold text-link">taking over the payments</Link>, including the part where your name can stay on the loan.
          </p>
        </div>
      </Section>

      <Section tone="mist">
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">What happens after you send the address.</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-2">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-navy pt-5">
              <span className="text-sm font-semibold tracking-wide text-link">0{index + 1}</span>
              <h3 className="mt-2 text-2xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-3 leading-7 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-2xl leading-7 text-muted">
          Same-day means a conversation, not a made-up price texted in an hour. Read{" "}
          <Link href="/guides/cash-sale" className="font-semibold text-link">how a cash sale works</Link> if you want the longer version before you call.
        </p>
      </Section>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">What you are actually skipping.</h2>
            <ul className="mt-8 grid gap-4">
              {included.map(([title, body]) => (
                <li key={title} className="border border-line p-5">
                  <h3 className="text-lg font-semibold text-ink">{title}</h3>
                  <p className="mt-2 leading-7 text-muted">{body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 leading-7 text-muted">
              If a trustee sale already has a date, start with{" "}
              <Link href="/stop-foreclosure" className="font-semibold text-link">that date</Link>. Title needs days, not a pep talk. Or call{" "}
              <a href={site.phoneTel} className="font-semibold text-link">{site.phoneDisplay}</a>.
            </p>
          </div>
          <LeadForm sourcePath="/cash-offer" language="en" />
        </div>
      </Section>

      <Section tone="mist">
        <Comparison />
      </Section>

      <Section>
        <FaqList faqs={cashFaqs} heading="Questions before you ask for a number" />
      </Section>

      <Section tone="mist">
        <SituationLinks />
        <div className="mt-14">
          <CityLinks />
        </div>
      </Section>

      <ClosingBand
        title="Send the address. We’ll call you today."
        body="You do not have to decide anything on the phone. If the house is not a fit, we will say so."
      />
    </>
  );
}
