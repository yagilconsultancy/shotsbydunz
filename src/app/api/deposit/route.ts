import { NextResponse } from "next/server";
import { guardUpload } from "@/lib/security";
import { db, dbConfigured, siteUrl } from "@/lib/supabase";
import { clearDepositLink, findByToken, logEvent, readProof, uploadProof } from "@/lib/bookings";
import { proofProblem } from "@/lib/proof";
import { sendMail } from "@/lib/mail";
import { clientEmails, ownerEmails } from "@/lib/booking-emails";
import { site } from "@/content/site";

const fail = (message: string, status: number, errors?: Record<string, string>) => NextResponse.json({ message, errors }, { status });

export async function POST(req: Request) {
  const guard = await guardUpload(req, "deposit");
  if (!guard.ok) return guard.response;
  const { body, file } = guard;
  if (!dbConfigured()) return fail(`Uploads aren’t switched on yet. Please email ${site.email}.`, 503);

  const b = typeof body.token === "string" ? await findByToken(body.token) : null;
  if (!b) return fail("This link has expired. Contact me for a new one.", 410);
  if (body.agree !== true) return fail("Please agree to the terms to secure your date.", 422, { agree: "Please agree to the terms to secure your date." });

  const problem = proofProblem(file);
  if (problem) return fail(problem, 422, { proof: problem });
  const proof = await readProof(file!);
  if ("error" in proof) return fail(proof.error, 422, { proof: proof.error });

  const path = await uploadProof(b.id, proof);
  if (!path) return fail("Your screenshot couldn’t be saved. Please try again.", 502);

  const now = new Date().toISOString();
  const { data, error } = await db()
    .from("bookings")
    .update({ status: "deposit_submitted", proof_path: path, proof_uploaded_at: now, status_note: null })
    .eq("id", b.id)
    .in("status", ["quoted", "proof_needs_fixing"])
    .select("*")
    .single();
  if (error || !data) return fail("This link has already been used. Contact me if you need help.", 409);
  await clearDepositLink(b.id);
  await logEvent(b.id, "deposit proof uploaded", "client");

  const owner = process.env.BOOKING_TO_EMAIL || site.email;
  await Promise.all([
    sendMail({ to: owner, replyTo: data.email, ...ownerEmails.proofUploaded(data, `${siteUrl()}/admin/b/${b.id}`) }),
    sendMail({ to: data.email, replyTo: owner, ...clientEmails.depositReceived(data) }),
  ]);
  return NextResponse.json({ ok: true });
}
