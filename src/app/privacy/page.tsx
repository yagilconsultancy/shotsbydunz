import type { Metadata } from "next";
import { privacySections, privacyUpdated } from "@/content/privacy";
import { site } from "@/content/site";
import styles from "../terms/terms.module.css";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What ShotsByDunz collects through this website, why, and how to have it changed or deleted.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="container page-hero">
        <h1>Privacy policy</h1>
        <p className="lede">
          How {site.name} and SBD Booths handle the details you share. Questions? Email{" "}
          <a href={`mailto:${site.email}`} className="text-link">{site.email}</a>.
        </p>
        <p className="muted">Last updated {privacyUpdated}.</p>
      </section>
      <section className="container section-tight" style={{ paddingBottom: "clamp(64px, 10vw, 128px)" }}>
        <ol className={styles.list}>
          {privacySections.map((t) => (
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
      </section>
    </>
  );
}
