"use client";

import { useRef, useState } from "react";
import { setFocus } from "@/app/admin/(dash)/media/actions";
import styles from "@/app/admin/admin.module.css";

type Props = {
  id: string;
  src: string;
  x?: number | null;
  y?: number | null;
  // Hidden fields that tell the action which page to return to.
  children: React.ReactNode;
};

// Shows the whole photo. Tapping it saves that spot as the photo's focus point, so every frame on
// the site, at any screen size, crops around it.
export default function FocusPicker({ id, src, x, y, children }: Props) {
  const form = useRef<HTMLFormElement>(null);
  const [point, setPoint] = useState(x != null && y != null ? { x, y } : null);
  const [busy, setBusy] = useState(false);

  function pick(e: React.MouseEvent<HTMLImageElement>) {
    if (busy) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = Math.round(((e.clientX - r.left) / r.width) * 100);
    const py = Math.round(((e.clientY - r.top) / r.height) * 100);
    const next = { x: Math.max(0, Math.min(100, px)), y: Math.max(0, Math.min(100, py)) };
    setPoint(next);
    const f = form.current!;
    (f.elements.namedItem("x") as HTMLInputElement).value = String(next.x);
    (f.elements.namedItem("y") as HTMLInputElement).value = String(next.y);
    setBusy(true);
    f.requestSubmit();
  }

  return (
    <form ref={form} action={setFocus} className={styles.focusPicker}>
      {children}
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="x" defaultValue={point?.x ?? ""} />
      <input type="hidden" name="y" defaultValue={point?.y ?? ""} />
      <p className={styles.focusHelp}>
        <strong>Focus point.</strong> Tap the part of the photo that must always show, like a face. Every screen crops around it.
      </p>
      <div className={styles.focusStage}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" onClick={pick} draggable={false} />
        {point && <span className={styles.focusDot} style={{ left: `${point.x}%`, top: `${point.y}%` }} aria-hidden="true" />}
      </div>
      <p className="muted">{point ? (busy ? "Saving…" : "Focus point set.") : "No focus point yet: the site keeps the upper part of the photo."}</p>
      {point && (
        <button className="btn btn-ghost" name="reset" value="yes" disabled={busy}>
          Reset focus point
        </button>
      )}
    </form>
  );
}
