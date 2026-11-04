import { NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/supabase";
import { runCleanup } from "@/lib/cleanup";

// Vercel calls this once a day (vercel.json) with "Authorization: Bearer <CRON_SECRET>".
// It keeps the free Supabase project awake and runs the 12-month clean-up. Without the secret
// set, it only does the harmless keep-alive read, and nobody else can trigger deletions.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authorised = !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
  if (secret && !authorised) return new NextResponse(null, { status: 401 });
  if (!dbConfigured()) return NextResponse.json({ ok: false });

  const { error } = await db().from("bookings").select("id", { head: true, count: "exact" }).limit(1);
  if (error || !authorised) return NextResponse.json({ ok: !error });

  try {
    const counts = await runCleanup();
    console.log("Clean-up", counts);
    return NextResponse.json({ ok: true, ...counts });
  } catch {
    console.error("Clean-up failed");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
