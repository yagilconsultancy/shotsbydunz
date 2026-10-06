import styles from "./PhotoStrip.module.css";

type Props = { images: string[]; caption: string; tilt?: number };

// A 2x6 booth print: four frames cropped from the event photos, with the event name printed underneath.
export default function PhotoStrip({ images, caption, tilt = -4 }: Props) {
  const frames = [0, 1, 2, 3].map((i) => images[i % images.length]);
  const positions = ["50% 30%", "30% 60%", "70% 40%", "50% 70%"];
  return (
    <div className={styles.strip} style={{ rotate: `${tilt}deg` }} aria-hidden="true">
      {frames.map((src, i) => (
        <span
          key={i}
          className={styles.frame}
          style={{ backgroundImage: `url(${src})`, backgroundPosition: positions[i] }}
        />
      ))}
      <span className={styles.caption}>{caption}</span>
    </div>
  );
}
