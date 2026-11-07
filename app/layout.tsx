import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { GoogleTagManager, GoogleTagManagerNoscript } from "@/components/marketing/google-tag-manager";
import { site } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Vamos Properties LLC",
    template: "%s · Vamos Properties",
  },
  description:
    "Phoenix homeowners can ask Patrick and Jaime for a cash offer or help with a mortgage that is behind.",
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-paper font-sans text-ink antialiased">
        <GoogleTagManagerNoscript />
        {children}
        <GoogleTagManager />
      </body>
    </html>
  );
}
