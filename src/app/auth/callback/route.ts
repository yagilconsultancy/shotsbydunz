import { NextResponse } from "next/server";
import { adminEmails, authClient, siteUrl } from "@/lib/supabase";

// Email links (sign-in, set or reset password) land here. "next" is matched against a fixed
// value, never used as an address, so the link can't be bent to send someone elsewhere.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const base = siteUrl();
  if (!code) return NextResponse.redirect(`${base}/admin/login?e=link`);
  const supabase = await authClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const email = data.user?.email?.toLowerCase();
  if (error || !email || !adminEmails().includes(email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${base}/admin/login?e=link`);
  }
  if (url.searchParams.get("next") === "password") return NextResponse.redirect(`${base}/admin/set-password`);
  return NextResponse.redirect(`${base}/admin`);
}
