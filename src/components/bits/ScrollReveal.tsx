"use client";

// Adapted from React Bits (reactbits.dev) ScrollReveal. Licence in ./LICENSE.md.
// Changes: renders any tag (the original nested a <p> in an <h2>), cleans up only its own
// scroll triggers, and shows the text fully for visitors who turn on reduced motion.

import { useMemo, useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion";
import styles from "./ScrollReveal.module.css";

type Props = {
  children: string;
  tag?: "h2" | "p";
  id?: string;
  className?: string;
  baseOpacity?: number;
  blurStrength?: number;
};

export default function ScrollReveal({ children, tag = "p", id, className, baseOpacity = 0.14, blurStrength = 5 }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  const words = useMemo(
    () =>
      children.split(/(\s+)/).map((word, i) =>
        /^\s+$/.test(word) ? (
          word
        ) : (
          <span className={styles.word} key={i}>
            {word}
          </span>
        ),
      ),
    [children],
  );

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const targets = el.querySelectorAll(`.${styles.word}`);
      gsap.fromTo(
        targets,
        { opacity: baseOpacity, filter: `blur(${blurStrength}px)` },
        {
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 55%", scrub: true },
        },
      );
    },
    { scope: ref },
  );

  const Tag = tag;
  return (
    <Tag ref={ref} id={id} className={className}>
      {words}
    </Tag>
  );
}
