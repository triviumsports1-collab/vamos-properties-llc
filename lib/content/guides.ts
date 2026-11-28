export const guides = [
  {
    slug: "cash-sale",
    title: "How a cash sale works",
    description:
      "What happens from the first call to a Maricopa County title company, and what a cash price does and does not include.",
    blurb: "The steps, the timeline, the Arizona paperwork, and the part where you can still say no.",
    updatedAt: "2026-11-28",
  },
  {
    slug: "trustee-sale",
    title: "After a Notice of Trustee's Sale",
    description:
      "How the Arizona trustee sale timeline works, the options before the sale date, and what to gather before you ask for a cash offer.",
    blurb: "The 91-day clock, the reinstatement deadline, your options, and when to call.",
    updatedAt: "2026-11-28",
  },
  {
    slug: "life-events",
    title: "Divorce, probate, or a job loss",
    description:
      "How to sell a Maricopa County house when the reason is a divorce, an estate, or a payment you cannot make.",
    blurb: "Who has to sign, what title will ask for, and which path fits each situation.",
    updatedAt: "2026-11-28",
  },
] as const;

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
