import Link from "next/link";
import Frame from "./Frame";
import type { Project } from "@/content/portfolio";
import styles from "./WorkTile.module.css";

type Props = {
  project: Project;
  ratio?: string;
  size?: "default" | "large";
  priority?: boolean;
};

export default function WorkTile({ project, ratio, size = "default", priority }: Props) {
  const r = ratio ?? (project.orientation === "wide" ? "16 / 10" : "4 / 5");
  return (
    <Link href={`/portfolio/${project.slug}`} className={styles.tile} data-size={size}>
      <div className={styles.media}>
        <Frame src={project.cover} alt={project.coverAlt} ratio={r} label={project.title} priority={priority} />
        {project.runtime && (
          <span className={styles.runtime}>
            <svg viewBox="0 0 10 12" width="8" height="10" aria-hidden="true">
              <path d="M0 0v12l10-6z" fill="currentColor" />
            </svg>
            {project.runtime}
          </span>
        )}
      </div>
      <div className={styles.caption}>
        <span className={styles.title}>{project.title}</span>
        <span className={styles.meta}>
          {project.kind}, {project.location.split(",")[0]} {project.year}
        </span>
      </div>
    </Link>
  );
}
