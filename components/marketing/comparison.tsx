const rows = [
  ["Time", "Often one to three months", "Often a couple of weeks once title is clean", "Depends on the loan and title"],
  ["Repairs and showings", "Usually expected", "None", "None"],
  ["Agent commission", "Typically paid from the sale", "None from you", "None from you"],
  ["Your name on the loan", "Comes off when the loan is paid", "Comes off when the loan is paid at closing", "Can stay on the loan"],
  ["Who you talk to", "An agent, then the buyer’s lender", "Patrick or Jaime, then a title company", "Patrick or Jaime. The loan can stay in your name"],
  ["The closing date", "Depends on a buyer and their loan", "A date title can actually meet", "Depends on the payoff and the papers"],
  ["Fits when", "You can wait and want a retail price", "You want an as-is sale and a date", "A cash sale would leave little after the payoff"],
];

export function Comparison() {
  return (
    <section>
      <h2 className="text-3xl font-semibold text-ink sm:text-4xl">Three ways this can go</h2>
      <p className="mt-3 max-w-2xl leading-7 text-muted">
        A listed sale, a cash sale, and a payment takeover solve different problems. The cash sale is the one that pays the loan off and takes your name off it.
      </p>
      <div className="mt-6 overflow-x-auto border border-line touch-scroll">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">Listing, cash offer, and payment takeover compared</caption>
          <thead className="bg-navy text-white">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium"> </th>
              <th scope="col" className="px-4 py-3 font-medium">List with an agent</th>
              <th scope="col" className="bg-amber px-4 py-4 font-semibold text-amber-ink">Cash offer</th>
              <th scope="col" className="px-4 py-3 font-medium">Take over payments</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-t border-line">
                <th scope="row" className="px-4 py-3 font-medium text-ink">{row[0]}</th>
                <td className="px-4 py-3 text-muted">{row[1]}</td>
                <td className="bg-amber/15 px-4 py-4 text-ink">{row[2]}</td>
                <td className="px-4 py-3 text-muted">{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
