import { NextResponse } from "next/server";
import { isRealDate } from "@/lib/booking";
import { dbConfigured } from "@/lib/supabase";
import { takenOn } from "@/lib/availability";
import { overLimit } from "@/lib/security";

// The booking form asks which times are taken on a date. The answer is times only: no names,
// events or notes ever leave the server.
export async function GET(req: Request) {
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (overLimit(`availability:${ip}`, 60, 10 * 60 * 1000)) return NextResponse.json({ taken: [] }, { status: 429 });
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!isRealDate(date) || !dbConfigured()) return NextResponse.json({ taken: [] });
  try {
    const taken = await takenOn(date);
    return NextResponse.json({ taken }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ taken: [], unavailable: true });
  }
}
