import type { Metadata } from "next";
import Link from "next/link";
import ServiceList from "@/components/ServiceList";
import { rawFootage } from "@/content/services";
import { policies } from "@/content/site";
import styles from "./services.module.css";

export const metadata: Metadata = {
  title: "Rates",
  description: "Event videography, personal brand content, BTS coverage, highlight videos and reels in London, Ontario.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="container page-hero">
        <h1>Rates</h1>
        <p className="lede">
          Prices start where shown and change with hours, number of videos and travel. Tell me what you need and
          you’ll get an exact quote within 24 hours.
        </p>
      </section>

      <section className="container section-tight" aria-label="All services">
        <ServiceList />
      </section>

      <section className="container section" aria-labelledby="extras">
        <div className={styles.split}>
          <div className="section-head">
            <h2 id="extras">Raw footage add-ons</h2>
            <p className="lede">Want the unedited clips too? Add any of these to a video booking.</p>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Add-on</th>
                <th scope="col">What you get</th>
                <th scope="col">Price</th>
              </tr>
            </thead>
            <tbody>
              {rawFootage.map((r) => (
                <tr key={r.name}>
                  <th scope="row">{r.name}</th>
                  <td>{r.detail}</td>
                  <td className={styles.price}>{r.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="container section-tight" aria-labelledby="good-to-know">
        <div className={styles.split}>
          <h2 id="good-to-know">Good to know</h2>
          <dl className={styles.facts}>
            <div>
              <dt>Deposit</dt>
              <dd>{policies.video.deposit}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{policies.video.delivery}</dd>
            </div>
            <div>
              <dt>Revisions</dt>
              <dd>{policies.video.revisions}</dd>
            </div>
            <div>
              <dt>Travel</dt>
              <dd>{policies.video.travel}</dd>
            </div>
          </dl>
        </div>
        <p className={styles.more}>
          Full details in the <Link href="/terms" className="text-link">terms and conditions</Link> and the{" "}
          <Link href="/faq" className="text-link">FAQ</Link>.
        </p>
      </section>
    </>
  );
}
