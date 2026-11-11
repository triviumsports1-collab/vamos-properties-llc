"use client";

import { usePathname } from "next/navigation";
import { WhatsAppButton } from "@/components/marketing/whatsapp-button";

export function WhatsAppButtonLive() {
  const spanish = usePathname().startsWith("/es");
  return <WhatsAppButton spanish={spanish} />;
}
