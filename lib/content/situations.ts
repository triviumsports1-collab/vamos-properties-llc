import type { Faq } from "@/lib/content/faqs";

type Block = { title: string; body: string };

export type Situation = {
  slug: string;
  /** Short label for links and cards. */
  label: string;
  /** <title> without the brand suffix. */
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  heroLine: string;
  /** One-line teaser for the /sell hub and cross links. */
  blurb: string;
  intro: string[];
  fact: { text: string; note: string };
  problems: Block[];
  steps: Block[];
  rules: Block[];
  gather: string[];
  faqs: Faq[];
  /** Other pages on the site that fit this situation. */
  related: Array<{ href: string; label: string }>;
};

export const situations: Situation[] = [
  {
    slug: "inherited-house",
    label: "Inherited house or probate",
    title: "Sell an Inherited House in Phoenix for Cash",
    description:
      "Inherited a house in Maricopa County? How probate, a beneficiary deed, or a small-estate affidavit decides who can sign, and how a cash sale can work around the estate.",
    eyebrow: "Inherited a house in Arizona",
    h1: "Sell an inherited house without fixing it or emptying it first.",
    heroLine:
      "The house came with a key, a loan, and a garage full of someone else's life. Before anyone can sell it, someone has to have the right to sign. We start there.",
    blurb: "Probate, a beneficiary deed, siblings who disagree, and a house nobody lives in.",
    intro: [
      "Most inherited houses we hear about in the Valley are not a real estate problem first. They are a paperwork problem: who owns the house now, who is allowed to sign, and who has to agree.",
      "Arizona gives an estate a few ways to answer that. Sometimes a beneficiary deed already did it. Sometimes a small-estate affidavit is enough. Sometimes the Maricopa County Superior Court has to appoint a personal representative first. The answer decides how soon a sale can close, so it is the first thing we ask about.",
      "After that, the house itself is the easy part. We buy it as it is, with the furniture, the old roof, and the boxes in the garage, and a title company pays any loan and lien from the sale.",
    ],
    fact: {
      text: "A beneficiary deed (A.R.S. § 33-405) recorded before the owner died can pass the house to the named person without probate. It only works if it was recorded while the owner was alive.",
      note: "Check the Maricopa County Recorder for a deed recorded in the owner's name before you assume probate is needed.",
    },
    problems: [
      {
        title: "Nobody can live in it, and it still costs money",
        body: "The mortgage, taxes, insurance, HOA dues, and the summer power bill keep coming while the estate is sorted out. A vacant house can also be harder to insure.",
      },
      {
        title: "The heirs do not agree",
        body: "One sibling wants to keep it, one wants to rent it, one wants it gone. A sale needs the people with the right to sign. We can show every heir the same number and the same math.",
      },
      {
        title: "A lifetime of belongings inside",
        body: "You do not have to empty it. Take what matters to the family, and leave the rest. Clearing it out becomes our job after closing.",
      },
      {
        title: "Repairs nobody wants to pay for",
        body: "An inherited house often needs a roof, plumbing, or an HVAC system that was put off for years. A cash price accounts for that, so the estate does not have to front the money.",
      },
    ],
    steps: [
      {
        title: "Tell us what the estate has",
        body: "The address, the name on the deed, whether there is a will, a beneficiary deed, or a court case, and what is owed on the house.",
      },
      {
        title: "Get a number for the house as it is",
        body: "Patrick or Jaime look at the house and give every heir the same number with the math behind it. No one has to clean or repair anything first.",
      },
      {
        title: "Close when the paperwork allows",
        body: "A Maricopa County title company confirms who can sign, pays the loan and liens, and sends the rest as the estate directs. We can sign once the authority is in place.",
      },
    ],
    rules: [
      {
        title: "Who can sign",
        body: "Usually the person named in a beneficiary deed, an heir using a small-estate affidavit, or a personal representative appointed by the court. The title company will ask for the document that gives that authority.",
      },
      {
        title: "The small-estate path for a house",
        body: "Arizona allows an affidavit for real property instead of full probate when the estate's Arizona real property is under the limit in A.R.S. § 14-3971, which is $300,000 for deaths on or after September 26, 2025, and at least six months have passed since the death.",
      },
      {
        title: "The loan does not have to be paid off just because the owner died",
        body: "Federal law (the Garn–St Germain Act) generally keeps a lender from calling the loan just because the house passed to a relative at death. The payments still have to be made, so a sale or a plan should not wait too long.",
      },
    ],
    gather: [
      "The death certificate",
      "The will or trust, if there is one",
      "Any beneficiary deed or court letters naming a personal representative",
      "The latest mortgage statement and property tax bill",
      "HOA name and contact, if there is one",
      "Names and contact details for the other heirs",
    ],
    faqs: [
      {
        question: "Can we sell before probate is finished?",
        answer:
          "You can talk to us, get a number, and sign once someone has the legal authority to sell. In an informal probate, a personal representative can often sell once appointed, without waiting for the estate to close. Your attorney can confirm what your letters allow.",
      },
      {
        question: "Do we have to clean out the house?",
        answer:
          "No. Take what the family wants to keep. Anything left after closing becomes ours to deal with, including furniture, appliances, and what is in the garage or the shed.",
      },
      {
        question: "What if one heir does not want to sell?",
        answer:
          "We will not pressure anyone. A sale needs the people who have the right to sign, and sometimes that means the heirs or the court have to work it out first. We can give everyone the same offer in writing so the conversation starts from the same facts.",
      },
      {
        question: "The house still has a mortgage. Is that a problem?",
        answer:
          "Not by itself. At closing the title company pays off the loan from the sale price, and the estate receives what is left. Tell us the balance early so we can say plainly whether the number covers it.",
      },
      {
        question: "Who gets the money from the sale?",
        answer:
          "The title company pays it out as the authority document and the estate direct, usually to the personal representative or the heirs. We do not decide how an estate is split.",
      },
      {
        question: "We live out of state. Can we still sell?",
        answer:
          "Yes. Many heirs never come to Arizona for this. Title companies can usually arrange a mobile or remote notary for signing, and we can meet at the house with whoever has the key.",
      },
    ],
    related: [
      { href: "/guides/life-events", label: "Guide: divorce, probate, or a job loss" },
      { href: "/guides/cash-sale", label: "Guide: how a cash sale works" },
      { href: "/stop-foreclosure", label: "Behind on the estate's mortgage?" },
    ],
  },
  {
    slug: "divorce",
    label: "Divorce",
    title: "Sell a House During a Divorce in Arizona",
    description:
      "Selling a Maricopa County house during or after a divorce: why both spouses usually sign, what the court order says, and how a cash sale gives you one clear number to split.",
    eyebrow: "Selling during a divorce",
    h1: "One house, two people, and a number you can both see.",
    heroLine:
      "In a divorce, the house is often the biggest thing left to decide. A cash sale gives both of you the same written number, a date you choose, and no showings while you are still sorting things out.",
    blurb: "Both spouses sign, the court order matters, and nobody wants showings.",
    intro: [
      "Arizona is a community property state. A house bought during the marriage usually belongs to both spouses, whoever's name is on the mortgage, and selling it normally takes both signatures.",
      "That makes a divorce sale different. The question is not only what the house is worth, but whether both of you agree to sell, whether the court has already said what happens to it, and how the money is split at closing.",
      "We do not take sides. We give both of you, or both lawyers, the same offer with the same math. If you agree, the title company follows the decree or your written agreement when it pays out.",
    ],
    fact: {
      text: "Once a divorce petition is served in Arizona, a preliminary injunction (A.R.S. § 25-315) generally stops either spouse from selling community property without the other's written consent or a court order.",
      note: "Ask your family law attorney what your order says before you sign anything.",
    },
    problems: [
      {
        title: "Neither of you can afford it alone",
        body: "One income may not carry the payment, taxes, and insurance. Waiting for a buyout that cannot be financed often leads to missed payments.",
      },
      {
        title: "Showings while you still live there",
        body: "A listing means cleaning, staging, and strangers walking through a house that is already tense. A direct sale has one visit.",
      },
      {
        title: "Arguing about the price",
        body: "A written cash offer is one number both lawyers can look at. Either of you can compare it with a listing estimate before deciding.",
      },
      {
        title: "A move-out date that has to work",
        body: "You can pick a closing date that fits the decree, the school year, or a lease that starts somewhere else.",
      },
    ],
    steps: [
      {
        title: "Either of you can call first",
        body: "We will ask whether the other spouse knows and agrees, and whether there is an attorney. Nothing is signed by asking.",
      },
      {
        title: "Both of you get the same offer",
        body: "We send one written number to both spouses or both lawyers, with what the loan payoff and closing costs do to it.",
      },
      {
        title: "Title splits it the way you agreed",
        body: "Both spouses sign. The title company pays the loan and liens, and divides what is left according to the decree or your signed agreement.",
      },
    ],
    rules: [
      {
        title: "Both spouses usually sign",
        body: "Under A.R.S. § 25-214, selling community real property generally needs both spouses to join. A title company will ask for both signatures, or for a court order that says otherwise.",
      },
      {
        title: "The court order controls",
        body: "If a decree or a temporary order says who keeps the house or how a sale is handled, the sale has to follow it. Bring the order to the first call.",
      },
      {
        title: "Taxes on the sale",
        body: "Some sellers can exclude part of the gain on a main home under federal law. How that applies in a divorce depends on your situation. Ask a tax professional before you close.",
      },
    ],
    gather: [
      "The divorce decree or any temporary orders about the house",
      "The latest mortgage statement, plus any HELOC or second loan",
      "Both spouses' contact details, or both attorneys'",
      "HOA name and contact, if there is one",
      "A move-out date that works for both of you",
    ],
    faqs: [
      {
        question: "Can I sell the house if my spouse will not sign?",
        answer:
          "Usually not on your own. Community real property in Arizona generally needs both spouses to sign, and once a divorce is filed there is usually an order against selling without consent. Your attorney can ask the court for an order if your spouse will not cooperate.",
      },
      {
        question: "Can we sell before the divorce is final?",
        answer:
          "Often yes, if both spouses agree in writing or the court approves it. Many couples sell first so there is cash to divide instead of a house.",
      },
      {
        question: "Who gets the money?",
        answer:
          "The title company pays out the proceeds the way your decree or your written agreement says. We do not decide the split and we do not take sides.",
      },
      {
        question: "What if one of us already moved out?",
        answer:
          "That is common. We can work with the spouse who still lives there for the visit, and the other can sign separately, often with a mobile notary.",
      },
      {
        question: "What if we owe more than the house is worth?",
        answer:
          "Tell us the payoff. We will say plainly if a cash sale cannot cover it. In that case your attorney may look at a short sale or another option, and we will not pretend otherwise.",
      },
    ],
    related: [
      { href: "/guides/life-events", label: "Guide: divorce, probate, or a job loss" },
      { href: "/take-over-payments", label: "Taking over the payments" },
      { href: "/cash-offer", label: "How a cash offer is priced" },
    ],
  },
  {
    slug: "rental-property",
    label: "Rental with tenants",
    title: "Sell a Rental Property with Tenants in Phoenix",
    description:
      "Tired of being a landlord in Maricopa County? Sell a rental house with the tenant still in it, the lease in place, and no make-ready repairs.",
    eyebrow: "Tired of being a landlord",
    h1: "Sell the rental with the tenant still in it.",
    heroLine:
      "You do not have to wait for the lease to end, evict anyone, or fix the place up between tenants. We buy rentals as they are, lease and all.",
    blurb: "Tenant in place, a lease that has not ended, or a rental that needs work.",
    intro: [
      "Many of the calls we get from landlords start the same way: the house was a good idea once, and now it is late rent, repair calls, and a property manager's invoice.",
      "Selling a rental on the open market usually means waiting for the tenant to leave, paying for repairs and cleaning, and then listing an empty house. A direct sale skips that. We can buy with the tenant in place and take over the lease.",
      "If the tenant is behind, or the house needs work, that changes the number. It does not stop the sale.",
    ],
    fact: {
      text: "In Arizona a landlord generally has to give a tenant two days' notice before entering for a non-emergency reason (A.R.S. § 33-1343). We plan the one visit around that.",
      note: "The lease itself may say more. Bring it to the call.",
    },
    problems: [
      {
        title: "A tenant who pays late, or not at all",
        body: "You can sell with the situation as it is. We will want to know what is owed and whether any notice has been served, so the number reflects it.",
      },
      {
        title: "Repairs between every tenant",
        body: "Carpet, paint, appliances, and an AC unit that is near the end. A cash price is for the house as it stands, not after a make-ready.",
      },
      {
        title: "You live far from the house",
        body: "Out-of-state owners can sell without flying in. The title company can arrange signing where you are.",
      },
      {
        title: "Showings would upset the tenant",
        body: "A listing means repeated entries and strangers walking through. A direct sale usually needs one visit, with proper notice.",
      },
    ],
    steps: [
      {
        title: "Send the address and the lease facts",
        body: "Rent, lease end date, deposit held, whether rent is current, and what is owed on the house.",
      },
      {
        title: "One visit, with notice",
        body: "We schedule one walk-through, with the notice the tenant is owed. Then you get a number with the math behind it.",
      },
      {
        title: "Close and hand over the lease",
        body: "The title company pays the loan and liens. The lease and the deposit transfer to us at closing, and we tell the tenant who to pay next.",
      },
    ],
    rules: [
      {
        title: "The lease goes with the house",
        body: "A sale does not cancel a residential lease. The buyer generally steps into the landlord's place, and the tenant keeps the rights the lease and Arizona's Residential Landlord and Tenant Act give them.",
      },
      {
        title: "Security deposits transfer",
        body: "The deposit you are holding moves to the new owner at closing, so the tenant's money is accounted for. It shows up on the settlement statement.",
      },
      {
        title: "Taxes on an investment property",
        body: "Selling a rental can mean capital gains and depreciation recapture. Some owners use a 1031 exchange, which has strict federal deadlines (45 days to identify, 180 days to close). Talk to a tax professional before you sign.",
      },
    ],
    gather: [
      "The current lease and any written notices to the tenant",
      "A rent ledger showing what is paid and what is owed",
      "The security deposit amount",
      "The latest mortgage statement and property tax bill",
      "Property manager's contact details, if you use one",
    ],
    faqs: [
      {
        question: "Do I have to evict the tenant before selling?",
        answer:
          "No. We buy with tenants in place. If an eviction has already started, tell us where it stands, because that affects timing and the number.",
      },
      {
        question: "Will you raise the tenant's rent or kick them out?",
        answer:
          "We take over the lease as written, and the tenant keeps the rights the lease gives them. What happens when the lease ends is a conversation for later, and it has to follow Arizona law.",
      },
      {
        question: "What happens to the security deposit?",
        answer:
          "It transfers to us at closing and appears on the settlement statement. From then on, we are responsible for it under the lease.",
      },
      {
        question: "Can I sell a rental that is vacant and trashed?",
        answer:
          "Yes. A vacant rental with damage is a common call. We buy it as is, and the condition is part of the number.",
      },
      {
        question: "Do you buy small multifamily too?",
        answer:
          "Send it. Duplexes, triplexes, and fourplexes in Maricopa County are worth a call. Larger buildings may be outside what we buy, and we will tell you so.",
      },
    ],
    related: [
      { href: "/cash-offer", label: "How a cash offer is priced" },
      { href: "/guides/cash-sale", label: "Guide: how a cash sale works" },
      { href: "/take-over-payments", label: "Taking over the payments" },
    ],
  },
  {
    slug: "as-is",
    label: "House that needs repairs",
    title: "Sell a House As-Is in Phoenix for Cash",
    description:
      "Sell a Maricopa County house that needs repairs: roof, foundation, old plumbing, fire or water damage, or a house that is too full to show. No repairs, no cleaning, no inspection list.",
    eyebrow: "Sell it as it is",
    h1: "Sell the house the way it is today.",
    heroLine:
      "A roof that leaks, plumbing from another decade, a fire, or a house too full to show. You do not have to fix it, clean it, or hand a buyer a repair list. The condition changes the number, not whether we will look.",
    blurb: "Roof, foundation, old plumbing, fire or water damage, or a full house.",
    intro: [
      "A regular buyer usually needs a loan, and a lender usually needs the house to pass an appraisal and an inspection. A house with big repairs can fail that, or turn into a long list of requests after the inspection.",
      "We pay cash and buy the house as it stands. There is no repair request, and no inspection report to negotiate over afterward. We look at it once, account for the repairs in the price, and show you that math.",
      "You still decide. A cash price for a house that needs work will be below what a fully fixed house could list for. Some owners take the cash price, and some fix it and list. Either is a fair choice.",
    ],
    fact: {
      text: "Many Valley houses built in the late 1970s through the mid-1990s were plumbed with polybutylene pipe, which insurers and inspectors often flag. It is one of the repairs we price in, not a reason to say no.",
      note: "If you are not sure what your pipes are, we can look during the visit.",
    },
    problems: [
      {
        title: "A roof, foundation, or AC that is near the end",
        body: "The big-ticket items that make a lender or a buyer back out. We price them in rather than asking you to fix them.",
      },
      {
        title: "Fire, water, or mold damage",
        body: "Damage after a fire, a burst pipe, or a monsoon leak. If there is an insurance claim open, tell us so the title company can account for it.",
      },
      {
        title: "Too much inside to show",
        body: "A hoarding situation or years of belongings. You take what you want to keep. What is left becomes our job after closing.",
      },
      {
        title: "Unpermitted work or code issues",
        body: "An enclosed patio, a converted garage, or an open notice from the city. Tell us what you know, and we account for it.",
      },
    ],
    steps: [
      {
        title: "Tell us what is wrong",
        body: "The address and what you know about the roof, plumbing, AC, damage, or permits. Do not clean up first.",
      },
      {
        title: "One visit, then a number",
        body: "Patrick or Jaime walk the house once and give you a price with the repairs we accounted for. No inspection list follows.",
      },
      {
        title: "Close on your date",
        body: "A Maricopa County title company handles the closing and pays the loan and any liens. Leave what you do not want.",
      },
    ],
    rules: [
      {
        title: "As-is still means honest",
        body: "Arizona sellers are still expected to tell a buyer what they know about the house. Tell us about known problems. It does not stop the sale, and it keeps you protected.",
      },
      {
        title: "Open code or HOA violations",
        body: "A notice from the city or an HOA fine can show up at title as a lien or a demand. The title company sorts out what has to be paid at closing.",
      },
      {
        title: "Insurance claims",
        body: "If you have an open claim or received insurance money for damage, say so. Who keeps the claim or the payment is decided in the contract, not afterward.",
      },
    ],
    gather: [
      "What you know about the roof, plumbing, electrical, AC, and foundation",
      "Any insurance claim number for fire or water damage",
      "Any city, county, or HOA violation notices",
      "The latest mortgage statement",
      "Permits or receipts for work that was done, if you have them",
    ],
    faqs: [
      {
        question: "Do I need to clean the house before you see it?",
        answer:
          "No. We would rather see it as it is. Cleaning before the visit does not change the number much, and it costs you time and money.",
      },
      {
        question: "Will you ask for repairs after the inspection?",
        answer:
          "No. We look at the house before we make the offer, and the repairs are in the price. We do not come back with a repair list after you agree.",
      },
      {
        question: "Why is a cash price lower than a listing?",
        answer:
          "Because we pay for the repairs, the holding costs, and the risk, and you skip the commission, the showings, and the inspection back-and-forth. We show you that math so you can compare.",
      },
      {
        question: "Can you buy a house with fire damage?",
        answer:
          "Yes. Tell us whether there is an open insurance claim and whether the house is boarded or secured. Both affect the timing and the number.",
      },
      {
        question: "What if the house has unpermitted additions?",
        answer:
          "Tell us what was built and when. We account for it in the price. It is common in the Valley and does not, by itself, stop a cash sale.",
      },
    ],
    related: [
      { href: "/cash-offer", label: "How a cash offer is priced" },
      { href: "/guides/cash-sale", label: "Guide: how a cash sale works" },
      { href: "/sell/inherited-house", label: "Inherited a house that needs work?" },
    ],
  },
  {
    slug: "relocation",
    label: "Moving or relocating",
    title: "Sell Your House Fast When You Are Relocating from Phoenix",
    description:
      "Moving for a job, the military, or family? Sell a Maricopa County house on a date that fits your move, without a second mortgage payment or a long-distance listing.",
    eyebrow: "Moving out of the Valley",
    h1: "Sell on the date your move needs.",
    heroLine:
      "A new job, military orders, or family in another state. You pick the closing date, sign from wherever you are, and do not carry two housing payments while a listing sits.",
    blurb: "A new job, military orders, or family elsewhere, on a date you pick.",
    intro: [
      "A relocation puts a date on everything. The new job starts, the orders say report, or the lease in the new city begins, and the Phoenix house is still here.",
      "Listing from far away means managing showings, repairs, and offers over the phone while you are already gone. A direct sale gives you one number and a closing date you choose, so you can plan the move around it.",
      "If the house would sell for more on the open market and you have the time, a listing may be the better choice. We will say so if the math points that way.",
    ],
    fact: {
      text: "Title companies in Arizona can usually arrange a mobile or remote notary, so you can sign the closing documents from your new city without flying back.",
      note: "Ask the title company early which signing option they offer for your file.",
    },
    problems: [
      {
        title: "Two housing payments at once",
        body: "Rent or a new mortgage where you are going, plus the Phoenix payment, taxes, insurance, and utilities until the house sells.",
      },
      {
        title: "A start date that will not move",
        body: "Job start dates and report dates are fixed. A closing date you set lets you plan backward from it.",
      },
      {
        title: "Selling from somewhere else",
        body: "Showings, repairs, and inspections are hard to manage from another state. We need one visit and your signature.",
      },
      {
        title: "No time to fix it up",
        body: "We buy it as it is. Leave the paint, the yard, and the worn carpet. Take what you want and leave the rest.",
      },
    ],
    steps: [
      {
        title: "Tell us your move date",
        body: "The address, what you owe, and the date you need to be gone or need the money by.",
      },
      {
        title: "One visit, before or after you leave",
        body: "We can see the house while you are still there, or meet someone with the key after you go.",
      },
      {
        title: "Sign from wherever you are",
        body: "The title company arranges signing in your new city and pays the loan off from the sale. The rest is sent to you.",
      },
    ],
    rules: [
      {
        title: "Your loan is paid at closing",
        body: "The title company orders the payoff from your lender and pays it from the sale. You do not have to coordinate that from far away.",
      },
      {
        title: "Utilities and HOA",
        body: "Utilities stay on until closing. HOA dues are prorated, and the HOA's transfer paperwork is ordered by title.",
      },
      {
        title: "Military moves",
        body: "If you are moving on orders, for example from Luke Air Force Base, tell us your report date. Talk to your base legal office about any benefits that apply to your loan or lease.",
      },
    ],
    gather: [
      "Your move date and the date you need the money by",
      "The latest mortgage statement",
      "HOA name and contact, if there is one",
      "Who will have a key after you leave",
      "Your new mailing address for closing documents",
    ],
    faqs: [
      {
        question: "Can I close after I have already moved?",
        answer:
          "Yes. The title company can usually arrange a mobile or remote notary where you live. Someone just needs to let us in for the one visit.",
      },
      {
        question: "How fast can we close?",
        answer:
          "A clean title file often closes in a couple of weeks. We will not promise a specific number of days before we know about the loan, liens, and HOA.",
      },
      {
        question: "Can I pick a later closing date?",
        answer:
          "Yes. If your move is a few months out, we can set the closing for when you need it. Ask on the first call.",
      },
      {
        question: "Should I list instead?",
        answer:
          "If you have time and the house shows well, a listing may bring more. If time, distance, or repairs are the problem, a cash sale is simpler. We will show you the math either way.",
      },
      {
        question: "What happens to things I leave behind?",
        answer:
          "Take what you want. Anything left after closing becomes ours to deal with, so you do not have to arrange a cleanout from another state.",
      },
    ],
    related: [
      { href: "/cash-offer", label: "How a cash offer is priced" },
      { href: "/take-over-payments", label: "Taking over the payments" },
      { href: "/guides/cash-sale", label: "Guide: how a cash sale works" },
    ],
  },
];

export function getSituation(slug: string) {
  return situations.find((item) => item.slug === slug);
}
