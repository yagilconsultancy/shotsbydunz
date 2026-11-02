"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion, setLenis } from "@/lib/motion";

// Smooth scrolling (Lenis) driven by GSAP's clock, plus the site's scroll effects.
// Pages opt in with data attributes, so effects stay out of page code:
//   data-reveal       fades and lifts into view once
//   data-parallax     the photo inside drifts slower than the page
//   data-speed="0.2"  the element drifts by this much of the viewport (negative = up)
//   data-hero-media   the hero photo eases in and the hero copy lifts away as you scroll past
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -88 }, autoRaf: false });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const reveal = gsap.utils.toArray<HTMLElement>("main [data-reveal]");
      gsap.set(reveal, { opacity: 0, y: 28 });
      ScrollTrigger.batch(reveal, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.09, clearProps: "transform" }),
      });

      gsap.utils.toArray<HTMLElement>("main [data-parallax]").forEach((el) => {
        const img = el.querySelector("img");
        if (!img) return;
        gsap.fromTo(
          img,
          { yPercent: -7, scale: 1.16 },
          {
            yPercent: 7,
            scale: 1.16,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("main [data-speed]").forEach((el) => {
        const speed = parseFloat(el.dataset.speed || "0");
        gsap.to(el, {
          y: () => -speed * window.innerHeight,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("main [data-hero-media]").forEach((media) => {
        const hero = media.closest("section");
        if (!hero) return;
        const copy = hero.querySelector("[data-hero-copy]");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
        });
        tl.to(media, { yPercent: 12, scale: 1.08, ease: "none" }, 0);
        if (copy) tl.to(copy, { yPercent: -18, opacity: 0, ease: "none" }, 0);
      });
    });

    // Re-measure once images have their final size.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = window.setTimeout(refresh, 600);

    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
