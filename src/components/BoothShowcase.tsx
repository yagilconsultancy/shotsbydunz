"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import PhotoStrip from "./PhotoStrip";
import styles from "./BoothShowcase.module.css";

type Pkg = { id: string; name: string; price: number; hours: number; includes: string[]; highlight?: boolean };
type Strip = { src: string; caption: string };
type Feature = { icon: "share" | "print" | "key" | "book"; label: string };

// idle → counting (3, 2, 1) → flash → printing → done. Plays once when the card comes into view;
// "Print again" replays it. With reduced motion the strips are simply there.
type Phase = "idle" | "counting" | "flash" | "printing" | "done";

function FeatureIcon({ name }: { name: Feature["icon"] }) {
  const p = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "share")
    return (
      <svg {...p}>
        <circle cx="18" cy="5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="19" r="2.5" />
        <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
      </svg>
    );
  if (name === "print")
    return (
      <svg {...p}>
        <path d="M7 9V3h10v6M7 17H4v-7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7h-3" />
        <path d="M7 14h10v7H7z" />
      </svg>
    );
  if (name === "key")
    return (
      <svg {...p}>
        <rect x="6" y="9" width="12" height="12" rx="2" />
        <path d="M12 9V6M9.5 3.5h5" />
        <circle cx="12" cy="15" r="2" />
      </svg>
    );
  return (
    <svg {...p}>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 21V5M9 8h6" />
    </svg>
  );
}

export default function BoothShowcase({
  title,
  lede,
  features,
  packages,
  strips,
}: {
  title: string;
  lede: string;
  features: readonly Feature[];
  packages: Pkg[];
  strips: Strip[];
}) {
  const [chosen, setChosen] = useState(packages.find((p) => p.highlight)?.id ?? packages[0].id);
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(3);
  const card = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const pkg = packages.find((p) => p.id === chosen)!;

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const play = () => {
    clear();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setPhase("done");
    setPhase("counting");
    setCount(3);
    at(650, () => setCount(2));
    at(1300, () => setCount(1));
    at(1950, () => setPhase("flash"));
    at(2250, () => setPhase("printing"));
    at(4600, () => setPhase("done"));
  };

  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clear();
    };
    // play only reads refs and setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const replay = () => {
    clear();
    setPhase("idle");
    at(450, play);
  };

  const shown = 4;
  const extra = pkg.includes.length - shown;

  return (
    <div ref={card} className={styles.card} data-phase={phase}>
      <div className={styles.flash} aria-hidden="true" />
      <div className={styles.text}>
        <p className={styles.kicker}>SBD Booth</p>
        <h2 id="booth-title" className={styles.title}>
          {title}
        </h2>
        <p className={styles.lede}>{lede}</p>
        <ul className={styles.features}>
          {features.map((f) => (
            <li key={f.label}>
              <FeatureIcon name={f.icon} />
              {f.label}
            </li>
          ))}
        </ul>

        <div className={styles.picker}>
          <div className={styles.segment} role="group" aria-label="Choose a package">
            <span
              className={styles.thumb}
              style={{ "--n": packages.length, "--at": packages.findIndex((p) => p.id === chosen) } as React.CSSProperties}
              aria-hidden="true"
            />
            {packages.map((p) => (
              <button key={p.id} type="button" aria-pressed={p.id === chosen} onClick={() => setChosen(p.id)}>
                {p.name.replace(" Experience", "")}
                {p.highlight && <span className={styles.badge}>Popular</span>}
              </button>
            ))}
          </div>

          <div className={styles.pkg} key={pkg.id} aria-live="polite">
            <div className={styles.priceRow}>
              <span className={styles.price}>${pkg.price}</span>
              <span className={styles.per}>for {pkg.hours} hours · 50% deposit holds the date</span>
            </div>
            <ul className={styles.includes}>
              {pkg.includes.slice(0, shown).map((t, i) => (
                <li key={t} style={{ "--i": i } as React.CSSProperties}>
                  {t}
                </li>
              ))}
              {extra > 0 && (
                <li className={styles.moreLine} style={{ "--i": shown } as React.CSSProperties}>
                  and {extra} more
                </li>
              )}
            </ul>
          </div>

          <div className={styles.actions}>
            <Link href={`/book?service=booth&package=${pkg.id}`} className="btn btn-dark">
              Book {pkg.name.replace(" Experience", "")}
            </Link>
            <Link href="/booths" className={styles.more}>
              Explore the booth <span aria-hidden="true">›</span>
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.machine}>
        <div className={styles.count} aria-hidden="true">
          <span className={styles.countLabel}>Smile in</span>
          <span className={styles.countWin}>
            <span className={styles.countRoll} style={{ "--c": 3 - count } as React.CSSProperties}>
              <b>3</b>
              <b>2</b>
              <b>1</b>
            </span>
          </span>
        </div>
        <div className={styles.slot} aria-hidden="true">
          <span />
        </div>
        <div className={styles.tray}>
          {strips.map((s, i) => (
            <div key={i} className={styles.hang} style={{ "--i": i, "--tilt": `${i ? -4 : 5}deg` } as React.CSSProperties}>
              <PhotoStrip images={[s.src]} caption={s.caption} tilt={0} />
            </div>
          ))}
        </div>
        <button type="button" className={styles.again} onClick={replay} disabled={phase !== "done"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Print again
        </button>
      </div>
    </div>
  );
}
