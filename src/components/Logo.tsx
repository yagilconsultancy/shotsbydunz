import Link from "next/link";
import styles from "./Logo.module.css";

export default function Logo({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <Link href="/" className={styles.logo} data-tone={tone} aria-label="ShotsByDunz home">
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.word}>
        Shots<em>by</em>Dunz
      </span>
    </Link>
  );
}
