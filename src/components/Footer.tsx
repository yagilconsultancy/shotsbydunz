import Link from "next/link";
import Logo from "./Logo";
import { nav, site } from "@/content/site";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.cta}>
          <h2>Got a date in mind?</h2>
          <p className="muted">Weekends book up fast, especially in summer. {site.replyPromise}</p>
          <div className="btn-row">
            <Link href="/book" className="btn btn-primary">
              Book Me
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Ask a question
            </Link>
          </div>
        </div>
        <div className={styles.cols}>
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Contact</h3>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a href={site.phoneHref}>{site.phone}</a>
            <span className="muted">{site.city}</span>
          </div>
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Follow</h3>
            <a href={site.socials.instagram.href} rel="noopener" target="_blank">
              Instagram {site.socials.instagram.label}
            </a>
            <a href={site.socials.tiktok.href} rel="noopener" target="_blank">
              TikTok {site.socials.tiktok.label}
            </a>
            <a href={site.socials.boothInstagram.href} rel="noopener" target="_blank">
              SBD Booths {site.socials.boothInstagram.label}
            </a>
          </div>
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Site</h3>
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/contact">Contact</Link>
            <Link href="/terms">Terms and conditions</Link>
          </div>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <Logo />
        <p className="muted">
          © {year} {site.name}. Website by{" "}
          <a href="https://www.yagildigitalstudios.com" rel="noopener" target="_blank">
            YAGIL Digital Studio
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
