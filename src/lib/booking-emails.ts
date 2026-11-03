import { addOnOptions, labelFor, money, packageOptions, serviceOptions } from "./booking";
import { prettyDate, prettyTime, type BookingRow } from "./booking-status";
import { renderEmail, type EmailParts, type Row } from "./email-layout";
import { siteUrl } from "./supabase";
import { etransfer, policies, site } from "@/content/site";

type Email = { subject: string; html: string; text: string };

// Client emails go to whatever address was typed into the form, so they only ever contain
// fixed wording, menu choices, dates, amounts and Dunz's own notes. Nothing a visitor typed.

const boothOnly = (b: BookingRow) => b.services.length === 1 && b.services[0] === "booth";
const servicesLine = (b: BookingRow) => b.services.map((s) => labelFor(serviceOptions, s)).join(", ");
const when = (b: BookingRow) => `${prettyDate(b.event_date)}, ${prettyTime(b.start_time)}`;

const quoteSteps = ["Request", "Quote", "Deposit", "Confirmed"];
const boothSteps = ["Booked", "Deposit check", "Confirmed"];

function details(b: BookingRow): { title: string; rows: Row[] } {
  return {
    title: `Booking ${b.ref}`,
    rows: [
      ["Services", servicesLine(b)],
      ["Booth package", b.booth_package ? labelFor(packageOptions, b.booth_package) : ""],
      ["Date", prettyDate(b.event_date)],
      ["Start time", prettyTime(b.start_time)],
      ["Coverage", `${b.hours} ${b.hours === "1" ? "hour" : "hours"}`],
    ],
  };
}

const balanceLine = (b: BookingRow) => (boothOnly(b) ? policies.booth.balance : policies.video.balance);

function money2(b: BookingRow): Row[] {
  const rows: Row[] = [];
  if (b.total_cents != null) rows.push(["Total", money(b.total_cents)]);
  if (b.deposit_cents != null) rows.push(["Deposit", money(b.deposit_cents)]);
  if (b.total_cents != null && b.deposit_cents != null) rows.push(["Balance", money(b.total_cents - b.deposit_cents)]);
  return rows;
}

function calendarLink(b: BookingRow) {
  const [y, m, d] = b.event_date.split("-").map(Number);
  const [h, min] = b.start_time.split(":").map(Number);
  const hours = b.hours === "10+" ? 10 : Number(b.hours) || 3;
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = new Date(Date.UTC(y, m - 1, d, h, min));
  const end = new Date(start.getTime() + hours * 3600 * 1000);
  const fmt = (t: Date) => `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}T${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}00`;
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: `${site.name}: ${servicesLine(b)}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    ctz: "America/Toronto",
    details: `Booking ${b.ref} with ${site.name}. Questions: ${site.email}`,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

function client(subject: string, parts: EmailParts): Email {
  return { subject: `${subject} · ${site.name}`, ...renderEmail(parts, { siteUrl: siteUrl() }) };
}

const ignore = "If you didn’t make this request, you can ignore this email.";

export const clientEmails = {
  requestReceived: (b: BookingRow) =>
    client(`We got your booking request (${b.ref})`, {
      preheader: `Thanks for reaching out. Your quote is on its way within 24 hours.`,
      eyebrow: "Booking request",
      title: "Thanks, your request is in.",
      steps: { labels: quoteSteps, current: 1 },
      intro: [
        `I’m excited to hear about your event on ${prettyDate(b.event_date)}. I’ll check my availability and send your personal quote within 24 hours.`,
        "Nothing to pay yet. Your quote comes with a secure link to pay the deposit when you’re ready.",
      ],
      details: details(b),
      next: {
        title: "What happens next",
        items: [
          "I check the date and send your quote by email.",
          `You pay the deposit by Interac e-Transfer and upload the confirmation through the quote link.`,
          "I confirm your booking, and your date is held just for you.",
        ],
      },
      footnote: ignore,
    }),

  depositReceived: (b: BookingRow) =>
    client(`Deposit received, confirming soon (${b.ref})`, {
      preheader: `Your deposit proof is in. I’ll confirm your date within 24 hours.`,
      eyebrow: "Deposit received",
      title: "Your deposit proof is in.",
      steps: boothOnly(b) ? { labels: boothSteps, current: 1 } : { labels: quoteSteps, current: 2 },
      intro: [
        "Thank you! I’ll match your e-transfer and confirm your booking within 24 hours.",
        "Your date is secured once you get my confirmation email.",
      ],
      highlight: money2(b),
      details: details(b),
      footnote: ignore,
    }),

  quote: (b: BookingRow, link: string) =>
    client(`Your quote from ${site.name} (${b.ref})`, {
      preheader: `Your quote for ${prettyDate(b.event_date)} is ready. Secure your date with the deposit.`,
      eyebrow: "Your quote",
      title: "Your quote is ready.",
      steps: { labels: quoteSteps, current: 2 },
      intro: [
        `Thank you for your patience. Here’s your quote for ${prettyDate(b.event_date)}.`,
        "To secure your date, send the deposit by Interac e-Transfer, then upload the confirmation screenshot through the button below.",
      ],
      highlight: money2(b),
      note: b.quote_note ? { label: "A note from Dunz", text: b.quote_note } : undefined,
      cta: { href: link, label: "Pay deposit & secure my date", hint: `This private link works for 7 days. E-transfers go to ${etransfer.email}, with ${b.ref} in the message.` },
      details: details(b),
      next: {
        title: "Good to know",
        items: [`Deposit: ${policies.video.deposit}.`, `${balanceLine(b)}.`, `${policies.video.reschedule}.`],
      },
    }),

  proofNeedsFixing: (b: BookingRow, link: string) =>
    client(`Please re-upload your deposit proof (${b.ref})`, {
      preheader: "I couldn’t match your e-transfer yet. A quick re-upload sorts it.",
      eyebrow: "Action needed",
      title: "One quick fix, please.",
      steps: boothOnly(b) ? { labels: boothSteps, current: 1 } : { labels: quoteSteps, current: 2 },
      intro: [
        "I couldn’t match your e-transfer to the screenshot you uploaded. No stress, it’s usually a quick fix.",
        `Please check the amount and that ${b.ref} is in the message, then upload a new screenshot.`,
      ],
      note: b.status_note ? { label: "What I need", text: b.status_note } : undefined,
      highlight: b.deposit_cents != null ? [["Deposit due", money(b.deposit_cents)], ["Send to", etransfer.email], ["Message", b.ref]] : undefined,
      cta: { href: link, label: "Upload a new screenshot", hint: "This private link works for 7 days." },
      details: details(b),
    }),

  confirmed: (b: BookingRow) =>
    client(`You’re booked! ${prettyDate(b.event_date)} (${b.ref})`, {
      preheader: `Your date is confirmed. Can’t wait to capture it.`,
      eyebrow: "Booking confirmed",
      title: "You’re booked!",
      steps: boothOnly(b) ? { labels: boothSteps, current: boothSteps.length } : { labels: quoteSteps, current: quoteSteps.length },
      intro: [
        `Your deposit is received and ${prettyDate(b.event_date)} is officially yours. I can’t wait to be part of it.`,
        "Save the date in your calendar below. I’ll be in touch closer to the day to go over the schedule and any special moments.",
      ],
      highlight: money2(b),
      cta: { href: calendarLink(b), label: "Add to my calendar" },
      details: details(b),
      next: {
        title: "Before your event",
        items: boothOnly(b)
          ? [`${policies.booth.balance}.`, "Plan a 3 m × 3 m space near a power outlet for the booth.", `${policies.booth.travel}.`]
          : [`${policies.video.balance}.`, "Send me the schedule of the day and any must-have moments.", `${policies.video.reschedule}.`],
      },
    }),

  declined: (b: BookingRow) =>
    client(`About your booking request (${b.ref})`, {
      preheader: "An update on your booking request.",
      eyebrow: "Booking update",
      title: "Thank you for thinking of me.",
      intro: ["Unfortunately I can’t take this booking. I really appreciate you reaching out, and I hope to work with you another time."],
      note: b.status_note ? { label: "A note from Dunz", text: b.status_note } : undefined,
      secondary: { href: `${siteUrl()}/portfolio`, label: "See recent work" },
    }),

  cancelled: (b: BookingRow) =>
    client(`Your booking is cancelled (${b.ref})`, {
      preheader: "Your booking has been cancelled.",
      eyebrow: "Booking cancelled",
      title: "Your booking is cancelled.",
      intro: [`Booking ${b.ref} for ${prettyDate(b.event_date)} has been cancelled. If you have questions, just reply to this email.`],
      note: b.status_note ? { label: "A note from Dunz", text: b.status_note } : undefined,
      details: details(b),
    }),

  balancePaid: (b: BookingRow) =>
    client(`Balance received, you’re all paid (${b.ref})`, {
      preheader: "Payment received. Thank you!",
      eyebrow: "Payment received",
      title: "You’re all paid up.",
      intro: [`Thank you! Your balance for ${prettyDate(b.event_date)} is received. Nothing more to pay.`],
      highlight: b.total_cents != null ? [["Paid in full", money(b.total_cents)]] : undefined,
      details: details(b),
    }),

  delivered: (b: BookingRow) =>
    client(`Your ${boothOnly(b) ? "photos are" : "files are"} ready (${b.ref})`, {
      preheader: "Thank you for booking with ShotsByDunz.",
      eyebrow: "Delivered",
      title: "It was a pleasure.",
      intro: [
        `Your ${boothOnly(b) ? "photos" : "files"} from ${prettyDate(b.event_date)} have been delivered. Thank you for trusting me with your day.`,
        "If you loved working together, a review or a tag on Instagram means the world.",
      ],
      cta: { href: site.socials.instagram.href, label: `Tag ${site.socials.instagram.label}` },
      secondary: { href: `mailto:${site.email}?subject=Review%20for%20${encodeURIComponent(b.ref)}`, label: "Send a review" },
    }),
};

function ownerRows(b: BookingRow): Row[] {
  return [
    ["Name", b.name],
    ["Email", b.email],
    ["Phone", b.phone],
    ["Contact by", b.contact_method],
    ["Services", servicesLine(b)],
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
  ];
}

function owner(subject: string, eyebrow: string, title: string, intro: string, b: BookingRow, link: string): Email {
  return {
    subject,
    ...renderEmail(
      {
        preheader: intro,
        eyebrow,
        title,
        intro: [intro],
        highlight: [["Reference", b.ref], ["When", when(b)], ...money2(b)],
        cta: { href: link, label: "Open in dashboard" },
        details: { title: "Everything they sent", rows: ownerRows(b) },
        signoff: false,
        footnote: "Sent by your website. Reply to this email to answer the client directly.",
      },
      { siteUrl: siteUrl() },
    ),
  };
}

export const ownerEmails = {
  newRequest: (b: BookingRow, link: string) =>
    owner(`New request ${b.ref}: ${b.event_type}, ${b.event_date}`, "New request", "New booking request", "Send a quote from the dashboard.", b, link),
  newDeposit: (b: BookingRow, link: string) =>
    owner(
      `Deposit to check ${b.ref}: ${b.event_type}, ${b.event_date}`,
      "Deposit to check",
      "New booth booking",
      `Check your bank for ${money(b.deposit_cents ?? 0)} with ${b.ref} in the message, then confirm in the dashboard.`,
      b,
      link,
    ),
  proofUploaded: (b: BookingRow, link: string) =>
    owner(
      `Deposit to check ${b.ref}: ${b.event_type}, ${b.event_date}`,
      "Deposit to check",
      "Deposit proof uploaded",
      `Check your bank for ${money(b.deposit_cents ?? 0)} with ${b.ref} in the message, then confirm in the dashboard.`,
      b,
      link,
    ),
};
