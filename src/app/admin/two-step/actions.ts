"use server";

import { redirect } from "next/navigation";
import { adminGate, signInLimited } from "@/lib/admin";
import { authClient } from "@/lib/supabase";

const codeFrom = (fd: FormData) => String(fd.get("code") ?? "").replace(/\s/g, "");

// The code from the authenticator app, at each sign-in.
export async function verifyCode(fd: FormData) {
  const gate = await adminGate();
  if (!gate) redirect("/admin/login");
  if (gate.step !== "code") redirect("/admin");
  const back = fd.get("next") === "password" ? "/admin/two-step?next=password" : "/admin/two-step";
  if (await signInLimited("code", gate.email)) redirect(`${back}${back.includes("?") ? "&" : "?"}e=slow`);
  const code = codeFrom(fd);
  if (!/^\d{6}$/.test(code)) redirect(`${back}${back.includes("?") ? "&" : "?"}e=code`);
  const supabase = await authClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp?.[0];
  if (!factor) redirect("/admin/two-step/setup");
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) redirect(`${back}${back.includes("?") ? "&" : "?"}e=code`);
  redirect(fd.get("next") === "password" ? "/admin/set-password" : "/admin");
}

// First code after scanning the QR code: proves the app is set up, and turns two-step on.
export async function confirmSetup(fd: FormData) {
  const gate = await adminGate();
  if (!gate) redirect("/admin/login");
  if (gate.step !== "setup") redirect("/admin");
  if (!gate.emailProven) redirect("/admin/login?m=link&e=setup");
  if (await signInLimited("setup", gate.email)) redirect("/admin/two-step/setup?e=slow");
  const code = codeFrom(fd);
  const factorId = String(fd.get("factor") ?? "");
  if (!/^\d{6}$/.test(code)) redirect(`/admin/two-step/setup?e=code&f=${encodeURIComponent(factorId)}`);
  const supabase = await authClient();
  // Only a not-yet-confirmed app belonging to this account can be confirmed here.
  const { data } = await supabase.auth.mfa.listFactors();
  const mine = (data?.all ?? []).find((f) => f.id === factorId && f.factor_type === "totp" && f.status === "unverified");
  if (!mine) redirect("/admin/two-step/setup");
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) redirect(`/admin/two-step/setup?e=code&f=${encodeURIComponent(factorId)}`);
  redirect("/admin?m=two-step");
}
