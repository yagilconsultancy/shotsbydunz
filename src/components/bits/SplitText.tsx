"use client";

// Adapted from React Bits (reactbits.dev) SplitText. Licence in ./LICENSE.md.
// Changes: plays on load or on scroll, waits for fonts, respects reduced motion, and keeps
// the heading hidden only until the split runs (a CSS fallback reveals it if scripts fail).

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText as GSAPSplitText, useGSAP, prefersReducedMotion } from "@/lib/motion";

type Tag = "h1" | "h2" | "h3" | "p" | "span";

type Props = {
  text: string;
  tag?: Tag;
  className?: string;
  splitType?: "chars" | "words" | "lines";
  delay?: number;
  stagger?: number;
  duration?: number;
  ease?: string;
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  onScroll?: boolean;
};

export default function SplitText({
  text,
  tag = "p",
  className,
  splitType = "chars",
  delay = 0,
  stagger = 0.03,
  duration = 1.1,
  ease = "power3.out",
  from = { opacity: 0, y: "0.35em", filter: "blur(8px)" },
  to = { opacity: 1, y: 0, filter: "blur(0px)" },
  onScroll = false,
}: Props) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !fontsReady) return;
      el.style.visibility = "visible";
      if (prefersReducedMotion()) return;

      const split = new GSAPSplitText(el, {
        type: splitType === "lines" ? "lines" : splitType === "words" ? "words" : "words, chars",
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        autoSplit: splitType === "lines",
        onSplit(self) {
          const targets = splitType === "lines" ? self.lines : splitType === "words" ? self.words : self.chars;
          return gsap.fromTo(targets, from, {
            ...to,
            duration,
            ease,
            delay,
            stagger,
            clearProps: "filter,willChange",
            scrollTrigger: onScroll ? { trigger: el, start: "top 88%", once: true } : undefined,
          });
        },
      });

      return () => {
        ScrollTrigger.getAll().forEach((st) => st.trigger === el && st.kill());
        split.revert();
      };
    },
    { dependencies: [text, fontsReady], scope: ref },
  );

  const Tag = tag;
  return (
    <Tag ref={ref} className={className} data-split="">
      {text}
    </Tag>
  );
}
