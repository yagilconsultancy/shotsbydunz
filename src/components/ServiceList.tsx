import Link from "next/link";
import { services } from "@/content/services";
import styles from "./ServiceList.module.css";

export default function ServiceList() {
  return (
    <ul className={styles.list}>
      {services.map((s) => (
        <li key={s.slug}>
          <Link href={`/services/${s.slug}`} className={styles.row}>
            <span className={styles.name}>{s.name}</span>
            <span className={styles.summary}>{s.summary}</span>
            <span className={styles.price}>
              {s.startingFrom === "Quote" ? "Custom quote" : `From ${s.startingFrom}`}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
