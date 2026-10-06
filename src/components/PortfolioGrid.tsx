"use client";

import { useState } from "react";
import WorkTile from "./WorkTile";
import { categories, projectsFor, type CategoryId } from "@/content/portfolio";
import styles from "./PortfolioGrid.module.css";

export default function PortfolioGrid({ initial }: { initial: CategoryId }) {
  const [active, setActive] = useState<CategoryId>(initial);
  const filtered = projectsFor(active);

  const choose = (id: CategoryId) => {
    setActive(id);
    window.history.replaceState(null, "", id === "all" ? "/portfolio" : `/portfolio?category=${id}`);
  };

  return (
    <>
      <div className={styles.filters} role="group" aria-label="Show work by type">
        {categories.map((c) => (
          <button key={c.id} type="button" className={styles.filter} aria-pressed={active === c.id} onClick={() => choose(c.id)}>
            {c.label}
            <span className={styles.count}>{projectsFor(c.id).length}</span>
          </button>
        ))}
      </div>
      <div className={styles.grid}>
        {filtered.map((p, i) => (
          <div key={p.slug} className={styles.item} data-orientation={p.orientation} data-lead={i === 0 ? "true" : undefined}>
            <WorkTile project={p} priority={i < 2} size={i === 0 ? "large" : "default"} />
          </div>
        ))}
      </div>
    </>
  );
}
