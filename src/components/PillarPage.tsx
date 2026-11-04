import Link from "next/link";
import Viewfinder from "./Viewfinder";
import WorkTile from "./WorkTile";
import SplitText from "./bits/SplitText";
import ScrollReveal from "./bits/ScrollReveal";
import OfferList from "./OfferList";
import { getPillar, pillars, type PillarId } from "@/content/pillars";
import { services } from "@/content/services";
import { filterProjects, getProjects, photo } from "@/lib/media";
import { policies } from "@/content/site";
import styles from "./PillarPage.module.css";

export default async function PillarPage({ id, heading }: { id: Exclude<PillarId, "booth">; heading: string }) {
  const pillar = getPillar(id);
  const list = services.filter((s) => s.pillar === id);
  const [all, door] = await Promise.all([getProjects(), photo("doors", pillars.indexOf(pillar))]);
  const mine = filterProjects(all, id);
  const work = mine.slice(0, 4);
  // Each offer borrows a photo from this section's own projects, so the preview shows real work.
  const offers = list.map((s, i) => {
    const p = mine.length ? mine[i % mine.length] : null;
    return { ...s, image: p ? { src: p.cover, alt: p.coverAlt } : { src: door.src, alt: door.alt } };
  });

  return (
    <>
      <Viewfinder image={door.src} imageAlt={door.alt} label={pillar.name} size="tall">
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
        <OfferList offers={offers} />
        <ul className={styles.notes}>
          <li>{policies.video.deposit}</li>
          <li>{policies.video.travel}</li>
          <li>
            <Link href="/services" className={styles.allRates}>
              All rates <span aria-hidden="true">›</span>
            </Link>
          </li>
        </ul>
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
