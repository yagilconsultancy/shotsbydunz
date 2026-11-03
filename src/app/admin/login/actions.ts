"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminEmails, authClient, dbConfigured, siteUrl } from "@/lib/supabase";

const tries = new Map<string, number[]>();

export async function sendLoginLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const h = await headers();
  const ip = h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (tries.get(ip) ?? []).filter((t) => now - t < 15 * 60 * 1000);
  tries.set(ip, [...recent, now]);
  if (recent.length >= 5) redirect("/admin/login?e=slow");

  // Same answer whether or not the email is allowed, so the page can't be used to discover it.
  if (dbConfigured() && adminEmails().includes(email)) {
    const supabase = await authClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${siteUrl()}/auth/callback` },
    });
  }
  redirect("/admin/login?sent=1");
}

export async function signOut() {
  const supabase = await authClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
