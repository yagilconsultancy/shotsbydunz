import type { Metadata } from "next";
import { boothTerms, videoTerms } from "@/content/terms";
import { site } from "@/content/site";
import styles from "./terms.module.css";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "Booking, payment, cancellation and usage terms for ShotsByDunz and SBD Booths.",
};

function Block({ items }: { items: { title: string; points: string[] }[] }) {
  return (
    <ol className={styles.list}>
      {items.map((t) => (
        <li key={t.title}>
          <h3>{t.title}</h3>
          <ul>
            {t.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export default function TermsPage() {
  return (
    <>
      <section className="container page-hero">
        <h1>Terms and conditions</h1>
        <p className="lede">
          By booking with {site.name}, you agree to these terms. Questions or custom requests? Email{" "}
          <a href={`mailto:${site.email}`} className="text-link">{site.email}</a>.
        </p>
        <nav className={styles.jump} aria-label="Sections">
          <a href="#video">Video bookings</a>
          <a href="#booth">SBD Booths</a>
        </nav>
      </section>
      <section id="video" className="container section-tight">
        <h2 className={styles.h2}>Video bookings</h2>
        <Block items={videoTerms} />
      </section>
      <section id="booth" className="container section-tight" style={{ paddingBottom: "clamp(64px, 10vw, 128px)" }}>
        <h2 className={styles.h2}>SBD Booths</h2>
        <Block items={boothTerms} />
      </section>
    </>
  );
}
