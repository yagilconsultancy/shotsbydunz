import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

export const PROOF_BUCKET = "deposit-proofs";

export const dbConfigured = () => !!(url && secretKey);

let service: SupabaseClient | null = null;

// The secret key bypasses every database rule, so this client is only ever created on the
// server and only after the caller has done its own checks.
export function db() {
  if (!url || !secretKey) throw new Error("Supabase is not configured");
  service ??= createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return service;
}

export async function authClient() {
  if (!url || !publishableKey) throw new Error("Supabase is not configured");
  const store = await cookies();
  return createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server components can't set cookies; src/proxy.ts refreshes the session instead.
        }
      },
    },
  });
}

export const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
