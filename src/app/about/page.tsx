import type { Metadata } from "next";
import Link from "next/link";
import Frame from "@/components/Frame";
import { photo } from "@/lib/media";
import { about, testimonials } from "@/content/about";
import { homeFacts } from "@/content/home";
import { site } from "@/content/site";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Dunz",
  description: "Meet Dunz, the videographer behind ShotsByDunz and SBD Booths in London, Ontario.",
};

export default async function AboutPage() {
  const [portrait, bts] = await Promise.all([photo("dunz-portrait"), photo("about-bts")]);
  return (
    <div className="contact-sheet">
      <section className={`container ${styles.hero}`}>
        <Frame src={portrait.src} alt={portrait.alt} ratio="4 / 5" priority className={styles.photo} label="Dunz" />
        <div className={styles.heroText}>
          <h1 className={styles.title}>{about.headline}</h1>
          <div className="prose lede">
            {about.story.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
          <dl className={styles.quick}>
            {homeFacts.slice(0, 2).map((f) => (
              <div key={f.figure}>
                <dt>{f.figure}</dt>
                <dd>{f.label}</dd>
              </div>
            ))}
            <div>
              <dt>Ontario</dt>
              <dd>based in {site.city.split(",")[0]}, travelling for the right booking</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section container" aria-labelledby="approach">
        <div className="section-head">
          <h2 id="approach">How I work</h2>
        </div>
        <ol className={styles.approach}>
          {about.approach.map((a, i) => (
            <li key={a.title} className={styles.pillar} data-reveal>
              <span className={styles.num} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{a.title}</h3>
              <p className="muted">{a.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section-tight container" aria-labelledby="kind-words">
        <div className="section-head">
          <h2 id="kind-words">Kind words</h2>
        </div>
        <ul className={styles.quotes}>
          {testimonials.map((t) => (
            <li key={t.name} data-reveal>
              <blockquote>
                <p>“{t.text}”</p>
                <footer>
                  {t.name}, {t.event.toLowerCase()}
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </section>

      {about.showOffCamera && (
        <section className="section-tight container" aria-labelledby="offcam">
          <div className={styles.offCam}>
            <Frame src={bts.src} alt={bts.alt} ratio="9 / 16" className={styles.bts} label="On set" />
            <div className={styles.offText}>
              <h2 id="offcam">Off camera</h2>
              <ul className={styles.facts}>
                {about.offCamera.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="btn-row">
                <Link href="/book" className="btn btn-primary">
                  Book Me
                </Link>
                <Link href="/portfolio" className={styles.chevron}>
                  See my work <span aria-hidden="true">›</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
