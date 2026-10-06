import { testimonials } from "@/content/about";
import styles from "./Testimonials.module.css";

export default function Testimonials() {
  return (
    <div className={styles.grid}>
      {testimonials.map((t) => (
        <blockquote key={t.name} className={styles.quote}>
          <p>“{t.text}”</p>
          <footer>
            <strong>{t.name}</strong> <span className="muted">{t.event}</span>
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
