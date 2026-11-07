import Script from "next/script";
import { site } from "@/lib/site";

/**
 * Google Tag Manager (GTM-5XGG59XD).
 * dataLayer + gtag() initialize in the document head. gtm.js loads after
 * hydration (Next.js recommendation for tag managers). The noscript iframe
 * belongs immediately after the opening body tag.
 */
export function GoogleTagManager() {
  const id = site.gtmId;
  if (!id) return null;

  return (
    <>
      <Script id="gtm-datalayer" strategy="beforeInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});`}
      </Script>
      <Script
        id="gtm-script"
        src={`https://www.googletagmanager.com/gtm.js?id=${id}`}
        strategy="afterInteractive"
      />
    </>
  );
}

export function GoogleTagManagerNoscript() {
  const id = site.gtmId;
  if (!id) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0"
        width="0"
        title="Google Tag Manager"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
