"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Frame from "./Frame";
import type { Still } from "@/content/portfolio";
import styles from "./StillsGallery.module.css";

export default function StillsGallery({ stills, title }: { stills: Still[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const show = (i: number) => {
    setOpen(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + stills.length) % stills.length)),
    [stills.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  return (
    <>
      <div className={styles.grid}>
        {stills.map((s, i) => (
          <button key={s.src + i} type="button" className={styles.thumb} data-orientation={s.orientation} onClick={() => show(i)}>
            <Frame src={s.src} alt={s.alt} ratio={s.orientation === "wide" ? "3 / 2" : s.orientation === "square" ? "1" : "4 / 5"} />
            <span className="visually-hidden">Open photo {i + 1} of {stills.length}</span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label={`${title} photos`}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialogRef.current && close()}
      >
        {open !== null && (
          <figure className={styles.figure}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stills[open].src} alt={stills[open].alt} />
            <figcaption>
              <span>{stills[open].alt}</span>
              <span className={styles.counter}>
                {open + 1} / {stills.length}
              </span>
            </figcaption>
          </figure>
        )}
        <div className={styles.controls}>
          {stills.length > 1 && (
            <>
              <button type="button" className="btn btn-ghost" onClick={() => step(-1)}>
                Previous
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => step(1)}>
                Next
              </button>
            </>
          )}
          <button type="button" className="btn btn-primary" onClick={close}>
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
