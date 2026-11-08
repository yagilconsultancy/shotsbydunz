"use server";

import { redirect } from "next/navigation";
import { adminEmails, authClient, dbConfigured, siteUrl } from "@/lib/supabase";
import { botCheckPassed, signInLimited } from "@/lib/admin";

const emailFrom = (fd: FormData) => String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 200);

// Wrong email and wrong password get the same answer, so the page can't be used to find out
// which emails have dashboard access.
export async function signInWithPassword(fd: FormData) {
  const email = emailFrom(fd);
  const password = String(fd.get("password") ?? "").slice(0, 200);
  if (await signInLimited("password", email)) redirect("/admin/login?e=slow");
  if (!(await botCheckPassed(fd))) redirect("/admin/login?e=bot");
  if (!dbConfigured() || !adminEmails().includes(email) || !password) redirect("/admin/login?e=wrong");
  const supabase = await authClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?e=wrong");
  redirect("/admin");
}

export async function sendLoginLink(fd: FormData) {
  const email = emailFrom(fd);
  if (await signInLimited("link", email)) redirect("/admin/login?m=link&e=slow");
  if (!(await botCheckPassed(fd))) redirect("/admin/login?m=link&e=bot");
  if (dbConfigured() && adminEmails().includes(email)) {
    const supabase = await authClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${siteUrl()}/auth/callback` },
    });
  }
  redirect("/admin/login?sent=link");
}

// Used both the first time (to choose a password) and when the password is forgotten.
export async function sendPasswordLink(fd: FormData) {
  const email = emailFrom(fd);
  if (await signInLimited("reset", email, 3)) redirect("/admin/login?m=reset&e=slow");
  if (!(await botCheckPassed(fd))) redirect("/admin/login?m=reset&e=bot");
  if (dbConfigured() && adminEmails().includes(email)) {
    const supabase = await authClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl()}/auth/callback?next=password` });
  }
  redirect("/admin/login?sent=reset");
}

export async function signOut() {
  const supabase = await authClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
