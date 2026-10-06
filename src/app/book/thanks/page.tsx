import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Request sent", robots: { index: false } };

type Props = { searchParams: Promise<{ name?: string }> };

export default async function ThanksPage({ searchParams }: Props) {
  const { name } = await searchParams;
  return (
    <section className="container page-hero" style={{ paddingBottom: "clamp(64px, 10vw, 128px)", maxWidth: 820 }}>
      <h1>Request sent{name ? `, ${name.slice(0, 40)}` : ""}.</h1>
      <p className="lede">
        I’ve got your details. {site.replyPromise} with availability and your quote. A copy of your request is on its
        way to your inbox.
      </p>
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
