import type { Faq } from "@/lib/content/faqs";

/**
 * Extra, city-specific content for the priority area pages.
 * Anything here is merged on top of `areas.ts` by `getAreaPage()`.
 * Keep the house voice: plain, specific, no invented numbers or reviews.
 */
export type AreaExtras = {
  /** Short line under the H1 in the hero. */
  heroLine: string;
  /** "Why owners in {city} call" cards. */
  situations: { title: string; body: string }[];
  /** Replaces the base neighborhood notes with longer ones. */
  neighborhoods?: { name: string; note: string }[];
  /** Local details that change the call: HOAs, construction, timing. */
  localNotes: { title: string; body: string }[];
  /** Added after the base FAQs. */
  moreFaqs: Faq[];
};

export const areaExtras: Record<string, AreaExtras> = {
  phoenix: {
    heroLine:
      "Maryvale to Ahwatukee, a house with equity or one that is already behind. Patrick or Jaime look at the address and call you back the same day.",
    situations: [
      {
        title: "The notice is already recorded",
        body: "A Notice of Trustee's Sale on a Phoenix house starts a clock that runs at the Maricopa County Recorder. We start with the sale date and work backward to a closing title can meet.",
      },
      {
        title: "An inherited house you never planned to own",
        body: "A parent's house in west or south Phoenix, full of furniture and decades of repairs nobody made. You can sell it as it sits, and leave what you do not want.",
      },
      {
        title: "A rental that stopped working",
        body: "Late rent, a tenant who will not leave, or a vacant house running up utilities. A house with a lease is still a cash conversation.",
      },
      {
        title: "Repairs you cannot fund",
        body: "A roof at the end of its life, an evaporative cooler that quit, old plumbing. Listing usually means fixing first. Selling to us means you do not.",
      },
    ],
    neighborhoods: [
      {
        name: "Maryvale",
        note: "Mostly single-story block and ranch houses built from the 1950s through the 1970s, many with long-time owners. Roofs, coolers, original plumbing and electrical come up on the first call far more often than a remodel. Those are the repairs a retail buyer's inspector flags and we price in instead.",
      },
      {
        name: "South Phoenix and Laveen",
        note: "Older streets near Baseline sit beside newer Laveen subdivisions with HOAs. A big lot does not automatically mean equity if the loan is recent or the house needs work. Tell us which side of the street mix you are on.",
      },
      {
        name: "Central Phoenix",
        note: "Older houses, smaller lots, and a mix of owners and rentals near the light rail and the Central corridor. Some have real equity; many owners still do not want months of showings. A private sale skips the open houses.",
      },
      {
        name: "Sunnyslope and North Mountain",
        note: "Hillside lots, older construction, and some houses with additions that were never permitted. A view does not fix a tired roof or a payment that is already late. We look at what is actually there, permits included.",
      },
      {
        name: "Ahwatukee",
        note: "South of South Mountain, with more HOAs and newer houses than Maryvale. Divorce, a job change, or dues plus a mortgage still put owners behind. The association's payoff belongs on the first call next to the loan balance.",
      },
      {
        name: "Deer Valley and north Phoenix",
        note: "Production homes from the 1980s onward and longer drives to the core. North Phoenix is not one price, and two floor plans on the same street can be two different offers. Send the exact address.",
      },
    ],
    localNotes: [
      {
        title: "Older systems are normal here",
        body: "Many Phoenix houses still run original ducts, cast-iron drains, or an evaporative cooler. We price those in. You do not replace them first.",
      },
      {
        title: "Additions and permits",
        body: "Garage conversions and back rooms are common in older Phoenix neighborhoods. An unpermitted room changes the number, not whether we can buy.",
      },
      {
        title: "Tenants and inherited houses",
        body: "A lease, a tenant, or an estate that is not settled yet each changes who signs and when. Tell us early so title is not the surprise.",
      },
    ],
    moreFaqs: [
      {
        question: "How fast can you close on a Phoenix house?",
        answer:
          "As fast as title can clear it. With a clean title that is often a couple of weeks. A probate, a lien, or a second owner who has to sign takes longer, and we will say so on the first call.",
      },
      {
        question: "Do I need to clean out the house?",
        answer:
          "No. Take what you want and leave the rest. That is often the point for inherited houses in Maryvale and south Phoenix.",
      },
      {
        question: "Is a cash offer lower than listing?",
        answer:
          "Usually, yes. We buy as-is and cover the cost and risk of the repairs and the wait. If listing would net you more and you have the time, we will tell you that.",
      },
    ],
  },

  gilbert: {
    heroLine:
      "Heritage District cottages, Val Vista, Power Ranch and the south edge. Equity or not, an as-is sale and a straight number from Patrick or Jaime.",
    situations: [
      {
        title: "A divorce and one house",
        body: "Both people on the title usually have to sign, even when they are not speaking. A cash sale with a set date can be simpler than months of showings while the house is shared.",
      },
      {
        title: "Behind with real equity",
        body: "Many Gilbert owners have equity and still fall behind. If a trustee sale is recorded, a sale before the date protects that equity better than an auction does.",
      },
      {
        title: "Moving out of state",
        body: "A job transfer or a move closer to family, and no time to manage repairs, staging and a listing from somewhere else. You can close without being here for showings.",
      },
      {
        title: "HOA letters piling up",
        body: "Fines, a violation notice, or dues that fell behind with the mortgage. The association's payoff is paid at closing from the sale.",
      },
    ],
    neighborhoods: [
      {
        name: "Heritage District",
        note: "Gilbert's original downtown, with older cottages, infill and a few historic houses near Gilbert Road. Condition varies house to house far more than in a production subdivision, so the walkthrough matters more than the zip code.",
      },
      {
        name: "Val Vista and central Gilbert",
        note: "Established neighborhoods from the 1990s and 2000s, many with HOAs and mature landscaping. Owners here often have equity and still need a private sale because of a divorce, a move, or an inherited house.",
      },
      {
        name: "Power Ranch and south Gilbert",
        note: "Large master-planned HOA communities with parks and amenities. The association's payoff letter can take as long as the mortgage payoff, so we ask for the community name early.",
      },
      {
        name: "Higley and the south edge",
        note: "Newer construction and larger payments toward Queen Creek. Being far south does not add days to a trustee sale; the date on the notice is the same Maricopa County clock.",
      },
    ],
    localNotes: [
      {
        title: "HOAs are the rule, not the exception",
        body: "Most Gilbert subdivisions have an association. Unpaid dues and fines are paid from the sale, but the payoff letter has to be ordered, so we start it early.",
      },
      {
        title: "Equity changes the advice",
        body: "If a Gilbert house would list well and you have time, a traditional sale may net more. We will say that out loud and you can compare.",
      },
      {
        title: "Two signatures",
        body: "When two people are on the title, both sign. We can work around schedules and separate signing appointments at the title company.",
      },
    ],
    moreFaqs: [
      {
        question: "Can you buy a Gilbert house in Power Ranch or another HOA community?",
        answer:
          "Yes. Tell us the community name on the first call. The association's payoff and any transfer fees are handled at closing through the title company.",
      },
      {
        question: "We are getting divorced. Do we both have to agree?",
        answer:
          "If you are both on the title, you both sign. We do not take sides, and we can schedule separate signings. Talk to your lawyers about the decree before you sign anything.",
      },
      {
        question: "Can I sell my Gilbert house from out of state?",
        answer:
          "Usually, yes. Title companies can arrange mobile or remote signing. We will tell you what the title company needs from you before you commit.",
      },
    ],
  },

  scottsdale: {
    heroLine:
      "Old Town to DC Ranch. A polished street can still hide a late payment, an HOA notice, or an estate. Patrick or Jaime give you a number and the tradeoffs.",
    situations: [
      {
        title: "A higher payment that stopped working",
        body: "A bigger loan, HOA dues and insurance can outrun income after a job change. If you are behind, the date on the notice matters more than the view.",
      },
      {
        title: "An inherited Scottsdale house",
        body: "A parent's house near Old Town or McCormick Ranch, managed from another state. You can sell it as it sits without coordinating repairs and showings remotely.",
      },
      {
        title: "Divorce in a high-equity house",
        body: "Two owners, one house, and a buyer pool that expects a polished listing. A cash sale trades some price for a date and fewer people walking through.",
      },
      {
        title: "A dated house in a nice neighborhood",
        body: "Original kitchens, old pools and tired roofs in older ranch houses. Retail buyers in Scottsdale expect updates. We buy without them.",
      },
    ],
    neighborhoods: [
      {
        name: "Old Town and south Scottsdale",
        note: "Older ranch houses and smaller lots near Indian School, McDowell and Scottsdale Road. Many are original or partly updated. Condition, permits and who is on the title matter more here than a fresh coat of paint.",
      },
      {
        name: "McCormick Ranch",
        note: "An established master-planned area with lakes, greenbelts and association rules. The street looks settled, but roofs, pools and HVAC systems on many houses are reaching the age where a buyer's inspector flags them.",
      },
      {
        name: "Gainey Ranch and the Shea corridor",
        note: "HOAs, gated streets in places, and higher payments. A pretty elevation can still be behind. The dues and any special assessment belong on the first call next to the loan balance.",
      },
      {
        name: "North Scottsdale and DC Ranch",
        note: "Newer master-planned communities, larger homes and longer drives. Association estoppel letters can take as long as the mortgage payoff, and being far north does not add days to a trustee sale.",
      },
      {
        name: "McDowell Mountain and the northeast edge",
        note: "Larger lots, desert landscaping and a different buyer pool than Old Town. North Scottsdale is not one number. Tell us the cross streets and the community name.",
      },
    ],
    localNotes: [
      {
        title: "Associations and estoppels",
        body: "Many Scottsdale communities have one or two associations. Each one issues a payoff statement before closing. We order them early so they do not hold up the date.",
      },
      {
        title: "The honest comparison",
        body: "A well-kept Scottsdale house often sells well on the open market. If that is your situation and you have the time, listing may net more, and we will say so.",
      },
      {
        title: "Pools and roofs",
        body: "Pool equipment, foam or tile roofs and older AC units are the usual repair list. We price them in so you do not have to fix them first.",
      },
    ],
    moreFaqs: [
      {
        question: "Do you only buy distressed houses in Scottsdale?",
        answer:
          "No. We also buy houses in good shape when an owner wants a private sale and a date. If you would net more by listing, we will tell you that before you decide.",
      },
      {
        question: "Can you close if the house has two HOAs?",
        answer:
          "Yes. It is common in Scottsdale. The title company orders a payoff from each association and pays them from the sale.",
      },
      {
        question: "Can I keep living in the house until closing?",
        answer:
          "Yes. You stay until closing. A short stay after closing is sometimes possible if the title company can document it, and we will answer that before you sign.",
      },
    ],
  },

  chandler: {
    heroLine:
      "Downtown, west Chandler, Ocotillo and the 202 corridor. HOA dues, a late payment or a house you just need gone: an as-is offer and a straight answer.",
    situations: [
      {
        title: "HOA and mortgage in the same month",
        body: "Dues, a special assessment and the loan payment can stack up fast. A cash sale pays the association and the lender from the proceeds at closing.",
      },
      {
        title: "A job change",
        body: "Many Chandler owners work in tech and manufacturing nearby. A layoff or a relocation can turn a comfortable payment into a late one within a few months.",
      },
      {
        title: "A rental you are done managing",
        body: "A house near the 101 or the 202 that has been a rental for years. Tenants, wear and repairs change the number, not whether we can buy.",
      },
      {
        title: "A house that needs work before it could list",
        body: "Original 1980s and 1990s systems in west Chandler, or a newer house with deferred maintenance. You can skip the repairs and the showings.",
      },
    ],
    neighborhoods: [
      {
        name: "Downtown Chandler",
        note: "Older houses and smaller lots around the historic square and Arizona Avenue. A different buyer pool than a south Chandler production home, and a different repair list: original plumbing, older roofs and additions.",
      },
      {
        name: "West Chandler",
        note: "Many houses from the 1980s and 1990s, some with HOAs and some without. Roofs, original HVAC and dated interiors are the usual conversation, not a gut remodel.",
      },
      {
        name: "Ocotillo and south Chandler",
        note: "Master-planned HOA communities, newer construction and some lake or golf frontage. The association payoff and the loan balance both belong on the first call, because both are paid at closing.",
      },
      {
        name: "North Chandler",
        note: "Closer to Tempe and the 202, with smaller lots in places and more rentals. If the house has been rented, tell us whether a tenant is still there and when the lease ends.",
      },
    ],
    localNotes: [
      {
        title: "Most streets have an HOA",
        body: "Unpaid dues, fines and transfer fees are paid from the sale. We ask for the association name early so the payoff letter does not delay closing.",
      },
      {
        title: "Two very different housing ages",
        body: "Downtown and west Chandler houses are often 30 to 40 years old; south Chandler is newer. The repair list, and the offer, follow the house, not the city.",
      },
      {
        title: "Not just distressed sales",
        body: "If your Chandler house would list well and you have time, a traditional sale may net more. We will say that and give you our number to compare.",
      },
    ],
    moreFaqs: [
      {
        question: "Do you buy houses in Ocotillo and other south Chandler HOAs?",
        answer:
          "Yes. Tell us the community name. The association's payoff and transfer fees are handled at closing by the title company.",
      },
      {
        question: "Can you buy a Chandler house with a tenant in it?",
        answer:
          "Often, yes. Tell us whether the lease is current, how long is left, and whether rent is being paid. Each one changes the number and the timeline.",
      },
      {
        question: "How do I get the offer?",
        answer:
          "Send the address with the form or call. Patrick or Jaime will ask a few questions, look at the house, and give you a number with the math behind it. You can say no.",
      },
    ],
  },
  mesa: {
    heroLine:
      "Downtown and west Mesa, Dobson Ranch, east Mesa and the Superstition corridor. Long-owned ranch houses and newer HOA homes, bought as-is.",
    situations: [
      {
        title: "A family house that has been paid on for decades",
        body: "Many Mesa owners have been in the same block house for 30 years or more. When the roof, the cooler and the payment all come due together, a private sale can be simpler than fixing it up to list.",
      },
      {
        title: "An inherited house and an estate to settle",
        body: "A parent's house in west Mesa, still full of their things. Once the person with authority to sign is clear, you can sell it as it sits and leave what you do not want.",
      },
      {
        title: "Behind on a newer east Mesa house",
        body: "A bigger payment plus HOA dues in a newer subdivision can fall behind fast after a job change. If a notice is recorded, the date on it decides how much time is left.",
      },
      {
        title: "A low-rate loan you do not want to lose",
        body: "If the mortgage is old and the rate is low, ask us to compare a cash payoff with taking over the payments. We will say which one actually fits the balance, and what stays in your name.",
      },
    ],
    neighborhoods: [
      {
        name: "Downtown and west Mesa",
        note: "The older grid around Main Street and the light rail, with block and ranch houses and long ownership. Postponed repairs are normal here: roofs, coolers, original plumbing. These are straightforward as-is conversations.",
      },
      {
        name: "Dobson Ranch",
        note: "An established west Mesa community with lakes, an association and mature yards. The street looks settled, but many houses have original systems reaching the age a buyer's inspector will flag.",
      },
      {
        name: "East Mesa",
        note: "More space, larger lots on some streets, and a mix of older houses, newer subdivisions and manufactured-home communities. East Mesa covers a lot of ground, so tell us the cross streets.",
      },
      {
        name: "Near Superstition Springs",
        note: "Newer than the old grid and often in an HOA. Unpaid dues and fines show up next to the mortgage payoff, and the association letter has to be ordered before closing.",
      },
    ],
    localNotes: [
      {
        title: "Old grid versus new subdivisions",
        body: "West Mesa and east Mesa are different houses with different repair lists. The offer follows the address and the condition, not the city name.",
      },
      {
        title: "Manufactured homes and land",
        body: "If the house is a manufactured home, tell us whether you own the land or rent a lot. That changes who signs and whether a sale to us can be written.",
      },
      {
        title: "Already listed?",
        body: "If you have a listing agreement, that contract controls. We can talk after it ends the way the agreement allows.",
      },
    ],
    moreFaqs: [
      {
        question: "Do you buy houses in Dobson Ranch?",
        answer:
          "Yes. Tell us the address and whether HOA dues are current. The association payoff is handled by the title company at closing.",
      },
      {
        question: "Do I have to fix the roof or cooler before selling?",
        answer: "No. We price the repairs into the offer. You do not replace anything first.",
      },
      {
        question: "How long does a Mesa cash sale take?",
        answer:
          "Often a couple of weeks once title is clean. Probate, liens or a second owner who has to sign take longer, and we will tell you that on the first call.",
      },
    ],
  },

  tempe: {
    heroLine:
      "Near campus, south Tempe, the lake and north Tempe. Rentals, roommates and inherited houses included. An as-is number from Patrick or Jaime.",
    situations: [
      {
        title: "A rental near campus you are done with",
        body: "Turnover every summer, roommates, and wear that adds up. Selling with tenants in place is often possible, and you skip the clean-up between leases.",
      },
      {
        title: "Inherited from a parent who lived here for years",
        body: "A south Tempe house with original finishes, managed from another state. Once you have authority to sign, you can sell without flying in for repairs and showings.",
      },
      {
        title: "A condo with HOA trouble",
        body: "Dues, a special assessment or rental limits near the lake. Condos depend on the association, the rules and the balance, so we look at all three before naming a number.",
      },
      {
        title: "Behind on the payment",
        body: "A job change or a split household can put a Tempe house behind. If a trustee sale is recorded, the date on the notice is the clock.",
      },
    ],
    neighborhoods: [
      {
        name: "Near campus and Maple-Ash",
        note: "Older, smaller houses near Arizona State University, many rented to students. Occupancy, lease dates and wear matter as much as the roof, and showing a house full of roommates is hard. A private sale avoids that.",
      },
      {
        name: "South Tempe",
        note: "More suburban streets south of the US-60, some with associations, many owner-occupied for decades. A quieter, private sale is often the point for these owners.",
      },
      {
        name: "Near Tempe Town Lake",
        note: "Higher prices and more condos and townhomes. Association payoff letters and rental rules can take longer than the loan payoff, so we start them early.",
      },
      {
        name: "North Tempe",
        note: "Closer to the 202, Papago and Phoenix, with smaller lots and older houses. Still worth a look; still needs the actual address.",
      },
    ],
    localNotes: [
      {
        title: "Tenants and lease dates",
        body: "Tell us how many people live there, whether rent is current and when each lease ends. An occupied house is a different number and timeline than a vacant one.",
      },
      {
        title: "Condos are a separate conversation",
        body: "For a condo or townhome, the association, its rental rules and any assessment decide whether a cash sale fits. We will say so if it does not.",
      },
      {
        title: "Selling from out of state",
        body: "Heirs and landlords often live elsewhere. Title companies can usually arrange remote signing once your authority to sign is documented.",
      },
    ],
    moreFaqs: [
      {
        question: "Can you buy a house near ASU with students living in it?",
        answer:
          "Often, yes. Tell us how many tenants, whether rent is paid and when the leases end. Each one changes the number and the closing date.",
      },
      {
        question: "Will you buy a Tempe house in good condition?",
        answer:
          "Yes. If listing would likely net more and you have time, we will tell you that and you can compare.",
      },
      {
        question: "Do I need to be in Arizona to sell?",
        answer:
          "Usually not. The title company can arrange remote or mobile signing. We will tell you what they need before you commit.",
      },
    ],
  },

  glendale: {
    heroLine:
      "Catlin Court to Arrowhead, west Glendale to Grand Avenue. Older block homes and newer HOA streets, bought as-is with the tradeoffs said out loud.",
    situations: [
      {
        title: "A long-owned block house that needs work",
        body: "West Glendale has many houses like Maryvale's: solid block, original systems, long-time owners. You can sell without replacing the roof or the cooler first.",
      },
      {
        title: "A rental with a tenant problem",
        body: "Late rent, a lease that still has months, or a tenant who will not move. Tell us which one, because each changes the number and the timing.",
      },
      {
        title: "Payment trouble north of the 101",
        body: "Newer Arrowhead-area houses carry bigger payments and HOA dues. A job change can put them behind quickly, and the sale date on the notice is the deadline.",
      },
      {
        title: "Only the sale date in hand",
        body: "If all you have is the notice, put the address and the sale date on the form. That date tells us whether there is enough time to open a title file.",
      },
    ],
    neighborhoods: [
      {
        name: "Downtown Glendale and Catlin Court",
        note: "Older houses and smaller lots near the historic downtown, including the Catlin Court historic district. Condition, permits and who is on the title matter more than a fresh coat of paint.",
      },
      {
        name: "West Glendale",
        note: "Block homes and long-time owners, close in feel to Maryvale, plus newer streets toward the stadium and Westgate area. Deferred repairs are normal on these calls.",
      },
      {
        name: "Arrowhead and north of the 101",
        note: "Newer master-planned streets, HOAs and higher payments. A pretty elevation can still be behind, and the association payoff belongs on the first call next to the loan balance.",
      },
      {
        name: "Along Grand Avenue",
        note: "Mixed edges, older houses and some rentals along the diagonal corridor. Tell us if a tenant is in the house before we talk price.",
      },
    ],
    localNotes: [
      {
        title: "Two different Glendales",
        body: "The older grid south of the Loop and the newer HOA streets north of it are priced differently. Send the address, not the freeway exit.",
      },
      {
        title: "No photo-ready kitchen needed",
        body: "Call even if the house is not ready for pictures. We look at it as it is and price the work in.",
      },
      {
        title: "When a sale will not clear the loan",
        body: "If the payoff is larger than a cash price, we will say that before anyone spends a week on paperwork, and explain the other paths.",
      },
    ],
    moreFaqs: [
      {
        question: "Do you buy houses in Arrowhead Ranch?",
        answer:
          "Yes. Tell us the community and whether dues are current. The title company pays the association from the sale.",
      },
      {
        question: "Can I sell a Glendale house that has unpermitted work?",
        answer:
          "Usually, yes. Unpermitted additions change the number, not whether we can buy. Tell us about them early.",
      },
      {
        question: "Is there a cost to get an offer?",
        answer: "No. There is no fee to ask, and no fee if you say no.",
      },
    ],
  },

  peoria: {
    heroLine:
      "Old Town near Grand Avenue up to Vistancia and Lake Pleasant. A Peoria cash sale, or a straight talk about a mortgage that is behind.",
    situations: [
      {
        title: "A long commute and a payment that stopped fitting",
        body: "Many north Peoria owners bought farther out for space. A job change or a second car payment can push the mortgage behind.",
      },
      {
        title: "A vacant house you are paying for",
        body: "Utilities, insurance and HOA dues on a house nobody lives in. Vacant is fine; tell us if the power is off so we plan the visit around daylight.",
      },
      {
        title: "A tired rental in Old Town",
        body: "Older systems, turnover wear, and a tenant situation you are done managing. We buy as-is and price the repairs in.",
      },
      {
        title: "A low-rate loan in a newer subdivision",
        body: "If the rate is the best part of the deal, we can explain what a takeover would and would not do. Your name can stay on that loan.",
      },
    ],
    neighborhoods: [
      {
        name: "Old Town Peoria",
        note: "The older grid near Grand Avenue and Washington Street. Smaller houses, older systems and owners who have been there a long time. Deferred repairs are normal and priced in.",
      },
      {
        name: "North of the 101",
        note: "Newer subdivisions and HOAs around the sports complex and Arrowhead area. The payment and the dues are usually the stress, not a crumbling foundation.",
      },
      {
        name: "Vistancia",
        note: "A large master-planned community farther north, with association rules title will ask about. A different price than Old Town, and a longer payoff checklist.",
      },
      {
        name: "Toward Lake Pleasant",
        note: "Farther out with larger lots on some streets. We still drive it if the numbers can work. The first step is the address, not a listing appointment.",
      },
    ],
    localNotes: [
      {
        title: "HOAs in north Peoria",
        body: "Most newer Peoria streets have an association. It can slow the paperwork and add a balance, but it rarely makes the house unsellable.",
      },
      {
        title: "Distance does not change the clock",
        body: "Peoria is Maricopa County. A Notice of Trustee's Sale here follows the same county timeline as Phoenix.",
      },
      {
        title: "Vacant houses",
        body: "A vacant house is fine. Tell us about the utilities and access so the walkthrough is not wasted.",
      },
    ],
    moreFaqs: [
      {
        question: "Do you buy houses in Vistancia?",
        answer:
          "Yes. Tell us the village and whether dues are current. The association payoff and transfer fees are handled at closing.",
      },
      {
        question: "Can you buy a Peoria house with a tenant?",
        answer:
          "Often, yes. Tell us whether the lease is current and when it ends. That changes the number and the timeline.",
      },
      {
        question: "Will a cash offer be lower than listing?",
        answer:
          "Usually. We buy as-is and take on the repairs and the wait. If listing would net more and you have time, we will say so.",
      },
    ],
  },

  surprise: {
    heroLine:
      "Original Surprise, Marley Park, north Surprise and near the age-restricted communities. No listing, no staging, no new carpet first.",
    situations: [
      {
        title: "A payment set when life looked steadier",
        body: "Surprise grew fast, and many loans were sized for a two-income household or a shorter commute. A job change is enough to put a house behind.",
      },
      {
        title: "A parent's house in an age-restricted community",
        body: "Heirs often inherit in communities with age rules. Those rules can limit who can hold title, so tell us the community before anyone assumes a buyer can take the deed.",
      },
      {
        title: "HOA dues on top of everything",
        body: "Planned neighborhoods mean an association. Unpaid dues and fines are paid from a sale, but the payoff letter has to be ordered early.",
      },
      {
        title: "A sale date only weeks away",
        body: "Put the date on the form. Title work needs more than a weekend, and we will tell you on the first call if the date is already too close.",
      },
    ],
    neighborhoods: [
      {
        name: "Original Surprise",
        note: "The original townsite near Grand Avenue: older, smaller houses than the newer north side. Repairs and long ownership are common, and we price them in.",
      },
      {
        name: "Marley Park and planned neighborhoods",
        note: "HOA streets with parks and amenities. The association estoppel can take as long as the loan payoff, so we ask for the community name on the first call.",
      },
      {
        name: "North Surprise",
        note: "Newer houses, bigger payments and a longer drive into the Valley. Being new does not mean the loan is current.",
      },
      {
        name: "Near age-restricted communities",
        note: "Surprise has large age-restricted communities. Their rules can limit who can hold title or live there. Say so on the first call so we do not waste the week.",
      },
    ],
    localNotes: [
      {
        title: "Age rules decide the paperwork",
        body: "In an age-restricted community, the rules can decide whether a sale to us can be written at all. We check before we make promises.",
      },
      {
        title: "No staging or carpet first",
        body: "We do not ask you to list, stage or replace anything. The offer accounts for what the house needs.",
      },
      {
        title: "The same county clock",
        body: "Northwest Valley trustee sales do not get extra time because the house is far from downtown Phoenix. The notice date controls.",
      },
    ],
    moreFaqs: [
      {
        question: "Do you buy houses in Marley Park?",
        answer:
          "Yes. Tell us whether dues are current. The title company pays the association from the sale at closing.",
      },
      {
        question: "Can I sell a Surprise house I inherited from out of state?",
        answer:
          "Usually, once your authority to sign is documented. Title companies can arrange remote signing.",
      },
      {
        question: "How soon will someone call me?",
        answer:
          "Patrick or Jaime call during business hours, 8:00 a.m. to 7:00 p.m., seven days. If you send the address after that, we call the next morning.",
      },
    ],
  },

  avondale: {
    heroLine:
      "Historic Avondale, Garden Lakes, north of I-10 and the west edge. Repairs, city notices and leftover belongings included in an as-is offer.",
    situations: [
      {
        title: "A city notice or lien on the house",
        body: "Old repair notices or city liens can still be sold through. They become payoff lines at the title company, not a reason to hide the house.",
      },
      {
        title: "Divorce or a spouse who moved out",
        body: "If both of you are on the title, both of you sign. We can explain that part without making you retell the whole story.",
      },
      {
        title: "A newer house with a payment that stretched",
        body: "Many production homes north of I-10 were bought with bigger payments. A move, a layoff or a split household can put them behind.",
      },
      {
        title: "A full house to clear out",
        body: "Leftover furniture, a garage of tools, a yard that got away. You can take what you want and leave the rest.",
      },
    ],
    neighborhoods: [
      {
        name: "Historic Avondale",
        note: "Older houses south of the freeway around Western Avenue. Deferred repairs and smaller lots are normal, and the repair list is priced into the offer.",
      },
      {
        name: "Garden Lakes",
        note: "A known west-side community with lakes, its own streets and, in places, an association. Tell us if dues are behind so the payoff can be ordered early.",
      },
      {
        name: "North of I-10",
        note: "Newer production homes from the 2000s onward. The stress is often the payment, a move or a divorce, not a house from 1965.",
      },
      {
        name: "Toward the west edge",
        note: "Closer to Goodyear and the raceway in feel. Still Maricopa County for a trustee sale; the date does not move because the drive is longer.",
      },
    ],
    localNotes: [
      {
        title: "Notices are payoff lines",
        body: "Bring any city notice or lien to the first call. It usually becomes a payoff or a repair we take on, not a deal-breaker.",
      },
      {
        title: "South versus north of I-10",
        body: "The historic streets south of the freeway and the newer ones north of it do not share a price. Say which one you are in.",
      },
      {
        title: "You know the costs before you sign",
        body: "A cash sale handles repairs, leftover belongings and title costs. You see the number and what it includes before signing anything.",
      },
    ],
    moreFaqs: [
      {
        question: "Do you buy houses in Garden Lakes?",
        answer:
          "Yes. Tell us the address and whether any association dues are behind. The title company pays them from the sale.",
      },
      {
        question: "Do I need to clean out the house first?",
        answer: "No. Take what you want and leave the rest.",
      },
      {
        question: "Can you buy if I owe more than the house is worth?",
        answer:
          "Sometimes not with cash. If a sale would not pay off the loan, we will say so and explain other options, including talking to your lender or a lawyer.",
      },
    ],
  },


  goodyear: {
    heroLine:
      "Estrella, Palm Valley, PebbleCreek and the newer streets near I-10. No listing, no staging, and no new paint first.",
    situations: [
      {
        title: "A newer payment that got too big",
        body: "Many Goodyear houses were bought recently, at recent prices. A job change or a second income that stopped is enough to put the payment behind.",
      },
      {
        title: "HOA dues and fines piling up",
        body: "Most Goodyear streets have an association. Unpaid dues are paid from a sale at closing, but the payoff letter has to be ordered early.",
      },
      {
        title: "A parent's house in PebbleCreek",
        body: "Heirs often inherit in age-restricted communities. Tell us the community so we check its rules before anyone promises a closing date.",
      },
      {
        title: "Moving for work",
        body: "A transfer or a new job somewhere else. You pick the closing date and can sign from where you land.",
      },
    ],
    localNotes: [
      {
        title: "Master-planned means paperwork",
        body: "The association's transfer and payoff letter can take as long as the loan payoff. We ask for the community name on the first call.",
      },
      {
        title: "Recent loans leave less room",
        body: "With a newer loan, there may be little left after the payoff. We will say so plainly instead of making an offer that cannot close.",
      },
      {
        title: "Same county clock",
        body: "A Goodyear notice is recorded with the Maricopa County Recorder. The 91-day minimum is the same as anywhere in the Valley.",
      },
    ],
    moreFaqs: [
      {
        question: "Do you buy in Palm Valley?",
        answer: "Yes. Send the address and tell us whether the HOA dues are current.",
      },
      {
        question: "How soon will someone call me?",
        answer:
          "Patrick or Jaime call during business hours, 8:00 a.m. to 7:00 p.m., seven days. If you send the address after that, we call the next morning.",
      },
    ],
  },

  buckeye: {
    heroLine:
      "Verrado, Sundance, Festival Ranch and the older lots near downtown. New or old, behind or not, we look at the address first.",
    situations: [
      {
        title: "A long commute and a big payment",
        body: "Many Buckeye owners drive a long way to work. When the job moves or the costs add up, the payment is what breaks first.",
      },
      {
        title: "Bought near the top",
        body: "Some Buckeye houses were bought at recent highs. We look at the payoff first and tell you plainly whether a cash sale covers it.",
      },
      {
        title: "Older houses on larger lots",
        body: "Wells, septic systems and additions are common near downtown and on acreage. We price them in instead of asking you to fix them.",
      },
      {
        title: "Selling a rental from far away",
        body: "Investors bought many Buckeye houses to rent. We can buy with the tenant in place and take over the lease.",
      },
    ],
    localNotes: [
      {
        title: "HOA and district charges",
        body: "Some newer Buckeye communities have HOA dues and special district charges on the tax bill. Title sorts out what has to be paid at closing.",
      },
      {
        title: "Wells and septic",
        body: "Outside the newer subdivisions, a house may be on a well or septic. Tell us on the first call so we ask the right questions.",
      },
      {
        title: "Same county clock",
        body: "Buckeye is in Maricopa County. A notice is recorded there, and the 91-day minimum is the same.",
      },
    ],
    moreFaqs: [
      {
        question: "Do you buy in Verrado?",
        answer: "Yes. Tell us whether the HOA dues are current. The title company pays the association at closing.",
      },
      {
        question: "How soon will someone call me?",
        answer:
          "Patrick or Jaime call during business hours, 8:00 a.m. to 7:00 p.m., seven days. If you send the address after that, we call the next morning.",
      },
    ],
  },

  "queen-creek": {
    heroLine:
      "Horse property, acreage, Hastings Farms and the newer HOA streets. As-is, with the barn, the well and the additions included.",
    situations: [
      {
        title: "Acreage a lender will not appraise easily",
        body: "Horse setups, wells, guest houses and additions can make a financed sale slow. A cash buyer looks at the property as it is.",
      },
      {
        title: "A newer payment that stopped working",
        body: "Newer Queen Creek houses often come with bigger loans and HOA dues. A change in income is enough to put one behind.",
      },
      {
        title: "Too much land to keep up",
        body: "Owners who are tired of the upkeep on a large lot, or who are ready to downsize, call us before they spend money fixing it.",
      },
      {
        title: "A notice from the wrong county",
        body: "Part of Queen Creek is in Pinal County. If your notice came from the Pinal County Recorder, tell us, so we look at the right records.",
      },
    ],
    localNotes: [
      {
        title: "Two counties, one town",
        body: "Most of Queen Creek is in Maricopa County, but part is in Pinal County. The county on your deed decides where records and notices are filed.",
      },
      {
        title: "Wells, septic and animals",
        body: "Acreage brings questions a subdivision house does not. Tell us what is there and we price it in.",
      },
      {
        title: "HOA letters on newer streets",
        body: "Newer communities have associations. Their payoff letter is ordered early so it does not hold up closing.",
      },
    ],
    moreFaqs: [
      {
        question: "Do you buy in Hastings Farms?",
        answer: "Yes. Send the address and tell us whether the HOA dues are current.",
      },
      {
        question: "How soon will someone call me?",
        answer:
          "Patrick or Jaime call during business hours, 8:00 a.m. to 7:00 p.m., seven days. If you send the address after that, we call the next morning.",
      },
    ],
  },

  "sun-city": {
    heroLine:
      "Sun City and Sun City West, sold as they are: original kitchens, older systems and a lifetime of belongings. Often handled by family, often from out of state.",
    situations: [
      {
        title: "A parent moving to assisted living",
        body: "The move happens on the facility's schedule, not the market's. A cash sale can help pay for care without months of showings.",
      },
      {
        title: "An inherited house, heirs out of state",
        body: "Many Sun City sellers are children who live elsewhere. Title companies can arrange signing remotely, and we can meet whoever has the key.",
      },
      {
        title: "A house held in a trust",
        body: "Many owners put the house in a living trust. A successor trustee can often sell without probate, with the trust documents.",
      },
      {
        title: "Original systems and finishes",
        body: "Older roofs, plumbing and kitchens are common. We buy as-is, so the family does not have to update anything first.",
      },
    ],
    localNotes: [
      {
        title: "Age rules come first",
        body: "Sun City and Sun City West are age-restricted. We check how those rules affect a sale before we promise a date.",
      },
      {
        title: "Recreation center paperwork",
        body: "Each community has its own recreation centers, and a sale includes their paperwork and any fees a buyer owes. Title handles it at closing.",
      },
      {
        title: "The right document to sign",
        body: "A power of attorney, trust papers, or court letters for an estate. The title company will ask for whichever gives the seller authority.",
      },
    ],
    moreFaqs: [
      {
        question: "Do you buy in Sun City West too?",
        answer: "Yes. Tell us which community the house is in, because the rules and paperwork differ.",
      },
      {
        question: "How soon will someone call me?",
        answer:
          "Patrick or Jaime call during business hours, 8:00 a.m. to 7:00 p.m., seven days. If you send the address after that, we call the next morning.",
      },
    ],
  },

  "el-mirage": {
    heroLine:
      "Rancho El Mirage, the original townsite and the 2000s subdivisions near Luke. Rentals, military moves and houses that are behind.",
    situations: [
      {
        title: "Moving on military orders",
        body: "Families at Luke Air Force Base often have a fixed report date. We plan the closing around it, and you can sign from your next duty station.",
      },
      {
        title: "A rental you are done managing",
        body: "Many El Mirage houses are rented. We can buy with the tenant in place, so you do not have to wait for the lease to end.",
      },
      {
        title: "A payment that is behind",
        body: "A missed payment can turn into a recorded notice. Tell us the date on it, and we work backward to a closing title can meet.",
      },
      {
        title: "Deferred repairs",
        body: "AC units, roofs and flooring that were put off. We buy as-is, and the condition is part of the number.",
      },
    ],
    localNotes: [
      {
        title: "Mostly HOA streets",
        body: "Most El Mirage houses are in 2000s subdivisions with an association. The payoff letter is ordered early.",
      },
      {
        title: "Close to Luke",
        body: "Military moves come with fixed dates. Tell us yours on the first call.",
      },
      {
        title: "Same county clock",
        body: "El Mirage is in Maricopa County. A notice is recorded there, and the 91-day minimum is the same.",
      },
    ],
    moreFaqs: [
      {
        question: "Do you buy in Rancho El Mirage?",
        answer: "Yes. Send the address and tell us whether the HOA dues are current.",
      },
      {
        question: "How soon will someone call me?",
        answer:
          "Patrick or Jaime call during business hours, 8:00 a.m. to 7:00 p.m., seven days. If you send the address after that, we call the next morning.",
      },
    ],
  },

  laveen: {
    heroLine:
      "Newer subdivisions along Baseline, older acreage and houses near South Mountain. As-is, with the tenant, the well or the second loan.",
    situations: [
      {
        title: "A 2000s loan that never recovered",
        body: "Some Laveen houses were bought or refinanced at a high point. We look at the first and any second loan before we name a number.",
      },
      {
        title: "Older property on a larger lot",
        body: "Irrigation, wells, animals and additions. A cash buyer can be simpler than a lender who struggles to appraise it.",
      },
      {
        title: "A rental with a tenant in it",
        body: "Many Laveen houses are rented. We can buy with the lease in place.",
      },
      {
        title: "A notice already recorded",
        body: "Tell us the date on it. Title work needs time, and we will say on the first call if the date is already too close.",
      },
    ],
    localNotes: [
      {
        title: "Phoenix, mostly",
        body: "Most of Laveen is in the City of Phoenix, and some addresses are county land. City or county, the sale works the same way.",
      },
      {
        title: "Second loans",
        body: "If there is a HELOC or second mortgage, tell us. It is paid from the sale too, and it changes the room after payoff.",
      },
      {
        title: "Same county clock",
        body: "Laveen is in Maricopa County. A notice is recorded there, and the 91-day minimum is the same.",
      },
    ],
    moreFaqs: [
      {
        question: "Do you buy near South Mountain?",
        answer: "Yes. Send the address and tell us about any HOA.",
      },
      {
        question: "How soon will someone call me?",
        answer:
          "Patrick or Jaime call during business hours, 8:00 a.m. to 7:00 p.m., seven days. If you send the address after that, we call the next morning.",
      },
    ],
  },
};

export function getAreaExtras(slug: string): AreaExtras | undefined {
  return areaExtras[slug];
}
