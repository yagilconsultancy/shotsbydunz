import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import { site } from "@/content/site";
import styles from "./book.module.css";

export const metadata: Metadata = {
  title: "Book Me",
  description: "Request a date for event videography, social content or an SBD Booth.",
};

type Props = { searchParams: Promise<{ service?: string; package?: string; event?: string; bundle?: string }> };

export default async function BookPage({ searchParams }: Props) {
  const q = await searchParams;
  return (
    <section className={`container ${styles.wrap}`}>
      <div className={styles.intro}>
        <h1>Book Me</h1>
        <p className="lede">Four quick steps. {site.replyPromise} with availability and a quote.</p>
        <p className="muted">
          Rather talk first? Call or text <a href={site.phoneHref} className="text-link">{site.phone}</a>.
        </p>
      </div>
      <div className={styles.formCol}>
        <BookingForm prefill={{ service: q.service, pkg: q.package, event: q.event, bundle: q.bundle === "1" }} />
      </div>
    </section>
  );
}
