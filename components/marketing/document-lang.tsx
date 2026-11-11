"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isSpanish } from "@/lib/i18n/routes";

/** Keeps `<html lang>` in sync on client navigations. The root head script sets it before first paint. */
export function DocumentLang() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = isSpanish(pathname) ? "es" : "en";
  }, [pathname]);
  return null;
}
