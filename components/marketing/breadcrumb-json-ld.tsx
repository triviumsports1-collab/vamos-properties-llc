import { JsonLd } from "@/components/marketing/json-ld";
import { site } from "@/lib/site";

/** BreadcrumbList JSON-LD. `path` values are site-relative ("/" for home). */
export function BreadcrumbJsonLd({ items }: { items: Array<{ name: string; path: string }> }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.path === "/" ? site.url : `${site.url}${item.path}`,
        })),
      }}
    />
  );
}
