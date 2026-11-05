import type { Metadata } from "next";
import Link from "next/link";
import Frame from "@/components/Frame";
import StillsGallery from "@/components/StillsGallery";
import PhotoStrip from "@/components/PhotoStrip";
import BoothEstimator from "@/components/BoothEstimator";
import SplitText from "@/components/bits/SplitText";
import { folderPhotos, photo } from "@/lib/media";
import { getFolder } from "@/content/media-folders";
import { boothEvents, boothPackages, boothSpecs, boothSteps } from "@/content/booths";
import { boothPage } from "@/content/booth-page";
import { faqGroups } from "@/content/faq";
import { policies, site } from "@/content/site";
import styles from "./booths.module.css";

export const metadata: Metadata = {
  title: "SBD Booth photobooth rental",
  description:
    "Photobooth rental in London, Ontario. Digital booth from $350, unlimited prints from $450, keychains and guest books, with an attendant all night.",
};

const from = Math.min(...boothPackages.map((p) => p.price));

export default async function BoothsPage() {
  const boothFaq = faqGroups.find((g) => g.title === "SBD Booths")?.items ?? [];
  const [hero, atBooth, prints, gallery] = await Promise.all([
    photo("booth-hero"),
    photo("booth-pair", 0),
    photo("booth-pair", 1),
    folderPhotos("booth-gallery"),
  ]);
  const strips = [0, 1, 2].map((i) => gallery[i] ?? getFolder("booth-gallery")!.fallback[i]);

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="booth-h1">
        <div className={styles.heroMedia}>
          <Frame src={hero.src} alt={hero.alt} priority className={styles.heroImage} />
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>A ShotsByDunz experience</p>
          <SplitText tag="h1" className={styles.title} text="SBD Booth" splitType="words" delay={0.2} />
          <p className={styles.heroLine}>{boothPage.heroLine}</p>
          <div className={styles.heroCtas}>
            <Link href="/book?service=booth" className="btn btn-booth">
              Check your date
            </Link>
            <a href="#packages" className={styles.chevron}>
              Build your night <span aria-hidden="true">›</span>
            </a>
          </div>
          <p className={styles.facts}>
            From ${from} <span aria-hidden="true">/</span> 3 hours included <span aria-hidden="true">/</span> Attendant all night{" "}
            <span aria-hidden="true">/</span> Prints on the spot
          </p>
        </div>
      </section>

      <section className={`container section ${styles.story}`} aria-labelledby="story-title">
        <div className={styles.storyImage} data-reveal>
          <Frame src={atBooth.src} alt={atBooth.alt} ratio="4 / 5" label="At the booth" />
        </div>
        <div className={styles.storyText}>
          <h2 id="story-title" className={styles.h2} data-reveal>
            {boothPage.storyTitle}
          </h2>
          <p className={styles.lede} data-reveal>
            {boothPage.story}
          </p>
          <p className={styles.events} data-reveal>
            <span className={styles.label}>Perfect for</span>
            {boothEvents.join(", ")}.
          </p>
        </div>
      </section>

      <section id="packages" className="container section-tight" aria-labelledby="pkg-title">
        <header className={styles.head}>
          <h2 id="pkg-title" className={styles.h2}>
            Packages
          </h2>
          <p className={styles.headLede}>Both run for 3 hours with an attendant on site. The total updates as you go.</p>
        </header>
        <BoothEstimator />
        <ul className={styles.terms} aria-label="Booking terms">
          <li>{policies.booth.deposit}</li>
          <li>{policies.booth.balance}</li>
          <li>{policies.booth.leadTime}</li>
          <li>{policies.booth.travel}</li>
        </ul>
      </section>

      <section className="container section" aria-labelledby="prints">
        <header className={`${styles.head} ${styles.headRow}`}>
          <h2 id="prints" className={styles.h2}>
            Printed on the night
          </h2>
          <a href={site.socials.boothInstagram.href} className="text-link" target="_blank" rel="noopener">
            More on Instagram {site.socials.boothInstagram.label}
          </a>
        </header>
        <div className={styles.prints}>
          <div className={styles.printsImage} data-reveal>
            <Frame src={prints.src} alt={prints.alt} ratio="4 / 5" label="Prints and keychains" />
          </div>
          <div className={styles.printsStrips} data-reveal>
            {strips.map((s, i) => (
              <div key={i} className={styles.fanStrip} style={{ "--k": i - 1 } as React.CSSProperties}>
                <PhotoStrip images={[s.src]} caption={s.caption ?? ""} tilt={0} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="container section-tight" aria-labelledby="booth-gallery">
          <header className={styles.head}>
            <h2 id="booth-gallery" className={styles.h2}>
              From the booth
            </h2>
          </header>
          <StillsGallery
            title="SBD Booth"
            stills={gallery.map((g) => ({ src: g.src, alt: g.alt, orientation: g.orientation ?? "square" }))}
          />
        </section>
      )}

      <section className="container section-tight" aria-labelledby="how">
        <header className={styles.head}>
          <h2 id="how" className={styles.h2}>
            How it works
          </h2>
        </header>
        <ol className={styles.steps}>
          {boothSteps.map((s, i) => (
            <li key={s.title} className={styles.step} data-reveal>
              <span className={styles.stepNum} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepBody}>{s.body}</p>
            </li>
          ))}
        </ol>
        <dl className={styles.specs}>
          {boothSpecs.map((s) => (
            <div key={s.label} data-reveal>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container section-tight" aria-labelledby="bundle">
        <div className={styles.bundle} data-reveal>
          <div>
            <h2 id="bundle" className={styles.bundleTitle}>
              Film the night, too
            </h2>
            <p className={styles.bundleText}>{boothPage.bundle}</p>
          </div>
          <Link href="/book?service=booth&bundle=1" className="btn btn-dark">
            Ask about the bundle
          </Link>
        </div>
      </section>

      <section className="container section" aria-labelledby="bfaq">
        <header className={styles.head}>
          <h2 id="bfaq" className={styles.h2}>
            Booth questions
          </h2>
        </header>
        <div className={styles.faq}>
          {boothFaq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
