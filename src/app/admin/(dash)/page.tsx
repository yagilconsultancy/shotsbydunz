import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/supabase";
import { isRealDate, labelFor, serviceOptions } from "@/lib/booking";
import { prettyDate, prettyTime, statuses, type BookingRow, type Status } from "@/lib/booking-status";
import styles from "../admin.module.css";

const views = {
  action: { label: "Needs you", statuses: ["requested", "deposit_submitted"] as Status[] },
  upcoming: { label: "Upcoming", statuses: ["quoted", "deposit_submitted", "proof_needs_fixing", "confirmed", "balance_paid"] as Status[] },
  all: { label: "All", statuses: Object.keys(statuses) as Status[] },
};
type View = keyof typeof views;

type Props = { searchParams: Promise<{ view?: string; date?: string }> };

export default async function AdminHome({ searchParams }: Props) {
  await requireAdmin();
  const q = await searchParams;
  const view: View = q.view && q.view in views ? (q.view as View) : "action";
  const day = q.date && isRealDate(q.date) ? q.date : null;

  let query = db().from("bookings").select("*").order("event_date", { ascending: true }).order("start_time", { ascending: true }).limit(200);
  if (day) query = query.eq("event_date", day);
  else {
    query = query.in("status", views[view].statuses);
    if (view === "upcoming") query = query.gte("event_date", new Date().toISOString().slice(0, 10));
  }
  const { data } = await query;
  const rows = (data ?? []) as BookingRow[];

  return (
    <>
      <nav className={styles.tabs} aria-label="Booking views">
        {(Object.keys(views) as View[]).map((v) => (
          <Link key={v} href={`/admin?view=${v}`} aria-current={!day && v === view ? "page" : undefined}>
            {views[v].label}
          </Link>
        ))}
        <form className={styles.dayPick} action="/admin">
          <label htmlFor="date" className="visually-hidden">
            Show one day
          </label>
          <input id="date" name="date" type="date" defaultValue={day ?? ""} />
          <button type="submit" className="btn btn-ghost">
            Show day
          </button>
        </form>
      </nav>
      {day && <h2 className={styles.dayTitle}>{prettyDate(day)}</h2>}
      {rows.length === 0 ? (
        <p className="muted">{view === "action" && !day ? "Nothing needs you right now." : "No bookings here."}</p>
      ) : (
        <ul className={styles.list}>
          {rows.map((b) => (
            <li key={b.id}>
              <Link href={`/admin/b/${b.id}`} className={styles.row}>
                <span className={styles.when}>
                  {prettyDate(b.event_date)}
                  <span className="muted">
                    {prettyTime(b.start_time)}, {b.hours} h
                  </span>
                </span>
                <span>
                  {b.name}
                  <span className="muted">{b.services.map((s) => labelFor(serviceOptions, s)).join(", ")}</span>
                </span>
                <span className={styles.badge} data-status={b.status}>
                  {statuses[b.status].label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
