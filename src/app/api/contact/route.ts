import { NextResponse } from "next/server";
import { rowsToHtml, rowsToText, sendMail } from "@/lib/mail";
import { site } from "@/content/site";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 4000) : "";

  if (typeof body.website === "string" && body.website) return NextResponse.json({ ok: true });

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter an email address like name@example.com.";
  if (message.length < 5) errors.message = "Write a short message.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Message", message],
  ];
  const sent = await sendMail({
    to: process.env.BOOKING_TO_EMAIL || site.email,
    replyTo: email,
    subject: `Website message from ${name}`,
    html: rowsToHtml("New message", rows),
    text: rowsToText(rows),
  });
  if (!sent.ok) return NextResponse.json({ message: `Your message didn’t send. Email ${site.email} directly.` }, { status: 502 });
  return NextResponse.json({ ok: true });
}
