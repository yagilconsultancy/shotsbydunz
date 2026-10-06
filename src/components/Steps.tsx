import styles from "./Steps.module.css";

type Step = { title: string; body: string };

export default function Steps({ steps, accent = "amber" }: { steps: Step[]; accent?: "amber" | "booth" }) {
  return (
    <ol className={styles.steps} data-accent={accent}>
      {steps.map((s, i) => (
        <li key={s.title} className={styles.step}>
          <span className={styles.num} aria-hidden="true">
            {i + 1}
          </span>
          <h3 className={styles.title}>{s.title}</h3>
          <p className="muted">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
