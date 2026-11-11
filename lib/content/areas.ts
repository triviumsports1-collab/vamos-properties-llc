import type { Faq } from "@/lib/content/faqs";

export type Area = {
  slug: string;
  name: string;
  description: string;
  opening: string;
  fact: string;
  paragraphs: string[];
  neighborhoods: { name: string; note: string }[];
  zips: string[];
  nearby: string[];
  faqs: Faq[];
};

export const areas: Area[] = [
  {
    slug: "phoenix",
    name: "Phoenix",
    description:
      "Sell a Phoenix house as-is, from Maryvale to Ahwatukee, or ask Vamos about a mortgage that is behind.",
    opening:
      "Phoenix is not one market. A 1960s block house in Maryvale, a smaller lot near Central, and a newer house in Ahwatukee can all be behind for the same reason and still need three different offers.",
    fact: "Trustee sales for Phoenix addresses are recorded with the Maricopa County Recorder. The date on your notice is the clock, not the day the letter started to feel real.",
    paragraphs: [
      "If the notice is already recorded, a cash sale is meant to pay the loan off at a title company before that date. Taking over the payments is a different conversation, and the loan can stay in your name.",
      "We buy as-is. That includes deferred roofs, swamp coolers that gave up, houses with tenants, and houses you inherited and have not cleaned out. You do not need a sign in the yard or a weekend of showings.",
      "Patrick or Jaime will ask what part of Phoenix the house is in, what you owe, and whether anyone else is on the title. The city name alone is not enough to price it.",
    ],
    neighborhoods: [
      {
        name: "Maryvale",
        note: "Mostly block and ranch houses from the 1960s and 1970s. Roofs, coolers, and long-time owners show up on the first call more often than a remodel.",
      },
      {
        name: "South Phoenix and Laveen",
        note: "Older streets sit next to newer subdivisions. A big lot does not automatically mean equity if the loan is new or the house needs work.",
      },
      {
        name: "Central Phoenix",
        note: "Smaller lots, older houses, and a mix of owners and rentals. Showing the house every weekend is often the part people want to skip.",
      },
      {
        name: "Sunnyslope and North Mountain",
        note: "Hills and older construction. A view does not fix a tired roof or a payment that is already late.",
      },
      {
        name: "Ahwatukee",
        note: "More HOAs and newer houses than Maryvale. Divorce, a job change, or dues plus a mortgage still put people behind.",
      },
      {
        name: "Deer Valley and north Phoenix",
        note: "Production homes and longer drives. We need the address, because the north side of the city is not one price.",
      },
    ],
    zips: ["85009", "85015", "85017", "85031", "85033", "85035", "85040", "85041", "85042", "85044", "85048", "85051"],
    nearby: ["glendale", "tempe", "avondale", "scottsdale"],
    faqs: [
      {
        question: "Do you buy houses in west and south Phoenix?",
        answer:
          "Yes. Older block homes, houses with deferred repairs, and houses already in pre-foreclosure are the ones we talk about most.",
      },
      {
        question: "Can I stay a few days after closing?",
        answer:
          "Sometimes, if a cash sale is the path and the title company can document a short occupancy. We will say yes or no before you sign, not the day you hand over the keys.",
      },
      {
        question: "Does a Phoenix zip code decide the offer?",
        answer:
          "It tells us where to look. The offer still follows the block, the condition, the loan balance, and the date you need to close.",
      },
    ],
  },
  {
    slug: "scottsdale",
    name: "Scottsdale",
    description:
      "Sell a Scottsdale house as-is, from Old Town to north of Shea, or ask Vamos about a mortgage that is behind.",
    opening:
      "Scottsdale looks polished from Scottsdale Road, and people assume nobody there is behind. A divorce, a job change, HOA dues on top of the mortgage, or a house you inherited from another state still put owners on the clock.",
    fact: "A trustee sale for a Scottsdale address is still a Maricopa County recording. The date on the notice is the clock, not the day the letter started to feel real.",
    paragraphs: [
      "We buy as-is. That includes a tired roof on an older ranch near Old Town, a lock that barely works, a tenant still in the house, and a north Scottsdale production home that would photograph well if you had the months to list it.",
      "Old Town, McCormick Ranch, and DC Ranch are not one price. A golf-course elevation does not fix a payment that is already late, and a smaller lot south of Indian School is a different walkthrough than a house north of Shea.",
      "If the house would list well, we will say that a traditional sale might net more and that it will take longer. Our cash number is the certain one. Patrick or Jaime will ask the address, what you owe, and whether an association letter is already on the counter.",
    ],
    neighborhoods: [
      {
        name: "Old Town and south Scottsdale",
        note: "Older houses, smaller lots, and mixed streets near Indian School and McDowell. Condition and who is on the title matter more than a fresh coat of paint.",
      },
      {
        name: "McCormick Ranch",
        note: "Established lakes and golf, with association rules and houses whose systems are aging even when the street looks settled.",
      },
      {
        name: "Gainey Ranch and the Shea corridor",
        note: "HOAs, higher payments, and a pretty elevation that can still be behind. The dues belong on the first call next to the loan balance.",
      },
      {
        name: "North Scottsdale and DC Ranch",
        note: "Newer master-planned streets, longer drives, and association estoppels that can take as long as the payoff. Being far north does not add days to a trustee sale.",
      },
      {
        name: "McDowell Mountain and the northeast edge",
        note: "Larger lots and a different buyer pool than Old Town. Tell us the cross streets. North Scottsdale is not one number.",
      },
    ],
    zips: ["85250", "85251", "85255", "85257", "85258", "85259", "85260", "85262"],
    nearby: ["phoenix", "tempe", "mesa"],
    faqs: [
      {
        question: "Do you buy houses in north Scottsdale and DC Ranch?",
        answer:
          "Yes. Master-planned streets, HOAs, and newer houses are still a cash conversation if the payment, a divorce, or a move is the reason. Tell us the community name on the first call.",
      },
      {
        question: "Will you lowball a Scottsdale house that would list well?",
        answer:
          "You will see how we got to the number: price, repairs, dues, and the cost of closing on your timeline. If a listing might net more, we will say so. You can decline the offer.",
      },
      {
        question: "Do HOA dues in Scottsdale stop a cash sale?",
        answer:
          "They rarely stop the sale. They can add a payoff. We would rather hear the association name on the first call than discover it at the title company.",
      },
    ],
  },
  {
    slug: "mesa",
    name: "Mesa",
    description:
      "A local cash offer for Mesa homeowners, including older ranch houses and homes that need to sell without a listing.",
    opening:
      "Mesa has a lot of single-story block and ranch houses that have been in one family for decades. Many of those owners are behind because the payment, the roof, or both got away from them.",
    fact: "Mesa sits in the East Valley, and a trustee sale here still runs through Maricopa County, not a separate city auction.",
    paragraphs: [
      "We buy in Mesa as-is, including houses that need a new cooler, a new roof, or a full clean-out after someone has moved. You can leave what you cannot take.",
      "East Mesa and west Mesa do not price the same. Downtown and the older grid are a different conversation from a newer subdivision near the Superstition corridor.",
      "If the mortgage is old and the rate is low, ask us to compare a cash payoff with taking over the payments. We will tell you which one actually fits the balance.",
    ],
    neighborhoods: [
      {
        name: "Downtown and west Mesa",
        note: "Older block and ranch houses, long ownership, and repairs that have been postponed. These are straightforward as-is conversations.",
      },
      {
        name: "Dobson Ranch",
        note: "An established area with an association, mature yards, and houses whose systems are aging even when the street looks settled.",
      },
      {
        name: "East Mesa",
        note: "More space and, on some streets, more deferred exterior work. Tell us the cross streets. East Mesa covers a lot of ground.",
      },
      {
        name: "Near Superstition Springs",
        note: "Newer relative to the old grid, often with an HOA. Unpaid dues can show up beside the mortgage payoff.",
      },
    ],
    zips: ["85201", "85202", "85203", "85204", "85205", "85206", "85207", "85208", "85210", "85212", "85213"],
    nearby: ["gilbert", "chandler", "tempe"],
    faqs: [
      {
        question: "Do you buy inherited houses in Mesa?",
        answer:
          "Yes, once the person who can sign is clear. Probate can slow a deed. Bring the names on the title and we will tell you what a title company will still need.",
      },
      {
        question: "Is a listed Mesa house something you can buy?",
        answer:
          "If you already have a listing agreement, that contract controls. We can talk after you and your agent end it the way the agreement allows.",
      },
      {
        question: "Do you come to east Mesa?",
        answer:
          "Yes. The first step is still the phone call. If the numbers can work, we come to the house.",
      },
    ],
  },
  {
    slug: "glendale",
    name: "Glendale",
    description:
      "Sell a Glendale house as-is, from the older grid to north of the Loop, or talk through a mortgage that is behind.",
    opening:
      "Glendale stretches from older neighborhoods near downtown to newer subdivisions north of the Loop. The houses, and the equity, are not the same in both places.",
    fact: "Glendale owners use the same Maricopa County trustee-sale timeline as Phoenix. The 91st day is counted from the recording, not from the day the letter felt real.",
    paragraphs: [
      "A cash offer is the direct way out: as-is, no showings, closing on a date you can live with if title can meet it. If the loan is behind and a sale would not clear it, we will say that before anyone spends a week on paperwork.",
      "Houses near Grand Avenue and the older downtown grid are a different walkthrough than Arrowhead or the master-planned streets north of the 101. Bring the address, not a freeway exit.",
      "Call even if the kitchen is not ready for photos. We do not need a spotless house to start.",
    ],
    neighborhoods: [
      {
        name: "Downtown Glendale and Catlin Court",
        note: "Older houses and smaller lots. Condition and who is on the title matter more than a fresh coat of paint.",
      },
      {
        name: "West Glendale",
        note: "Block homes and long-time owners, close in feel to Maryvale. Deferred repairs are normal on these calls.",
      },
      {
        name: "Arrowhead and north of the 101",
        note: "Newer streets, HOAs, and higher payments. A pretty elevation can still be behind.",
      },
      {
        name: "Along Grand Avenue",
        note: "Mixed edges, older houses, and some rentals. Tell us if a tenant is in the house before we talk price.",
      },
    ],
    zips: ["85301", "85302", "85303", "85304", "85305", "85306", "85308"],
    nearby: ["phoenix", "peoria", "avondale"],
    faqs: [
      {
        question: "Can you help if the house is rented?",
        answer:
          "Often, yes. Tell us if a tenant is in the house and whether the rent is current. That changes both the cash number and whether a takeover makes sense.",
      },
      {
        question: "How do I start if I only have the sale date?",
        answer:
          "Put the address and the sale date on the form. That date is how we know whether there is enough time to open a title file.",
      },
      {
        question: "Do HOA dues in north Glendale stop a sale?",
        answer:
          "They rarely stop it. They can add a payoff. We would rather hear the association name on the first call.",
      },
    ],
  },
  {
    slug: "chandler",
    name: "Chandler",
    description:
      "Chandler homeowners can request a cash offer or ask about a mortgage that has fallen behind, HOA included.",
    opening:
      "Chandler looks newer from the street, and people assume that means nobody there is behind. Payments still break when a job goes, a divorce starts, or the HOA and the mortgage land in the same month.",
    fact: "Many Chandler houses sit in HOAs. Unpaid dues can show up at closing next to the mortgage payoff.",
    paragraphs: [
      "We will ask about the association, the loan balance, and the repairs you have been putting off. You do not have to bring the house up to HOA standards before we walk it.",
      "Downtown Chandler is not Ocotillo, and west Chandler is not the south edge. The offer follows the subdivision, not the city slogan.",
      "A cash closing is designed to pay liens from the sale. A payment takeover does not automatically clear them, and it does not take your name off the mortgage.",
    ],
    neighborhoods: [
      {
        name: "Downtown Chandler",
        note: "Older houses and smaller lots near the city core. A different buyer pool than a south Chandler production home, and a different repair list.",
      },
      {
        name: "West Chandler",
        note: "A lot of 1980s and 1990s houses. Roofs and original systems are the usual conversation, not a gut remodel.",
      },
      {
        name: "Ocotillo and south Chandler",
        note: "HOAs, newer construction, and sometimes a golf or lake edge. The dues and the loan balance both belong on the first call.",
      },
      {
        name: "North Chandler",
        note: "Closer to Tempe and the 202. Smaller lots in places, and more pressure if the house has been a rental.",
      },
    ],
    zips: ["85224", "85225", "85226", "85248", "85249", "85286"],
    nearby: ["gilbert", "mesa", "tempe"],
    faqs: [
      {
        question: "Do HOA rules stop a cash sale?",
        answer:
          "They rarely stop the sale itself. They can add a payoff. We would rather know the association on the first call than discover it at the title company.",
      },
      {
        question: "What if I am only one payment behind?",
        answer:
          "You may still have time to work with the servicer. If you want a second path anyway, we will give you a straight offer and you can compare it with staying.",
      },
      {
        question: "Will you buy a Chandler house that is in good shape?",
        answer:
          "Yes. If it would list well, we will also say that a traditional sale might net more and that it will take longer. Our number is the certain one.",
      },
    ],
  },
  {
    slug: "gilbert",
    name: "Gilbert",
    description:
      "Talk with Vamos about a Gilbert house you need to sell as-is, including homes with equity and homes that are behind.",
    opening:
      "Gilbert owners often have more equity than they think, and also more pressure: a payment, a divorce, or a house they inherited and do not want to manage from another state.",
    fact: "Heritage District cottages and south Gilbert production homes do not price the same. The offer follows the block, not the city name.",
    paragraphs: [
      "If the house would list well, we will tell you that a traditional sale might net more, and that it will also take longer and ask you to repair and show it. Our cash number is the certain one.",
      "If you are already behind, waiting on a retail buyer can run into the trustee sale. That is when the date on the notice matters more than an online estimate.",
      "Power Ranch and the Heritage District should not be priced with the same sentence. Tell us the cross streets.",
    ],
    neighborhoods: [
      {
        name: "Heritage District",
        note: "Older cottages and infill, not a production floor plan. Condition varies house to house.",
      },
      {
        name: "Val Vista and central Gilbert",
        note: "Established neighborhoods. Some owners have equity and still need a private sale because of a divorce or a move.",
      },
      {
        name: "Power Ranch and south Gilbert",
        note: "Large HOA communities. The association letter can take as long as the payoff.",
      },
      {
        name: "Higley and the south edge",
        note: "Newer houses and bigger payments. Being far south does not add days to a trustee sale.",
      },
    ],
    zips: ["85233", "85234", "85295", "85296", "85297", "85298"],
    nearby: ["chandler", "mesa", "tempe"],
    faqs: [
      {
        question: "Will you lowball a Gilbert house that is in good shape?",
        answer:
          "You will see how we got to the number: price, repairs, and the cost of closing on your timeline. You can decline it.",
      },
      {
        question: "Can two owners sign if they are not speaking?",
        answer:
          "Both people on the title usually have to sign. We can work around schedules. We cannot skip a signature the title company requires.",
      },
      {
        question: "Do you buy houses with tenants in Gilbert?",
        answer:
          "Often. Rent that is late, a lease that still has months, or a vacant rental are three different numbers. Tell us which one it is.",
      },
    ],
  },
  {
    slug: "peoria",
    name: "Peoria",
    description:
      "A Peoria cash sale or a straight talk about taking over a mortgage that is behind.",
    opening:
      "Peoria runs from older neighborhoods near Grand Avenue up toward newer master-planned streets. Distance from central Phoenix shows up in the price, and in how tired a long commute can make a payment feel.",
    fact: "Peoria is still Maricopa County. A Notice of Trustee's Sale is a county recording, even if the letter mentions a local trustee.",
    paragraphs: [
      "Bring the address and, if you have it, the sale date. We buy as-is, including houses with old roofs and tired rentals.",
      "Old Town and Vistancia are not the same house. North Peoria HOAs add a payoff line that a Grand Avenue bungalow may not have.",
      "If the rate on the loan is the only good thing left in the deal, we can explain what a takeover would and would not do. Your name can stay on that loan.",
    ],
    neighborhoods: [
      {
        name: "Old Town Peoria",
        note: "The older grid near Grand. Smaller houses, older systems, and owners who have been there a long time.",
      },
      {
        name: "North of the 101",
        note: "Newer subdivisions and HOAs. The payment and the dues are usually the stress, not a crumbling foundation.",
      },
      {
        name: "Vistancia",
        note: "Master planned and farther north. A different price than Old Town, and association rules that title will ask about.",
      },
      {
        name: "Toward Lake Pleasant",
        note: "Farther out. We still drive it if the numbers can work. The first step is the address, not a listing appointment.",
      },
    ],
    zips: ["85345", "85381", "85382", "85383"],
    nearby: ["glendale", "surprise", "phoenix"],
    faqs: [
      {
        question: "Do you drive to north Peoria for a walkthrough?",
        answer: "Yes. The first step is still the phone call. If the numbers can work, we come to the house.",
      },
      {
        question: "What if the house is vacant?",
        answer: "Vacant is fine. Tell us if the power is off so we plan the visit around daylight.",
      },
      {
        question: "Can a Peoria HOA block the sale?",
        answer:
          "It can slow the paperwork and add a balance. It rarely makes the house unsellable. Tell us the community name up front.",
      },
    ],
  },
  {
    slug: "surprise",
    name: "Surprise",
    description:
      "Surprise homeowners can ask Vamos for a cash offer or help when the mortgage is behind.",
    opening:
      "Surprise grew quickly, and a lot of those payments were set when life looked steadier. A job change or a longer commute is enough to put a house behind.",
    fact: "Northwest Valley trustee sales do not get extra time because the house is far from downtown Phoenix. The notice date still controls.",
    paragraphs: [
      "We buy in Surprise without asking you to list, stage, or replace the carpet first. The offer accounts for what the house needs.",
      "The original townsite and the newer planned neighborhoods are different houses. Age-restricted communities also have their own rules. Tell us if the house is in one before anyone assumes a buyer can take the deed.",
      "If you have a sale date inside the next few weeks, put it on the form. Title work needs more than a weekend.",
    ],
    neighborhoods: [
      {
        name: "Original Surprise",
        note: "Older and smaller than the newer north side. Repairs and long ownership are common.",
      },
      {
        name: "Marley Park and planned neighborhoods",
        note: "HOA streets. The association estoppel can take as long as the loan payoff.",
      },
      {
        name: "North Surprise",
        note: "Newer houses, bigger payments, and a longer drive. Being new does not mean the loan is current.",
      },
      {
        name: "Near age-restricted communities",
        note: "Those rules can limit who can hold title. Say so on the first call so we do not waste the week.",
      },
    ],
    zips: ["85374", "85378", "85379", "85387", "85388"],
    nearby: ["peoria", "glendale", "phoenix"],
    faqs: [
      {
        question: "Can you close before a Surprise trustee sale?",
        answer:
          "Sometimes, if there are enough days left and the payoff can be ordered. We will tell you on the first call if the date is already too close.",
      },
      {
        question: "Do you charge a fee to make an offer?",
        answer: "No. There is no fee to ask, and no fee if you say no.",
      },
      {
        question: "What if the house is in an age-restricted community?",
        answer:
          "Tell us the community. Some of those rules decide whether a sale to us can even be written. We will not guess.",
      },
    ],
  },
  {
    slug: "avondale",
    name: "Avondale",
    description:
      "Sell an Avondale house as-is, or talk with Vamos about payments you have fallen behind on.",
    opening:
      "Avondale has older streets and newer subdivisions in the same city. We need the address, not a guess from the freeway exit.",
    fact: "Avondale houses with city liens or old repair notices can still be sold. Those items are payoff lines, not a reason to hide the house.",
    paragraphs: [
      "A cash sale is built to handle repairs, leftover belongings, and a closing date you pick within what title can actually do. You will know the costs before you sign.",
      "South of I-10 and the newer streets north of it do not share a price. Garden Lakes is not the historic center. Say which one you are in.",
      "If divorce or a job loss is the reason, you can say that in one line on the form. It helps us call with the right question first.",
    ],
    neighborhoods: [
      {
        name: "Historic Avondale",
        note: "Older houses south of the freeway. Deferred repairs and smaller lots are normal.",
      },
      {
        name: "Garden Lakes",
        note: "A known west-side community with its own streets and, in places, an association. Tell us if dues are behind.",
      },
      {
        name: "North of I-10",
        note: "Newer production homes. The stress is often the payment, a move, or a divorce, not a house from 1965.",
      },
      {
        name: "Toward the west edge",
        note: "Closer to the county line in feel. Still Maricopa County for a trustee sale. The date does not move because the drive is longer.",
      },
    ],
    zips: ["85323", "85392"],
    nearby: ["phoenix", "glendale", "peoria"],
    faqs: [
      {
        question: "What if my spouse has moved out?",
        answer:
          "If they are on the title, they still have to sign. We can explain that part without making you retell the whole story on a web form.",
      },
      {
        question: "Do you buy houses that need a new roof?",
        answer: "Yes. The roof comes out of the offer. You do not have to replace it first.",
      },
      {
        question: "Can a city repair notice stop the sale?",
        answer:
          "It usually becomes a payoff or a repair we take on, not a reason to pretend the notice is not there. Bring it.",
      },
    ],
  },
  {
    slug: "tempe",
    name: "Tempe",
    description:
      "A Tempe cash buyer for houses you need to sell without a listing, including rentals and inherited homes.",
    opening:
      "Tempe houses are often on smaller lots, closer to campus or the lake, and harder to show if the situation at home is already messy.",
    fact: "Condos and townhomes in Tempe can have association payoff letters that take longer than the house itself. Start that clock early.",
    paragraphs: [
      "We buy Tempe houses as-is, including places you cannot easily hold open because of tenants, roommates, or a lock that barely works.",
      "South Tempe subdivisions and the streets near campus are different properties. A condo near the lake adds an association and rental rules a single-family house may not have.",
      "You will get a person, a number, and a plain description of whether the loan gets paid off. If it will not, we say that.",
    ],
    neighborhoods: [
      {
        name: "Near campus and Maple-Ash",
        note: "Smaller houses, rentals, and roommates. Occupancy matters as much as the roof.",
      },
      {
        name: "South Tempe",
        note: "More suburban streets, some with associations. A quieter sale is often the point.",
      },
      {
        name: "Near Tempe Town Lake",
        note: "Different prices, and more condos. The association timeline can run longer than the loan payoff.",
      },
      {
        name: "North Tempe",
        note: "Closer to the 202 and to Phoenix. Still worth a look. Still needs the actual address.",
      },
    ],
    zips: ["85281", "85282", "85283", "85284"],
    nearby: ["phoenix", "mesa", "chandler", "scottsdale"],
    faqs: [
      {
        question: "Do you buy condos in Tempe?",
        answer:
          "Sometimes. The association, the rental rules, and the loan balance decide it. The form is still the right start.",
      },
      {
        question: "Can an out-of-state heir sell a Tempe house?",
        answer:
          "Yes, if you have authority to sign. A title company will ask for those documents. You do not have to fly in just to ask for an offer.",
      },
      {
        question: "What if the house is full of tenants?",
        answer:
          "Tell us how many and whether they pay. We can often still make a cash offer. We cannot pretend an occupied house is vacant.",
      },
    ],
  },
];

export function getArea(slug: string) {
  return areas.find((area) => area.slug === slug);
}
