import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminGate } from "@/lib/admin";
import FormCheck from "@/components/admin/FormCheck";
import { sendPasswordLink, signInWithPassword } from "./actions";
import styles from "../auth.module.css";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ sent?: string; e?: string; m?: string }> };

const errors: Record<string, string> = {
  wrong: "That email and password don’t match. Check both and try again.",
  slow: "Too many tries. Wait 15 minutes and try again.",
  bot: "Please complete the quick check above the button and try again.",
  link: "That link didn’t work or has expired. Links work once, for an hour. Ask for a new one below.",
  setup: "Before turning on two-step sign-in, confirm it’s you: we’ll email you a link. Open it on this device, then set up your authenticator app.",
};

export default async function LoginPage({ searchParams }: Props) {
  const gate = await adminGate();
  const q = await searchParams;
  // Someone signed in by password who still needs to set up two-step can stay to ask for a link.
  if (gate && !(gate.step === "setup" && q.m === "reset")) redirect("/admin");
  const mode = q.m === "reset" ? "reset" : "password";
  const error = q.e ? errors[q.e] : null;

  if (q.sent) {
    return (
      <section className={`container ${styles.wrap}`}>
        <h1 className={styles.title}>Check your email</h1>
        <p className="lede">
          If that email has dashboard access, a link to set your password is on its way. It works once, within an hour, on
          any device.
        </p>
        <Link href="/admin/login" className={styles.alt}>
          Back to sign in
        </Link>
      </section>
    );
  }

  return (
    <section className={`container ${styles.wrap}`}>
      <h1 className={styles.title}>{mode === "reset" ? "Set your password" : "Sign in"}</h1>
      <p className="lede">
        {mode === "password" && "The ShotsByDunz dashboard: bookings, photos and portfolio."}
        {mode === "reset" && "First time here, or forgot your password? We’ll email you a link to choose a new one."}
      </p>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {mode === "password" && (
        <form action={signInWithPassword} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="username" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <FormCheck />
          <button type="submit" className="btn btn-primary">
            Sign in
          </button>
        </form>
      )}

      {mode === "reset" && (
        <form action={sendPasswordLink} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <FormCheck />
          <button type="submit" className="btn btn-primary">
            Send password link
          </button>
        </form>
      )}

      <nav className={styles.links} aria-label="Other options">
        {mode === "reset" ? (
          <Link href="/admin/login">Back to sign in</Link>
        ) : (
          <Link href="/admin/login?m=reset">First time, or forgot your password?</Link>
        )}
      </nav>
    </section>
  );
}
