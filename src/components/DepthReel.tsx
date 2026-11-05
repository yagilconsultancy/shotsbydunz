"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./DepthReel.module.css";

export type ReelItem = { slug: string; title: string; meta: string; runtime?: string; src: string; alt: string };

// Projects stand in a line that recedes into the haze. One number, p, drives everything: each
// card's depth is its index minus p, wrapped around the line, and every position, size, blur and
// fade is read from the depth table below. Dragging moves p, so cards follow the finger 1:1.
// On release the drag's speed is projected forward (Apple's scroll-deceleration formula) to pick
// the landing project, and p eases there. Grabbing mid-flight starts from where p actually is.

// Depth stops from -1 (leaving off the right edge) to 5 (arriving out of the haze), as fractions of the stage.
const WIDE = {
  x: [1.25, 0.72, 0.47, 0.32, 0.21, 0.13, 0.07],
  feet: [1.06, 0.93, 0.81, 0.745, 0.7, 0.67, 0.65],
  h: [1.08, 0.8, 0.52, 0.38, 0.29, 0.22, 0.16],
  blur: [0, 0, 1.5, 4, 8, 12, 17],
  fade: [1, 1, 1, 0.92, 0.7, 0.42, 0],
  light: [1, 1, 0.74, 0.62, 0.55, 0.5, 0.45],
};
const NARROW = {
  x: [1.3, 0.66, 0.36, 0.2, 0.1, 0.04, 0],
  feet: [1.02, 0.97, 0.88, 0.83, 0.8, 0.78, 0.77],
  h: [0.74, 0.5, 0.34, 0.26, 0.2, 0.16, 0.12],
  blur: [0, 0, 1.5, 4, 8, 12, 17],
  fade: [1, 1, 1, 0.85, 0.6, 0.35, 0],
  light: [1, 1, 0.74, 0.62, 0.55, 0.5, 0.45],
};
const RATIO = 4 / 5;

const wrap = (x: number, n: number) => ((x % n) + n) % n;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
// Where a flick would come to rest (Designing Fluid Interfaces, WWDC 2018).
const project = (v: number, rate = 0.998) => ((v / 1000) * rate) / (1 - rate);

export default function DepthReel({ items, children }: { items: ReelItem[]; children: React.ReactNode }) {
  const N = items.length;
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const roll = useRef<HTMLSpanElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const p = useRef(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const el = stage.current;
    if (!el || N < 2) return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, base = 0, table = WIDE, dirty = true, last = 0, raf = 0;
    let shown = -1;
    const cache = cards.current.map(() => ({ f: "", o: "" }));

    const size = () => {
      W = el.clientWidth;
      H = el.clientHeight;
      table = W < 700 ? NARROW : WIDE;
      base = H * 0.9;
      cards.current.forEach((c) => {
        if (!c) return;
        c.style.width = `${base * RATIO}px`;
        c.style.height = `${base}px`;
      });
      dirty = true;
    };

    const paint = () => {
      const pos = p.current;
      cards.current.forEach((c, i) => {
        if (!c) return;
        let d = wrap(i - pos, N);
        if (d > N - 1) d -= N;
        const k = clamp(d + 1, 0, 6), a = Math.floor(k), b = Math.min(6, a + 1), t = k - a;
        const mix = (A: number[]) => A[a] + (A[b] - A[a]) * t;
        const h = mix(table.h) * H, s = h / base, w = h * RATIO;
        const x = mix(table.x) * W - w / 2, y = mix(table.feet) * H - h;
        c.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
        // Blur is applied before the scale, so divide it back out to look the same at every depth.
        const blur = mix(table.blur) / s;
        // Cards further back also dim, so the line fades into the dark like a room at night.
        const light = mix(table.light);
        const f =
          `${blur < 0.2 ? "" : `blur(${blur.toFixed(1)}px) `}${light > 0.995 ? "" : `brightness(${light.toFixed(2)})`}`.trim() || "none";
        const o = mix(table.fade).toFixed(3);
        if (f !== cache[i].f) c.style.filter = cache[i].f = f;
        if (o !== cache[i].o) c.style.opacity = cache[i].o = o;
        c.style.zIndex = String(100 - Math.round(d * 10));
      });
      if (roll.current?.firstElementChild) {
        const lh = (roll.current.firstElementChild as HTMLElement).offsetHeight;
        roll.current.style.transform = `translate3d(0,${(-wrap(pos, N) * lh).toFixed(1)}px,0)`;
      }
      const now = wrap(Math.round(pos), N);
      if (now !== shown) {
        shown = now;
        setCurrent(now);
      }
    };

    let mx = 0, my = 0, cx = 0, cy = 0;
    const frame = (now: number) => {
      const dt = Math.min(50, now - last) || 16;
      last = now;
      const was = p.current;
      if (calm) p.current = target.current;
      else p.current += (target.current - p.current) * (1 - Math.exp(-dt * 0.0072));
      if (Math.abs(target.current - p.current) < 0.0004) p.current = target.current;
      if (p.current !== was || dirty) {
        dirty = false;
        paint();
      }
      cx += (mx - cx) * 0.32;
      cy += (my - cy) * 0.32;
      if (ring.current) ring.current.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
      raf = requestAnimationFrame(frame);
    };

    let down = false, sx = 0, st = 0, moved = 0;
    let trail: { x: number; t: number }[] = [];
    const pull = () => Math.max(150, W * 0.22);

    const onEnter = (e: PointerEvent) => e.pointerType === "mouse" && ring.current?.classList.add(styles.show);
    const onLeave = () => ring.current?.classList.remove(styles.show);
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      const overLink = !!(e.target as Element).closest("a,button");
      ring.current?.classList.toggle(styles.hide, overLink);
      if (!down) return;
      const dx = e.clientX - sx;
      moved = Math.max(moved, Math.abs(dx));
      target.current = p.current = st + dx / pull();
      dirty = true;
      trail.push({ x: e.clientX, t: e.timeStamp });
      if (trail.length > 6) trail.shift();
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest("a,button")) return;
      down = true;
      sx = e.clientX;
      // Start from where the line is on screen, not where it was heading, so a grab never jumps.
      st = p.current;
      target.current = p.current;
      moved = 0;
      trail = [{ x: e.clientX, t: e.timeStamp }];
      el.setPointerCapture(e.pointerId);
      ring.current?.classList.add(styles.drag);
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      ring.current?.classList.remove(styles.drag);
      if (moved < 6) {
        const hit = document
          .elementsFromPoint(e.clientX, e.clientY)
          .find((x) => x instanceof HTMLElement && x.dataset.card !== undefined) as HTMLElement | undefined;
        if (hit) {
          const d = Math.round(wrap(Number(hit.dataset.card) - target.current, N));
          if (d > 0 && d < N) target.current = Math.round(target.current) + d;
        }
        return;
      }
      const a = trail[0], b = trail[trail.length - 1];
      const v = b && a && b.t > a.t ? ((b.x - a.x) / (b.t - a.t)) * 1000 : 0;
      const rest = p.current + clamp(project(v) / pull(), -2.5, 2.5);
      target.current = Math.round(rest);
    };

    // Only sideways wheel moves the line, so the page still scrolls normally over it.
    let wheelT = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      target.current += clamp(e.deltaX, -120, 120) / 420;
      clearTimeout(wheelT);
      wheelT = window.setTimeout(() => (target.current = Math.round(target.current)), 150);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") target.current = Math.round(target.current) + 1;
      else if (e.key === "ArrowLeft") target.current = Math.round(target.current) - 1;
      else return;
      e.preventDefault();
    };

    size();
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(size);
    ro.observe(el);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(wheelT);
      ro.disconnect();
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("keydown", onKey);
    };
  }, [N]);

  const pad = (n: number) => String(n + 1).padStart(2, "0");
  const now = items[current];

  return (
    <section className={styles.hero} aria-label="Featured projects">
      <div
        ref={stage}
        className={styles.stage}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Featured projects. Drag, swipe or use the arrow keys to change project."
      >
        <div className={styles.line} aria-hidden="true">
          {items.map((it, i) => (
            <div key={it.slug} ref={(n) => void (cards.current[i] = n)} className={styles.card} data-card={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.src} alt="" draggable={false} decoding="async" loading={i < 3 ? "eager" : "lazy"} />
            </div>
          ))}
        </div>
        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.copy}>{children}</div>
        <div className={styles.tag}>
          <div className={styles.count} aria-hidden="true">
            <span>No.</span>
            <span className={styles.win}>
              <span ref={roll} className={styles.roll}>
                {[...items, items[0]].map((it, i) => (
                  <b key={i}>{pad(i % N)}</b>
                ))}
              </span>
            </span>
          </div>
          <Link href={`/portfolio/${now.slug}`} className={styles.open}>
            Open {now.title}
          </Link>
          <p className="visually-hidden" aria-live="polite">
            Project {current + 1} of {N}: {now.title}
          </p>
        </div>
        <div ref={ring} className={styles.ring} aria-hidden="true">
          <span>Drag</span>
        </div>
      </div>
    </section>
  );
}
