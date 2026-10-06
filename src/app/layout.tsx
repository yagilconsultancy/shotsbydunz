import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bodoni-moda/opsz.css";
import "@fontsource-variable/instrument-sans";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBookBar from "@/components/MobileBookBar";
import PreviewBanner from "@/components/PreviewBanner";
import { site } from "@/content/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | Event videographer in London, Ontario`,
    template: `%s | ${site.name}`,
  },
  description:
    "Event photography and film, brand content and SBD Booth photobooth rentals in London, Ontario.",
  openGraph: {
    title: site.name,
    description: site.tagline,
    images: ["/images/hero-wedding.jpg"],
    siteName: site.name,
    locale: "en_CA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#110d12",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <PreviewBanner />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <MobileBookBar />
      </body>
    </html>
  );
}
