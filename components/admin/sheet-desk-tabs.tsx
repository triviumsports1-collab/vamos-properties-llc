import Link from "next/link";
import { sheetDeskHref, type SheetDeskQuery, type SheetDeskTab } from "@/lib/gdoc-listings/desk-href";

export function SheetDeskTabs({ query, tab }: { query: SheetDeskQuery; tab: SheetDeskTab }) {
  const inventoryHref = sheetDeskHref({ ...query, tab: "inventory" });
  const rulesHref = sheetDeskHref({ ...query, tab: "rules" });

  return (
    <nav className="flex overflow-x-auto border-b border-line touch-scroll" aria-label="Sheet desk sections">
      <TabLink href={inventoryHref} active={tab === "inventory"}>
        Listings inventory
      </TabLink>
      <TabLink href={rulesHref} active={tab === "rules"}>
        Pricing rules
      </TabLink>
    </nav>
  );
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`-mb-px inline-flex min-h-12 shrink-0 items-center border-b-2 px-4 text-sm font-semibold motion-safe:transition-colors ${
        active ? "border-amber text-ink" : "border-transparent text-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
