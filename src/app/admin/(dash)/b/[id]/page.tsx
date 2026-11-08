import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/supabase";
import { getBooking, proofUrl } from "@/lib/bookings";
import { addOnOptions, clockLabel, labelFor, money, packageOptions, serviceOptions, BOOTH_DEPOSIT, VIDEO_DEPOSIT, type Span } from "@/lib/booking";
import { clashFor, spanOf } from "@/lib/availability";
import { declineReasons } from "@/content/site";
import { prettyDate, prettyTime, statuses, type BookingRow } from "@/lib/booking-status";
import { cancelBooking, confirmBooking, declineBooking, markBalancePaid, markDelivered, proofNeedsFixing, sendQuote, updateHold } from "../../actions";
import styles from "../../../admin.module.css";

const messages: Record<string, string> = {
  quote: "Quote sent. The client has a 7-day link to pay the deposit.",
  confirmed: "Confirmed. The client has been told they’re booked.",
  fix: "Asked the client for a new screenshot.",
  declined: "Declined. The client has been told.",
  cancelled: "Cancelled. The client has been told.",
  paid: "Balance marked as paid.",
  delivered: "Marked as delivered.",
  amount: "Check the amounts: both are needed, and the deposit can’t be more than the total.",
  stale: "This booking changed in another tab. Here’s the latest.",
  clash: "This booking overlaps a time that’s already held. Check the same-day list, then tick “Confirm anyway” if it’s fine.",
  reason: "Choose a reason for declining.",
  "reason-other": "Add a message to the client when the reason is “Other”.",
  hold: "Held time updated. Those hours are now closed on the booking form.",
  "hold-bad": "Enter both times for the held window.",
};

const hhmm = (minutes: number) => {
  const m = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ m?: string }> };

export default async function BookingPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const { m } = await searchParams;
  const b = await getBooking(id);
  if (!b) notFound();

  const [proof, sameDay, events, holdRow, clash] = await Promise.all([
    b.proof_path ? proofUrl(b.proof_path) : null,
    db().from("bookings").select("id, ref, name, start_time, hours, status").eq("event_date", b.event_date).neq("id", b.id).not("status", "in", "(declined,cancelled)"),
    db().from("booking_events").select("at, action, actor").eq("booking_id", b.id).order("at", { ascending: false }),
    db().from("blocked_times").select("starts_at, ends_at").eq("booking_id", b.id).maybeSingle(),
    b.status === "deposit_submitted" || b.status === "proof_needs_fixing"
      ? clashFor(b.event_date, b.start_time.slice(0, 5), b.hours, b.id).catch(() => null)
      : null,
  ]);
  const hold = holdRow.data ? spanOf(b.event_date, holdRow.data) : null;
  const others = (sameDay.data ?? []) as Pick<BookingRow, "id" | "ref" | "name" | "start_time" | "hours" | "status">[];
  const isImage = b.proof_path && /\.(jpg|png)$/.test(b.proof_path);
  const hasVideoService = b.services.some((s) => s !== "booth");
  const suggestedRate = hasVideoService ? VIDEO_DEPOSIT : BOOTH_DEPOSIT;

  const rows: [string, string | null][] = [
    ["Email", b.email],
    ["Phone", b.phone],
    ["Contact by", b.contact_method],
    ["Services", b.services.map((s) => labelFor(serviceOptions, s)).join(", ")],
    ["Booth package", b.booth_package ? labelFor(packageOptions, b.booth_package) : null],
    ["Videos", b.videos ? String(b.videos) : null],
    ["Hours", b.hours],
    ["Add-ons", b.add_ons.map((a) => labelFor(addOnOptions, a)).join(", ") || null],
    ["Keychains", b.keychains ? String(b.keychains) : null],
    ["Venue", b.venue],
    ["Address", b.location],
    ["Event type", b.event_type],
    ["Guests", b.guests ? String(b.guests) : null],
    ["Songs", b.songs],
    ["Song mix", b.song_mix],
    ["Schedule", b.schedule],
    ["Ideas and requests", b.details],
    ["Reference links", b.reference_links],
    ["Budget", b.budget],
    ["Found via", b.referral],
    ["Total", b.total_cents != null ? money(b.total_cents) : null],
    ["Deposit", b.deposit_cents != null ? money(b.deposit_cents) : null],
    ["Declined because", b.decline_reason],
    ["Note", b.status_note],
  ];

  return (
    <article className={styles.detail}>
      <Link href="/admin" className="text-link">
        ← All bookings
      </Link>
      {m && messages[m] && (
        <p className={styles.flash} role="status">
          {messages[m]}
        </p>
      )}
      <header className={styles.head}>
        <div>
          <p className="muted">{b.ref}</p>
          <h1 className={styles.name}>{b.name}</h1>
          <p>
            {prettyDate(b.event_date)}, {prettyTime(b.start_time)}, {b.hours} hours
          </p>
        </div>
        <span className={styles.badge} data-status={b.status}>
          {statuses[b.status].label}
        </span>
      </header>

      <div className={styles.cols}>
        <div>
          <section className={styles.panel}>
            <h2>What to do</h2>
            <Actions b={b} suggestedRate={suggestedRate} clash={clash} />
          </section>

          {(b.status === "confirmed" || b.status === "balance_paid") && (
            <section className={styles.panel}>
              <h2>Held time</h2>
              {hold ? (
                <p>
                  {clockLabel(hold.from)} – {clockLabel(hold.to)} is closed on the booking form for everyone else.
                </p>
              ) : (
                <p className="muted">No time is held for this booking yet. Save a window below to hold it.</p>
              )}
              <form action={updateHold} className={styles.form}>
                <input type="hidden" name="id" value={b.id} />
                <div className={styles.money}>
                  <label>
                    From
                    <input type="time" name="from" step={900} defaultValue={hold ? hhmm(hold.from) : ""} required />
                  </label>
                  <label>
                    To
                    <input type="time" name="to" step={900} defaultValue={hold ? hhmm(hold.to) : ""} required />
                  </label>
                </div>
                <p className="muted">Starts 30 minutes before and ends 30 minutes after the booking unless you change it. An end time earlier than the start means past midnight.</p>
                <button type="submit" className="btn btn-ghost">
                  Save held time
                </button>
              </form>
            </section>
          )}

          {b.proof_path && (
            <section className={styles.panel}>
              <h2>Deposit proof</h2>
              {proof ? (
                <>
                  {isImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proof} alt="E-transfer screenshot uploaded by the client" className={styles.proof} />
                  )}
                  <p>
                    <a href={proof} target="_blank" rel="noopener noreferrer" className="text-link">
                      Open the file
                    </a>{" "}
                    <span className="muted">(link works for 5 minutes; reload the page for a new one)</span>
                  </p>
                </>
              ) : (
                <p className="muted">The file couldn’t be loaded. Reload the page.</p>
              )}
              <p className="muted">Check your bank for {b.deposit_cents != null ? money(b.deposit_cents) : "the deposit"} with the message {b.ref}.</p>
            </section>
          )}
        </div>

        <div>
          <section className={styles.panel}>
            <h2>Details</h2>
            <dl className={styles.dl}>
              {rows
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
          </section>

          <section className={styles.panel}>
            <h2>Same day</h2>
            {others.length === 0 ? (
              <p className="muted">Nothing else on {prettyDate(b.event_date)}.</p>
            ) : (
              <ul className={styles.mini}>
                {others.map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/b/${o.id}`} className="text-link">
                      {prettyTime(o.start_time)}, {o.hours} h: {o.name}
                    </Link>{" "}
                    <span className="muted">({statuses[o.status].label})</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.panel}>
            <h2>History</h2>
            <ul className={styles.mini}>
              {(events.data ?? []).map((e, i) => (
                <li key={i}>
                  {new Date(e.at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}: {e.action}{" "}
                  <span className="muted">({e.actor === "client" ? "client" : "you"})</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </article>
  );
}

function NoteField({ label, required }: { label: string; required?: boolean }) {
  return (
    <div className={styles.field}>
      <label>
        {label} {!required && <span className="muted">optional</span>}
        <textarea name="note" rows={2} maxLength={1000} required={required} />
      </label>
    </div>
  );
}

function Actions({ b, suggestedRate, clash }: { b: BookingRow; suggestedRate: number; clash: Span | null }) {
  const id = <input type="hidden" name="id" value={b.id} />;
  const total = b.total_cents != null ? (b.total_cents / 100).toFixed(2) : "";
  const deposit = b.deposit_cents != null ? (b.deposit_cents / 100).toFixed(2) : "";

  switch (b.status) {
    case "requested":
    case "quoted":
      return (
        <>
          <form action={sendQuote} className={styles.form}>
            {id}
            {b.status === "quoted" && <p className="muted">Quote sent. Sending again gives the client a fresh 7-day link.</p>}
            <div className={styles.money}>
              <label>
                Total ($)
                <input name="total" inputMode="decimal" defaultValue={total} required />
              </label>
              <label>
                Deposit ($)
                <input name="deposit" inputMode="decimal" defaultValue={deposit} required />
              </label>
            </div>
            <p className="muted">Usual deposit: {Math.round(suggestedRate * 100)}% of the total.</p>
            <NoteField label="Note to the client" />
            <button type="submit" className="btn btn-primary">
              {b.status === "quoted" ? "Send quote again" : "Send quote"}
            </button>
          </form>
          <Decline id={id} />
        </>
      );
    case "deposit_submitted":
    case "proof_needs_fixing":
      return (
        <>
          {b.status === "proof_needs_fixing" && <p className="muted">Waiting for the client to upload a new screenshot.</p>}
          <form action={confirmBooking} className={styles.form}>
            {id}
            <p>Seen the deposit in your bank? Confirm to secure the date, hold the time and email the client.</p>
            {clash && (
              <>
                <p className={styles.warn}>
                  Overlaps a held time ({clockLabel(clash.from)} – {clockLabel(clash.to)}).
                </p>
                <label className={styles.inline}>
                  <input type="checkbox" name="force" value="yes" /> Confirm anyway
                </label>
              </>
            )}
            <button type="submit" className="btn btn-primary">
              Confirm booking
            </button>
          </form>
          <form action={proofNeedsFixing} className={styles.form}>
            {id}
            <NoteField label="What’s wrong with the proof?" required />
            <button type="submit" className="btn btn-ghost">
              Ask for a new screenshot
            </button>
          </form>
          <Decline id={id} />
        </>
      );
    case "confirmed":
    case "balance_paid":
      return (
        <>
          {b.status === "confirmed" && (
            <form action={markBalancePaid} className={styles.form}>
              {id}
              <button type="submit" className="btn btn-primary">
                Mark balance paid
              </button>
            </form>
          )}
          <form action={markDelivered} className={styles.form}>
            {id}
            <button type="submit" className="btn btn-ghost">
              Mark delivered
            </button>
          </form>
          <form action={cancelBooking} className={styles.form}>
            {id}
            <NoteField label="Reason for cancelling" />
            <button type="submit" className="btn btn-ghost">
              Cancel booking
            </button>
          </form>
        </>
      );
    default:
      return <p className="muted">Nothing left to do on this booking.</p>;
  }
}

function Decline({ id }: { id: React.ReactNode }) {
  return (
    <details className={styles.more}>
      <summary>Decline this booking</summary>
      <form action={declineBooking} className={styles.form}>
        {id}
        <div className={styles.field}>
          <label>
            Reason
            <select name="reason" required defaultValue="">
              <option value="" disabled>
                Choose a reason
              </option>
              {declineReasons.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>
        <NoteField label="Message to the client (needed for “Other”)" />
        <p className="muted">The client sees the reason and your message.</p>
        <button type="submit" className="btn btn-ghost">
          Decline and email the client
        </button>
      </form>
    </details>
  );
}
