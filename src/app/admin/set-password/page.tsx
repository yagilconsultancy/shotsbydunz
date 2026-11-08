import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminGate } from "@/lib/admin";
import { PASSWORD_MIN, passwordRules } from "@/lib/password";
import { setPassword } from "./actions";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Choose a password", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ e?: string }> };

const errors: Record<string, string> = {
  match: "The two passwords don’t match. Type the same password in both boxes.",
  weak: "That password doesn’t meet the rules below. Try a longer one, like three random words with a number and a symbol.",
  same: "That’s your current password. Choose a new one.",
  slow: "Too many tries. Wait 15 minutes and try again.",
};

export default async function SetPasswordPage({ searchParams }: Props) {
  const gate = await adminGate();
  if (!gate) redirect("/admin/login?e=link");
  if (gate.step === "code") redirect("/admin/two-step?next=password");
  const q = await searchParams;
  const error = q.e ? errors[q.e] : null;
  return (
    <section className={`container ${styles.wrap}`}>
      <h1 className={styles.title}>Choose a password</h1>
      <p className="lede">For {gate.email}. Only you will know it: it isn’t emailed or shown to anyone.</p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <form action={setPassword} className={styles.form}>
        <input type="email" name="username" value={gate.email} autoComplete="username" readOnly hidden />
        <div className={styles.field}>
          <label htmlFor="password">New password</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={PASSWORD_MIN} maxLength={128} required aria-describedby="rules" />
        </div>
        <div className={styles.field}>
          <label htmlFor="confirm">Type it again</label>
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={PASSWORD_MIN} maxLength={128} required />
        </div>
        <ul id="rules" className={styles.rules}>
          {passwordRules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <button type="submit" className="btn btn-primary">
          Save password
        </button>
      </form>
    </section>
  );
}
