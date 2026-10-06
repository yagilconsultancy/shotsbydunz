import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import WorkTile from "@/components/WorkTile";
import { getService, rawFootage, services } from "@/content/services";
import { projects } from "@/content/portfolio";
import { faqGroups } from "@/content/faq";
import styles from "./service.module.css";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return { title: service.name, description: service.summary };
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const examples = projects.filter((p) => p.pillars.includes(service.pillar)).slice(0, 4);
  const isCustom = service.startingFrom === "Quote";
  const faqs = faqGroups.flatMap((g) => g.items).filter((f) => /turnaround|revisions|music|raw/i.test(f.q)).slice(0, 3);

  return (
    <>
      <section className="container page-hero">
        <Link href="/services" className={styles.back}>
          All services
        </Link>
        <h1>{service.name}</h1>
        <p className="lede">{service.intro}</p>
        <div className={styles.priceRow}>
          <span className={styles.price}>{isCustom ? "Custom quote" : `From ${service.startingFrom}`}</span>
          <span className="muted">Delivered in {service.turnaround.toLowerCase()}</span>
        </div>
        <div className="btn-row">
          <Link href={`/book?service=${service.slug}`} className="btn btn-primary">
            Book this service
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Ask a question
          </Link>
        </div>
      </section>

      <section className="container section-tight">
        <div className={styles.cols}>
          <div className={styles.col}>
            <h2 className={styles.colTitle}>Ideal for</h2>
            <ul>
              {service.idealFor.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
          <div className={styles.col}>
            <h2 className={styles.colTitle}>What’s included</h2>
            <ul>
              {service.included.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
          <div className={styles.col}>
            <h2 className={styles.colTitle}>You receive</h2>
            <ul>
              {service.deliverables.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {examples.length > 0 && (
        <section className="container section" aria-labelledby="examples">
          <div className="section-head">
            <h2 id="examples">Examples</h2>
          </div>
          <div className={styles.examples}>
            {examples.map((p) => (
              <WorkTile key={p.slug} project={p} />
            ))}
          </div>
        </section>
      )}

      {!isCustom && (
        <section className="container section-tight" aria-labelledby="raw">
          <h2 id="raw" className={styles.smallHead}>
            Add raw footage
          </h2>
          <ul className={styles.rawList}>
            {rawFootage.map((r) => (
              <li key={r.name}>
                <span>{r.name}</span>
                <span className={styles.rawPrice}>{r.price}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="container section-tight" aria-labelledby="qs">
        <h2 id="qs" className={styles.smallHead}>
          Common questions
        </h2>
        <div className={styles.faqs}>
          {faqs.map((f) => (
            <div key={f.q}>
              <h3 className={styles.q}>{f.q}</h3>
              <p className="muted">{f.a}</p>
            </div>
          ))}
        </div>
        <Link href="/faq" className="text-link">
          All questions
        </Link>
      </section>
    </>
  );
}
