"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.turnstile) return resolve();
    let s = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (!s) {
      s = document.createElement("script");
      s.src = src;
      s.async = true;
      document.head.appendChild(s);
    }
    s.addEventListener("load", () => resolve(), { once: true });
    s.addEventListener("error", () => reject(), { once: true });
  });
}

// Cloudflare's bot check. Switched on only when the site key is set in Vercel, so the forms
// work without it during the preview.
export default function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const cb = useRef(onToken);
  useEffect(() => {
    cb.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!siteKey || !box.current) return;
    let id = "";
    let gone = false;
    loadScript()
      .then(() => {
        if (gone || !box.current || !window.turnstile) return;
        id = window.turnstile.render(box.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (t: string) => cb.current(t),
          "expired-callback": () => cb.current(""),
          "error-callback": () => cb.current(""),
        });
      })
      .catch(() => cb.current(""));
    return () => {
      gone = true;
      if (id) window.turnstile?.remove(id);
    };
  }, []);

  if (!siteKey) return null;
  return <div ref={box} style={{ minHeight: 65 }} />;
}

export const turnstileOn = !!siteKey;
