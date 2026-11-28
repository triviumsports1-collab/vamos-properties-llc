import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import Link from "next/link";
import { ClosingBand } from "@/components/marketing/closing-band";
import { FaqList } from "@/components/marketing/faq-list";
import { GuideBreadcrumb, GuideJsonLd, GuideLink } from "@/components/marketing/guide-article";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import type { Faq } from "@/lib/content/faqs";
import { getGuide } from "@/lib/content/guides";
import { situations } from "@/lib/content/situations";
import { site } from "@/lib/site";

const slug = "life-events";
const title = "Sell a House After Divorce, Probate or Job Loss in AZ";
const description =
  "Selling an Arizona house after a divorce, a death in the family, or a job loss: who has to sign, what title asks for, and which path fits your situation.";
const headline = "Selling a house after a divorce, a death, or a job loss in Arizona";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: `/guides/${slug}` },
  openGraph: {
    type: "article",
    siteName: site.name,
    locale: "en_US",
    url: `/guides/${slug}`,
    title,
    description,
    images: [{ url: site.ogImagePath, alt: site.ogImageAlt }],
  },
};

const firstQuestions = [
  {
    title: "Who has the right to sign?",
    body: "Everyone on the title, plus anyone the law adds: a spouse in a community property state, or the person with authority over an estate. This is the question that most often decides the closing date.",
  },
  {
    title: "What is owed against the house?",
    body: "The mortgage, any second loan or line of credit, property taxes, HOA dues, and liens. The title company pays all of them from the sale, so the total decides what is left for you.",
  },
  {
    title: "Is there a deadline?",
    body: "A trustee sale date, a court date, a move date, or a lease ending. A deadline changes which options are still realistic, so it goes on the form first.",
  },
  {
    title: "Where will you go next?",
    body: "If you need a few days after closing, or a closing date that matches a new job or a new lease, say so up front. It is easier to plan than to fix later.",
  },
];

const faqs: Faq[] = [
  {
    question: "Do both spouses have to sign to sell a house in Arizona?",
    answer:
      "Usually, yes. Arizona is a community property state, and selling community real property generally needs both spouses to join, even if only one name is on the deed. A divorce decree or court order can change who signs and how the money is split.",
  },
  {
    question: "Can I sell my parent's house before probate is finished?",
    answer:
      "Sometimes. A beneficiary deed recorded before death can pass the house without probate, and a small-estate affidavit works for some estates. Otherwise a personal representative appointed by the court can usually sell once appointed. The title company will ask for the document that gives authority.",
  },
  {
    question: "I lost my job and I am behind on the mortgage. What should I do first?",
    answer:
      "Call your servicer early and ask about forbearance, a repayment plan, or a modification, and talk to a free HUD-approved housing counselor. If a Notice of Trustee's Sale has been recorded, the date on it matters more than the reason you fell behind, so read the trustee sale guide.",
  },
  {
    question: "Is a cash sale always the best choice after a life change?",
    answer:
      "No. If the house is in good shape and you have months, listing with an agent often nets more. A cash sale makes sense when the timeline, the repairs, a deadline, or the stress of showings costs more than the price difference.",
  },
  {
    question: "Can we sell if the people on the title do not agree?",
    answer:
      "A sale needs the people with the right to sign. We can give everyone the same written number so the conversation starts from the same facts, but we will not pressure anyone, and a court may have to settle a real dispute.",
  },
];

export default async function LifeEventsGuidePage() {
  "use cache";
  cacheLife("hours");
  const guide = getGuide(slug);

  return (
    <>
      <GuideJsonLd slug={slug} headline={headline} description={description} dateModified={guide?.updatedAt ?? "2026-11-28"} />

      <Section>
        <GuideBreadcrumb label="Divorce, probate, or a job loss" />
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">{headline}.</h1>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            A life change rarely waits for a good time to sell. A divorce, a death in the family, a lost job, or a sudden move
            comes with its own paperwork, its own deadlines, and its own people who have to agree. The house itself is usually
            the easier part.
          </p>
          <p>
            This guide covers the questions every one of these sales starts with, what changes in each situation under Arizona
            rules, and which path tends to fit: a cash sale, a traditional listing, taking over the payments, or keeping the
            house. It is general information, not legal or tax advice.
          </p>
        </div>
      </Section>

      <Section tone="mist">
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Four questions every one of these sales starts with.</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {firstQuestions.map((item) => (
            <li key={item.title} className="bg-panel p-5">
              <h3 className="text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 leading-7 text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">What changes in each situation.</h2>
        <div className="mt-8 max-w-2xl space-y-10 text-lg leading-8">
          <div>
            <h3 className="text-2xl font-semibold text-ink">Divorce or separation</h3>
            <p className="mt-3 text-muted">
              Arizona is a community property state, so a house bought during the marriage usually belongs to both spouses, and
              selling it generally needs both to sign, even if only one name is on the deed. If there is a decree or a court
              order, it controls who signs, when, and how the proceeds are split. The title company follows that document.
            </p>
            <p className="mt-3 text-muted">
              We can work around separate schedules and separate phone calls, and give both of you the same written number. We
              cannot skip a signature the title company requires. More on{" "}
              <GuideLink href="/sell/divorce">selling a house during a divorce</GuideLink>.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-ink">A death in the family or an inherited house</h3>
            <p className="mt-3 text-muted">
              Before anyone can sell, someone has to have the authority to sign. In Arizona that may come from a beneficiary deed
              recorded before the owner died, a small-estate affidavit for a smaller estate, a trust, or a personal
              representative appointed by the court in probate. Each one is a different stack of paper and a different timeline.
            </p>
            <p className="mt-3 text-muted">
              Heirs often live out of state, and that is fine: an offer can come before anyone flies in, and signing can often be
              done with a remote or mobile notary. If the mortgage, the taxes, or the HOA dues went unpaid after the death, they
              are paid from the sale. More on <GuideLink href="/sell/inherited-house">selling an inherited house</GuideLink>.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-ink">A job loss, medical bills, or a payment you cannot make</h3>
            <p className="mt-3 text-muted">
              You do not need a polished story. The useful facts are the balance, the last payment you made, and whether a notice
              has been recorded. Before a notice, you have the most options: call the servicer about forbearance, a repayment
              plan, or a modification, and talk to a free HUD-approved housing counselor.
            </p>
            <p className="mt-3 text-muted">
              Once a Notice of Trustee&apos;s Sale is recorded, the date on it matters more than the reason. Read the{" "}
              <GuideLink href="/guides/trustee-sale">trustee sale guide</GuideLink> and the{" "}
              <GuideLink href="/stop-foreclosure">stop foreclosure page</GuideLink>. If the strain is property taxes or HOA dues
              instead of the mortgage, see <GuideLink href="/sell/behind-on-property-taxes">behind on property taxes</GuideLink>{" "}
              and <GuideLink href="/sell/behind-on-hoa-dues">behind on HOA dues</GuideLink>.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-ink">A move, a rental, or a house that needs too much</h3>
            <p className="mt-3 text-muted">
              Some life changes are not emergencies, just a change of plans: a new job out of state, a rental that stopped making
              sense, or a parent&apos;s house that needs a roof nobody wants to pay for. These sales are about timing and repairs.
              See <GuideLink href="/sell/relocation">selling when you relocate</GuideLink>,{" "}
              <GuideLink href="/sell/rental-property">selling a rental with tenants</GuideLink>,{" "}
              <GuideLink href="/sell/as-is">selling a house as-is</GuideLink>, and{" "}
              <GuideLink href="/sell/house-with-solar-panels">selling a house with leased solar</GuideLink>.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">Which path fits.</h2>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            A <GuideLink href="/cash-offer">cash offer</GuideLink> pays the loan off and takes your name off it, when the numbers
            work, on a date you pick. Read <GuideLink href="/guides/cash-sale">how a cash sale works</GuideLink> for the steps.
          </p>
          <p>
            A traditional listing often nets more when the house shows well and you have months. If that is you, we will say so.
          </p>
          <p>
            If a cash sale would leave little or nothing after the payoff,{" "}
            <GuideLink href="/take-over-payments">taking over the payments</GuideLink> is the other conversation. Your name can
            stay on the loan. Have a lawyer read those papers.
          </p>
          <p>
            The city still matters. A long-owned ranch in <GuideLink href="/areas/mesa">Mesa</GuideLink> is not a newer house
            with a fresh payment in <GuideLink href="/areas/gilbert">Gilbert</GuideLink> or{" "}
            <GuideLink href="/areas/chandler">Chandler</GuideLink>, and a <GuideLink href="/areas/sun-city">Sun City</GuideLink>{" "}
            estate sale is different again.
          </p>
        </div>
      </Section>

      <Section>
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Every situation we buy, with its own page.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-muted">
          Each page covers who has to sign, the Arizona rules that matter, and what to have ready for the first call.
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {situations.map((item) => (
            <li key={item.slug} className="border border-line p-5">
              <h3 className="text-xl font-semibold">
                <Link href={`/sell/${item.slug}`} className="text-link">
                  {item.label}
                </Link>
              </h3>
              <p className="mt-2 leading-7 text-muted">{item.blurb}</p>
            </li>
          ))}
          <li className="border border-line p-5">
            <h3 className="text-xl font-semibold">
              <Link href="/stop-foreclosure" className="text-link">Behind on the mortgage or facing a trustee sale</Link>
            </h3>
            <p className="mt-2 leading-7 text-muted">The 91-day clock, and what a cash sale can still do before the date.</p>
          </li>
        </ul>
      </Section>

      <Section tone="mist">
        <FaqList faqs={faqs} heading="Life-event selling questions" />
      </Section>

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">One line on the form is enough.</h2>
            <p className="mt-4 leading-7 text-muted">
              You do not have to write the whole story. The address, a phone you answer, and the situation get the right first
              question. If a date is close, call{" "}
              <a href={site.phoneTel} className="font-semibold text-link">{site.phoneDisplay}</a>.
            </p>
          </div>
          <LeadForm sourcePath={`/guides/${slug}`} language="en" />
        </div>
      </Section>

      <ClosingBand title="Tell us which situation it is." body="Our specialists will ask the next question. You can stop there." />
    </>
  );
}
