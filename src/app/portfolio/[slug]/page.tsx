import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Frame from "@/components/Frame";
import StillsGallery from "@/components/StillsGallery";
import SplitText from "@/components/bits/SplitText";
import { getProjectBySlug, getProjects } from "@/lib/media";
import { getPillar } from "@/content/pillars";
import { bookingHref } from "@/lib/booking";
import styles from "./project.module.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.story,
    openGraph: { images: [project.cover] },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const pillar = getPillar(project.pillars[0]);
  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <article>
      <div className="contact-sheet">
        <header className={`container ${styles.head}`}>
          <div className={styles.topline}>
            <Link
              href={`/portfolio?category=${pillar.id}`}
              className={styles.back}
            >
              <span aria-hidden="true">‹</span> {pillar.name}
            </Link>
            <span className={styles.position}>
              No. {pad(index + 1)} <span aria-hidden="true">/</span>{" "}
              {pad(projects.length)}
            </span>
          </div>
          <SplitText
            tag="h1"
            className={styles.title}
            text={project.title}
            splitType="words"
            delay={0.1}
            stagger={0.06}
          />
          <dl className={styles.credits} data-reveal>
            <div>
              <dt>Client</dt>
              <dd>{project.client}</dd>
            </div>
            <div>
              <dt>Event</dt>
              <dd>{project.kind}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{project.year}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{project.location}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{project.role.join(", ")}</dd>
            </div>
          </dl>
        </header>

        <figure className={styles.playerWrap}>
          <div className={styles.player} data-orientation={project.orientation}>
            {project.video ? (
              <iframe
                src={project.video}
                title={project.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <Frame
                src={project.cover}
                alt={project.coverAlt}
                priority
                label={project.title}
                className={styles.cover}
              />
            )}
          </div>
          {!project.video && project.runtime && (
            <figcaption className={styles.runtime}>
              Film, {project.runtime}. Sample still shown until the real film is
              uploaded.
            </figcaption>
          )}
        </figure>

        <section className={`container ${styles.body}`}>
          <p className={styles.story}>{project.story}</p>
          <div className={styles.side}>
            {project.quote && (
              <blockquote className={styles.quote}>
                <p>“{project.quote.text}”</p>
                <footer>{project.quote.name}</footer>
              </blockquote>
            )}
            <Link
              href={bookingHref(pillar.id)}
              className={`btn ${pillar.id === "booth" ? "btn-booth" : "btn-primary"}`}
            >
              Book something like this
            </Link>
          </div>
        </section>

        {project.stills.length > 0 && (
          <section
            className="container section-tight"
            aria-labelledby="stills-title"
          >
            <div className={styles.stillsHead}>
              <h2 id="stills-title" className={styles.h2}>
                Stills
              </h2>
              <span className={styles.position}>
                {project.stills.length} photos
              </span>
            </div>
            <StillsGallery stills={project.stills} title={project.title} />
          </section>
        )}

        <nav className={`container ${styles.next}`} aria-label="More projects">
          <Link href={`/portfolio/${next.slug}`} className={styles.nextCard}>
            <Frame
              src={next.cover}
              alt=""
              label={next.title}
              className={styles.nextImage}
            />
            <span className={styles.nextText}>
              <span className={styles.nextLabel}>Next project</span>
              <span className={styles.nextTitle}>{next.title}</span>
              <span className={styles.nextMeta}>
                {next.kind}, {next.location.split(",")[0]} {next.year}
              </span>
            </span>
            <span className={styles.nextArrow} aria-hidden="true">
              ›
            </span>
          </Link>
          <div className={styles.navRow}>
            <Link href={`/portfolio/${prev.slug}`} className={styles.prev}>
              <span aria-hidden="true">‹</span> {prev.title}
            </Link>
            <Link href="/portfolio" className={styles.prev}>
              All work
            </Link>
          </div>
        </nav>
      </div>
    </article>
  );
}
