import type { Faq } from "@/lib/content/faqs";
import { JsonLd } from "@/components/marketing/json-ld";

export function FaqList({
  faqs,
  heading = "Questions people ask first",
}: {
  faqs: Faq[];
  heading?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section>
      <JsonLd data={jsonLd} />
      <h2 className="text-3xl font-semibold text-ink sm:text-4xl">{heading}</h2>
      <div className="mt-6 divide-y divide-line border-y border-line">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-4">
            <summary className="flex min-h-12 cursor-pointer list-none items-center text-lg text-ink [&::-webkit-details-marker]:hidden">
              <span className="mr-3 font-semibold text-amber" aria-hidden="true">
                +
              </span>
              <h3 className="text-lg font-normal text-ink">{faq.question}</h3>
            </summary>
            <p className="mt-3 max-w-2xl pl-6 leading-7 text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
