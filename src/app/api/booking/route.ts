import { NextResponse } from "next/server";
import {
  addOnOptions,
  boothPrice,
  emptyBooking,
  hasBooth,
  hasVideo,
  isFixedPrice,
  newRef,
  refPattern,
  serviceOptions,
  validateAll,
  type Booking,
} from "@/lib/booking";
import { guardUpload } from "@/lib/security";
import { dbConfigured, db, siteUrl } from "@/lib/supabase";
import { logEvent, readProof, uploadProof } from "@/lib/bookings";
import { proofProblem } from "@/lib/proof";
import { sendMail } from "@/lib/mail";
import { clientEmails, ownerEmails } from "@/lib/booking-emails";
import { clashFor } from "@/lib/availability";
import type { BookingRow } from "@/lib/booking-status";
import { site } from "@/content/site";

const clip = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, allowed: string[]) =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && allowed.includes(x)))] : [];
const orNull = (s: string) => s || null;

const fail = (message: string, status: number, errors?: Record<string, string>) => NextResponse.json({ message, errors }, { status });

export async function POST(req: Request) {
  const guard = await guardUpload(req, "booking");
  if (!guard.ok) return guard.response;
  const { body, file } = guard;

  // Bots fill in the hidden "website" field; people never see it.
  if (clip(body.website)) {
    console.warn("Booking dropped by the spam trap");
    return NextResponse.json({ ok: true, kind: "request" });
  }

  const b: Booking = {
    ...emptyBooking,
    name: clip(body.name, 120),
    email: clip(body.email, 200),
    phone: clip(body.phone, 40),
    contactMethod: clip(body.contactMethod, 40),
    date: clip(body.date, 10),
    startTime: clip(body.startTime, 5),
    location: clip(body.location, 300),
    venue: clip(body.venue, 120),
    eventType: clip(body.eventType, 60),
    guests: clip(body.guests, 4),
    services: list(body.services, serviceOptions.map((s) => s.id)),
    boothPackage: clip(body.boothPackage, 40),
    videos: clip(body.videos, 2),
    hours: clip(body.hours, 3),
    addOns: list(body.addOns, addOnOptions.map((a) => a.id)),
    keychains: clip(body.keychains, 4),
    songs: clip(body.songs, 500),
    songMix: clip(body.songMix, 40),
    schedule: clip(body.schedule),
    details: clip(body.details),
    references: clip(body.references, 1000),
    budget: clip(body.budget, 40),
    referral: clip(body.referral, 60),
    agree: body.agree === true,
    callConfirm: body.callConfirm === true,
  };

  const errors = validateAll(b);
  if (Object.keys(errors).length) return fail("Some details need fixing before this can be sent.", 422, errors as Record<string, string>);

  if (!dbConfigured())
    return fail(`Online booking isn’t switched on yet, so this wasn’t sent. Please email ${site.email} or text ${site.phone}.`, 503);

  // The form checks this too, but someone may have confirmed that slot since the page loaded.
  try {
    if (await clashFor(b.date, b.startTime, b.hours))
      return fail("That time was just booked. Choose another start time.", 409, { startTime: "That time is no longer available. Choose another start time." });
  } catch {
    console.error("Availability check failed");
  }

  const fixed = isFixedPrice(b);
  const price = fixed ? boothPrice(b) : null;
  let proof = null;
  if (fixed) {
    const ref = clip(body.ref, 10);
    if (!refPattern.test(ref)) return fail("Your booking reference is missing. Refresh the page and start again.", 400);
    const problem = proofProblem(file);
    if (problem) return fail(problem, 422, { proof: problem });
    const read = await readProof(file!);
    if ("error" in read) return fail(read.error, 422, { proof: read.error });
    proof = read;
  }

  const booth = hasBooth(b);
  const row = {
    ref: fixed ? clip(body.ref, 10) : newRef(),
    status: fixed ? "deposit_submitted" : "requested",
    pricing: fixed ? "fixed" : "quote",
    name: b.name,
    email: b.email,
    phone: b.phone,
    contact_method: b.contactMethod,
    services: b.services,
    booth_package: booth ? b.boothPackage : null,
    videos: hasVideo(b) ? Number(b.videos) : null,
    hours: b.hours,
    add_ons: b.addOns.filter((a) => {
      const group = addOnOptions.find((o) => o.id === a)?.group;
      return (group === "booth" && booth) || (group === "video" && hasVideo(b));
    }),
    keychains: booth && b.addOns.includes("keychains") ? Number(b.keychains) : null,
    event_date: b.date,
    start_time: b.startTime,
    location: b.location,
    venue: orNull(b.venue),
    event_type: b.eventType,
    guests: b.guests ? Number(b.guests) : null,
    songs: orNull(b.songs),
    song_mix: orNull(b.songMix),
    schedule: orNull(b.schedule),
    details: orNull(b.details),
    reference_links: orNull(b.references),
    budget: orNull(b.budget),
    referral: orNull(b.referral),
    total_cents: price?.totalCents ?? null,
    deposit_cents: price?.depositCents ?? null,
  };

  let saved: BookingRow | null = null;
  for (let attempt = 0; attempt < 3 && !saved; attempt++) {
    const { data, error } = await db().from("bookings").insert(row).select("*").single();
    if (!error) saved = data as BookingRow;
    else if (error.code === "23505" && !fixed) row.ref = newRef();
    else if (error.code === "23505") return fail("That booking reference was already used. Refresh the page and start again.", 409);
    else {
      console.error("Booking insert failed", error.code);
      return fail(`Your booking didn’t save. Please try again, or email ${site.email}.`, 502);
    }
  }
  if (!saved) return fail(`Your booking didn’t save. Please try again, or email ${site.email}.`, 502);

  if (proof) {
    const path = await uploadProof(saved.id, proof);
    if (!path) {
      await db().from("bookings").delete().eq("id", saved.id);
      return fail("Your screenshot couldn’t be saved. Please try again.", 502);
    }
    const now = new Date().toISOString();
    await db().from("bookings").update({ proof_path: path, proof_uploaded_at: now }).eq("id", saved.id);
    saved = { ...saved, proof_path: path, proof_uploaded_at: now };
  }

  await logEvent(saved.id, fixed ? "booked with deposit proof" : "requested", "client");

  // The booking is saved either way, so a failed email only gets logged.
  const link = `${siteUrl()}/admin/b/${saved.id}`;
  const owner = process.env.BOOKING_TO_EMAIL || site.email;
  const o = fixed ? ownerEmails.newDeposit(saved, link) : ownerEmails.newRequest(saved, link);
  const c = fixed ? clientEmails.depositReceived(saved) : clientEmails.requestReceived(saved);
  await Promise.all([
    sendMail({ to: owner, replyTo: saved.email, ...o }),
    sendMail({ to: saved.email, replyTo: owner, ...c }),
  ]);

  return NextResponse.json({ ok: true, kind: fixed ? "deposit" : "request" });
}
