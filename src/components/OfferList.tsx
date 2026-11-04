"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Service } from "@/content/services";
import styles from "./OfferList.module.css";

type Offer = Pick<Service, "slug" | "name" | "summary" | "idealFor" | "included" | "deliverables" | "turnaround" | "startingFrom"> & {
  image: { src: string; alt: string };
};

const priceLabel = (s: string) => (s === "Quote" ? "Custom quote" : `From ${s}`);

// The price rolls up one character at a time as its row comes into view.
function RollingPrice({ text }: { text: string }) {
  return (
    <span className={styles.price} aria-label={text}>
      {[...text].map((c, i) => (
        <span key={i} className={styles.digit} style={{ "--i": i } as React.CSSProperties} aria-hidden="true">
          <span>{c === " " ? " " : c}</span>
        </span>
      ))}
    </span>
  );
}

export default function OfferList({ offers }: { offers: Offer[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const preview = useRef<HTMLDivElement>(null);

  // Rows draw in once, as they reach the screen.
  useEffect(() => {
    const ul = list.current;
    const rows = ul?.querySelectorAll<HTMLElement>("[data-row]");
    if (!ul || !rows) return;
    ul.dataset.armed = "";
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "";
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  // With a mouse, a photo for the row under the pointer trails the cursor. It eases toward the
  // pointer each frame and leans in the direction it is moving, so it reads as being carried.
  useEffect(() => {
    const ul = list.current;
    const card = preview.current;
    if (!ul || !card || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, placed = false;
    const tick = () => {
      const k = calm ? 1 : 0.16;
      const dx = (tx - x) * k;
      x += dx;
      y += (ty - y) * k;
      const lean = calm ? 0 : Math.max(-8, Math.min(8, dx * 0.6));
      card.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${lean.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const r = ul.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!placed) {
        x = tx;
        y = ty;
        placed = true;
      }
    };
    const leave = () => (placed = false);
    ul.addEventListener("pointermove", move);
    ul.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ul.removeEventListener("pointermove", move);
      ul.removeEventListener("pointerleave", leave);
    };
  }, []);

  const showPreview = hover !== null && open === null;

  return (
    <div className={styles.wrap}>
      <ul ref={list} className={styles.list} onPointerLeave={() => setHover(null)}>
        {offers.map((o, i) => {
          const isOpen = open === o.slug;
          const panel = `offer-${o.slug}`;
          return (
            <li
              key={o.slug}
              data-row
              data-open={isOpen ? "" : undefined}
              className={styles.row}
              style={{ "--d": `${i * 90}ms` } as React.CSSProperties}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
            >
              <h3 className={styles.heading}>
                <button
                  type="button"
                  className={styles.head}
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  onClick={() => setOpen(isOpen ? null : o.slug)}
                >
                  <span className={styles.index} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.name}>{o.name}</span>
                  <span className={styles.summary}>{o.summary}</span>
                  <span className={styles.meta}>
                    <RollingPrice text={priceLabel(o.startingFrom)} />
                    <span className={styles.turn}>{o.turnaround}</span>
                  </span>
                  <span className={styles.toggle} aria-hidden="true" />
                </button>
              </h3>
              <div id={panel} className={styles.panel} role="region" aria-label={o.name} inert={!isOpen}>
                <div className={styles.panelInner}>
                  <div className={styles.panelBody}>
                    <div className={styles.photo}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={o.image.src} alt={o.image.alt} loading="lazy" decoding="async" />
                    </div>
                    <div className={styles.details}>
                      <div>
                        <p className={styles.label}>Ideal for</p>
                        <ul className={styles.chips}>
                          {o.idealFor.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.cols}>
                        <div>
                          <p className={styles.label}>What’s included</p>
                          <ul className={styles.checks}>
                            {o.included.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className={styles.label}>You get</p>
                          <ul className={styles.checks}>
                            {o.deliverables.map((t) => (
                              <li key={t}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className={styles.actions}>
                        <Link href={`/book?service=${o.slug}`} className="btn btn-primary">
                          Book {o.name.toLowerCase()}
                        </Link>
                        <Link href={`/services/${o.slug}`} className={styles.more}>
                          Full details <span aria-hidden="true">›</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div ref={preview} className={styles.preview} data-show={showPreview ? "" : undefined} aria-hidden="true">
        {offers.map((o, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={o.slug} src={o.image.src} alt="" data-active={hover === i ? "" : undefined} loading="lazy" decoding="async" />
        ))}
      </div>
    </div>
  );
}
