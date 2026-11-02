import { NextResponse } from "next/server";
import {
  addOnOptions,
  emptyBooking,
  hasBooth,
  hasVideo,
  labelFor,
  packageOptions,
  serviceOptions,
  validateAll,
  type Booking,
} from "@/lib/booking";
import { rowsToHtml, rowsToText, sendMail } from "@/lib/mail";
import { guardForm } from "@/lib/security";
import { policies, site } from "@/content/site";

const clip = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, allowed: string[]) =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && allowed.includes(x)))] : [];

export async function POST(req: Request) {
  const guard = await guardForm(req, "booking");
  if (!guard.ok) return guard.response;
  const body = guard.body;

  // Bots fill in the hidden "website" field; people never see it.
  if (clip(body.website)) return NextResponse.json({ ok: true });

  const b: Booking = {
    ...emptyBooking,
    name: clip(body.name, 120),
    email: clip(body.email, 200),
    phone: clip(body.phone, 40),
    contactMethod: clip(body.contactMethod, 40),
    date: clip(body.date, 10),
    startTime: clip(body.startTime, 10),
    location: clip(body.location, 300),
    eventType: clip(body.eventType, 60),
    guests: clip(body.guests, 10),
    services: list(body.services, serviceOptions.map((s) => s.id)),
    boothPackage: clip(body.boothPackage, 40),
    videos: clip(body.videos, 4),
    hours: clip(body.hours, 4),
    addOns: list(body.addOns, addOnOptions.map((a) => a.id)),
    songs: clip(body.songs, 500),
    songMix: clip(body.songMix, 40),
    schedule: clip(body.schedule),
    details: clip(body.details),
    references: clip(body.references, 1000),
    budget: clip(body.budget, 40),
    referral: clip(body.referral, 60),
    agree: body.agree === true,
  };

  const errors = validateAll(b);
  if (Object.keys(errors).length) {
    return NextResponse.json({ message: "Some details need fixing before this can be sent.", errors }, { status: 422 });
  }

  const rows: [string, string][] = [
    ["Name", b.name],
    ["Email", b.email],
    ["Phone", b.phone],
    ["Contact by", b.contactMethod],
    ["Services", b.services.map((s) => labelFor(serviceOptions, s)).join(", ")],
    ["Booth package", hasBooth(b) ? labelFor(packageOptions, b.boothPackage) : ""],
    ["Number of videos", hasVideo(b) ? b.videos : ""],
    ["Hours", b.hours],
    ["Add-ons", b.addOns.map((a) => labelFor(addOnOptions, a)).join(", ")],
    ["Event date", b.date],
    ["Start time", b.startTime],
    ["Location", b.location],
    ["Event type", b.eventType],
    ["Guests", b.guests],
    ["Songs", b.songs],
    ["Song mix", b.songMix],
    ["Schedule", b.schedule],
    ["Ideas and requests", b.details],
    ["References", b.references],
    ["Budget", b.budget],
    ["Found via", b.referral],
  ];

  const owner = process.env.BOOKING_TO_EMAIL || site.email;
  const toOwner = await sendMail({
    to: owner,
    replyTo: b.email,
    subject: `New booking request: ${b.eventType} on ${b.date}`,
    html: rowsToHtml("New booking request", rows),
    text: rowsToText(rows),
  });

  if (toOwner.notConfigured) {
    return NextResponse.json(
      {
        message: `Online booking isn’t switched on yet, so this request wasn’t sent. Please email ${site.email} or text ${site.phone} with your date and what you need.`,
      },
      { status: 503 },
    );
  }
  if (!toOwner.ok) {
    return NextResponse.json(
      { message: `Your request didn’t send. Please try again, or email ${site.email} directly.` },
      { status: 502 },
    );
  }

  // This goes to whatever address was typed in, so it carries fixed wording and menu choices
  // only. Nothing the visitor wrote can be relayed to a stranger through Dunz's sender.
  const deposit = [hasVideo(b) && `Video: ${policies.video.deposit}.`, hasBooth(b) && `Booth: ${policies.booth.deposit}.`]
    .filter(Boolean)
    .join(" ");
  const clientRows: [string, string][] = [
    ["Services", rows[4][1]],
    ["Booth package", rows[5][1]],
    ["Event date", b.date],
    ["Deposit", deposit],
  ];
  const intro = "Thanks for your booking request. I’ll reply within 24 hours with availability and your quote. If you didn’t send this, you can ignore this email.";
  await sendMail({
    to: b.email,
    replyTo: owner,
    subject: `${site.name}: we got your booking request`,
    html: `<p style="font-family:Arial,sans-serif;font-size:15px">${intro}</p>` + rowsToHtml("Your request", clientRows),
    text: `${intro}\n\n${rowsToText(clientRows)}`,
  });

  return NextResponse.json({ ok: true });
}
