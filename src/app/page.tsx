import Link from "next/link";
import Viewfinder from "@/components/Viewfinder";
import PillarPanels from "@/components/PillarPanels";
import WorkTile from "@/components/WorkTile";
import Steps from "@/components/Steps";
import PhotoStrip from "@/components/PhotoStrip";
import Frame from "@/components/Frame";
import SplitText from "@/components/bits/SplitText";
import ScrollReveal from "@/components/bits/ScrollReveal";
import Magnet from "@/components/bits/Magnet";
import { projects } from "@/content/portfolio";
import { testimonials } from "@/content/about";
import { boothPackages } from "@/content/booths";
import { site } from "@/content/site";
import styles from "./home.module.css";

const howItWorks = [
  { title: "Tell me about the day", body: "Send the booking form. Within 24 hours you get availability and a quote." },
  { title: "Lock the date", body: "A deposit holds your date. Then we plan the schedule, key moments and music together." },
  { title: "I shoot, you enjoy it", body: "I arrive early, stay out of the way and catch what matters." },
  { title: "Your film arrives", body: "Edited and delivered in 5 to 7 days, with one round of changes included." },
];

const layout = ["a", "b", "c", "d", "e", "f"];

export default function HomePage() {
  const featured = projects.filter((p) => p.featured).slice(0, 6);
  const lead = testimonials[0];

  return (
    <>
      <Viewfinder image="/images/hero-wedding.jpg" imageAlt="Guests dancing around a couple under warm string lights">
        <p className={styles.kicker}>Photo, film and photobooths in {site.city}</p>
        <SplitText tag="h1" className={styles.heroTitle} text="Nights worth keeping." delay={0.35} />
        <div className="btn-row">
          <Magnet>
            <Link href="/book" className="btn btn-primary">
              Book Me
            </Link>
          </Magnet>
          <Link href="/portfolio" className="btn btn-ghost">
            Watch the work
          </Link>
        </div>
      </Viewfinder>

      <section className={`container ${styles.intro}`} aria-labelledby="intro-title">
        <div className={styles.introText}>
          <ScrollReveal tag="h2" id="intro-title" className={styles.statement}>
            {"I’m Dunz. I photograph and film weddings, birthdays and launches, make content for brands, and run the photobooth everyone ends up crowding."}
          </ScrollReveal>
          <Link href="/about" className="text-link">
            How I work
          </Link>
        </div>
        <div className={styles.portrait} data-speed="0.08">
          <Frame src="/images/dunz-portrait.jpg" alt="Dunz filming at an evening event" ratio="4 / 5" label="Dunz" />
        </div>
      </section>

      <section aria-label="What I do">
        <PillarPanels />
      </section>

      <section className="section container" aria-labelledby="work-title">
        <div className={styles.workHead} data-reveal>
          <h2 id="work-title">Selected work</h2>
          <Link href="/portfolio" className="text-link">
            All work
          </Link>
        </div>
        <div className={styles.work}>
          {featured.map((p, i) => (
            <div key={p.slug} className={styles.workItem} data-slot={layout[i]} data-reveal>
              <WorkTile project={p} size={i === 0 ? "large" : "default"} ratio={i === 0 ? "16 / 9" : undefined} />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.booth} aria-label="SBD Booth">
        <div className={`container ${styles.boothInner}`}>
          <div className={styles.boothText}>
            <p className={styles.boothKicker}>SBD Booth</p>
            <SplitText
              tag="h2"
              className={styles.boothTitle}
              text="The corner of the room everyone ends up in."
              splitType="words"
              stagger={0.06}
              onScroll
            />
            <p className={styles.boothLede}>
              Instant sharing, unlimited prints, keychains and guest books. Styled to your event and run by our attendant
              from setup to the last print.
            </p>
            <dl className={styles.boothPrices}>
              {boothPackages.map((p) => (
                <div key={p.id}>
                  <dt>{p.name}</dt>
                  <dd>${p.price}</dd>
                </div>
              ))}
            </dl>
            <div className="btn-row">
              <Link href="/booths" className="btn btn-dark">
                Explore the booth
              </Link>
            </div>
          </div>
          <div className={styles.strips}>
            <div data-speed="0.12">
              <PhotoStrip images={["/images/booth-wedding.jpg"]} caption="Amara & Tobi" tilt={-7} />
            </div>
            <div data-speed="-0.06">
              <PhotoStrip images={["/images/rooftop-birthday.jpg"]} caption="Kemi at 30" tilt={4} />
            </div>
          </div>
        </div>
      </section>

      <section className={`section container ${styles.quote}`} aria-label="What clients say">
        <blockquote>
          <SplitText tag="p" text={`“${lead.text}”`} splitType="words" stagger={0.05} onScroll />
          <footer>
            {lead.name}, {lead.event.toLowerCase()}
          </footer>
        </blockquote>
      </section>

      <section className="section-tight container" aria-labelledby="how-title">
        <div className="section-head" data-reveal>
          <h2 id="how-title">From first message to finished film</h2>
        </div>
        <Steps steps={howItWorks} />
      </section>
    </>
  );
}
