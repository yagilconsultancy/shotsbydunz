import { escapeHtml, rowsToHtml, rowsToText } from "./mail";
import { addOnOptions, labelFor, money, packageOptions, serviceOptions } from "./booking";
import { prettyDate, prettyTime, type BookingRow } from "./booking-status";
import { policies, site } from "@/content/site";

type Email = { subject: string; html: string; text: string };

const p = (s: string) => `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1f1a1d">${s}</p>`;
const button = (href: string, label: string) =>
  `<p style="margin:20px 0"><a href="${escapeHtml(href)}" style="background:#1f1a1d;color:#fff;padding:12px 20px;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;border-radius:4px">${escapeHtml(label)}</a></p>`;

// Client emails go to whatever address was typed into the form, so they only ever contain
// fixed wording, menu choices, dates, amounts and Dunz's own notes. Nothing a visitor typed.
function clientSummary(b: BookingRow): [string, string][] {
  return [
    ["Reference", b.ref],
    ["Services", b.services.map((s) => labelFor(serviceOptions, s)).join(", ")],
    ["Booth package", b.booth_package ? labelFor(packageOptions, b.booth_package) : ""],
    ["Date", prettyDate(b.event_date)],
    ["Start time", prettyTime(b.start_time)],
    ["Hours", b.hours],
    ["Total", b.total_cents != null ? money(b.total_cents) : ""],
    ["Deposit", b.deposit_cents != null ? money(b.deposit_cents) : ""],
  ];
}

function build(subject: string, paras: string[], rows: [string, string][] = [], link?: { href: string; label: string }): Email {
  const html = paras.map((t) => p(escapeHtml(t))).join("") + (link ? button(link.href, link.label) : "") + (rows.length ? rowsToHtml("Your booking", rows) : "");
  const text = paras.join("\n\n") + (link ? `\n\n${link.label}: ${link.href}` : "") + (rows.length ? `\n\n${rowsToText(rows)}` : "");
  return { subject: `${site.name}: ${subject}`, html, text };
}

const sign = `${site.name}, ${site.city}`;
const ignore = "If you didn't make this request, you can ignore this email.";

export const clientEmails = {
  requestReceived: (b: BookingRow) =>
    build("we got your booking request", [`Thanks for your booking request. I'll check availability and send your quote within 24 hours.`, ignore, sign], clientSummary(b)),

  depositReceived: (b: BookingRow) =>
    build("deposit received, awaiting confirmation", [
      `Thanks, your booking request and proof of deposit are in. I'll check the e-transfer and confirm your date within 24 hours. Your date is not secured until you get my confirmation email.`,
      ignore,
      sign,
    ], clientSummary(b)),

  quote: (b: BookingRow, link: string) =>
    build("your quote", [
      `Here's your quote. To secure your date, send the deposit by e-transfer and upload your confirmation through the link below. The link works for 7 days.`,
      ...(b.quote_note ? [`A note from me: ${b.quote_note}`] : []),
      sign,
    ], clientSummary(b), { href: link, label: "Pay deposit and secure my date" }),

  proofNeedsFixing: (b: BookingRow, link: string) =>
    build("please check your deposit upload", [
      `I couldn't match your e-transfer to the upload. Please check the details and upload a new screenshot through the link below. The link works for 7 days.`,
      ...(b.status_note ? [`What I need: ${b.status_note}`] : []),
      sign,
    ], clientSummary(b), { href: link, label: "Upload a new screenshot" }),

  confirmed: (b: BookingRow) =>
    build("you're booked", [
      `Your deposit is received and your date is confirmed. ${b.services.includes("booth") && b.services.length === 1 ? policies.booth.balance : policies.video.balance}.`,
      `If you need to change anything, reply to this email.`,
      sign,
    ], clientSummary(b)),

  declined: (b: BookingRow) =>
    build("about your booking request", [
      `Thank you for thinking of me. Unfortunately I can't take this booking.`,
      ...(b.status_note ? [b.status_note] : []),
      sign,
    ]),

  cancelled: (b: BookingRow) =>
    build("your booking is cancelled", [`Your booking ${b.ref} has been cancelled.`, ...(b.status_note ? [b.status_note] : []), `Questions? Reply to this email.`, sign]),

  balancePaid: (b: BookingRow) => build("balance received", [`Thank you, your balance for booking ${b.ref} is received. You're all paid up.`, sign]),

  delivered: (b: BookingRow) => build("your files are on their way", [`Your ${b.services.includes("booth") && b.services.length === 1 ? "photos" : "files"} for booking ${b.ref} have been delivered. Thank you for booking with me.`, sign]),
};

function ownerRows(b: BookingRow): [string, string][] {
  return [
    ["Reference", b.ref],
    ["Name", b.name],
    ["Email", b.email],
    ["Phone", b.phone],
    ["Contact by", b.contact_method],
    ["Services", b.services.map((s) => labelFor(serviceOptions, s)).join(", ")],
    ["Booth package", b.booth_package ? labelFor(packageOptions, b.booth_package) : ""],
    ["Number of videos", b.videos ? String(b.videos) : ""],
    ["Hours", b.hours],
    ["Add-ons", b.add_ons.map((a) => labelFor(addOnOptions, a)).join(", ")],
    ["Keychains", b.keychains ? String(b.keychains) : ""],
    ["Date", prettyDate(b.event_date)],
    ["Start time", prettyTime(b.start_time)],
    ["Location", b.location],
    ["Event type", b.event_type],
    ["Guests", b.guests ? String(b.guests) : ""],
    ["Songs", b.songs ?? ""],
    ["Song mix", b.song_mix ?? ""],
    ["Schedule", b.schedule ?? ""],
    ["Ideas and requests", b.details ?? ""],
    ["References", b.reference_links ?? ""],
    ["Budget", b.budget ?? ""],
    ["Found via", b.referral ?? ""],
    ["Total", b.total_cents != null ? money(b.total_cents) : ""],
    ["Deposit", b.deposit_cents != null ? money(b.deposit_cents) : ""],
  ];
}

function ownerEmail(subject: string, intro: string, b: BookingRow, adminLink: string): Email {
  const rows = ownerRows(b);
  return {
    subject,
    html: p(escapeHtml(intro)) + button(adminLink, "Open in dashboard") + rowsToHtml(b.ref, rows),
    text: `${intro}\n\nOpen in dashboard: ${adminLink}\n\n${rowsToText(rows)}`,
  };
}

export const ownerEmails = {
  newRequest: (b: BookingRow, link: string) =>
    ownerEmail(`New request ${b.ref}: ${b.event_type}, ${b.event_date}`, "New booking request. Send a quote from the dashboard.", b, link),
  newDeposit: (b: BookingRow, link: string) =>
    ownerEmail(`Deposit to check ${b.ref}: ${b.event_type}, ${b.event_date}`, `New booth booking with proof of a ${money(b.deposit_cents ?? 0)} deposit. Check your bank, then confirm in the dashboard.`, b, link),
  proofUploaded: (b: BookingRow, link: string) =>
    ownerEmail(`Deposit to check ${b.ref}: ${b.event_type}, ${b.event_date}`, `Proof of a ${money(b.deposit_cents ?? 0)} deposit was uploaded. Check your bank, then confirm in the dashboard.`, b, link),
};
