import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminGate } from "@/lib/admin";
import { authClient } from "@/lib/supabase";
import { confirmSetup } from "../actions";
import styles from "../../auth.module.css";

export const metadata: Metadata = { title: "Set up two-step sign-in", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ e?: string; f?: string }> };

export default async function TwoStepSetupPage({ searchParams }: Props) {
  const gate = await adminGate();
  if (!gate) redirect("/admin/login");
  if (gate.step !== "setup") redirect("/admin");
  if (!gate.emailProven) redirect("/admin/login?m=link&e=setup");
  const q = await searchParams;
  const supabase = await authClient();
  const { data: list } = await supabase.auth.mfa.listFactors();
  const pending = (list?.all ?? []).filter((f) => f.factor_type === "totp" && f.status === "unverified");

  // After a wrong code, keep the app that was just scanned instead of making a new QR code.
  let retry = q.e === "code" && q.f ? pending.find((f) => f.id === q.f) : undefined;
  let qr = "";
  let secret = "";
  if (!retry) {
    // A fresh QR code each visit; any earlier unconfirmed one is cleared so only one can work.
    for (const f of pending) await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "ShotsByDunz", issuer: "ShotsByDunz" });
    if (error || !data) throw new Error("Couldn't start two-step setup");
    retry = { id: data.id } as (typeof pending)[number];
    qr = data.totp.qr_code;
    secret = data.totp.secret;
  }

  return (
    <section className={`container ${styles.wrap}`}>
      <h1 className={styles.title}>Turn on two-step sign-in</h1>
      <p className="lede">
        After your password, the dashboard will also ask for a 6-digit code from your phone. Even if someone learns your
        password, they can’t get in without it.
      </p>
      {q.e === "code" && (
        <p className={styles.error} role="alert">
          That code didn’t work. Use the code showing now for ShotsByDunz in your app.
        </p>
      )}
      {q.e === "slow" && (
        <p className={styles.error} role="alert">
          Too many tries. Wait 15 minutes and try again.
        </p>
      )}
      <ol className={styles.steps}>
        {qr ? (
          <>
            <li>
              <strong>Install an authenticator app</strong>
              <span className={styles.hint}>Google Authenticator, Microsoft Authenticator or 1Password all work. They’re free.</span>
            </li>
            <li>
              <strong>Add ShotsByDunz</strong>
              <span className={styles.hint}>In the app, tap + and scan this code.</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR code to add ShotsByDunz to your authenticator app" className={styles.qr} width={200} height={200} />
              <span className={styles.hint}>Setting up on this phone? Enter this key in the app instead:</span>
              <code className={styles.secret}>{secret.replace(/(.{4})/g, "$1 ").trim()}</code>
            </li>
          </>
        ) : (
          <li>
            <strong>Use the ShotsByDunz entry you just added</strong>
            <span className={styles.hint}>
              Didn’t add it? <Link href="/admin/two-step/setup">Start again with a new code</Link>
            </span>
          </li>
        )}
        <li>
          <strong>Type the 6-digit code it shows</strong>
          <form action={confirmSetup} className={styles.form}>
            <input type="hidden" name="factor" value={retry.id} />
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
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Turn on two-step
            </button>
          </form>
        </li>
      </ol>
    </section>
  );
}
