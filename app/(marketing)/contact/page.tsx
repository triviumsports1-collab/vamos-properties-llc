import { cacheLife } from "next/cache";
import Link from "next/link";
import { LeadForm } from "@/components/marketing/lead-form";
import { LocalBusinessJsonLd } from "@/components/marketing/local-business";
import { Section } from "@/components/marketing/section";
import { hreflang } from "@/lib/i18n/routes";
import { site } from "@/lib/site";

export const metadata = {
  title: "Contact",
  description:
    "Call or text Vamos Properties in Phoenix, or send the address. Patrick or Jaime reply the same day.",
  alternates: { canonical: "/contact", ...hreflang("/contact", "/es/contacto") },
};

export default async function ContactPage() {
  "use cache";
  cacheLife("hours");

  return (
    <>
      <LocalBusinessJsonLd />
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Contact</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Call, text, or send the address.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          The useful thing you can give us is the address and, if you have it, the trustee sale date. If you want to read first, start with a{" "}
          <Link href="/cash-offer" className="font-semibold text-link">cash offer</Link>,{" "}
          <Link href="/stop-foreclosure" className="font-semibold text-link">a foreclosure date</Link>, or{" "}
          <Link href="/guides" className="font-semibold text-link">the short guides</Link>.
        </p>
        <dl className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-muted">Phone</dt>
            <dd className="mt-2">
              <a href={site.phoneTel} className="text-2xl font-semibold text-ink sm:text-3xl">
                {site.phoneDisplay}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Email</dt>
            <dd className="mt-2">
              <a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center break-all text-lg font-semibold text-ink">
                {site.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Hours</dt>
            <dd className="mt-2 text-lg leading-8 text-ink">{site.hours}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Where we buy</dt>
            <dd className="mt-2 text-lg leading-8 text-ink">{site.area}</dd>
          </div>
        </dl>
      </Section>

      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(18rem,1fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">If the phone is easier, use it.</h2>
            <p className="mt-4 text-lg leading-8 text-muted">
              The form is for the address, your name, and what is going on. Patrick or Jaime reply the same day.
            </p>
          </div>
          <LeadForm sourcePath="/contact" language="en" />
        </div>
      </Section>
    </>
  );
}
