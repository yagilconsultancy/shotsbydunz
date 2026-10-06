"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Frame.module.css";

type Props = {
  src: string;
  alt: string;
  ratio?: string;
  priority?: boolean;
  label?: string;
  className?: string;
  sizes?: string;
};

// Shows the photo, or a quiet titled frame if the file isn't there yet, so a missing
// image never leaves a broken icon on the page.
export default function Frame({ src, alt, ratio, priority, label, className }: Props) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The image can fail before React attaches onError (server-rendered pages), so check once on mount too.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <div className={`${styles.frame} ${className ?? ""}`} style={ratio ? { aspectRatio: ratio } : undefined}>
      {failed ? (
        <div className={styles.missing} role="img" aria-label={alt}>
          <span className={styles.missingTitle}>{label ?? alt}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
