"use client";

import { usePathname } from "next/navigation";
import { CallBar } from "@/components/marketing/call-bar";

export function CallBarLive() {
  const spanish = usePathname().startsWith("/es");
  return <CallBar spanish={spanish} />;
}
