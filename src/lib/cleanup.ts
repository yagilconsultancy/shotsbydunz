import { db, PROOF_BUCKET } from "./supabase";
import { MEDIA_BUCKET } from "./media";

// Keeps the privacy policy's promises (src/content/privacy.ts): deposit screenshots go 12
// months after the event, unbooked enquiries 12 months after they came in. Confirmed bookings
// stay for business and tax records. Runs from the daily Vercel job. Findings 3, #2.

const BATCH = 100;
const monthsAgo = (n: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
};

async function removeProofFolder(bookingId: string) {
  const bucket = db().storage.from(PROOF_BUCKET);
  const { data } = await bucket.list(bookingId, { limit: 100 });
  const paths = (data ?? []).filter((f) => f.id).map((f) => `${bookingId}/${f.name}`);
  if (paths.length) await bucket.remove(paths);
  return paths.length;
}

export async function runCleanup() {
  const counts = { proofs: 0, enquiries: 0, orphanPhotos: 0 };
  const cutoff = monthsAgo(12);

  const { data: oldProofs } = await db()
    .from("bookings")
    .select("id")
    .not("proof_path", "is", null)
    .lt("event_date", cutoff.toISOString().slice(0, 10))
    .limit(BATCH);
  for (const b of oldProofs ?? []) {
    counts.proofs += await removeProofFolder(b.id);
    await db().from("bookings").update({ proof_path: null }).eq("id", b.id);
    await db().from("booking_events").insert({ booking_id: b.id, action: "deposit screenshot deleted (12 months after event)", actor: "system" });
  }

  const { data: oldEnquiries } = await db()
    .from("bookings")
    .select("id")
    .in("status", ["requested", "quoted", "proof_needs_fixing", "declined", "cancelled"])
    .lt("created_at", cutoff.toISOString())
    .limit(BATCH);
  for (const b of oldEnquiries ?? []) {
    await removeProofFolder(b.id);
    await db().from("bookings").delete().eq("id", b.id);
    counts.enquiries++;
  }

  // Photos uploaded but never saved (closed tab, failed check) after a day. Photos kept for
  // "Undo to previous" are still in the media table, so they stay.
  const { data: rows } = await db().from("media").select("path");
  const used = new Set((rows ?? []).map((r) => r.path));
  const bucket = db().storage.from(MEDIA_BUCKET);
  const dayAgo = Date.now() - 24 * 3600 * 1000;
  const { data: folders } = await bucket.list("", { limit: 100 });
  for (const folder of (folders ?? []).filter((f) => !f.id)) {
    const { data: owners } = await bucket.list(folder.name, { limit: 1000 });
    for (const owner of (owners ?? []).filter((f) => !f.id)) {
      const prefix = `${folder.name}/${owner.name}`;
      const { data: files } = await bucket.list(prefix, { limit: 1000 });
      const stale = (files ?? [])
        .filter((f) => f.id && !used.has(`${prefix}/${f.name}`) && new Date(f.created_at ?? 0).getTime() < dayAgo)
        .map((f) => `${prefix}/${f.name}`);
      if (stale.length) {
        await bucket.remove(stale);
        counts.orphanPhotos += stale.length;
      }
    }
  }
  return counts;
}
