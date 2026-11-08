import { db } from "./supabase";
import { bookingSpan, isRealDate, overlaps, type Span } from "./booking";

// blocked_times stores Ontario wall-clock times ("2026-12-05T13:30:00"). Here they become minutes
// from midnight on a given event date, the form the booking rules in lib/booking.ts work in.
const DAY = 1440;
const base = (date: string) => Date.parse(`${date}T00:00:00Z`);
export const stampAt = (date: string, minutes: number) => new Date(base(date) + minutes * 60000).toISOString().slice(0, 19);
const minutesFrom = (date: string, stamp: string) => Math.round((Date.parse(`${stamp.slice(0, 19)}Z`) - base(date)) / 60000);

export type Block = { id: string; booking_id: string | null; starts_at: string; ends_at: string; note: string | null };

// Everything that could touch a booking on this date, including a long evening the day before.
export async function blocksAround(date: string): Promise<Block[]> {
  if (!isRealDate(date)) return [];
  const { data, error } = await db()
    .from("blocked_times")
    .select("id, booking_id, starts_at, ends_at, note")
    .lt("starts_at", stampAt(date, 2 * DAY))
    .gt("ends_at", stampAt(date, -DAY))
    .order("starts_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as Block[];
}

export async function takenOn(date: string, exceptBooking?: string): Promise<Span[]> {
  const blocks = await blocksAround(date);
  return blocks
    .filter((b) => !exceptBooking || b.booking_id !== exceptBooking)
    .map((b) => ({ from: minutesFrom(date, b.starts_at), to: minutesFrom(date, b.ends_at) }));
}

export async function clashFor(date: string, startTime: string, hours: string, exceptBooking?: string) {
  const span = bookingSpan(startTime, hours);
  return (await takenOn(date, exceptBooking)).find((t) => overlaps(span, t)) ?? null;
}

// The hold for a confirmed booking. Replacing rather than updating keeps one row per booking.
export async function holdBooking(bookingId: string, date: string, startTime: string, hours: string, span?: Span) {
  const s = span ?? bookingSpan(startTime, hours);
  await db().from("blocked_times").delete().eq("booking_id", bookingId);
  const { error } = await db()
    .from("blocked_times")
    .insert({ booking_id: bookingId, starts_at: stampAt(date, s.from), ends_at: stampAt(date, s.to) });
  if (error) throw error;
}

export async function releaseBooking(bookingId: string) {
  await db().from("blocked_times").delete().eq("booking_id", bookingId);
}

export const spanOf = (date: string, b: Pick<Block, "starts_at" | "ends_at">): Span => ({
  from: minutesFrom(date, b.starts_at),
  to: minutesFrom(date, b.ends_at),
});
