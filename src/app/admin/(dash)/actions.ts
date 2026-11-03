"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db, siteUrl } from "@/lib/supabase";
import { getBooking, issueDepositLink, clearDepositLink, logEvent } from "@/lib/bookings";
import { sendMail } from "@/lib/mail";
import { clientEmails } from "@/lib/booking-emails";
import type { BookingRow, Status } from "@/lib/booking-status";
import { site } from "@/content/site";

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

export async function confirmBooking(fd: FormData) {
  const { actor, b } = await load(fd);
  const updated = await move(b, ["deposit_submitted", "proof_needs_fixing"], { status: "confirmed", confirmed_at: new Date().toISOString(), status_note: null });
  await clearDepositLink(b.id);
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
  const updated = await move(b, ["requested", "quoted", "deposit_submitted", "proof_needs_fixing"], { status: "declined", status_note: note(fd) });
  await clearDepositLink(b.id);
  await logEvent(b.id, "declined", actor);
  await tell(updated, clientEmails.declined(updated));
  redirect(`/admin/b/${b.id}?m=declined`);
}

export async function cancelBooking(fd: FormData) {
  const { actor, b } = await load(fd);
  const updated = await move(b, ["confirmed", "balance_paid"], { status: "cancelled", status_note: note(fd) });
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
