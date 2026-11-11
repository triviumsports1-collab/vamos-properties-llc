import { cacheLife } from "next/cache";
import Link from "next/link";
import { ClosingBand } from "@/components/marketing/closing-band";
import { Founders } from "@/components/marketing/founders";
import { LeadForm } from "@/components/marketing/lead-form";
import { Section } from "@/components/marketing/section";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

export const metadata = {
  title: "About Patrick and Jaime",
  description:
    "Vamos Properties LLC is Patrick and Jaime, local buyers who help Maricopa County homeowners sell as-is or talk through a mortgage that is behind.",
  alternates: { canonical: "/about", ...hreflang("/about", "/es/nosotros") },
};

export default async function AboutPage() {
  "use cache";
  cacheLife("hours");

  return (
    <>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">The people who answer</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Two people in the Valley, not a national desk.
        </h1>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-8 text-ink">
          <p>
            Vamos Properties LLC buys houses in Maricopa County from owners who need a private way out. Patrick and Jaime answer the phone. The same person you meet is the person who stays with the file.
          </p>
          <p>
            A cash closing runs through a title company. You see the number before you sign, including the fact that a cash price is usually below a listed price. If the better fit is taking over the payments, we will say what stays in your name before anyone celebrates.
          </p>
          <p>
            Hours are {site.hours}. If you call after that, leave the address. We return it in the morning.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Link href="/cash-offer" className="border border-line p-5">
            <h2 className="text-xl font-semibold text-ink">Cash offer</h2>
            <p className="mt-2 leading-7 text-muted">As-is, through a title company, and you can say no.</p>
          </Link>
          <Link href="/stop-foreclosure" className="border border-line p-5">
            <h2 className="text-xl font-semibold text-ink">Stop a foreclosure</h2>
            <p className="mt-2 leading-7 text-muted">Start with the date on the notice.</p>
          </Link>
          <Link href="/take-over-payments" className="border border-line p-5">
            <h2 className="text-xl font-semibold text-ink">Take over payments</h2>
            <p className="mt-2 leading-7 text-muted">Read the part where your name can stay on the loan.</p>
          </Link>
        </div>
      </Section>

      <Section tone="mist">
        <h2 className="max-w-2xl text-3xl font-semibold text-ink sm:text-4xl">What we will not tell you.</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          <li className="bg-panel p-5">
            <h3 className="text-lg font-semibold text-ink">That every house has equity</h3>
            <p className="mt-2 leading-7 text-muted">Some loans are larger than a cash price. We say that. We do not invent a number to get a signature.</p>
          </li>
          <li className="bg-panel p-5">
            <h3 className="text-lg font-semibold text-ink">That we repair credit</h3>
            <p className="mt-2 leading-7 text-muted">A sale before the auction can keep the sale from happening. It does not erase the late payments already on your report.</p>
          </li>
          <li className="bg-panel p-5">
            <h3 className="text-lg font-semibold text-ink">That a takeover removes the loan</h3>
            <p className="mt-2 leading-7 text-muted">It can leave the mortgage in your name. The risks are written on that page because they belong in the open.</p>
          </li>
          <li className="bg-panel p-5">
            <h3 className="text-lg font-semibold text-ink">That a stranger’s review is your result</h3>
            <p className="mt-2 leading-7 text-muted">We do not publish seller names, star ratings, or a count of deals we did not do. You get Patrick or Jaime, and a number you can refuse.</p>
          </li>
        </ul>
      </Section>

      <Section>
        <Founders />
      </Section>

      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Tell us the address when you are ready.</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
              You will hear back from Patrick or Jaime, not from a rotating closer. If you would rather talk first, call{" "}
              <a href={site.phoneTel} className="font-semibold text-link">{site.phoneDisplay}</a>
              {" "}or email{" "}
              <a href={`mailto:${site.email}`} className="font-semibold text-link">{site.email}</a>.
            </p>
          </div>
          <LeadForm sourcePath="/about" language="en" />
        </div>
      </Section>

      <ClosingBand
        title="The person on the first call stays with the file."
        body="Leave the address. If we are with another homeowner, we still return it the same day."
      />
    </>
  );
}
