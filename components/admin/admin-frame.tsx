"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { logoutAdmin } from "@/lib/admin/actions";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pipeline", label: "Lead pipeline" },
  { href: "/admin/sheet-listings", label: "Sheet listings" },
  { href: "/admin/media", label: "Media library" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/bank", label: "Data bank" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminFrame({
  name,
  current,
  children,
}: {
  name: string;
  current: string;
  children: ReactNode;
}) {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-full bg-paper md:flex md:h-dvh md:overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-navy px-4 py-2 text-white md:hidden">
        <Link href="/admin" className="inline-flex min-h-11 flex-col justify-center">
          <span className="text-lg font-semibold leading-none">Vamos</span>
          <span className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/70">Command center</span>
        </Link>
        <button
          type="button"
          className="inline-flex min-h-11 items-center px-3 text-sm text-white"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((value) => !value)}
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>
      <aside
        className={`${mobileOpen ? "block" : "hidden"} ${desktopOpen ? "md:block" : "md:hidden"} border-b border-line bg-navy text-white md:h-full md:w-64 md:overflow-y-auto md:border-b-0 md:border-r`}
      >
        <div className="hidden items-center justify-between px-4 py-4 md:flex">
          <Link href="/admin" className="inline-flex min-h-11 flex-col justify-center">
            <span className="text-lg font-semibold leading-none">Vamos</span>
            <span className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/70">Command center</span>
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 items-center px-2 text-sm text-white/80"
            onClick={() => setDesktopOpen(false)}
          >
            Hide
          </button>
        </div>
        <nav className="grid px-2 pb-4" aria-label="Admin">
          {links.map((link) => {
            const active = current === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center px-3 text-sm ${active ? "bg-white/10 text-amber" : "text-white/85"}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
          <span className="text-sm text-white/80">{name}</span>
          <form action={logoutAdmin}>
            <button type="submit" className="inline-flex min-h-11 items-center text-sm text-white">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1 md:overflow-y-auto">
        {desktopOpen ? null : (
          <div className="hidden border-b border-line bg-navy px-4 py-2 text-white md:block">
            <button type="button" className="inline-flex min-h-11 items-center text-sm" onClick={() => setDesktopOpen(true)}>
              Show menu
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
