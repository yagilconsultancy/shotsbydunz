import { NextResponse } from "next/server";

const MAX_BODY_BYTES = 16 * 1024;

type Guarded = { ok: true; body: Record<string, unknown>; ip: string } | { ok: false; response: NextResponse };

const reject = (message: string, status: number) => ({ ok: false as const, response: NextResponse.json({ message }, { status }) });

const clientIp = (req: Request) =>
  req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

// Browsers always send Origin on a cross-site POST, so a mismatch means another site is
// submitting the form. Sec-Fetch-Site backs this up in browsers that send it.
function sameOrigin(req: Request) {
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  const origin = req.headers.get("origin");
  if (!origin) return !!site;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// Per-instance memory only, so it slows a single bot rather than stopping a crowd. The
// Vercel firewall rule in docs/security/ACCOUNT-CHECKLIST.md is the real limit.
const hits = new Map<string, number[]>();
function overLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > windowMs) hits.delete(k);
  return recent.length > max;
}

async function turnstileOk(token: unknown, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

export async function guardForm(req: Request, name: string, opts = { max: 5, windowMs: 10 * 60 * 1000 }): Promise<Guarded> {
  if (!sameOrigin(req)) return reject("This form can only be sent from the ShotsByDunz website.", 403);
  if (!(req.headers.get("content-type") ?? "").toLowerCase().startsWith("application/json"))
    return reject("That request couldn’t be read. Refresh the page and try again.", 415);
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return reject("That message is too long.", 413);

  const ip = clientIp(req);
  if (overLimit(`${name}:${ip}`, opts.max, opts.windowMs))
    return reject("Too many messages in a short time. Please wait a few minutes and try again.", 429);

  const raw = await req.text().catch(() => "");
  if (raw.length > MAX_BODY_BYTES) return reject("That message is too long.", 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    body = null;
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return reject("That request couldn’t be read. Refresh the page and try again.", 400);

  const b = body as Record<string, unknown>;
  if (!(await turnstileOk(b.turnstile, ip))) return reject("Please complete the quick check above the button and try again.", 403);
  return { ok: true, body: b, ip };
}
