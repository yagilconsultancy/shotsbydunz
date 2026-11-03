import { NextResponse } from "next/server";
import { adminEmails, authClient, siteUrl } from "@/lib/supabase";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  const base = siteUrl();
  if (!code) return NextResponse.redirect(`${base}/admin/login?e=link`);
  const supabase = await authClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const email = data.user?.email?.toLowerCase();
  if (error || !email || !adminEmails().includes(email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${base}/admin/login?e=link`);
  }
  return NextResponse.redirect(`${base}/admin`);
}
