import Link from "next/link";
import Frame from "./Frame";
import { pillars } from "@/content/pillars";
import styles from "./PillarPanels.module.css";

export default function PillarPanels() {
  return (
    <ul className={styles.panels}>
      {pillars.map((p) => (
        <li key={p.id}>
          <Link href={p.href} className={styles.panel} data-pillar={p.id}>
            <Frame src={p.image} alt={p.imageAlt} className={styles.image} label={p.name} />
            <span className={styles.text}>
              <span className={styles.name}>{p.name}</span>
              <span className={styles.line}>{p.line}</span>
              <span className={styles.cue}>{p.id === "booth" ? "See the booth" : `See ${p.name.toLowerCase()}`}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
