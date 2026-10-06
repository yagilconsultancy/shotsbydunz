import type { Metadata } from "next";
import Link from "next/link";
import Frame from "@/components/Frame";
import { about } from "@/content/about";
import { site } from "@/content/site";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Dunz",
  description: "Meet Dunz, the videographer behind ShotsByDunz and SBD Booths in London, Ontario.",
};

export default function AboutPage() {
  return (
    <>
      <section className={`container ${styles.hero}`}>
        <Frame src="/images/dunz-portrait.jpg" alt="Dunz filming at an evening event" ratio="4 / 5" priority className={styles.photo} label="Dunz" />
        <div className={styles.heroText}>
          <h1 className={styles.title}>{about.headline}</h1>
          <div className="prose lede">
            {about.story.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="approach">
        <div className="section-head">
          <h2 id="approach">How I work</h2>
        </div>
        <div className={styles.approach}>
          {about.approach.map((a) => (
            <div key={a.title} className={styles.pillar}>
              <h3>{a.title}</h3>
              <p className="muted">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-tight container" aria-labelledby="offcam">
        <div className={styles.offCam}>
          <Frame src="/images/fashion-bts.jpg" alt="Behind the scenes on a studio shoot" ratio="9 / 16" className={styles.bts} label="On set" />
          <div className={styles.offText}>
            <h2 id="offcam">Off camera</h2>
            <ul className={styles.facts}>
              {about.offCamera.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="muted">
              Based in {site.city}. Travelling across Ontario for the right booking.
            </p>
            <div className="btn-row">
              <Link href="/book" className="btn btn-primary">
                Book Me
              </Link>
              <Link href="/portfolio" className="btn btn-ghost">
                See my work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
