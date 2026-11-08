// Everything a visitor reads on the site lives in this folder, so content changes
// never mean touching page code. Anything marked SAMPLE is placeholder text we are
// using until Dunz sends the real thing (tracked in docs/CONTENT-TRACKER.md).

export const site = {
  name: "ShotsByDunz",
  shortName: "SBD",
  tagline: "Photo, film, content and photobooths for events and brands in London, Ontario.",
  city: "London, Ontario",
  email: "shotsbydunz@gmail.com",
  // SAMPLE: confirmed for SBD Booths only; waiting to hear if video uses the same number.
  phone: "+1 548 468 2830",
  phoneHref: "tel:+15484682830",
  smsHref: "sms:+15484682830",
  replyPromise: "I reply within 24 hours.",
  hours: "Mon to Sat, 10am to 7pm", // SAMPLE
  serviceArea: "London, Ontario and anywhere in Ontario. $50 travel fee outside London.",
  socials: {
    instagram: { label: "@shotsbydunz", href: "https://www.instagram.com/shotsbydunz" }, // SAMPLE handle
    tiktok: { label: "@shotsbydunz", href: "https://www.tiktok.com/@shotsbydunz" }, // SAMPLE handle
    boothInstagram: { label: "@sbdboothsca", href: "https://www.instagram.com/sbdboothsca" },
  },
};

// Shown on the deposit step. The email is from Dunz's terms; the rest is SAMPLE until she confirms.
export const etransfer = {
  email: "shotsbydunz@gmail.com",
  name: "ShotsByDunz", // SAMPLE: the name her bank shows
  autodeposit: false, // SAMPLE: if false, clients also need a security question and answer
  question: "What is the booking reference?", // SAMPLE
};

export const nav = [
  { href: "/photo-film", label: "Photo & Film" },
  { href: "/content", label: "Content" },
  { href: "/booths", label: "SBD Booth" },
  { href: "/portfolio", label: "Work" },
  { href: "/services", label: "Rates" },
  { href: "/about", label: "About" },
];

// Plan 5: shown on the booking form, emails, deposit page and terms.
export const bookingClauses = {
  photoCall: `Photography bookings are confirmed by phone. Please call Dunz at ${site.phone} within 48 hours of booking to confirm your date.`,
  timing:
    "Dunz arrives early to set up. Your booked time starts counting 30 minutes after she arrives, so you have time to settle in if your programme isn’t ready yet. If your programme starts late, coverage ends no more than 30 minutes after your booked end time.",
};

export const declineReasons = [
  "Date already booked",
  "Outside my service area",
  "Not the kind of event I cover",
  "Timeline too short",
  "Other",
];

export const policies = {
  video: {
    deposit: "70% deposit to secure your date, non-refundable",
    balance: "Balance due on the day of the event",
    leadTime: "Book at least 48 hours before your event", // to confirm: 48 vs 72 hours
    reschedule: "Reschedule once, subject to availability, with at least 72 hours' notice",
    cancel: "Cancelling within 48 hours of the shoot forfeits the deposit",
    delivery: "5 to 7 days, depending on how many videos",
    revisions: "One revision included; extra revisions are charged",
    travel: "$50 travel fee outside London; more for longer trips",
  },
  booth: {
    deposit: "50% deposit to reserve your date",
    balance: "Balance due the day before the event",
    leadTime: "Bookings must be confirmed and secured 72 hours before the event",
    delivery: "Photos delivered on the day, at the event",
    travel: "$50 travel fee outside London; more for longer trips",
  },
};
