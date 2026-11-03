# Security Findings 2

Found 3 November 2026 by Claude for YAGIL Digital Studio, while installing the booking-flow libraries. Status: **fixed** (approved 2 November 2026, branch `update-nextjs-security`).

## What was found

`npm audit` on the packages that ship to visitors reports **1 critical issue** in Next.js, the framework the site is built on. Next.js published three security advisories after we installed version 16.3.8. They affect every 16.x version up to 16.4.0:

| Advisory | What it means | Does it touch us? |
| --- | --- | --- |
| [GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw): remote code execution through the image optimizer with SVG files | An attacker could run code on the server | Possibly. The image optimizer address exists on every Next.js site, even though we don't use it |
| [GHSA-p3m5-59mp-jv5r](https://github.com/advisories/GHSA-p3m5-59mp-jv5r): denial of service through Server Actions | An attacker could slow down or crash the server | Not today. Dunz's new dashboard will use Server Actions |
| [GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr): remote code execution in `use cache` functions | An attacker could run code on the server | No, we don't use `use cache` |

Plain English: the live site may be exposed through the first one, and the new dashboard would be exposed to the second.

## Fix plan (only after "Approved 3")

1. Upgrade `next` and `eslint-config-next` from 16.3.8 to **16.4.2**. That release fixes all three and has been public for more than two weeks. We skip 16.4.4, which is one day old, as a precaution against bad releases.
2. Block the unused image optimizer address (`/_next/image`) in the site settings, so the SVG route stays closed even if a future version reopens it.
3. Rebuild, run lint, and repeat the Findings 1 attack checks.
4. Ship it on its own branch, `update-nextjs-security`, ahead of the booking flow, so the live site is patched straight away.

## Results after the fix

Re-tested on 3 November 2026 against a production build:

- `npm audit --omit=dev`: **0 vulnerabilities** (Next.js 16.4.2).
- `/_next/image` returns **404**, with or without a picture address. Photos still load from `/images/`.
- Findings 1 checks still pass:
  - security headers and CSP are present
  - posts from other websites are refused (403)
  - malformed requests get a polite error (400)
- Desktop and phone: every page loads with no console or CSP errors.
