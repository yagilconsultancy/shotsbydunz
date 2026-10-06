import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Frame from "@/components/Frame";
import WorkTile from "@/components/WorkTile";
import StillsGallery from "@/components/StillsGallery";
import { getProject, projects } from "@/content/portfolio";
import { getPillar } from "@/content/pillars";
import styles from "./project.module.css";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.story, openGraph: { images: [project.cover] } };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const pillar = getPillar(project.pillars[0]);
  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];
  const isBooth = project.pillars.includes("booth");

  return (
    <article>
      <header className={`container ${styles.head}`}>
        <Link href={`/portfolio?category=${pillar.id}`} className={styles.back}>
          {pillar.name}
        </Link>
        <h1 className={styles.title}>{project.title}</h1>
        <dl className={styles.credits}>
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

      <div className={styles.player} data-orientation={project.orientation}>
        {project.video ? (
          <iframe src={project.video} title={project.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        ) : (
          <Frame src={project.cover} alt={project.coverAlt} priority label={project.title} className={styles.cover} />
        )}
        {!project.video && project.runtime && (
          <span className={styles.runtime}>
            Film, {project.runtime}. Sample still shown until the real film is uploaded.
          </span>
        )}
      </div>

      <section className={`container ${styles.body}`}>
        <p className={styles.story}>{project.story}</p>
        <div className={styles.side}>
          {project.quote && (
            <blockquote className={styles.quote}>
              <p>“{project.quote.text}”</p>
              <footer>{project.quote.name}</footer>
            </blockquote>
          )}
          <Link href={isBooth ? "/book?service=booth" : `/book?pillar=${pillar.id}`} className={`btn ${isBooth && project.pillars.length === 1 ? "btn-booth" : "btn-primary"}`}>
            Book something like this
          </Link>
        </div>
      </section>

      {project.stills.length > 0 && (
        <section className="container section-tight" aria-label="Photos">
          <StillsGallery stills={project.stills} title={project.title} />
        </section>
      )}

      <section className={`container ${styles.next}`} aria-labelledby="next-title">
        <p id="next-title" className="label">
          Next project
        </p>
        <WorkTile project={next} ratio="21 / 9" size="large" />
      </section>
    </article>
  );
}
