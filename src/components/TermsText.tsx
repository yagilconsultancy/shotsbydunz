import Link from "next/link";
import { boothTerms, videoTerms } from "@/content/terms";
import styles from "./TermsText.module.css";

export type TermsSection = "video" | "booth";

const sectionInfo: Record<TermsSection, { title: string; items: { title: string; points: string[] }[] }> = {
  video: { title: "Video bookings", items: videoTerms },
  booth: { title: "SBD Booths", items: boothTerms },
};

// The terms, readable in place, so clients see them before they book or pay. The same text
// as /terms, which stays the full page for sharing and printing.
export default function TermsText({ sections }: { sections: TermsSection[] }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.box} tabIndex={0} role="region" aria-label="Terms and conditions">
        {sections.map((key) => (
          <section key={key} className={styles.section}>
            <h3 className={styles.h3}>{sectionInfo[key].title}</h3>
            <ol className={styles.list}>
              {sectionInfo[key].items.map((t) => (
                <li key={t.title}>
                  <h4>{t.title}</h4>
                  <ul>
                    {t.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <p className={styles.small}>
        Also on the{" "}
        <Link href="/terms" target="_blank" className="text-link">
          terms page
        </Link>{" "}
        and in our{" "}
        <Link href="/privacy" target="_blank" className="text-link">
          privacy policy
        </Link>
        .
      </p>
    </div>
  );
}
