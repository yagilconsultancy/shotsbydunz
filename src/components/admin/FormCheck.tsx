"use client";

import Turnstile from "../Turnstile";

// The bot check inside a plain server-action form. Cloudflare adds its own hidden
// "cf-turnstile-response" field to the form, which the action reads.
export default function FormCheck() {
  return <Turnstile onToken={() => {}} />;
}
