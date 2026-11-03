"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProofUpload from "./ProofUpload";
import Turnstile, { turnstileOn } from "./Turnstile";
import { proofProblem } from "@/lib/proof";
import styles from "./BookingForm.module.css";

export default function DepositForm({ token, terms }: { token: string; terms: string }) {
  const router = useRouter();
  const [proof, setProof] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<{ proof?: string; agree?: string }>({});
  const [sendError, setSendError] = useState("");
  const [sending, setSending] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [attempt, setAttempt] = useState(0);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = { proof: proofProblem(proof) ?? undefined, agree: agree ? undefined : "Please agree to the terms to secure your date." };
    setErrors(e);
    if (e.proof || e.agree) return;
    if (turnstileOn && !captcha) return setSendError("Please complete the quick check above the button.");
    setSending(true);
    setSendError("");
    const form = new FormData();
    form.append("data", JSON.stringify({ token, agree, turnstile: captcha }));
    form.append("proof", proof!);
    const res = await fetch("/api/deposit", { method: "POST", body: form }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    setSending(false);
    if (res?.ok) return router.push("/book/thanks?type=deposit");
    setCaptcha("");
    setAttempt((n) => n + 1);
    if (json.errors) setErrors(json.errors);
    setSendError(json.message || "Your upload didn’t send. Check your connection and try again.");
  };

  return (
    <form className={styles.fields} onSubmit={submit} noValidate>
      <ProofUpload
        file={proof}
        error={errors.proof}
        onFile={(f) => {
          setProof(f);
          setErrors((x) => ({ ...x, proof: undefined }));
        }}
      />
      <div data-field="agree">
        <label className={styles.check}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span>
            I’ve read and agree to the{" "}
            <Link href={terms} target="_blank" className="text-link">
              terms and conditions
            </Link>{" "}
            and the{" "}
            <Link href="/privacy" target="_blank" className="text-link">
              privacy policy
            </Link>
            .
          </span>
        </label>
        {errors.agree && <p className={styles.error}>{errors.agree}</p>}
      </div>
      <Turnstile key={attempt} onToken={setCaptcha} />
      {sendError && (
        <p className={styles.sendError} role="alert">
          {sendError}
        </p>
      )}
      <div>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "Uploading…" : "Submit deposit proof"}
        </button>
      </div>
    </form>
  );
}
