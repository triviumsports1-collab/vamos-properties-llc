const items = [
  ["No fee to ask", "Looking at the address costs nothing."],
  ["As-is", "No repairs, and no parade of showings."],
  ["Same-day reply", "Our specialists call during the day."],
  ["You can say no", "An offer is not a promise to sell."],
];

export function TrustRow() {
  return (
    <section className="border-b border-line bg-panel">
      <ul className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([title, body]) => (
          <li key={title}>
            <p className="text-sm font-semibold text-ink">{title}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
