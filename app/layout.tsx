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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Vamos Properties LLC",
    template: "%s · Vamos Properties",
  },
  description:
    "Phoenix homeowners can ask Patrick and Jaime for a cash offer or help with a mortgage that is behind.",
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    images: [{ url: site.ogImagePath, alt: site.ogImageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    images: [site.ogImagePath],
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/icon.png",
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}try{var p=location.pathname;document.documentElement.lang=(p==="/es"||p.indexOf("/es/")===0)?"es":"en";}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="192x192" />
        <link rel="shortcut icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
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
