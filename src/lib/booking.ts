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

export const addOnOptions = [
  ...rawFootage.map((r) => ({ id: `raw-${r.name.toLowerCase().replace(/[^a-z]+/g, "-")}`, label: `${r.name} (${r.price})`, group: "video" as const })),
  ...boothAddOns.map((a) => ({ id: a.id, label: `${a.name} (${a.price})`, group: "booth" as const })),
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

export type Errors = Partial<Record<keyof Booking, string>>;

export function validateStep(step: number, b: Booking, now = new Date()): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!b.name.trim()) e.name = "Enter your name.";
    if (!emailRe.test(b.email.trim())) e.email = "Enter an email address like name@example.com.";
    if (!phoneRe.test(b.phone.trim())) e.phone = "Enter a phone number we can reach you on.";
  }
  if (step === 1) {
    if (b.services.length === 0) e.services = "Choose at least one service.";
    if (hasBooth(b) && !b.boothPackage) e.boothPackage = "Choose a booth package.";
    if (hasVideo(b) && !(Number(b.videos) >= 1)) e.videos = "Enter how many videos you need.";
    if (!b.hours) e.hours = "Choose how many hours of coverage you need.";
  }
  if (step === 2) {
    if (!b.date) e.date = "Choose your event date.";
    else if (b.date < earliestDate(b, now))
      e.date = `${hasBooth(b) ? "Booth bookings need 72" : "Video bookings need 48"} hours' notice. Choose a later date, or message me to check last-minute availability.`;
    if (!b.location.trim()) e.location = "Enter the venue or city.";
    if (!b.eventType) e.eventType = "Choose the type of event.";
  }
  if (step === 3) {
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
