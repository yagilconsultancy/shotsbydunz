import Link from "next/link";
import DepthReel, { type ReelItem } from "@/components/DepthReel";
import PhotoStrip from "@/components/PhotoStrip";
import Frame from "@/components/Frame";
import SplitText from "@/components/bits/SplitText";
import { folderPhotos, getProjects, photo } from "@/lib/media";
import { testimonials } from "@/content/about";
import { boothPackages } from "@/content/booths";
import { pillars } from "@/content/pillars";
import { homeBooth, homeFacts, homeHero, homeIntro, howItWorks } from "@/content/home";
import { site } from "@/content/site";
import styles from "./home.module.css";

export default async function HomePage() {
  const [projects, portrait, stripA, stripB, doors] = await Promise.all([
    getProjects(),
    photo("dunz-portrait"),
    photo("home-booth", 0),
    photo("home-booth", 1),
    folderPhotos("doors"),
  ]);
  // Six cards fill the line: featured projects first, then the rest in portfolio order.
  const picks = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)].slice(0, 6);
  const reel: ReelItem[] = picks.map((p) => ({
    slug: p.slug,
    title: p.title,
    meta: `${p.kind}, ${p.location.split(",")[0]} ${p.year}`,
    runtime: p.runtime,
    src: p.cover,
    alt: p.coverAlt,
  }));
  const lead = testimonials[0];

  return (
    <>
      <DepthReel items={reel}>
        <p className={styles.kicker}>Photo, film and photobooths · {site.city}</p>
        <SplitText
          tag="h1"
          className={styles.heroTitle}
          text={homeHero.title}
          splitType="words"
          stagger={0.08}
          delay={0.2}
        />
        <p className={styles.heroLede}>{homeHero.lede}</p>
        <div className={styles.heroCtas}>
          <Link href="/book" className="btn btn-primary">
            Book Me
          </Link>
          <Link href="/portfolio" className={styles.chevron}>
            All work <span aria-hidden="true">›</span>
          </Link>
        </div>
      </DepthReel>

      <section className="section container" aria-labelledby="services-title">
        <header className={styles.head}>
          <p className={styles.eyebrow}>What I do</p>
          <h2 id="services-title" className={styles.headTitle}>
            Three ways to book me.
          </h2>
          <p className={styles.headLede}>Pick one or put them together. Every booking goes through the same simple form.</p>
        </header>
        <ul className={styles.services}>
          {pillars.map((p, i) => (
            <li key={p.id} data-reveal>
              <Link href={p.href} className={styles.service} data-pillar={p.id}>
                <span className={styles.serviceText}>
                  <span className={styles.serviceName}>{p.name}</span>
                  <span className={styles.serviceLine}>{p.line}</span>
                  <span className={styles.serviceCue}>
                    Learn more <span aria-hidden="true">›</span>
                  </span>
                </span>
                <Frame src={doors[i]?.src ?? p.image} alt={doors[i]?.alt ?? p.imageAlt} className={styles.serviceImage} label={p.name} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section container" aria-labelledby="meet-title">
        <header className={styles.head}>
          <p className={styles.eyebrow}>The person behind the camera</p>
          <h2 id="meet-title" className={styles.headTitle}>
            Meet Dunz.
          </h2>
        </header>
        <div className={styles.bento}>
          <div className={`${styles.card} ${styles.portraitCard}`} data-reveal>
            <Frame src={portrait.src} alt={portrait.alt} label="Dunz" className={styles.fill} />
          </div>
          <div className={`${styles.card} ${styles.storyCard}`} data-reveal>
            <p className={styles.story}>{homeIntro}</p>
            <Link href="/about" className={styles.chevron}>
              How I work <span aria-hidden="true">›</span>
            </Link>
          </div>
          {homeFacts.map((f) => (
            <div key={f.figure} className={`${styles.card} ${styles.factCard}`} data-reveal>
              <span className={styles.figure}>{f.figure}</span>
              <span className={styles.figureLabel}>{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container" aria-labelledby="booth-title">
        <div className={styles.booth}>
          <div className={styles.boothText}>
            <p className={styles.boothKicker}>SBD Booth</p>
            <h2 id="booth-title" className={styles.boothTitle} data-reveal>
              {homeBooth.title}
            </h2>
            <p className={styles.boothLede}>{homeBooth.lede}</p>
            <dl className={styles.boothPrices}>
              {boothPackages.map((p) => (
                <div key={p.id}>
                  <dt>{p.name}</dt>
                  <dd>${p.price}</dd>
                </div>
              ))}
            </dl>
            <div className="btn-row">
              <Link href="/booths" className="btn btn-dark">
                Explore the booth
              </Link>
            </div>
          </div>
          <div className={styles.strips}>
            <div data-speed="0.06">
              <PhotoStrip images={[stripA.src]} caption={stripA.caption ?? ""} tilt={-6} />
            </div>
            <div data-speed="-0.03">
              <PhotoStrip images={[stripB.src]} caption={stripB.caption ?? ""} tilt={4} />
            </div>
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="how-title">
        <header className={styles.head}>
          <p className={styles.eyebrow}>How it works</p>
          <h2 id="how-title" className={styles.headTitle}>
            From first message to finished film.
          </h2>
        </header>
        <ol className={styles.steps}>
          {howItWorks.map((s, i) => (
            <li key={s.title} className={`${styles.card} ${styles.step}`} data-reveal>
              <span className={styles.stepNum} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepBody}>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`container ${styles.quote}`} aria-label="What clients say">
        <blockquote data-reveal>
          <p>{`“${lead.text}”`}</p>
          <footer>
            {lead.name}, {lead.event.toLowerCase()}
          </footer>
        </blockquote>
      </section>
    </>
  );
}
