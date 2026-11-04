import Link from "next/link";
import Logo from "./Logo";
import { nav, site } from "@/content/site";
import styles from "./Footer.module.css";

const services = nav.filter((n) => ["/photo-film", "/content", "/booths"].includes(n.href));
const studio = [...nav.filter((n) => !services.includes(n)), { href: "/faq", label: "FAQ" }, { href: "/contact", label: "Contact" }];

const socials = [
  { ...site.socials.instagram, name: "Instagram", icon: "ig" },
  { ...site.socials.tiktok, name: "TikTok", icon: "tt" },
  { ...site.socials.boothInstagram, name: "SBD Booths on Instagram", icon: "ig" },
] as const;

function Icon({ name }: { name: "ig" | "tt" | "mail" | "phone" | "pin" | "up" }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (name) {
    case "ig":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
        </svg>
      );
    case "tt":
      return (
        <svg {...common}>
          <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M14 4c.4 2.6 2.2 4.3 5 4.5" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
          <path d="m4.5 7 7.5 6 7.5-6" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
          <circle cx="12" cy="10" r="2.3" />
        </svg>
      );
    case "up":
      return (
        <svg {...common}>
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      );
  }
}

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className="container">
        <section className={styles.cta} aria-labelledby="footer-cta">
          <div>
            <p className={styles.eyebrow}>Bookings open</p>
            <h2 id="footer-cta" className={styles.ctaTitle}>
              Got a date in mind?
            </h2>
            <p className={styles.ctaText}>Weekends book up fast, especially in summer. {site.replyPromise}</p>
          </div>
          <div className={styles.ctaActions}>
            <Link href="/book" className="btn btn-primary">
              Book Me
            </Link>
            <Link href="/contact" className={styles.ghost}>
              Ask a question
            </Link>
          </div>
        </section>

        <div className={styles.grid}>
          <div className={styles.brand}>
            <Logo />
            <p className={styles.brandLine}>Photo, film and photobooths for the nights worth keeping.</p>
            <ul className={styles.socials} aria-label="Social media">
              {socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} rel="noopener" target="_blank" className={styles.social} aria-label={`${s.name} ${s.label}`} title={`${s.name} ${s.label}`}>
                    <Icon name={s.icon} />
                    {s.name.startsWith("SBD") && <span className={styles.socialTag}>Booth</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav className={styles.links} aria-label="Footer">
            <div className={styles.group}>
              <h3 className={styles.groupTitle}>Services</h3>
              <ul>
                {services.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href}>{n.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.group}>
              <h3 className={styles.groupTitle}>Studio</h3>
              <ul>
                {studio.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href}>{n.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className={styles.group}>
            <h3 className={styles.groupTitle}>Get in touch</h3>
            <ul className={styles.contact}>
              <li>
                <a href={`mailto:${site.email}`} className={styles.contactRow}>
                  <Icon name="mail" />
                  <span>{site.email}</span>
                </a>
              </li>
              <li>
                <a href={site.phoneHref} className={styles.contactRow}>
                  <Icon name="phone" />
                  <span>{site.phone}</span>
                </a>
              </li>
              <li>
                <span className={`${styles.contactRow} ${styles.plain}`}>
                  <Icon name="pin" />
                  <span>{site.city}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © {year} {site.name}
          </p>
          <ul className={styles.legal}>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              Site by{" "}
              <a href="https://www.yagildigitalstudios.com" rel="noopener" target="_blank">
                YAGIL Digital Studio
              </a>
            </li>
          </ul>
          <a href="#top" className={styles.top}>
            <Icon name="up" />
            <span>Back to top</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
