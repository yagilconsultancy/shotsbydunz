import Frame from "./Frame";
import Timecode from "./Timecode";
import styles from "./Viewfinder.module.css";

type Props = {
  children: React.ReactNode;
  image: string;
  imageAlt: string;
  videoSrc?: string;
  label?: string;
  size?: "full" | "tall";
  focus?: string;
};

export default function Viewfinder({ children, image, imageAlt, videoSrc, label = "Showreel 2026", size = "full", focus }: Props) {
  return (
    <section className={styles.frame} data-size={size} style={focus ? ({ "--focus": focus } as React.CSSProperties) : undefined}>
      <div className={styles.media}>
        {videoSrc ? (
          <video src={videoSrc} poster={image} autoPlay muted loop playsInline aria-hidden="true" />
        ) : (
          <Frame src={image} alt={imageAlt} priority className={styles.still} />
        )}
      </div>
      <div className={styles.hud} aria-hidden="true">
        <span className={styles.rec}>
          <span className={styles.dot} />
          Rec
        </span>
        <span className={styles.tc}>
          <Timecode />
        </span>
        <span className={styles.lbl}>{label}</span>
      </div>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
