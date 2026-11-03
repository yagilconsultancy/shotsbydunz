import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin";
import { sendLoginLink } from "./actions";
import styles from "@/components/BookingForm.module.css";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ sent?: string; e?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  if (await currentAdmin()) redirect("/admin");
  const q = await searchParams;
  return (
    <section className="container page-hero" style={{ paddingBottom: "clamp(64px, 10vw, 128px)", maxWidth: 560 }}>
      <h1>Bookings</h1>
      {q.sent ? (
        <p className="lede">If that email is allowed in, a sign-in link is on its way. It works once, on this device, for one hour.</p>
      ) : (
        <>
          <p className="lede">Enter your email and I’ll send you a one-time sign-in link.</p>
          {q.e === "link" && <p className={styles.sendError} role="alert">That sign-in link didn’t work. Ask for a new one below, and open it on this device.</p>}
          {q.e === "slow" && <p className={styles.sendError} role="alert">Too many tries. Wait 15 minutes and try again.</p>}
          <form action={sendLoginLink} className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div>
              <button type="submit" className="btn btn-primary">
                Send sign-in link
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
