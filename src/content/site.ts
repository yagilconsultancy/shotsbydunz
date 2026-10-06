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

export const nav = [
  { href: "/photo-film", label: "Photo & Film" },
  { href: "/content", label: "Content" },
  { href: "/booths", label: "SBD Booth" },
  { href: "/portfolio", label: "Work" },
  { href: "/services", label: "Rates" },
  { href: "/about", label: "About" },
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
