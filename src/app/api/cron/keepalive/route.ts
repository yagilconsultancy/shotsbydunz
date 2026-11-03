import { NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/supabase";

// Supabase pauses free projects after a week without database activity. Vercel calls this
// once a day (vercel.json) so the bookings database stays awake.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return new NextResponse(null, { status: 401 });
  if (!dbConfigured()) return NextResponse.json({ ok: false });
  const { error } = await db().from("bookings").select("id", { head: true, count: "exact" }).limit(1);
  return NextResponse.json({ ok: !error });
}
