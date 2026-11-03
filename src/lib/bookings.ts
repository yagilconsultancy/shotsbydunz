import { createHash, randomBytes } from "node:crypto";
import { db, PROOF_BUCKET } from "./supabase";
import { sniffProof } from "./proof";
import type { BookingRow, Status } from "./booking-status";

export const LINK_DAYS = 7;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function logEvent(bookingId: string, action: string, actor: string) {
  await db().from("booking_events").insert({ booking_id: bookingId, action, actor });
}

export async function getBooking(id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const { data } = await db().from("bookings").select("*").eq("id", id).maybeSingle();
  return (data as BookingRow | null) ?? null;
}

// Only the hash is stored, so a leaked database copy can't be turned back into working links.
export async function issueDepositLink(id: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + LINK_DAYS * 86400 * 1000).toISOString();
  const { error } = await db().from("bookings").update({ quote_token_hash: hashToken(token), quote_expires_at: expires }).eq("id", id);
  if (error) throw error;
  return token;
}

export async function findByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const { data } = await db().from("bookings").select("*").eq("quote_token_hash", hashToken(token)).maybeSingle();
  const row = data as BookingRow | null;
  if (!row || !row.quote_expires_at || new Date(row.quote_expires_at) < new Date()) return null;
  if (!(["quoted", "proof_needs_fixing"] as Status[]).includes(row.status)) return null;
  return row;
}

export async function clearDepositLink(id: string) {
  await db().from("bookings").update({ quote_token_hash: null, quote_expires_at: null }).eq("id", id);
}

export type Proof = { bytes: Uint8Array; ext: string; type: string };

export async function readProof(file: File): Promise<Proof | { error: string }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffProof(bytes);
  if (!kind) return { error: "That file isn't a JPG, PNG, HEIC or PDF. Upload a screenshot of your e-transfer." };
  return { bytes, ...kind };
}

export async function uploadProof(bookingId: string, proof: Proof) {
  const path = `${bookingId}/${Date.now()}-${randomBytes(6).toString("hex")}.${proof.ext}`;
  const { error } = await db().storage.from(PROOF_BUCKET).upload(path, proof.bytes, { contentType: proof.type, upsert: false });
  return error ? null : path;
}

export async function proofUrl(path: string) {
  const { data } = await db().storage.from(PROOF_BUCKET).createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}
