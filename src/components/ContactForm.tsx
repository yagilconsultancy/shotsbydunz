"use client";

import { useState } from "react";
import styles from "./BookingForm.module.css";

type Fields = { name: string; email: string; message: string; website: string };

export default function ContactForm() {
  const [data, setData] = useState<Fields>({ name: "", email: "", message: "", website: "" });
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [failMsg, setFailMsg] = useState("");

  const set = (k: keyof Fields, v: string) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setState("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) return setState("sent");
    if (json.errors) setErrors(json.errors);
    setFailMsg(json.message || (json.errors ? "" : "Your message didn’t send. Check your connection and try again."));
    setState("failed");
  };

  if (state === "sent") {
    return (
      <div className={styles.summary} role="status">
        <h3>Message sent.</h3>
        <p className="muted">Thanks, {data.name.split(" ")[0]}. I’ll reply to {data.email} within 24 hours.</p>
      </div>
    );
  }

  return (
    <form className={styles.fields} onSubmit={submit} noValidate>
      <div className={styles.honey} aria-hidden="true">
        <label>
          Leave this empty
          <input tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => set("website", e.target.value)} />
        </label>
      </div>
      <div className={styles.field}>
        <label htmlFor="c-name">Name</label>
        <input id="c-name" autoComplete="name" value={data.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "c-name-e" : undefined} />
        {errors.name && <p id="c-name-e" className={styles.error}>{errors.name}</p>}
      </div>
      <div className={styles.field}>
        <label htmlFor="c-email">Email</label>
        <input id="c-email" type="email" autoComplete="email" value={data.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "c-email-e" : undefined} />
        {errors.email && <p id="c-email-e" className={styles.error}>{errors.email}</p>}
      </div>
      <div className={styles.field}>
        <label htmlFor="c-msg">Message</label>
        <textarea id="c-msg" rows={5} value={data.message} onChange={(e) => set("message", e.target.value)} aria-invalid={!!errors.message} aria-describedby={errors.message ? "c-msg-e" : undefined} />
        {errors.message && <p id="c-msg-e" className={styles.error}>{errors.message}</p>}
      </div>
      {failMsg && (
        <p className={styles.sendError} role="alert">
          {failMsg}
        </p>
      )}
      <div>
        <button type="submit" className="btn btn-primary" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
