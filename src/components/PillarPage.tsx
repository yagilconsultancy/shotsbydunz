import Link from "next/link";
import Viewfinder from "./Viewfinder";
import WorkTile from "./WorkTile";
import SplitText from "./bits/SplitText";
import ScrollReveal from "./bits/ScrollReveal";
import { getPillar, type PillarId } from "@/content/pillars";
import { services } from "@/content/services";
import { projectsFor } from "@/content/portfolio";
import { policies } from "@/content/site";
import styles from "./PillarPage.module.css";

export default function PillarPage({ id, heading }: { id: Exclude<PillarId, "booth">; heading: string }) {
  const pillar = getPillar(id);
  const list = services.filter((s) => s.pillar === id);
  const work = projectsFor(id).slice(0, 4);

  return (
    <>
      <Viewfinder image={pillar.image} imageAlt={pillar.imageAlt} label={pillar.name} size="tall">
        <p className={styles.kicker}>{pillar.name}</p>
        <SplitText tag="h1" className={styles.title} text={heading} splitType="words" stagger={0.07} delay={0.25} />
      </Viewfinder>

      <section className={`container ${styles.intro}`}>
        <ScrollReveal className={styles.introText}>{pillar.intro}</ScrollReveal>
      </section>

      <section className="container section-tight" aria-labelledby="offer">
        <h2 id="offer" className={styles.h2}>
          What you can book
        </h2>
        <ul className={styles.offers}>
          {list.map((s) => (
            <li key={s.slug} data-reveal>
              <Link href={`/services/${s.slug}`} className={styles.offer}>
                <span className={styles.offerName}>{s.name}</span>
                <span className={styles.offerSummary}>{s.summary}</span>
                <span className={styles.offerMeta}>
                  <span className={styles.price}>{s.startingFrom === "Quote" ? "Custom quote" : `From ${s.startingFrom}`}</span>
                  <span className="muted">{s.turnaround}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          {policies.video.deposit}. {policies.video.travel}. <Link href="/services" className="text-link">All rates</Link>
        </p>
      </section>

      {work.length > 0 && (
        <section className="container section" aria-labelledby="work">
          <div className={styles.workHead}>
            <h2 id="work" className={styles.h2}>
              Recent {pillar.name.toLowerCase()} work
            </h2>
            <Link href={`/portfolio?category=${id}`} className="text-link">
              See all
            </Link>
          </div>
          <div className={styles.work}>
            {work.map((p) => (
              <div key={p.slug} data-reveal>
                <WorkTile project={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={`container ${styles.cta}`}>
        <h2 className={styles.ctaTitle}>Have a date or an idea?</h2>
        <div className="btn-row">
          <Link href={`/book?pillar=${id}`} className="btn btn-primary">
            Book Me
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Ask a question
          </Link>
        </div>
      </section>
    </>
  );
}
