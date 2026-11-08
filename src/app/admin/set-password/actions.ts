"use server";

import { redirect } from "next/navigation";
import { adminGate, signInLimited } from "@/lib/admin";
import { authClient } from "@/lib/supabase";
import { passwordProblem } from "@/lib/password";

export async function setPassword(fd: FormData) {
  const gate = await adminGate();
  if (!gate) redirect("/admin/login?e=link");
  // With two-step on, a password change needs the code first, like everything else.
  if (gate.step === "code") redirect("/admin/two-step?next=password");
  if (await signInLimited("set-password", gate.email, 10)) redirect("/admin/set-password?e=slow");
  const password = String(fd.get("password") ?? "");
  if (password !== String(fd.get("confirm") ?? "")) redirect("/admin/set-password?e=match");
  if (passwordProblem(password, gate.email)) redirect("/admin/set-password?e=weak");
  const supabase = await authClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/admin/set-password?e=${error.code === "same_password" ? "same" : "weak"}`);
  redirect("/admin?m=password");
}
