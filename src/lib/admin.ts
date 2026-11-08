import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminEmails, authClient, dbConfigured } from "./supabase";
import { overLimit, turnstileOk } from "./security";

// Where a signed-in person is in the sign-in steps:
//   "ok"    password (or email link) and the two-step code both done
//   "code"  two-step is set up, the code for this sign-in hasn't been entered yet
//   "setup" signed in, but no authenticator app has been set up yet
// emailProven: this sign-in used a link from the inbox (sign-in, set or reset password), not
// only a password. Setting up two-step needs it, so a leaked password alone can't be used to
// attach someone else's phone.
type Gate = { email: string; step: "ok" | "code" | "setup"; emailProven: boolean } | null;

type Claims = { aal?: string; amr?: { method?: string }[] };
const claimsOf = (token: string): Claims => {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
  } catch {
    return {};
  }
};

// Every dashboard page and action goes through here. Being signed in isn't enough: the email
// must be on ADMIN_EMAILS in Vercel, and the two-step code must have been entered.
export async function adminGate(): Promise<Gate> {
  if (!dbConfigured()) return null;
  const supabase = await authClient();
  const { data: s } = await supabase.auth.getSession();
  // getUser asks Supabase to check the session token, so the level read from it can be trusted.
  const { data, error } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (error || !email || !s.session || !adminEmails().includes(email)) return null;
  const claims = claimsOf(s.session.access_token);
  const emailProven = (claims.amr ?? []).some((a) => a.method && a.method !== "password" && a.method !== "totp");
  if (claims.aal === "aal2") return { email, step: "ok", emailProven };
  const hasApp = (data.user?.factors ?? []).some((f) => f.factor_type === "totp" && f.status === "verified");
  return { email, step: hasApp ? "code" : "setup", emailProven };
}

export async function currentAdmin() {
  const gate = await adminGate();
  return gate?.step === "ok" ? gate.email : null;
}

export async function requireAdmin() {
  const gate = await adminGate();
  if (!gate) redirect("/admin/login");
  if (gate.step === "code") redirect("/admin/two-step");
  if (gate.step === "setup") redirect("/admin/two-step/setup");
  return gate.email;
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

// Sign-in forms: 5 tries per 15 minutes from one address, and per email or account, so neither
// a single machine nor a spread of machines can guess a password or code quickly.
export async function signInLimited(name: string, key: string, max = 5) {
  const ip = await clientIp();
  const window = 15 * 60 * 1000;
  const a = overLimit(`${name}:ip:${ip}`, max, window);
  const b = key ? overLimit(`${name}:key:${key}`, max, window) : false;
  return a || b;
}

export async function botCheckPassed(form: FormData) {
  return turnstileOk(form.get("cf-turnstile-response"), await clientIp());
}
