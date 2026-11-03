import Link from "next/link";
import Frame from "./Frame";
import { pillars } from "@/content/pillars";
import { folderPhotos } from "@/lib/media";
import styles from "./PillarPanels.module.css";

export default async function PillarPanels() {
  const doors = await folderPhotos("doors");
  return (
    <ul className={styles.panels}>
      {pillars.map((p, i) => (
        <li key={p.id}>
          <Link href={p.href} className={styles.panel} data-pillar={p.id} data-parallax>
            <Frame src={doors[i]?.src ?? p.image} alt={doors[i]?.alt ?? p.imageAlt} className={styles.image} label={p.name} />
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
