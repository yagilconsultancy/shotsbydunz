import Link from "next/link";
import styles from "./Logo.module.css";

export default function Logo({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <Link href="/" className={styles.logo} data-tone={tone} aria-label="ShotsByDunz home">
      {/* eslint-disable-next-line @next/next/no-img-element -- a small SVG gains nothing from the image optimiser */}
      <img src="/brand/sbd-mark.svg" alt="" width={36} height={40} className={styles.mark} />
      <span className={styles.word}>
        Shots<em>by</em>Dunz
      </span>
    </Link>
  );
}
