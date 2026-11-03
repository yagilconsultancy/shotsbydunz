import type { Metadata } from "next";
import Link from "next/link";
import Viewfinder from "@/components/Viewfinder";
import Frame from "@/components/Frame";
import StillsGallery from "@/components/StillsGallery";
import { folderPhotos, photo } from "@/lib/media";
import { getFolder } from "@/content/media-folders";
import PhotoStrip from "@/components/PhotoStrip";
import Steps from "@/components/Steps";
import SplitText from "@/components/bits/SplitText";
import Magnet from "@/components/bits/Magnet";
import { boothAddOns, boothEvents, boothPackages, boothSpecs, boothSteps } from "@/content/booths";
import { faqGroups } from "@/content/faq";
import { policies, site } from "@/content/site";
import styles from "./booths.module.css";

export const metadata: Metadata = {
  title: "SBD Booth photobooth rental",
  description:
    "Photobooth rental in London, Ontario. Digital booth from $350, unlimited prints from $450, keychains and guest books, with an attendant all night.",
};

const digital = boothPackages[0].includes;
const rows = [...digital, "Unlimited 2×6 and 4×6 prints", "Online gallery"];

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
      <Viewfinder image={hero.src} imageAlt={hero.alt} label="SBD Booth" size="tall" focus="70% 40%">
        <p className={styles.kicker}>A ShotsByDunz experience</p>
        <SplitText tag="h1" className={styles.title} text="SBD Booth" delay={0.3} stagger={0.05} />
        <p className={styles.heroLine}>Props, prints and instant sharing, styled to your night and run by our attendant.</p>
        <div className="btn-row">
          <Magnet>
            <Link href="/book?service=booth" className="btn btn-booth">
              Check your date
            </Link>
          </Magnet>
          <a href="#packages" className="btn btn-ghost">
            Packages from $350
          </a>
        </div>
      </Viewfinder>

      <section className={`container ${styles.story}`} aria-label="At the booth">
        <div className={styles.storyImage} data-parallax>
          <Frame src={atBooth.src} alt={atBooth.alt} ratio="4 / 5" label="At the booth" />
        </div>
        <div className={styles.storyText}>
          <SplitText
            tag="h2"
            className={styles.h2}
            text="Your guests take the night home with them."
            splitType="words"
            stagger={0.06}
            onScroll
          />
          <p className="lede">
            The booth becomes the room’s meeting point. Guests send photos, GIFs and boomerangs to their phones in
            seconds, walk away with prints and keychains, and leave you a guest book full of faces and messages.
          </p>
          <ul className={styles.events}>
            {boothEvents.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="packages" className={styles.paper} aria-labelledby="pkg-title">
        <div className="container section">
          <div className={styles.pkgHead}>
            <h2 id="pkg-title" className={styles.h2}>
              Packages
            </h2>
            <p className={styles.pkgLede}>Both run for 3 hours with an attendant on site. Add hours and extras below.</p>
          </div>

          <div className={styles.tableWrap} data-reveal>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">
                    <span className="visually-hidden">What’s included</span>
                  </th>
                  {boothPackages.map((p) => (
                    <th key={p.id} scope="col" data-highlight={p.highlight ? "true" : undefined}>
                      {p.highlight && <span className={styles.badge}>Most booked</span>}
                      <span className={styles.pkgName}>{p.name}</span>
                      <span className={styles.pkgPrice}>${p.price}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r}>
                    <th scope="row">{r}</th>
                    {boothPackages.map((p) => {
                      const has = p.id === "unlimited-prints" || digital.includes(r);
                      return (
                        <td key={p.id} data-highlight={p.highlight ? "true" : undefined}>
                          {has ? <span className={styles.yes}>Included</span> : <span className={styles.no}>Not included</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  {boothPackages.map((p) => (
                    <td key={p.id} data-highlight={p.highlight ? "true" : undefined}>
                      <Link href={`/book?service=booth&package=${p.id}`} className={`btn ${p.highlight ? "btn-booth" : "btn-dark"}`}>
                        Book {p.name.split(" ")[0]}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>

          <div className={styles.extras}>
            <div>
              <h3 className={styles.h3}>Add-ons</h3>
              <ul className={styles.addOns}>
                {boothAddOns.map((a) => (
                  <li key={a.id}>
                    <span>{a.name}</span>
                    <strong>{a.price}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.terms}>
              <h3 className={styles.h3}>Booking</h3>
              <p>{policies.booth.deposit}.</p>
              <p>{policies.booth.balance}.</p>
              <p>{policies.booth.leadTime}.</p>
              <p>{policies.booth.travel}.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container section" aria-labelledby="prints">
        <div className={styles.printsHead}>
          <h2 id="prints" className={styles.h2}>
            Printed on the night
          </h2>
          <a href={site.socials.boothInstagram.href} className="text-link" target="_blank" rel="noopener">
            More on Instagram {site.socials.boothInstagram.label}
          </a>
        </div>
        <div className={styles.prints}>
          <div className={styles.printsImage} data-parallax>
            <Frame src={prints.src} alt={prints.alt} ratio="4 / 5" label="Prints and keychains" />
          </div>
          <div className={styles.printsStrips}>
            <div data-speed="0.1">
              <PhotoStrip images={[strips[0].src]} caption={strips[0].caption ?? ""} tilt={-5} />
            </div>
            <div data-speed="-0.05">
              <PhotoStrip images={[strips[1].src]} caption={strips[1].caption ?? ""} tilt={3} />
            </div>
            <div data-speed="0.16">
              <PhotoStrip images={[strips[2].src]} caption={strips[2].caption ?? ""} tilt={-2} />
            </div>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="container section-tight" aria-labelledby="booth-gallery">
          <h2 id="booth-gallery" className={styles.h2}>
            From the booth
          </h2>
          <StillsGallery
            title="SBD Booth"
            stills={gallery.map((g) => ({ src: g.src, alt: g.alt, orientation: g.orientation ?? "square" }))}
          />
        </section>
      )}

      <section className="container section-tight" aria-labelledby="how">
        <div className="section-head">
          <h2 id="how" className={styles.h2}>
            How it works
          </h2>
        </div>
        <Steps steps={boothSteps} accent="booth" />
        <dl className={styles.specs}>
          {boothSpecs.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container section-tight" aria-labelledby="bundle">
        <div className={styles.bundle} data-reveal>
          <div>
            <h2 id="bundle" className={styles.h2}>
              Film the night, too
            </h2>
            <p className="lede">Book Photo & Film and the booth together and get a bundle price. One team, one booking, both sides of the night.</p>
          </div>
          <Link href="/book?service=booth&bundle=1" className="btn btn-booth">
            Ask about the bundle
          </Link>
        </div>
      </section>

      <section className="container section" aria-labelledby="bfaq">
        <h2 id="bfaq" className={styles.h2} style={{ marginBottom: 32 }}>
          Booth questions
        </h2>
        <div className={styles.faq}>
          {boothFaq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p className="muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
