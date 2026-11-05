"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import WorkTile from "./WorkTile";
import { categories, type CategoryId, type Project } from "@/content/portfolio";
import type { PillarId } from "@/content/pillars";
import styles from "./PortfolioGrid.module.css";

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => unknown };

export default function PortfolioGrid({ initial, projects }: { initial: CategoryId; projects: Project[] }) {
  const [active, setActive] = useState<CategoryId>(initial);
  const bar = useRef<HTMLDivElement>(null);
  const [mark, setMark] = useState<{ x: number; w: number } | null>(null);
  const projectsFor = (id: CategoryId) => (id === "all" ? projects : projects.filter((p) => p.pillars.includes(id as PillarId)));
  const filtered = projectsFor(active);

  // The underline measures the chosen tab, so it slides between tabs of any width.
  useLayoutEffect(() => {
    const measure = () => {
      const btn = bar.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (btn) setMark({ x: btn.offsetLeft, w: btn.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  // Where the browser supports it, tiles glide from their old place to the new one, and tiles
  // that leave fade out, so the filter reads as one rearrangement rather than a page swap.
  const choose = (id: CategoryId) => {
    if (id === active) return;
    window.history.replaceState(null, "", id === "all" ? "/portfolio" : `/portfolio?category=${id}`);
    const doc = document as ViewTransitionDoc;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (doc.startViewTransition && !calm) doc.startViewTransition(() => flushSync(() => setActive(id)));
    else setActive(id);
  };

  return (
    <>
      <div ref={bar} className={styles.filters} role="group" aria-label="Show work by type">
        {categories.map((c) => (
          <button key={c.id} type="button" className={styles.filter} aria-pressed={active === c.id} onClick={() => choose(c.id)}>
            {c.label}
            <span className={styles.count}>{projectsFor(c.id).length}</span>
          </button>
        ))}
        {mark && <span className={styles.mark} style={{ transform: `translateX(${mark.x}px)`, width: mark.w }} aria-hidden="true" />}
      </div>
      <p className="visually-hidden" aria-live="polite">
        Showing {filtered.length} {filtered.length === 1 ? "project" : "projects"}
      </p>
      <div className={styles.grid}>
        {filtered.map((p, i) => (
          <div
            key={p.slug}
            data-reveal
            className={styles.item}
            data-orientation={p.orientation}
            data-lead={i === 0 ? "true" : undefined}
            style={{ viewTransitionName: `work-${p.slug}` } as React.CSSProperties}
          >
            <WorkTile project={p} priority={i < 2} size={i === 0 ? "large" : "default"} index={projects.indexOf(p)} />
          </div>
        ))}
      </div>
    </>
  );
}
