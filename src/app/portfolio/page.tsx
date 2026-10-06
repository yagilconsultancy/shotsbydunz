import type { Metadata } from "next";
import PortfolioGrid from "@/components/PortfolioGrid";
import { categories, type CategoryId } from "@/content/portfolio";

export const metadata: Metadata = {
  title: "Work",
  description: "Wedding and event films, photography, brand content and SBD Booth nights by ShotsByDunz.",
};

type Props = { searchParams: Promise<{ category?: string }> };

export default async function PortfolioPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const initial = (categories.some((c) => c.id === category) ? category : "all") as CategoryId;

  return (
    <>
      <section className="container page-hero">
        <h1>Work</h1>
        <p className="lede">Weddings, birthdays, launches and brands from the last year. Open any project for the film and the story behind it.</p>
      </section>
      <section className="container" style={{ paddingBottom: "clamp(64px, 10vw, 144px)" }}>
        <PortfolioGrid initial={initial} />
      </section>
    </>
  );
}
