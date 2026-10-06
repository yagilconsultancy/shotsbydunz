import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { site } from "@/content/site";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call, text or email ShotsByDunz in London, Ontario.",
};

export default function ContactPage() {
  return (
    <section className={`container ${styles.wrap}`}>
      <div className={styles.info}>
        <h1>Say hi</h1>
        <p className="lede">
          Questions, ideas or a quick quote. For a specific date, the <Link href="/book" className="text-link">booking form</Link> gets you an answer fastest.
        </p>
        <div className={styles.quick}>
          <a href={site.phoneHref} className="btn btn-primary">Call {site.phone}</a>
          <a href={site.smsHref} className="btn btn-ghost">Text me</a>
        </div>
        <dl className={styles.list}>
          <div>
            <dt>Email</dt>
            <dd><a href={`mailto:${site.email}`}>{site.email}</a></dd>
          </div>
          <div>
            <dt>Instagram</dt>
            <dd>
              <a href={site.socials.instagram.href} target="_blank" rel="noopener">{site.socials.instagram.label}</a>
              {" and "}
              <a href={site.socials.boothInstagram.href} target="_blank" rel="noopener">{site.socials.boothInstagram.label}</a>
            </dd>
          </div>
          <div>
            <dt>TikTok</dt>
            <dd><a href={site.socials.tiktok.href} target="_blank" rel="noopener">{site.socials.tiktok.label}</a></dd>
          </div>
          <div>
            <dt>Service area</dt>
            <dd>{site.serviceArea}</dd>
          </div>
          <div>
            <dt>Hours</dt>
            <dd>{site.hours}</dd>
          </div>
        </dl>
      </div>
      <div className={styles.formCol}>
        <h2 className={styles.formTitle}>Send a message</h2>
        <ContactForm />
      </div>
    </section>
  );
}
