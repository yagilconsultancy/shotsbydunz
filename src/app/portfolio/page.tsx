import type { Metadata } from "next";
import PortfolioGrid from "@/components/PortfolioGrid";
import { categories, type CategoryId } from "@/content/portfolio";
import { getProjects } from "@/lib/media";
import styles from "./work.module.css";

export const metadata: Metadata = {
  title: "Work",
  description: "Wedding and event films, photography, brand content and SBD Booth nights by ShotsByDunz.",
};

type Props = { searchParams: Promise<{ category?: string }> };

export default async function PortfolioPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const initial = (categories.some((c) => c.id === category) ? category : "all") as CategoryId;

  const projects = await getProjects();
  const ys = projects.map((p) => Number(p.year)).filter(Boolean);
  const years = ys.length ? (Math.min(...ys) === Math.max(...ys) ? `${ys[0]}` : `${Math.min(...ys)} to ${Math.max(...ys)}`) : "";

  return (
    <div className="contact-sheet">
      <section className={`container ${styles.head}`}>
        <h1 className={styles.title}>Work</h1>
        <div className={styles.intro}>
          <p className="lede">Weddings, birthdays, launches and brands from the last year. Open any project for the film and the story behind it.</p>
          <p className={styles.total}>
            {projects.length} projects <span aria-hidden="true">/</span> {years}
          </p>
        </div>
      </section>
      <section className={`container ${styles.list}`}>
        <PortfolioGrid initial={initial} projects={projects} />
      </section>
    </div>
  );
}
