import { Suspense } from "react";
import { CallBar, CallBarLive } from "@/components/marketing/call-bar";
import { SiteFooter, SiteFooterLive } from "@/components/marketing/site-footer";
import { SiteHeader, SiteHeaderLive } from "@/components/marketing/site-header";
import { WhatsAppButton, WhatsAppButtonLive } from "@/components/marketing/whatsapp-button";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Suspense fallback={<SiteHeader spanish={false} alternatePath="/es" />}>
        <SiteHeaderLive />
      </Suspense>
      <main id="content" className="pb-24 md:pb-0">
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
