import { Suspense } from "react";
import { CallBar } from "@/components/marketing/call-bar";
import { DocumentLang } from "@/components/marketing/document-lang";
import { CallBarLive } from "@/components/marketing/call-bar-live";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteFooterLive } from "@/components/marketing/site-footer-live";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteHeaderLive } from "@/components/marketing/site-header-live";
import { WhatsAppButton } from "@/components/marketing/whatsapp-button";
import { WhatsAppButtonLive } from "@/components/marketing/whatsapp-button-live";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Suspense fallback={null}>
        <DocumentLang />
      </Suspense>
      <Suspense fallback={<SiteHeader spanish={false} alternatePath="/es" />}>
        <SiteHeaderLive />
      </Suspense>
      <main id="content" className="pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        {children}
      </main>
      <Suspense fallback={<SiteFooter spanish={false} alternatePath="/es" />}>
        <SiteFooterLive />
      </Suspense>
      <Suspense fallback={<CallBar spanish={false} />}>
        <CallBarLive />
      </Suspense>
      <Suspense fallback={<WhatsAppButton spanish={false} />}>
        <WhatsAppButtonLive />
      </Suspense>
    </>
  );
}
