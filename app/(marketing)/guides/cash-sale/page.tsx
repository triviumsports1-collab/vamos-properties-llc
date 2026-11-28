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

const slug = "cash-sale";
const title = "How a Cash House Sale Works in Arizona";
const description =
  "Step-by-step: how a cash house sale works in Arizona, from the first call to a Maricopa County title company, the timeline, the paperwork, and what you net.";
const headline = "How a cash house sale works in Arizona, step by step";

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
  { when: "Day 1", what: "You send the address or call. A specialist calls you back the same day." },
  { when: "Days 1 to 3", what: "A short call about the loan, the house, and who is on the title, then one visit to see the house as it is." },
  { when: "Within a few days", what: "You get a written number with the math behind it. You can accept, ask questions, or decline." },
  { when: "After you accept", what: "A Maricopa County title company opens escrow, searches the title, and orders the loan and lien payoffs." },
  { when: "Often about 2 weeks", what: "Closing on a clean file. Probate, a missing signer, or a lien can take longer. You pick the date." },
  { when: "Closing day", what: "You sign with a notary, the deed records with the Maricopa County Recorder, and the title company pays the loan and sends you the rest." },
];

const steps = [
  {
    title: "1. You send the address",
    body: (
      <>
        Use the form or call <a href={site.phoneTel} className="font-semibold text-link">{site.phoneDisplay}</a>. If a
        notice is on the counter, include the sale date. If someone else is on the title, say their name. Those two facts save
        more time than a dozen photos.
      </>
    ),
  },
  {
    title: "2. We ask what a listing would hide",
    body: (
      <>
        What you owe, and to whom. What the house needs. Whether anyone lives there, including a tenant. Whether an HOA, a
        city notice, solar panels, or a second loan is in the drawer. A <GuideLink href="/cash-offer">cash offer</GuideLink> is
        built from those answers, not from a slogan.
      </>
    ),
  },
  {
    title: "3. One visit to the house",
    body: (
      <>
        We see the house once, as it sits. You do not clean, stage, repair, or empty it first. The visit is how we check the
        roof, the AC, the plumbing, and anything else that changes the price, so the number does not move later because of
        something we should have seen.
      </>
    ),
  },
  {
    title: "4. You see a number, then you choose",
    body: (
      <>
        The number is usually below a retail list price. You are trading that gap for no repairs, no showings, no buyer
        financing that can fall through, and no agent commission taken from your side. We show the math. If the gap is too
        wide, decline it. Asking did not lock you in.
      </>
    ),
  },
  {
    title: "5. A title company opens escrow",
    body: (
      <>
        In Arizona, a title and escrow company handles the closing. It searches the public record for every loan, lien, and
        judgment on the house, confirms who has the right to sign, orders the payoffs, and prepares the settlement statement.
        Read that statement. It lists every dollar that comes in and goes out.
      </>
    ),
  },
  {
    title: "6. You sign, the deed records, and you are paid",
    body: (
      <>
        You sign the deed and the closing papers in front of a notary, at the title office or with a mobile notary. The deed
        records with the Maricopa County Recorder, the title company pays off the mortgage and any liens, and the rest is sent
        to you. A clean file often takes about two weeks. We will not invent a Friday close to make the first call feel better.
      </>
    ),
  },
];

const compare = [
  { item: "Repairs before selling", listing: "Often expected, or negotiated after inspection", cash: "None. Bought as it is" },
  { item: "Showings and open houses", listing: "Yes, sometimes for weeks", cash: "One visit" },
  { item: "Buyer's loan and appraisal", listing: "Can delay or end the sale", cash: "No buyer loan to fall through" },
  { item: "Agent commission", listing: "Usually paid from the seller's proceeds", cash: "Not taken from your side" },
  { item: "Closing date", listing: "Set by the buyer's lender", cash: "You pick it" },
  { item: "Price", listing: "Often higher, if the house shows well and you can wait", cash: "Usually lower, because of the as-is terms" },
];

const faqs: Faq[] = [
  {
    question: "How long does a cash sale take in Arizona?",
    answer:
      "A clean title file often closes in about two weeks after you accept. It can be faster, and it can take longer if an heir, a spouse, a lien, or a payoff has to be sorted out first. You pick the closing date within what the title company can document.",
  },
  {
    question: "Do I pay closing costs on a cash sale with Vamos?",
    answer:
      "The offer is built so you are not writing a separate check for our closing costs, and no agent commission is taken from your side. Your loan payoff, liens, and any prorated taxes or HOA dues still come out of the price. The settlement statement shows every line before you sign.",
  },
  {
    question: "Can I sell for cash if I still owe on the mortgage?",
    answer:
      "Yes. The title company pays the loan off at closing from the sale price, and you receive what is left. If the loan is larger than the cash price, we say so and talk about other options, such as taking over the payments.",
  },
  {
    question: "What paperwork does an Arizona cash sale need?",
    answer:
      "Usually a purchase contract, a deed, an Affidavit of Property Value that records with the deed, the settlement statement, and payoff letters for any loans or liens. If an HOA is involved, the HOA sends a payoff and a resale disclosure. The title company prepares most of it.",
  },
  {
    question: "Do I have to move out the day we close?",
    answer:
      "Not always. If you need a few days, say so before anyone drafts papers. A short stay after closing only works if the title company can document it, so we settle that before you are packing boxes.",
  },
  {
    question: "Is a cash offer the same as an iBuyer offer?",
    answer:
      "Both are direct sales without a listing, but the terms differ by company: fees, repair deductions after inspection, and closing dates. Compare the net amount on the settlement statement, not the headline price.",
  },
];

export default async function CashSaleGuidePage() {
  "use cache";
  cacheLife("hours");
  const guide = getGuide(slug);

  return (
    <>
      <GuideJsonLd slug={slug} headline={headline} description={description} dateModified={guide?.updatedAt ?? "2026-11-28"} />

      <Section>
        <GuideBreadcrumb label="How a cash sale works" />
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">{headline}.</h1>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            People picture a wire the same afternoon. What you should picture is a phone call, one walkthrough, a number you can
            refuse, and a title company if you say yes. This guide walks through each step of a cash sale in Maricopa County, how
            long it usually takes, what paperwork Arizona requires, and what you actually walk away with.
          </p>
          <p>
            It is general information, not legal or tax advice. If your situation includes a court case, an estate, or a
            foreclosure date, have an Arizona attorney look at it too.
          </p>
        </div>
      </Section>

      <Section tone="mist">
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">The cash sale timeline at a glance.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          These are typical times for a clean file, not a promise. The title company, not the buyer, sets the pace once you
          accept.
        </p>
        <ol className="mt-8 grid gap-0 border-y border-line bg-panel">
          {timeline.map((row) => (
            <li key={row.when} className="grid gap-2 border-b border-line p-5 last:border-b-0 sm:grid-cols-[12rem_1fr]">
              <span className="font-semibold text-link">{row.when}</span>
              <span className="leading-7 text-ink">{row.what}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Each step, in order.</h2>
        <div className="mt-8 max-w-2xl space-y-8 text-lg leading-8">
          {steps.map((step) => (
            <div key={step.title}>
              <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="mist">
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">How the cash price is built.</h2>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            A cash price starts with what similar houses nearby actually sold for, not what they were listed at. From there we
            account for what the house needs to be sold to a retail buyer, the cost of holding and closing it, and the date you
            want. The older the roof, the AC, or the plumbing, the bigger that repair line gets.
          </p>
          <p>
            What you net is the price minus what the title company pays out for you: the mortgage payoff, any second loan or
            line of credit, liens, delinquent property taxes, HOA balances, and your share of the year&apos;s property taxes up to
            closing. If the house <GuideLink href="/sell/as-is">needs serious repairs</GuideLink>, a cash price usually beats
            fixing it first. If it is in good shape and you have months, listing may net more, and we will tell you that.
          </p>
        </div>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse bg-panel text-left">
            <caption className="sr-only">Listing with an agent compared with a cash sale</caption>
            <thead>
              <tr className="border-b-2 border-navy">
                <th scope="col" className="p-4 font-semibold text-ink">What changes</th>
                <th scope="col" className="p-4 font-semibold text-ink">Listing with an agent</th>
                <th scope="col" className="p-4 font-semibold text-ink">Cash sale with Vamos</th>
              </tr>
            </thead>
            <tbody>
              {compare.map((row) => (
                <tr key={row.item} className="border-b border-line">
                  <th scope="row" className="p-4 font-semibold text-ink">{row.item}</th>
                  <td className="p-4 leading-7 text-muted">{row.listing}</td>
                  <td className="p-4 leading-7 text-muted">{row.cash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section>
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">The Arizona paperwork, in plain words.</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          <li className="border border-line p-5">
            <h3 className="text-lg font-semibold text-ink">Who has to sign</h3>
            <p className="mt-2 leading-7 text-muted">
              Everyone on the title. Arizona is a community property state, so a spouse usually has to join in selling a house
              that belongs to the marriage, even if only one name is on the deed. An estate needs the person with legal authority.
              The <GuideLink href="/guides/life-events">life-events guide</GuideLink> covers divorce and probate.
            </p>
          </li>
          <li className="border border-line p-5">
            <h3 className="text-lg font-semibold text-ink">The deed and the affidavit</h3>
            <p className="mt-2 leading-7 text-muted">
              The deed moves ownership. An Affidavit of Property Value records with it at the Maricopa County Recorder. The title
              company prepares both and records them once the money is in place.
            </p>
          </li>
          <li className="border border-line p-5">
            <h3 className="text-lg font-semibold text-ink">Payoffs and liens</h3>
            <p className="mt-2 leading-7 text-muted">
              The title company asks each lender, the County Treasurer, and any HOA for an exact payoff, then pays them from the
              sale. You do not have to pay them first. Behind on <GuideLink href="/sell/behind-on-property-taxes">property taxes</GuideLink>{" "}
              or <GuideLink href="/sell/behind-on-hoa-dues">HOA dues</GuideLink>? Those get paid the same way.
            </p>
          </li>
          <li className="border border-line p-5">
            <h3 className="text-lg font-semibold text-ink">The settlement statement</h3>
            <p className="mt-2 leading-7 text-muted">
              Before you sign, you get a statement that shows the price, every payoff, every prorated amount, and the check you
              receive. If a line does not make sense, ask before signing, not after.
            </p>
          </li>
        </ul>
      </Section>

      <Section tone="mist">
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">What this sale does, and what it does not.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="bg-panel p-5">
            <h3 className="text-lg font-semibold text-ink">It can</h3>
            <p className="mt-2 leading-7 text-muted">
              Pay the mortgage off at closing, take your name off that loan, and let you leave repairs and leftover belongings
              behind. If a sale date is the problem, start with <GuideLink href="/stop-foreclosure">the foreclosure page</GuideLink>{" "}
              and the <GuideLink href="/guides/trustee-sale">trustee sale guide</GuideLink>.
            </p>
          </div>
          <div className="bg-panel p-5">
            <h3 className="text-lg font-semibold text-ink">It cannot</h3>
            <p className="mt-2 leading-7 text-muted">
              Erase missed payments already on your credit, skip a signature title requires, or pay off a loan that is larger
              than the cash price. When that last one is true, we talk about{" "}
              <GuideLink href="/take-over-payments">taking over the payments</GuideLink> instead of pretending the equity is there.
            </p>
          </div>
        </div>
        <h3 className="mt-12 text-xl font-semibold text-ink">When a cash sale is not the right choice</h3>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          If the house is updated, shows well, and you can wait a few months for a buyer and their lender, a traditional listing
          will often net more. A cash sale is worth it when the repairs, the timeline, a tenant, a notice, or the stress of
          showings costs more than the price gap. We would rather tell you that on the first call than lose your trust at closing.
        </p>
      </Section>

      <Section>
        <FaqList faqs={faqs} heading="Cash sale questions" />
      </Section>

      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Bring the address when the page has done its job.</h2>
            <p className="mt-4 leading-7 text-muted">
              If the reason is a divorce, an estate, or a job loss, the{" "}
              <GuideLink href="/guides/life-events">life-events guide</GuideLink> covers who has to sign. Each city is a little
              different, so the city pages, starting with <GuideLink href="/areas/phoenix">Phoenix</GuideLink>,{" "}
              <GuideLink href="/areas/mesa">Mesa</GuideLink>, <GuideLink href="/areas/glendale">Glendale</GuideLink>, and{" "}
              <GuideLink href="/areas/chandler">Chandler</GuideLink>, cover the houses and neighborhoods there.
            </p>
          </div>
          <LeadForm sourcePath={`/guides/${slug}`} language="en" />
        </div>
      </Section>

      <ClosingBand title="A cash offer is a number, not a trap." body="Call or send the address. You can still keep the house." />
    </>
  );
}
