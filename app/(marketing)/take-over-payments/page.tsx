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
import { takeoverFaqs } from "@/lib/content/faqs";
import { site } from "@/lib/site";

export const metadata = {
  title: "Take over mortgage payments in Phoenix",
  description:
    "Vamos can bring a delinquent Phoenix mortgage current and make the payments. The loan can stay in your name. Read the risks.",
  alternates: { canonical: "/take-over-payments", ...hreflang("/take-over-payments", "/es/tomar-los-pagos") },
};

const steps = [
  {
    title: "We look at the balance and the rate",
    body: "If a cash sale would pay the loan and leave you money, we say that and stop talking about a takeover. The low rate only matters when the cash path does not pencil.",
  },
  {
    title: "We say what stays in your name",
    body: "The deed can transfer. The existing loan can stay yours on the lender’s books. This is not a refinance and not a new loan in our name.",
  },
  {
    title: "The payment duty gets written down",
    body: "Who pays, how much, and what happens if it is late. A conversation is not a payment history. Do not sign if that part is fuzzy.",
  },
  {
    title: "You have a lawyer read it",
    body: "Due-on-sale rights, a later missed payment, and your credit all belong in that review. We will not tell you the foreclosure is already over.",
  },
];

const risks = [
  {
    title: "Your name can stay on the loan",
    body: "The deed can change hands while the mortgage stays yours on the bank’s books. This is not a new loan in our name.",
  },
  {
    title: "The lender can call it due",
    body: "Many loans have a due-on-sale right. The lender can ask for the balance in full after the deed transfers.",
  },
  {
    title: "A later missed payment is still yours",
    body: "If an agreed payment is missed and the loan is still in your name, your credit can still be hurt. We will not tell you the foreclosure is already over.",
  },
];

export default async function TakeOverPaymentsPage() {
  "use cache";
  cacheLife("hours");

  return (
    <>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Payment takeover</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          We can catch the loan up. Your name can stay on it.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Taking over the payments means we bring the past-due amount current and keep paying after the deed transfers. It is not credit repair, and it is not the cleaner exit.
        </p>
        <p className="mt-6 max-w-2xl leading-8 text-ink">
          This path is worth a conversation when you are behind, a cash sale would leave little or nothing after the payoff, and the rate is low enough that keeping it is the point. If a cash sale pays the loan and leaves you money, we will say that instead.
        </p>
      </Section>

      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Read this before you ask us to take the payments.</h2>
            <ul className="mt-8 grid gap-4">
              {risks.map((risk) => (
                <li key={risk.title} className="bg-panel p-5">
                  <p className="text-lg font-semibold text-ink">{risk.title}</p>
                  <p className="mt-2 leading-7 text-muted">{risk.body}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 leading-7 text-muted">
              Have a lawyer read the papers before you sign. If you want the cleaner exit, start with a{" "}
              <Link href="/stop-foreclosure" className="font-semibold text-link">cash sale before the trustee sale</Link>.
              Or call <a href={site.phoneTel} className="font-semibold text-link">{site.phoneDisplay}</a>.
            </p>
          </div>
          <LeadForm sourcePath="/take-over-payments" language="en" />
        </div>
      </Section>

      <Section>
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">How the conversation is supposed to go.</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-2">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-navy pt-5">
              <span className="text-sm font-semibold tracking-wide text-link">0{index + 1}</span>
              <h3 className="mt-2 text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-3 leading-7 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-2xl leading-7 text-muted">
          If what you need is your name off the mortgage, go back to a{" "}
          <Link href="/cash-offer" className="font-semibold text-link">cash offer</Link>.
          The side-by-side is the same one on the home page, because the tradeoff does not change by city.
        </p>
      </Section>

      <Section tone="mist">
        <Comparison />
      </Section>

      <Section tone="mist">
        <SituationLinks />
      </Section>

      <Section>
        <CityLinks heading="The loan terms matter more than the city" />
        <p className="mt-6 max-w-2xl leading-7 text-muted">
          Still, the house has to be somewhere we can walk. Start with the city, then send the address. If a notice is already recorded, read{" "}
          <Link href="/guides/trustee-sale" className="font-semibold text-link">what the sale date does</Link> before you assume a takeover buys time.
        </p>
      </Section>

      <Section tone="mist">
        <FaqList faqs={takeoverFaqs} />
      </Section>

      <ClosingBand
        title="If cash would leave you nothing, say so."
        body="Tell us the balance and the rate. We will tell you which path is actually worth your time."
      />
    </>
  );
}
