import type { Metadata } from "next";
import Link from "next/link";
import { faqGroups } from "@/content/faq";
import styles from "./faq.module.css";

export const metadata: Metadata = {
  title: "Questions",
  description: "Deposits, travel, turnaround, music, raw footage and SBD Booths, answered.",
};

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((g) =>
      g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
    ),
  };

  return (
    <>
      <section className="container page-hero">
        <h1>Questions</h1>
        <p className="lede">
          The things people ask before booking. Still unsure? <Link href="/contact" className="text-link">Message me</Link>.
        </p>
      </section>
      <section className={`container ${styles.wrap}`}>
        <nav className={styles.toc} aria-label="Topics">
          {faqGroups.map((g) => (
            <a key={g.title} href={`#${g.title.toLowerCase().replace(/\s+/g, "-")}`}>
              {g.title}
            </a>
          ))}
        </nav>
        <div className={styles.groups}>
          {faqGroups.map((g) => (
            <section key={g.title} id={g.title.toLowerCase().replace(/\s+/g, "-")} aria-labelledby={`h-${g.title}`}>
              <h2 id={`h-${g.title}`} className={styles.groupTitle}>
                {g.title}
              </h2>
              <div className={styles.items}>
                {g.items.map((i) => (
                  <details key={i.q}>
                    <summary>{i.q}</summary>
                    <p>{i.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
