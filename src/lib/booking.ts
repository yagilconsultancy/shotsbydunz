import { services } from "@/content/services";
import { boothAddOns, boothPackages } from "@/content/booths";
import { rawFootage } from "@/content/services";

export const eventTypes = [
  "Wedding",
  "Birthday",
  "Baby shower",
  "Graduation",
  "Corporate event",
  "Brand launch",
  "Personal brand shoot",
  "Music or artist shoot",
  "Other",
];

export const serviceOptions = [
  ...services.map((s) => ({ id: s.slug, label: s.name })),
  { id: "booth", label: "SBD Booth (photobooth)" },
];

export const contactMethods = ["Email", "Phone call", "Text", "Instagram DM"];
export const budgets = ["Under $300", "$300 to $600", "$600 to $1,000", "$1,000 to $2,000", "Over $2,000", "Not sure yet"];
export const referralSources = ["Instagram", "TikTok", "Google", "Friend or family", "Saw the booth at an event", "Other"];
export const hourOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];
export const songMixOptions = ["One song", "Two-song mix", "No preference"];

// Extra booth hours come from the hours field, so the "Additional hour" add-on isn't offered twice.
export const addOnOptions = [
  ...rawFootage.map((r) => ({ id: `raw-${r.name.toLowerCase().replace(/[^a-z]+/g, "-")}`, label: `${r.name} (${r.price})`, group: "video" as const })),
  ...boothAddOns
    .filter((a) => a.id !== "extra-hour")
    .map((a) => ({ id: a.id, label: `${a.name} (${a.price})`, group: "booth" as const })),
];

export const packageOptions = boothPackages.map((p) => ({ id: p.id, label: `${p.name} ($${p.price})` }));

export type Booking = {
  name: string;
  email: string;
  phone: string;
  contactMethod: string;
  date: string;
  startTime: string;
  location: string;
  eventType: string;
  guests: string;
  services: string[];
  boothPackage: string;
  videos: string;
  hours: string;
  addOns: string[];
  keychains: string;
  songs: string;
  songMix: string;
  schedule: string;
  details: string;
  references: string;
  budget: string;
  referral: string;
  agree: boolean;
  website?: string;
};

export const emptyBooking: Booking = {
  name: "",
  email: "",
  phone: "",
  contactMethod: "Email",
  date: "",
  startTime: "",
  location: "",
  eventType: "",
  guests: "",
  services: [],
  boothPackage: "",
  videos: "1",
  hours: "",
  addOns: [],
  keychains: "50",
  songs: "",
  songMix: "",
  schedule: "",
  details: "",
  references: "",
  budget: "",
  referral: "",
  agree: false,
};

export const hasVideo = (b: Pick<Booking, "services">) => b.services.some((s) => s !== "booth");
export const hasBooth = (b: Pick<Booking, "services">) => b.services.includes("booth");

// Booth-only bookings have fixed prices, so they pay the deposit straight away. Anything
// with video is quoted by Dunz first.
export const isFixedPrice = (b: Pick<Booking, "services">) => hasBooth(b) && !hasVideo(b);

export const BOOTH_DEPOSIT = 0.5;
export const VIDEO_DEPOSIT = 0.7;

export type PriceLine = { label: string; cents: number };

export function boothPrice(b: Pick<Booking, "boothPackage" | "hours" | "addOns" | "keychains">) {
  const pkg = boothPackages.find((p) => p.id === b.boothPackage);
  if (!pkg) return null;
  const lines: PriceLine[] = [{ label: `${pkg.name}, ${pkg.hours} hours`, cents: pkg.price * 100 }];
  const hours = b.hours === "10+" ? 10 : Number(b.hours);
  const extraHour = boothAddOns.find((a) => a.id === "extra-hour")!;
  if (hours > pkg.hours) {
    const extra = hours - pkg.hours;
    lines.push({ label: `${extra} extra ${extra === 1 ? "hour" : "hours"}`, cents: extra * extraHour.amount * 100 });
  }
  for (const id of b.addOns) {
    const a = boothAddOns.find((x) => x.id === id);
    if (!a || a.id === "extra-hour") continue;
    if (a.id === "keychains") {
      const qty = Number(b.keychains);
      lines.push({ label: `${qty} photo keychains`, cents: qty * a.amount * 100 });
    } else lines.push({ label: a.name, cents: a.amount * 100 });
  }
  const totalCents = lines.reduce((t, l) => t + l.cents, 0);
  return { lines, totalCents, depositCents: Math.round(totalCents * BOOTH_DEPOSIT) };
}

export const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-CA", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

// Short enough to type into an e-transfer message; no 0/O or 1/I to misread.
const refAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const refPattern = /^SBD-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;
export function newRef() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "SBD-" + Array.from(bytes, (n) => refAlphabet[n % refAlphabet.length]).join("");
}

// Video needs 48 hours' notice and the booth needs 72, so the earliest date depends on what's booked.
export function minimumHours(b: Pick<Booking, "services">) {
  return hasBooth(b) ? 72 : 48;
}

export function earliestDate(b: Pick<Booking, "services">, now = new Date()) {
  const d = new Date(now.getTime() + minimumHours(b) * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[+()\-.\s\d]{7,20}$/;
const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;

// A real calendar date in YYYY-MM-DD form, so "2026-02-31" or "9999-99-99" never reach Dunz.
export function isRealDate(v: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

function latestDate(now: Date) {
  const d = new Date(now);
  d.setFullYear(d.getFullYear() + 2);
  return d.toISOString().slice(0, 10);
}

const oneOf = (v: string, list: string[]) => list.includes(v);
const optionalOneOf = (v: string, list: string[]) => !v || list.includes(v);

export type Errors = Partial<Record<keyof Booking, string>>;

export function validateStep(step: number, b: Booking, now = new Date()): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!b.name.trim()) e.name = "Enter your name.";
    if (!emailRe.test(b.email.trim())) e.email = "Enter an email address like name@example.com.";
    if (!phoneRe.test(b.phone.trim())) e.phone = "Enter a phone number we can reach you on.";
    if (!oneOf(b.contactMethod, contactMethods)) e.contactMethod = "Choose how you’d like to be contacted.";
  }
  if (step === 1) {
    if (b.services.length === 0) e.services = "Choose at least one service.";
    if (hasBooth(b) && !packageOptions.some((p) => p.id === b.boothPackage)) e.boothPackage = "Choose a booth package.";
    if (hasVideo(b) && !(/^\d{1,2}$/.test(b.videos) && Number(b.videos) >= 1 && Number(b.videos) <= 50))
      e.videos = "Enter how many videos you need, from 1 to 50.";
    if (!oneOf(b.hours, hourOptions)) e.hours = "Choose how many hours of coverage you need.";
    if (hasBooth(b) && b.addOns.includes("keychains")) {
      const min = boothAddOns.find((a) => a.id === "keychains")!.minQty!;
      if (!(/^\d{1,4}$/.test(b.keychains) && Number(b.keychains) >= min && Number(b.keychains) <= 2000))
        e.keychains = `Keychains come in orders of ${min} or more.`;
    }
    if (b.boothPackage === "unlimited-prints" && b.addOns.includes("prints-upgrade"))
      e.addOns = "Unlimited prints are already in this package. Untick the upgrade.";
  }
  if (step === 2) {
    if (!b.date) e.date = "Choose your event date.";
    else if (!isRealDate(b.date)) e.date = "Choose a date from the calendar.";
    else if (b.date > latestDate(now)) e.date = "I take bookings up to two years ahead. Message me about dates further out.";
    else if (b.date < earliestDate(b, now))
      e.date = `${hasBooth(b) ? "Booth bookings need 72" : "Video bookings need 48"} hours' notice. Choose a later date, or message me to check last-minute availability.`;
    if (!b.location.trim()) e.location = "Enter the venue or city.";
    if (!oneOf(b.eventType, eventTypes)) e.eventType = "Choose the type of event.";
    if (!timeRe.test(b.startTime)) e.startTime = "Choose a start time.";
    if (b.guests && !(/^\d{1,4}$/.test(b.guests) && Number(b.guests) >= 1)) e.guests = "Enter the number of guests.";
    if (!optionalOneOf(b.songMix, songMixOptions)) e.songMix = "Choose a song mix.";
  }
  if (step === 3) {
    if (!optionalOneOf(b.budget, budgets)) e.budget = "Choose a budget range.";
    if (!optionalOneOf(b.referral, referralSources)) e.referral = "Choose how you found me.";
    if (!b.agree) e.agree = "Please agree to the terms and conditions to send your request.";
  }
  return e;
}

export function validateAll(b: Booking, now = new Date()): Errors {
  return { ...validateStep(0, b, now), ...validateStep(1, b, now), ...validateStep(2, b, now), ...validateStep(3, b, now) };
}

export function labelFor(list: { id: string; label: string }[], id: string) {
  return list.find((o) => o.id === id)?.label ?? id;
}

// Booking link for a part of the site: pre-selects the matching service in the form.
const serviceForPillar: Record<string, string> = { "photo-film": "event-videography", content: "personal-brand", booth: "booth" };
export const bookingHref = (pillar: string) => (serviceForPillar[pillar] ? `/book?service=${serviceForPillar[pillar]}` : "/book");
