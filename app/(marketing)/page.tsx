import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { AddressLookup } from "@/components/marketing/address-lookup";
import { CityLinks } from "@/components/marketing/city-links";
import { SituationLinks } from "@/components/marketing/situation-links";
import { ClosingBand } from "@/components/marketing/closing-band";
import { Comparison } from "@/components/marketing/comparison";
import { FaqList } from "@/components/marketing/faq-list";
import { Founders } from "@/components/marketing/founders";
import { LeadForm } from "@/components/marketing/lead-form";
import { LocalBusinessJsonLd } from "@/components/marketing/local-business";
import { Section } from "@/components/marketing/section";
import { TrustRow } from "@/components/marketing/trust-row";
import { hreflang } from "@/lib/i18n/routes";
import { homeFaqs } from "@/lib/content/faqs";
import { guides } from "@/lib/content/guides";
import { site } from "@/lib/site";

export const metadata = {
  title: {
    absolute: "We Buy Houses in Phoenix for Cash · Vamos Properties",
  },
  description:
    "Vamos Properties buys houses as-is in Maricopa County and can talk through a mortgage that is behind. Call Patrick or Jaime.",
  alternates: { canonical: "/", ...hreflang("/", "/es") },
};

const reasons = [
  {
    title: "Sell it as it sits",
    body: "Peeling paint, a tired roof, a tenant who will not leave. None of that has to be fixed before we talk.",
  },
  {
    title: "Skip the listing",
    body: "No sign in the yard, no weekend showings, and no agent commission taken out of the closing.",
  },
  {
    title: "Clear the loan",
    body: "A cash sale is meant to pay the mortgage off at a title company and take your name off it.",
  },
  {
    title: "Hear the other path",
    body: "If a cash sale would not clear what you owe, we will say so and explain a payment takeover, including the part where your name can stay on the loan.",
  },
];

const steps = [
  {
    title: "Send the address",
    body: "It takes under a minute. If a trustee sale notice is on the counter, include the date on it.",
  },
  {
    title: "Talk to one of us",
    body: "Patrick or Jaime asks what you owe, what the house needs, and what you actually want to happen.",
  },
  {
    title: "Choose, or don’t",
    body: "You get a cash number, a takeover explanation, or both. Saying no is a complete answer.",
  },
];

const lookedAt = [
  ["The date", "If a notice is recorded, the sale date decides whether title even has time. Everything else waits on that."],
  ["The balance", "What you owe, including a second loan or HOA dues, decides whether a cash sale can pay the debt off."],
  ["The house", "A roof, a tenant, or a full clean-out changes the number. It does not disqualify you from asking."],
  ["The title", "Everyone who has to sign, and any lien sitting behind the mortgage, shows up before a closing date is real."],
];

const situations = [
  {
    href: "/stop-foreclosure",
    title: "The notice is already on the counter",
    body: "Start with the sale date. A cash closing can only help if title can finish before that day.",
  },
  {
    href: "/sell",
    title: "A divorce or a death in the family",
    body: "Both people on the title usually have to sign. An heir needs authority to sign. We will say which papers title still needs.",
  },
  {
    href: "/cash-offer",
    title: "You just need it sold",
    body: "A vacant rental, a tired house, or a move you do not want to stage. The cash number is the certain one, and it is usually below a list price.",
  },
  {
    href: "/take-over-payments",
    title: "The loan is the only good part left",
    body: "If a cash sale would leave little after the payoff, we can talk about taking over the payments. Your name can stay on the loan.",
  },
];

export default async function HomePage() {
  "use cache";
  cacheLife("hours");

  return (
    <>
      <LocalBusinessJsonLd />
      <section className="relative isolate min-h-[38rem] overflow-hidden bg-navy text-white">
        <Image
          src="/phoenix-street.jpg"
          alt="Single-story homes on a quiet Phoenix street in late afternoon light"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0c1c30]/74" />
        <div className="relative mx-auto flex min-h-[38rem] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            Phoenix and Maricopa County
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">
            Behind on the house? Get a cash offer today.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/88">
            No repairs. No showings. Patrick or Jaime call you the same day, including when a trustee sale is already on the calendar.
          </p>
          <AddressLookup />
          <p className="mt-5 text-sm text-white/80">
            Prefer the phone? Call or text{" "}
            <a href={site.phoneTel} className="font-semibold text-amber">
              {site.phoneDisplay}
            </a>
            , {site.hours}.
          </p>
        </div>
      </section>

      <TrustRow />

      <Section tone="mist">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Why homeowners call</p>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">A private sale, with the tradeoffs said out loud.</h2>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {reasons.map((reason) => (
            <li key={reason.title} className="bg-panel p-6">
              <h3 className="text-xl font-semibold text-ink">{reason.title}</h3>
              <p className="mt-3 leading-7 text-muted">{reason.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">What happens next</p>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Three steps. Then it is your decision.</h2>
        </div>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t-2 border-navy pt-5">
              <span className="text-sm font-semibold tracking-wide text-link">0{index + 1}</span>
              <h3 className="mt-2 text-2xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-3 leading-7 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Two paths</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Cash, or we talk through the payments.</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
              Finish with your name and number. The address you just entered is already in the form.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link href="/stop-foreclosure" className="bg-panel p-5">
                <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-link">Most people</span>
                <span className="mt-2 block text-2xl font-semibold text-ink">Cash offer</span>
                <span className="mt-3 block leading-7 text-muted">
                  We buy as-is. The loan is paid off at closing, and your name comes off it.
                </span>
              </Link>
              <Link href="/take-over-payments" className="bg-panel p-5">
                <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-link">Read this first</span>
                <span className="mt-2 block text-2xl font-semibold text-ink">Take over payments</span>
                <span className="mt-3 block leading-7 text-muted">
                  We can bring a loan current. Your name can stay on that loan. The risks are on the next page.
                </span>
              </Link>
            </div>
          </div>
          <LeadForm sourcePath="/" language="en" />
        </div>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">The number</p>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">What we look at before we name a price.</h2>
          <p className="mt-4 text-lg leading-8 text-muted">
            Phoenix is not one price. A Maryvale block house and an Ahwatukee subdivision are different offers, and a Valley-wide average would lie about both. We do not publish a market statistic in place of your address.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {lookedAt.map(([title, body]) => (
            <li key={title} className="border border-line p-6">
              <h3 className="text-xl font-semibold text-ink">{title}</h3>
              <p className="mt-3 leading-7 text-muted">{body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="mist">
        <Comparison />
        <p className="mt-6 max-w-2xl leading-7 text-muted">
          The long version of the cash path is <Link href="/cash-offer" className="font-semibold text-link">how to get a cash offer</Link>.
          If the date is the emergency, read <Link href="/stop-foreclosure" className="font-semibold text-link">what to do before a trustee sale</Link>.
        </p>
      </Section>

      <Section>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Calls we get</p>
          <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">Four situations. None of them need a perfect house.</h2>
          <p className="mt-4 leading-7 text-muted">
            These are the reasons people call. They are not reviews, and we do not publish a seller’s name or a made-up result.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {situations.map((item) => (
            <li key={item.href} className="border border-line p-6">
              <h3 className="text-xl font-semibold text-ink">
                <Link href={item.href} className="text-link">
                  {item.title}
                </Link>
              </h3>
              <p className="mt-3 leading-7 text-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SituationLinks />
      </Section>

      <Section tone="mist">
        <CityLinks />
        <div className="mt-12">
          <h2 className="text-3xl font-semibold text-ink sm:text-4xl">If you want to read first.</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {guides.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/guides/${guide.slug}`} className="block min-h-12 border border-line bg-panel p-4 font-semibold text-ink">
                  {guide.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <Founders linked />
      </Section>

      <Section tone="mist">
        <FaqList faqs={homeFaqs} />
      </Section>

      <ClosingBand
        title="Send the address. We’ll call you today."
        body="If it is after 7:00 p.m., Patrick or Jaime will be on it in the morning. You do not have to decide anything on the phone."
      />
    </>
  );
}
