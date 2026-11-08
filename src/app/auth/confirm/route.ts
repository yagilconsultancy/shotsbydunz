import { NextResponse } from "next/server";
import { adminEmails, authClient, siteUrl } from "@/lib/supabase";

// The "set your password" email links here (Supabase → Authentication → Emails → Reset Password).
// Unlike /auth/callback, the link carries a one-time token rather than a code tied to the browser
// that asked for it, so it works when opened from the Gmail app or on another device. It still
// works once, expires after an hour, and only for emails on ADMIN_EMAILS.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const tokenHash = url.searchParams.get("token_hash");
  const base = siteUrl();
  if (!tokenHash || url.searchParams.get("type") !== "recovery" || tokenHash.length > 512)
    return NextResponse.redirect(`${base}/admin/login?m=reset&e=link`);
  const supabase = await authClient();
  const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
  const email = data.user?.email?.toLowerCase();
  if (error || !email || !adminEmails().includes(email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${base}/admin/login?m=reset&e=link`);
  }
  return NextResponse.redirect(`${base}/admin/set-password`);
}
