import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Dunz's sign-in lasts an hour per token; refreshing it here keeps her signed in while she
// uses the dashboard. Server pages can read cookies but not write them, so it has to happen here.
async function refreshSession(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) return [];
  const toSet: { name: string; value: string; options: Record<string, unknown> }[] = [];
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach((c) => {
          request.cookies.set(c.name, c.value);
          toSet.push(c);
        });
      },
    },
  });
  try {
    await supabase.auth.getUser();
  } catch {
    // Supabase unreachable: the page itself will send her to sign in.
  }
  return toSet;
}

// A fresh nonce per page view means only scripts Next.js itself writes into the page can run,
// so an injected <script> is refused by the browser even if one ever got through.
export async function proxy(request: NextRequest) {
  // The site serves its photos as plain files, so Next.js's image resizer is never needed.
  // Closing it removes the route behind GHSA-2464-fhr4-w9xw (Findings 2).
  if (request.nextUrl.pathname.startsWith("/_next/image")) return new NextResponse(null, { status: 404 });

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV === "development";
  const turnstile = "https://challenges.cloudflare.com";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${turnstile}${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob:${supabaseUrl ? ` ${supabaseUrl}` : ""}`,
    "font-src 'self'",
    "media-src 'self'",
    `connect-src 'self' ${turnstile}${supabaseUrl ? ` ${supabaseUrl}` : ""}`,
    `frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com ${turnstile}`,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const path = request.nextUrl.pathname;
  const cookies = path.startsWith("/admin") || path.startsWith("/auth") ? await refreshSession(request) : [];

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}

export const config = {
  matcher: [
    "/_next/image",
    {
      source: "/((?!api|_next/static|_next/image|images|icon.svg|favicon.ico|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
