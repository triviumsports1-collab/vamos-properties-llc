export type Faq = { question: string; answer: string };

export const homeFaqs: Faq[] = [
  {
    question: "Do I have to accept the offer?",
    answer:
      "No. Asking is a conversation. You can say no, keep the house, or keep talking to your lender or a lawyer while you decide.",
  },
  {
    question: "Who actually calls me?",
    answer:
      "A dedicated Vamos Properties specialist. Not a call center, and not a different person every time the file moves. The specialist on the first call stays with you through title.",
  },
  {
    question: "What if I still owe more than the house is worth?",
    answer:
      "Tell us the balance. We will say plainly whether a cash sale can pay the loan off, or whether taking over the payments is even worth a conversation. We will not pretend every house has equity.",
  },
  {
    question: "How fast can we talk?",
    answer:
      "During the day, from 8:00 a.m. to 7:00 p.m., one of us aims to call or text within a few minutes of the form. If it is late, you will hear from us in the morning.",
  },
  {
    question: "Will the offer match a listed price?",
    answer:
      "Usually not. A cash price sits below what a retail listing might bring, because you skip repairs, showings, and an agent commission, and you pick the date. We show that math before you decide.",
  },
  {
    question: "Is there a fee to ask?",
    answer:
      "No. There is no charge to send the address or to hear a number. You pay nothing unless you choose to sell, and even then a cash closing is built so the usual agent commission is not taken from you.",
  },
  {
    question: "Can I sell if the house is a mess?",
    answer:
      "Yes. Peeling paint, a bad roof, leftover furniture, or a tenant who is still there does not stop the first call. The condition changes the number. It does not change whether you are allowed to ask.",
  },
  {
    question: "What if I am already listed with an agent?",
    answer:
      "That listing agreement controls. We will not step into the middle of it. If you and your agent end it the way the contract allows, we can talk after that.",
  },
];

export const cashFaqs: Faq[] = [
  {
    question: "How do you come up with the number?",
    answer:
      "We look at the address, what similar houses actually sell for nearby, what the house needs, and what it costs to close on your date. You can ask us to walk through that. You can also say no.",
  },
  {
    question: "How long does a cash closing take?",
    answer:
      "A clean title file often closes in a couple of weeks, sometimes a bit faster, sometimes longer if an heir, a spouse, or a lien has to be sorted out. We will not promise a seven-day close before we know those facts.",
  },
  {
    question: "Who pays the closing costs?",
    answer:
      "On a cash sale with us, the usual agent commission is not taken from your side, and the offer is built so you are not writing a separate check for our closing costs. You still see the settlement statement before you sign.",
  },
  {
    question: "Do I have to move out the day we close?",
    answer:
      "Not always. If you need a few days, say so before anyone drafts papers. A short occupancy only works if title can document it. We will answer that before you are holding boxes.",
  },
];

export const foreclosureFaqs: Faq[] = [
  {
    question: "How long do I have after a Notice of Trustee's Sale?",
    answer:
      "In Arizona, the trustee's sale generally cannot be held before the 91st day after the notice is recorded. The date that matters is the one printed on your notice. Confirm it, and do not wait until the week of the sale to ask for help.",
  },
  {
    question: "Does selling for cash remove the foreclosure from my credit?",
    answer:
      "A completed foreclosure is a serious mark. Selling before the trustee's sale, with the loan paid off at closing, can keep the sale itself from happening. We do not repair credit, and we cannot erase missed payments that are already on your report.",
  },
  {
    question: "Can I still talk to my lender?",
    answer:
      "Yes. Calling the servicer, a housing counselor, or a lawyer is still your right. A cash conversation with us does not replace that, and it does not stop you from asking the servicer about their own options.",
  },
  {
    question: "What if the sale date is only a few weeks away?",
    answer:
      "Tell us on the first call. Title has to order a payoff and clear who can sign. Some dates still work. Some are already too close. We would rather say that on day one than discover it the week of the auction.",
  },
  {
    question: "What should I have in front of me?",
    answer:
      "The notice, if you have it, a recent mortgage statement, and the names of everyone on the title. Photos can wait. The date and the balance cannot.",
  },
  {
    question: "What if a cash sale will not pay off what I owe?",
    answer:
      "Then we say so. Taking over the payments is a different path, and your name can stay on the loan. It is not a quieter version of a payoff.",
  },
];

export const takeoverFaqs: Faq[] = [
  {
    question: "Does the loan come out of my name?",
    answer:
      "Not by itself. In a payment takeover, the deed can transfer while the existing loan stays in your name. The lender may also have the right to call the loan due. We write down who is supposed to make the payments, and you should have a lawyer read it.",
  },
  {
    question: "What happens to my credit if a payment is missed later?",
    answer:
      "If the loan is still in your name and a payment is missed, your credit can still be hurt. That is the main risk of this path. A cash sale that pays the loan off at closing is the cleaner way off the mortgage.",
  },
  {
    question: "When is a takeover even worth talking about?",
    answer:
      "Usually when you are behind, a cash sale would leave little or nothing after the loan is paid, and the interest rate is low enough that keeping it is the point. If a cash sale pays the loan and leaves you money, we will say so.",
  },
  {
    question: "Who is supposed to make the payment after the deed transfers?",
    answer:
      "That has to be written down before you sign. A handshake is not a payment history. If the agreement is not clear about the amount, the due date, and what happens if it is late, do not sign it.",
  },
  {
    question: "Can the lender demand the full balance?",
    answer:
      "Many deeds of trust give the lender a due-on-sale right after the property transfers. We cannot promise a lender will stay quiet. That risk belongs in the conversation, not in a footnote after you move out.",
  },
  {
    question: "Is this the same as a new loan in your name?",
    answer:
      "No. We are not getting you a refinance, and we are not telling the bank to rewrite the note into our name. If what you need is your name off the mortgage, a cash sale that pays it off is the path that does that.",
  },
];
