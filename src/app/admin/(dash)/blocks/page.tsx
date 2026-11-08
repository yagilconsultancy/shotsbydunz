import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/supabase";
import { clockLabel } from "@/lib/booking";
import { spanOf, stampAt, type Block } from "@/lib/availability";
import { prettyDate } from "@/lib/booking-status";
import { addBlock, removeBlock } from "../actions";
import styles from "../../admin.module.css";

const messages: Record<string, string> = {
  added: "Blocked. Those hours are closed on the booking form.",
  removed: "Block removed. Those hours are open again.",
  bad: "Choose a date, and either both times or “All day”.",
  failed: "That didn’t save. Try again.",
};

const ontarioToday = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });

export default async function BlocksPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  await requireAdmin();
  const { m } = await searchParams;
  const today = ontarioToday();
  const { data, error } = await db()
    .from("blocked_times")
    .select("id, booking_id, starts_at, ends_at, note")
    .gt("ends_at", stampAt(today, 0))
    .order("starts_at", { ascending: true })
    .limit(300);
  const blocks = (data ?? []) as Block[];
  const ids = blocks.map((b) => b.booking_id).filter((x): x is string => !!x);
  const { data: owners } = ids.length
    ? await db().from("bookings").select("id, ref, name").in("id", ids)
    : { data: [] as { id: string; ref: string; name: string }[] };
  const byId = new Map((owners ?? []).map((o) => [o.id, o]));

  return (
    <article className={styles.detail}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.name}>Blocked times</h1>
          <p className="muted">Times here can’t be picked on the booking form. Confirmed bookings are added for you.</p>
        </div>
      </header>
      {m && messages[m] && (
        <p className={styles.flash} role="status">
          {messages[m]}
        </p>
      )}

      <div className={styles.cols}>
        <section className={styles.panel}>
          <h2>Block a time</h2>
          <form action={addBlock} className={styles.form}>
            <div className={styles.field}>
              <label>
                Date
                <input type="date" name="date" min={today} required />
              </label>
            </div>
            <div className={styles.money}>
              <label>
                From
                <input type="time" name="from" step={900} />
              </label>
              <label>
                To
                <input type="time" name="to" step={900} />
              </label>
            </div>
            <label className={styles.inline}>
              <input type="checkbox" name="allDay" value="yes" /> All day
            </label>
            <div className={styles.field}>
              <label>
                Note to yourself <span className="muted">optional, never shown to clients</span>
                <input name="note" maxLength={200} />
              </label>
            </div>
            <button type="submit" className="btn btn-primary">
              Block this time
            </button>
          </form>
        </section>

        <section className={styles.panel}>
          <h2>Coming up</h2>
          {error ? (
            <p className="muted">Blocked times couldn’t be loaded. Has 004_availability.sql been run in Supabase?</p>
          ) : blocks.length === 0 ? (
            <p className="muted">Nothing blocked yet.</p>
          ) : (
            <ul className={styles.mini}>
              {blocks.map((b) => {
                const date = b.starts_at.slice(0, 10);
                const s = spanOf(date, b);
                const owner = b.booking_id ? byId.get(b.booking_id) : null;
                return (
                  <li key={b.id} className={styles.blockRow}>
                    <span>
                      <strong>{prettyDate(date)}</strong>, {s.from === 0 && s.to === 1440 ? "all day" : `${clockLabel(s.from)} – ${clockLabel(s.to)}`}
                      <br />
                      {owner ? (
                        <Link href={`/admin/b/${owner.id}`} className="text-link">
                          {owner.ref}: {owner.name}
                        </Link>
                      ) : (
                        <span className="muted">{b.note || "Blocked by you"}</span>
                      )}
                    </span>
                    {!b.booking_id && (
                      <form action={removeBlock}>
                        <input type="hidden" name="id" value={b.id} />
                        <button type="submit" className="btn btn-ghost">
                          Remove
                        </button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </article>
  );
}
