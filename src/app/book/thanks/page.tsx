import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Request sent", robots: { index: false } };

type Props = { searchParams: Promise<{ type?: string }> };

// Only the fixed word "deposit" changes the wording; nothing from the address is shown.
export default async function ThanksPage({ searchParams }: Props) {
  const deposit = (await searchParams).type === "deposit";
  return (
    <section className="container page-hero" style={{ paddingBottom: "clamp(64px, 10vw, 128px)", maxWidth: 820 }}>
      <h1>{deposit ? "Booking and deposit received." : "Request sent."}</h1>
      {deposit ? (
        <p className="lede">
          I’ll check the e-transfer and confirm your date within 24 hours. Your date is secured once you get my
          confirmation email. A copy of your booking is on its way to your inbox.
        </p>
      ) : (
        <p className="lede">
          I’ve got your details and I’ll reply within 24 hours with availability and your quote. A copy of your request is on
          its way to your inbox.
        </p>
      )}
      <p className="muted">While you wait, see what I’ve been filming lately.</p>
      <div className="btn-row">
        <a href={site.socials.instagram.href} className="btn btn-primary" target="_blank" rel="noopener">
          Follow on Instagram
        </a>
        <Link href="/portfolio" className="btn btn-ghost">
          Watch more work
        </Link>
      </div>
    </section>
  );
}
