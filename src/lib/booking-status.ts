export const statuses = {
  requested: { label: "Requested", action: true },
  quoted: { label: "Quote sent", action: false },
  deposit_submitted: { label: "Deposit to check", action: true },
  proof_needs_fixing: { label: "Proof needs fixing", action: false },
  confirmed: { label: "Confirmed", action: false },
  balance_paid: { label: "Balance paid", action: false },
  delivered: { label: "Delivered", action: false },
  declined: { label: "Declined", action: false },
  cancelled: { label: "Cancelled", action: false },
} as const;

export type Status = keyof typeof statuses;
export const isStatus = (s: string): s is Status => s in statuses;

export type BookingRow = {
  id: string;
  ref: string;
  created_at: string;
  status: Status;
  pricing: "fixed" | "quote";
  name: string;
  email: string;
  phone: string;
  contact_method: string;
  services: string[];
  booth_package: string | null;
  videos: number | null;
  hours: string;
  add_ons: string[];
  keychains: number | null;
  event_date: string;
  start_time: string;
  location: string;
  event_type: string;
  guests: number | null;
  songs: string | null;
  song_mix: string | null;
  schedule: string | null;
  details: string | null;
  reference_links: string | null;
  budget: string | null;
  referral: string | null;
  total_cents: number | null;
  deposit_cents: number | null;
  quote_note: string | null;
  quote_expires_at: string | null;
  proof_path: string | null;
  proof_uploaded_at: string | null;
  confirmed_at: string | null;
  balance_paid_at: string | null;
  delivered_at: string | null;
  status_note: string | null;
};

export const prettyDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

export const prettyTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
};
