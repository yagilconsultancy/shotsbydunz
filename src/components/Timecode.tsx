"use client";

import { useEffect, useState } from "react";

function format(frames: number) {
  const fps = 24;
  const f = frames % fps;
  const total = Math.floor(frames / fps);
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  return [h, m, s, f].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function Timecode() {
  const [frames, setFrames] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      setFrames(Math.floor(((now - start) / 1000) * 24));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{format(frames)}</span>;
}
