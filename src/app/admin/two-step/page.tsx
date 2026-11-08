import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminGate } from "@/lib/admin";
import { signOut } from "../login/actions";
import { verifyCode } from "./actions";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Two-step sign-in", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ e?: string; next?: string }> };

export default async function TwoStepPage({ searchParams }: Props) {
  const gate = await adminGate();
  if (!gate) redirect("/admin/login");
  if (gate.step === "setup") redirect("/admin/two-step/setup");
  if (gate.step === "ok") redirect("/admin");
  const q = await searchParams;
  return (
    <section className={`container ${styles.wrap}`}>
      <h1 className={styles.title}>Enter your code</h1>
      <p className="lede">Open your authenticator app and type the 6-digit code shown for ShotsByDunz.</p>
      {q.e === "code" && (
        <p className={styles.error} role="alert">
          That code didn’t work. Codes change every 30 seconds, so use the one showing now.
        </p>
      )}
      {q.e === "slow" && (
        <p className={styles.error} role="alert">
          Too many tries. Wait 15 minutes and try again.
        </p>
      )}
      <form action={verifyCode} className={styles.form}>
        {q.next === "password" && <input type="hidden" name="next" value="password" />}
        <div className={styles.field}>
          <label htmlFor="code">6-digit code</label>
          <input
            id="code"
            name="code"
            className={styles.code}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            required
            autoFocus
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Continue
        </button>
      </form>
      <nav className={styles.links} aria-label="Other options">
        <form action={signOut}>
          <button type="submit" className={styles.textButton}>
            Not you? Sign out
          </button>
        </form>
        <p className={styles.hint}>Lost your phone? Ask YAGIL Digital Studio to reset two-step for you.</p>
      </nav>
    </section>
  );
}
