import { redirect } from "next/navigation";
import { adminEmails, authClient, dbConfigured } from "./supabase";

// Every dashboard page and action calls this first. Being signed in isn't enough: the email
// must also be on the ADMIN_EMAILS list in Vercel.
export async function currentAdmin() {
  if (!dbConfigured()) return null;
  const supabase = await authClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  return email && adminEmails().includes(email) ? email : null;
}

export async function requireAdmin() {
  const email = await currentAdmin();
  if (!email) redirect("/admin/login");
  return email;
}
