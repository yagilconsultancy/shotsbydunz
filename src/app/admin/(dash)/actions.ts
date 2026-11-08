"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db, siteUrl } from "@/lib/supabase";
import { getBooking, issueDepositLink, clearDepositLink, logEvent } from "@/lib/bookings";
import { sendMail } from "@/lib/mail";
import { clientEmails } from "@/lib/booking-emails";
import type { BookingRow, Status } from "@/lib/booking-status";
import { declineReasons, site } from "@/content/site";
import { clashFor, holdBooking, releaseBooking, stampAt } from "@/lib/availability";
import { isRealDate } from "@/lib/booking";

const note = (fd: FormData) => String(fd.get("note") ?? "").trim().slice(0, 1000) || null;

function cents(v: FormDataEntryValue | null) {
  const s = String(v ?? "").replace(/[$,\s]/g, "");
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(s)) return null;
  const c = Math.round(Number(s) * 100);
  return c > 0 && c <= 10_000_000 ? c : null;
}

async function load(fd: FormData) {
  const actor = await requireAdmin();
  const b = await getBooking(String(fd.get("id") ?? ""));
  if (!b) redirect("/admin");
  return { actor, b };
}

// The status guard in the update means a double click, or two open tabs, can't apply the
// same change twice or skip a step.
async function move(b: BookingRow, from: Status[], patch: Partial<BookingRow> & { status: Status }) {
  const { data, error } = await db().from("bookings").update(patch).eq("id", b.id).in("status", from).select("*").single();
  if (error || !data) redirect(`/admin/b/${b.id}?m=stale`);
  return data as BookingRow;
}

const ownerEmail = () => process.env.BOOKING_TO_EMAIL || site.email;
const tell = (b: BookingRow, mail: { subject: string; html: string; text: string }) => sendMail({ to: b.email, replyTo: ownerEmail(), ...mail });

export async function sendQuote(fd: FormData) {
  const { actor, b } = await load(fd);
  const total = cents(fd.get("total"));
  const deposit = cents(fd.get("deposit"));
  if (!total || !deposit || deposit > total) redirect(`/admin/b/${b.id}?m=amount`);
  const updated = await move(b, ["requested", "quoted"], { status: "quoted", total_cents: total, deposit_cents: deposit, quote_note: note(fd) });
  const token = await issueDepositLink(b.id);
  await logEvent(b.id, b.status === "quoted" ? "quote re-sent" : "quote sent", actor);
  await tell(updated, clientEmails.quote(updated, `${siteUrl()}/deposit/${token}`));
  redirect(`/admin/b/${b.id}?m=quote`);
}

const isClock = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const toMinutes = (v: string) => Number(v.slice(0, 2)) * 60 + Number(v.slice(3, 5));

// A clash only stops the first click. Dunz may know something the calendar doesn't (two
// events in the same building, say), so ticking "confirm anyway" lets it through.
export async function confirmBooking(fd: FormData) {
  const { actor, b } = await load(fd);
  if (fd.get("force") !== "yes") {
    const clash = await clashFor(b.event_date, b.start_time.slice(0, 5), b.hours, b.id).catch(() => null);
    if (clash) redirect(`/admin/b/${b.id}?m=clash`);
  }
  const updated = await move(b, ["deposit_submitted", "proof_needs_fixing"], { status: "confirmed", confirmed_at: new Date().toISOString(), status_note: null });
  await clearDepositLink(b.id);
  await holdBooking(b.id, b.event_date, b.start_time.slice(0, 5), b.hours).catch(() => console.error("Couldn't hold the time"));
  await logEvent(b.id, "confirmed", actor);
  await tell(updated, clientEmails.confirmed(updated));
  redirect(`/admin/b/${b.id}?m=confirmed`);
}

export async function proofNeedsFixing(fd: FormData) {
  const { actor, b } = await load(fd);
  const updated = await move(b, ["deposit_submitted", "proof_needs_fixing"], { status: "proof_needs_fixing", status_note: note(fd) });
  const token = await issueDepositLink(b.id);
  await logEvent(b.id, "asked for new proof", actor);
  await tell(updated, clientEmails.proofNeedsFixing(updated, `${siteUrl()}/deposit/${token}`));
  redirect(`/admin/b/${b.id}?m=fix`);
}

export async function declineBooking(fd: FormData) {
  const { actor, b } = await load(fd);
  const reason = String(fd.get("reason") ?? "");
  const message = note(fd);
  if (!declineReasons.includes(reason)) redirect(`/admin/b/${b.id}?m=reason`);
  if (reason === "Other" && !message) redirect(`/admin/b/${b.id}?m=reason-other`);
  const updated = await move(b, ["requested", "quoted", "deposit_submitted", "proof_needs_fixing"], {
    status: "declined",
    decline_reason: reason,
    status_note: message,
  });
  await clearDepositLink(b.id);
  await releaseBooking(b.id).catch(() => null);
  await logEvent(b.id, `declined: ${reason}`, actor);
  await tell(updated, clientEmails.declined(updated));
  redirect(`/admin/b/${b.id}?m=declined`);
}

export async function cancelBooking(fd: FormData) {
  const { actor, b } = await load(fd);
  const updated = await move(b, ["confirmed", "balance_paid"], { status: "cancelled", status_note: note(fd) });
  await releaseBooking(b.id).catch(() => null);
  await logEvent(b.id, "cancelled", actor);
  await tell(updated, clientEmails.cancelled(updated));
  redirect(`/admin/b/${b.id}?m=cancelled`);
}

export async function markBalancePaid(fd: FormData) {
  const { actor, b } = await load(fd);
  const updated = await move(b, ["confirmed"], { status: "balance_paid", balance_paid_at: new Date().toISOString() });
  await logEvent(b.id, "balance paid", actor);
  await tell(updated, clientEmails.balancePaid(updated));
  redirect(`/admin/b/${b.id}?m=paid`);
}

export async function markDelivered(fd: FormData) {
  const { actor, b } = await load(fd);
  const updated = await move(b, ["confirmed", "balance_paid"], { status: "delivered", delivered_at: new Date().toISOString() });
  await logEvent(b.id, "delivered", actor);
  await tell(updated, clientEmails.delivered(updated));
  redirect(`/admin/b/${b.id}?m=delivered`);
}

// The held window for a confirmed booking. An end earlier than the start means past midnight.
export async function updateHold(fd: FormData) {
  const { actor, b } = await load(fd);
  if (b.status !== "confirmed" && b.status !== "balance_paid") redirect(`/admin/b/${b.id}`);
  const from = String(fd.get("from") ?? "");
  const to = String(fd.get("to") ?? "");
  if (!isClock(from) || !isClock(to)) redirect(`/admin/b/${b.id}?m=hold-bad`);
  const start = toMinutes(from);
  let end = toMinutes(to);
  if (end <= start) end += 1440;
  await holdBooking(b.id, b.event_date, b.start_time.slice(0, 5), b.hours, { from: start, to: end });
  await logEvent(b.id, `time held ${from}–${to}`, actor);
  redirect(`/admin/b/${b.id}?m=hold`);
}

export async function addBlock(fd: FormData) {
  await requireAdmin();
  const date = String(fd.get("date") ?? "");
  const from = String(fd.get("from") ?? "");
  const to = String(fd.get("to") ?? "");
  const allDay = fd.get("allDay") === "yes";
  if (!isRealDate(date) || (!allDay && (!isClock(from) || !isClock(to)))) redirect("/admin/blocks?m=bad");
  const start = allDay ? 0 : toMinutes(from);
  let end = allDay ? 1440 : toMinutes(to);
  if (end <= start) end += 1440;
  const { error } = await db()
    .from("blocked_times")
    .insert({ starts_at: stampAt(date, start), ends_at: stampAt(date, end), note: note(fd)?.slice(0, 200) ?? null });
  if (error) redirect("/admin/blocks?m=failed");
  // Old manual blocks are no use to anyone; clearing them here keeps the table small.
  const monthAgo = stampAt(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10), 0);
  await db().from("blocked_times").delete().is("booking_id", null).lt("ends_at", monthAgo);
  redirect("/admin/blocks?m=added");
}

export async function removeBlock(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/admin/blocks");
  // Holds for bookings are changed from the booking itself, so only manual blocks can go here.
  await db().from("blocked_times").delete().eq("id", id).is("booking_id", null);
  redirect("/admin/blocks?m=removed");
}
