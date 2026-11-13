import { cacheLife } from "next/cache";
import Link from "next/link";
import { ClosingBand } from "@/components/marketing/closing-band";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";

export const metadata = {
  title: "Sell a Phoenix house in a divorce, probate, or after a job loss",
  description:
    "Who has to sign, what a title company will ask for, and how a cash sale differs from taking over the payments.",
  alternates: { canonical: "/guides/life-events" },
};

const situations = [
  {
    title: "Divorce",
    body: "If both names are on the title, both people usually have to sign. We can work around schedules and separate phone calls. We cannot skip a signature the title company requires, and we will not pretend a court order exists if you do not have one.",
  },
  {
    title: "An inherited house",
    body: "An heir can often get an offer before flying to Arizona. The deed still needs the person who has authority to sign. Probate, a trust, or a surviving spouse are different stacks of paper. Bring the names and we will tell you what title will still ask for.",
  },
  {
    title: "A job loss or a payment you cannot make",
    body: "You do not need a polished story. The useful facts are the balance, the last payment you made, and whether a notice has been recorded. If the notice is there, the date matters more than the reason.",
  },
  {
    title: "You just need it sold",
    body: "A vacant rental, a parent’s house, or a place you never wanted to show is a normal reason. If the house would list easily and you have months, we will say a traditional sale might net more. If you want the certain date, ask for the cash number.",
  },
];

export default async function LifeEventsGuidePage() {
  "use cache";
  cacheLife("hours");

  return (
    <>
      <Section>
        <p className="text-sm font-semibold text-link">
          <Link href="/guides">Guides</Link>
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Divorce, a death in the family, or a payment that broke.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          The form has a short list of situations because the next question changes. The house is still the same kind of sale: as-is, through title, and optional until you sign.
        </p>
      </Section>

      <Section tone="mist">
        <h2 className="text-3xl font-semibold text-ink sm:text-4xl">What we need to know first.</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {situations.map((item) => (
            <li key={item.title} className="bg-panel p-5">
              <h3 className="text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 leading-7 text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">Which path fits.</h2>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            A <Link href="/cash-offer" className="font-semibold text-link">cash offer</Link> is the path that pays the loan off and takes your name off it, when the numbers work. Read{" "}
            <Link href="/guides/cash-sale" className="font-semibold text-link">how that closing runs</Link> if you want the steps.
          </p>
          <p>
            If a notice is already recorded, use <Link href="/stop-foreclosure" className="font-semibold text-link">the foreclosure page</Link> and{" "}
            <Link href="/guides/trustee-sale" className="font-semibold text-link">the trustee-sale guide</Link>. The reason you fell behind does not add days to the sale date.
          </p>
          <p>
            If a cash sale would leave little or nothing after the payoff, <Link href="/take-over-payments" className="font-semibold text-link">taking over the payments</Link> is the other conversation. Your name can stay on the loan. Have a lawyer read those papers.
          </p>
          <p>
            The city still matters. A long-owned ranch in <Link href="/areas/mesa" className="font-semibold text-link">Mesa</Link> is not a newer payment in{" "}
            <Link href="/areas/gilbert" className="font-semibold text-link">Gilbert</Link> or <Link href="/areas/chandler" className="font-semibold text-link">Chandler</Link>.
          </p>
          <p>
            The longer versions are on their own pages:{" "}
            <Link href="/sell/divorce" className="font-semibold text-link">selling during a divorce</Link> and{" "}
            <Link href="/sell/inherited-house" className="font-semibold text-link">selling an inherited house</Link>.
          </p>
        </div>
      </Section>

      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">One line on the form is enough.</h2>
            <p className="mt-4 leading-7 text-muted">
              You do not have to write the whole story. The address, a phone you answer, and the situation get the right first question.
            </p>
          </div>
          <LeadForm sourcePath="/guides/life-events" language="en" />
        </div>
      </Section>

      <ClosingBand
        title="Tell us which situation it is."
        body="Patrick or Jaime will ask the next question. You can stop there."
      />
    </>
  );
}
