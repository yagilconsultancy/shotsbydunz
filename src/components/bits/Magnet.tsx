"use client";

// Adapted from React Bits (reactbits.dev) Magnet. Licence in ./LICENSE.md.
// Changes: mouse only (off on touch screens and with reduced motion), moves the element
// directly instead of re-rendering on every mouse move, and wraps inline.

import { useEffect, useRef, type ReactNode } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

type Props = {
  children: ReactNode;
  padding?: number;
  strength?: number;
  className?: string;
};

export default function Magnet({ children, padding = 60, strength = 4, className }: Props) {
  const outer = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const el = outer.current;
    const moving = inner.current;
    if (!el || !moving) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const near = Math.abs(cx - e.clientX) < r.width / 2 + padding && Math.abs(cy - e.clientY) < r.height / 2 + padding;
      moving.style.transition = near ? "transform 0.3s ease-out" : "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
      moving.style.transform = near
        ? `translate3d(${(e.clientX - cx) / strength}px, ${(e.clientY - cy) / strength}px, 0)`
        : "translate3d(0, 0, 0)";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [padding, strength]);

  return (
    <span ref={outer} className={className} style={{ display: "inline-flex" }}>
      <span ref={inner} style={{ display: "inline-flex", willChange: "transform" }}>
        {children}
      </span>
    </span>
  );
}
