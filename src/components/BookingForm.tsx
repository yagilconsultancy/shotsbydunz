"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cloneElement, useEffect, useRef, useState } from "react";
import {
  addOnOptions,
  budgets,
  contactMethods,
  earliestDate,
  emptyBooking,
  eventTypes,
  hasBooth,
  hasVideo,
  hourOptions,
  isFixedPrice,
  boothPrice,
  money,
  newRef,
  labelFor,
  packageOptions,
  referralSources,
  serviceOptions,
  songMixOptions,
  validateStep,
  type Booking,
  type Errors,
} from "@/lib/booking";
import { policies } from "@/content/site";
import Turnstile, { turnstileOn } from "./Turnstile";
import EtransferBox from "./EtransferBox";
import ProofUpload from "./ProofUpload";
import { proofProblem } from "@/lib/proof";
import styles from "./BookingForm.module.css";

const baseSteps = ["About you", "What you need", "Your event", "The details"];

type Prefill = { service?: string; pkg?: string; event?: string; bundle?: boolean; hours?: string; addons?: string; keychains?: string };

const eventFromCategory: Record<string, string> = {
  weddings: "Wedding",
  birthdays: "Birthday",
  events: "Corporate event",
  "personal-brands": "Personal brand shoot",
  bts: "Music or artist shoot",
};

export default function BookingForm({ prefill }: { prefill: Prefill }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [token, setToken] = useState("");
  const [ref, setRef] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [proofError, setProofError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const [data, setData] = useState<Booking>(() => {
    const services: string[] = [];
    if (prefill.service && serviceOptions.some((s) => s.id === prefill.service)) services.push(prefill.service);
    if (prefill.bundle && !services.includes("event-videography")) services.push("event-videography");
    return {
      ...emptyBooking,
      services,
      boothPackage: packageOptions.some((p) => p.id === prefill.pkg) ? prefill.pkg! : "",
      // Choices carried over from the booth price builder; anything not on the lists is dropped.
      hours: hourOptions.includes(prefill.hours ?? "") ? prefill.hours! : prefill.service === "booth" || prefill.pkg ? "3" : "",
      addOns: (prefill.addons ?? "").split(",").filter((id) => addOnOptions.some((a) => a.id === id && a.group === "booth")),
      keychains: /^\d{1,4}$/.test(prefill.keychains ?? "") ? prefill.keychains! : emptyBooking.keychains,
      eventType: prefill.event ? eventFromCategory[prefill.event] ?? "" : "",
    };
  });

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const set = <K extends keyof Booking>(key: K, value: Booking[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggle = (key: "services" | "addOns", id: string) => {
    const list = data[key];
    set(key, list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const next = () => {
    const e = validateStep(step, data);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = document.querySelector<HTMLElement>(`[data-field="${Object.keys(e)[0]}"] input, [data-field="${Object.keys(e)[0]}"] select, [data-field="${Object.keys(e)[0]}"] textarea`);
      first?.focus();
      return;
    }
    if (step === baseSteps.length - 1 && !ref) setRef(newRef());
    setStep((s) => s + 1);
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (step < steps.length - 1) return next();
    const e = validateStep(Math.min(step, baseSteps.length - 1), data);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (fixed) {
      const problem = proofProblem(proof);
      setProofError(problem ?? "");
      if (problem) return;
    }
    if (turnstileOn && !token) return setSendError("Please complete the quick check above the button.");
    setSending(true);
    setSendError("");
    try {
      const form = new FormData();
      form.append("data", JSON.stringify({ ...data, ref: fixed ? ref : undefined, turnstile: token }));
      if (fixed && proof) form.append("proof", proof);
      const res = await fetch("/api/booking", { method: "POST", body: form });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToken("");
        setAttempt((n) => n + 1);
        if (json.errors?.proof) setProofError(json.errors.proof);
        if (json.errors) {
          setErrors(json.errors);
          const firstStep = [["name", "email", "phone", "contactMethod"], ["services", "boothPackage", "videos", "hours", "addOns", "keychains"], ["date", "startTime", "location", "eventType", "guests", "songMix"], ["budget", "referral", "agree"]].findIndex((keys) =>
            keys.some((k) => k in json.errors),
          );
          if (firstStep >= 0) setStep(firstStep);
        }
        setSendError(json.message || "Your request didn’t send. Check your connection and try again.");
        return;
      }
      router.push(json.kind === "deposit" ? "/book/thanks?type=deposit" : "/book/thanks");
    } catch {
      setSendError("Your request didn’t send. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  const video = hasVideo(data);
  const booth = hasBooth(data);
  const fixed = isFixedPrice(data);
  const steps = fixed ? [...baseSteps, "Deposit"] : baseSteps;
  const price = fixed ? boothPrice(data) : null;
  const visibleAddOns = addOnOptions.filter((a) => (a.group === "video" && video) || (a.group === "booth" && booth));

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <ol className={styles.progress} aria-label="Booking steps">
        {steps.map((s, i) => (
          <li key={s} data-state={i < step ? "done" : i === step ? "current" : "todo"} aria-current={i === step ? "step" : undefined}>
            <span className={styles.bar} />
            <span className={styles.stepLabel}>{s}</span>
          </li>
        ))}
      </ol>

      <h2 ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
        <span className="visually-hidden">
          Step {step + 1} of {steps.length}:{" "}
        </span>
        {steps[step]}
      </h2>

      <div className={styles.honey} aria-hidden="true">
        <label>
          Leave this empty
          <input tabIndex={-1} autoComplete="off" value={data.website ?? ""} onChange={(e) => set("website", e.target.value)} />
        </label>
      </div>

      {step === 0 && (
        <div className={styles.fields}>
          <Field id="name" label="Full name" error={errors.name}>
            <input id="name" autoComplete="name" value={data.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field id="email" label="Email" error={errors.email}>
            <input id="email" type="email" autoComplete="email" inputMode="email" value={data.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field id="phone" label="Phone" error={errors.phone}>
            <input id="phone" type="tel" autoComplete="tel" inputMode="tel" value={data.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <fieldset className={styles.fieldset}>
            <legend>Best way to reach you</legend>
            <div className={styles.pills}>
              {contactMethods.map((m) => (
                <label key={m} className={styles.pill}>
                  <input type="radio" name="contactMethod" checked={data.contactMethod === m} onChange={() => set("contactMethod", m)} />
                  <span>{m}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {step === 1 && (
        <div className={styles.fields}>
          <fieldset className={styles.fieldset} data-field="services" aria-describedby={errors.services ? "services-error" : undefined}>
            <legend>Services you’re interested in</legend>
            <div className={styles.checks}>
              {serviceOptions.map((s) => (
                <label key={s.id} className={styles.check}>
                  <input type="checkbox" checked={data.services.includes(s.id)} onChange={() => toggle("services", s.id)} />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
            {errors.services && <p id="services-error" className={styles.error}>{errors.services}</p>}
          </fieldset>

          {booth && (
            <fieldset className={styles.fieldset} data-field="boothPackage">
              <legend>Booth package</legend>
              <div className={styles.checks}>
                {packageOptions.map((p) => (
                  <label key={p.id} className={styles.check}>
                    <input type="radio" name="boothPackage" checked={data.boothPackage === p.id} onChange={() => set("boothPackage", p.id)} />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
              {errors.boothPackage && <p className={styles.error}>{errors.boothPackage}</p>}
            </fieldset>
          )}

          <div className={styles.row}>
            {video && (
              <Field id="videos" label="Number of videos" error={errors.videos}>
                <input id="videos" type="number" min={1} max={50} inputMode="numeric" value={data.videos} onChange={(e) => set("videos", e.target.value)} />
              </Field>
            )}
            <Field id="hours" label="Hours of coverage" error={errors.hours} hint={booth ? "Booth packages include 3 hours." : undefined}>
              <select id="hours" value={data.hours} onChange={(e) => set("hours", e.target.value)}>
                <option value="">Choose</option>
                {hourOptions.map((h) => (
                  <option key={h} value={h}>
                    {h} {h === "1" ? "hour" : "hours"}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {visibleAddOns.length > 0 && (
            <fieldset className={styles.fieldset}>
              <legend>
                Add-ons <span className={styles.optional}>optional</span>
              </legend>
              <div className={styles.checks}>
                {visibleAddOns.map((a) => (
                  <label key={a.id} className={styles.check}>
                    <input type="checkbox" checked={data.addOns.includes(a.id)} onChange={() => toggle("addOns", a.id)} />
                    <span>{a.label}</span>
                  </label>
                ))}
              </div>
              {errors.addOns && <p className={styles.error}>{errors.addOns}</p>}
            </fieldset>
          )}

          {booth && data.addOns.includes("keychains") && (
            <Field id="keychains" label="How many keychains?" error={errors.keychains} hint="Minimum 50.">
              <input id="keychains" type="number" min={50} max={2000} inputMode="numeric" value={data.keychains} onChange={(e) => set("keychains", e.target.value)} />
            </Field>
          )}
        </div>
      )}

      {step === 2 && (
        <div className={styles.fields}>
          <div className={styles.row}>
            <Field
              id="date"
              label="Event date"
              error={errors.date}
              hint={`Earliest available: ${new Date(earliestDate(data) + "T12:00:00").toLocaleDateString("en-CA", { month: "long", day: "numeric" })}`}
            >
              <input id="date" type="date" min={earliestDate(data)} value={data.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field id="startTime" label="Start time" error={errors.startTime}>
              <input id="startTime" type="time" value={data.startTime} onChange={(e) => set("startTime", e.target.value)} />
            </Field>
          </div>
          <Field id="location" label="Venue or city" error={errors.location} hint="A $50 travel fee applies outside London, Ontario.">
            <input id="location" autoComplete="address-level2" value={data.location} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <div className={styles.row}>
            <Field id="eventType" label="Type of event" error={errors.eventType}>
              <select id="eventType" value={data.eventType} onChange={(e) => set("eventType", e.target.value)}>
                <option value="">Choose</option>
                {eventTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            {booth && (
              <Field id="guests" label="Expected guests" optional>
                <input id="guests" type="number" min={1} inputMode="numeric" value={data.guests} onChange={(e) => set("guests", e.target.value)} />
              </Field>
            )}
          </div>
          {video && (
            <>
              <Field id="songs" label="Song choices" optional hint="Up to 2 songs. Leave blank and I’ll choose.">
                <textarea id="songs" rows={2} value={data.songs} onChange={(e) => set("songs", e.target.value)} />
              </Field>
              <fieldset className={styles.fieldset}>
                <legend>
                  Song mix <span className={styles.optional}>optional</span>
                </legend>
                <div className={styles.pills}>
                  {songMixOptions.map((m) => (
                    <label key={m} className={styles.pill}>
                      <input type="radio" name="songMix" checked={data.songMix === m} onChange={() => set("songMix", m)} />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div className={styles.fields}>
          <Field id="details" label="Ideas and special requests" optional>
            <textarea id="details" rows={4} value={data.details} onChange={(e) => set("details", e.target.value)} />
          </Field>
          {video && (
            <Field id="schedule" label="Schedule of the day" optional hint="Key moments and times, like speeches or first dance. You can also send this later.">
              <textarea id="schedule" rows={3} value={data.schedule} onChange={(e) => set("schedule", e.target.value)} />
            </Field>
          )}
          <Field id="references" label="Links to videos you love" optional>
            <input id="references" value={data.references} onChange={(e) => set("references", e.target.value)} />
          </Field>
          <div className={styles.row}>
            <Field id="budget" label="Budget" optional>
              <select id="budget" value={data.budget} onChange={(e) => set("budget", e.target.value)}>
                <option value="">Prefer not to say</option>
                {budgets.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
            <Field id="referral" label="How did you find me?" optional>
              <select id="referral" value={data.referral} onChange={(e) => set("referral", e.target.value)}>
                <option value="">Choose</option>
                {referralSources.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
          </div>

          <section className={styles.summary} aria-label="Your request">
            <h3>Your request</h3>
            <dl>
              <div>
                <dt>Services</dt>
                <dd>{data.services.map((s) => labelFor(serviceOptions, s)).join(", ")}</dd>
              </div>
              {booth && data.boothPackage && (
                <div>
                  <dt>Booth</dt>
                  <dd>{labelFor(packageOptions, data.boothPackage)}</dd>
                </div>
              )}
              <div>
                <dt>When</dt>
                <dd>
                  {data.date && new Date(data.date + "T12:00:00").toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  {data.startTime && `, ${data.startTime}`}
                </dd>
              </div>
              <div>
                <dt>Where</dt>
                <dd>{data.location}</dd>
              </div>
              {price ? (
                <>
                  <div>
                    <dt>Total</dt>
                    <dd>{money(price.totalCents)}</dd>
                  </div>
                  <div>
                    <dt>Deposit</dt>
                    <dd>
                      {money(price.depositCents)} now (50%). {policies.booth.balance}.
                    </dd>
                  </div>
                </>
              ) : (
                <div>
                  <dt>Deposit</dt>
                  <dd>
                    {video && <span className={styles.policy}>Video: {policies.video.deposit}. {policies.video.balance}.</span>}
                    {booth && <span className={styles.policy}>Booth: {policies.booth.deposit}. {policies.booth.balance}.</span>}
                  </dd>
                </div>
              )}
            </dl>
            <p className={styles.small}>
              {fixed
                ? "Next you’ll pay the deposit by e-transfer and upload proof. Your date is secured once I confirm the payment."
                : "This is a request, not a payment. I’ll check availability and send your quote. You pay the deposit after you accept it."}
            </p>
          </section>

          <div data-field="agree">
            <label className={styles.check}>
              <input type="checkbox" checked={data.agree} onChange={(e) => set("agree", e.target.checked)} aria-describedby={errors.agree ? "agree-error" : undefined} />
              <span>
                I’ve read and agree to the{" "}
                <Link href={booth && !video ? "/terms#booth" : "/terms"} target="_blank" className="text-link">
                  terms and conditions
                </Link>{" "}
                and the{" "}
                <Link href="/privacy" target="_blank" className="text-link">
                  privacy policy
                </Link>
                .
              </span>
            </label>
            {errors.agree && <p id="agree-error" className={styles.error}>{errors.agree}</p>}
          </div>
        </div>
      )}

      {step === 4 && price && (
        <div className={styles.fields}>
          <section className={styles.summary} aria-label="Price">
            <h3>Your booth booking</h3>
            <table className={styles.priceTable}>
              <tbody>
                {price.lines.map((l) => (
                  <tr key={l.label}>
                    <td>{l.label}</td>
                    <td>{money(l.cents)}</td>
                  </tr>
                ))}
                <tr className={styles.total}>
                  <td>Total</td>
                  <td>{money(price.totalCents)}</td>
                </tr>
                <tr className={styles.total}>
                  <td>Deposit due now (50%)</td>
                  <td>{money(price.depositCents)}</td>
                </tr>
              </tbody>
            </table>
            <p className={styles.small}>{policies.booth.travel}; any travel fee is added to the balance.</p>
          </section>
          <EtransferBox reference={ref} depositCents={price.depositCents} />
          <ProofUpload
            file={proof}
            error={proofError}
            onFile={(f) => {
              setProof(f);
              setProofError("");
            }}
          />
        </div>
      )}

      {step === steps.length - 1 && <Turnstile key={attempt} onToken={setToken} />}

      {sendError && (
        <p className={styles.sendError} role="alert">
          {sendError}
        </p>
      )}

      <div className={styles.nav}>
        {step > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </button>
        )}
        <button type="submit" className={`btn ${booth && !video ? "btn-booth" : "btn-primary"} ${styles.nextBtn}`} disabled={sending}>
          {step < steps.length - 1
            ? step === baseSteps.length - 1 && fixed
              ? "Continue to deposit"
              : "Continue"
            : sending
              ? "Sending…"
              : fixed
                ? "Submit booking and proof"
                : "Send booking request"}
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactElement<Record<string, unknown>>;
}) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const child = cloneElement(children, { "aria-describedby": describedBy, "aria-invalid": error ? true : undefined });
  return (
    <div className={styles.field} data-field={id}>
      <label htmlFor={id}>
        {label} {optional && <span className={styles.optional}>optional</span>}
      </label>
      {child}
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
