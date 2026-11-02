# Security Findings 1

Audited 10 October 2026 by Claude for YAGIL Digital Studio. Status: **fixed in code** (approved 10 October 2026, branch `feature/security-hardening`). Account settings in `docs/security/ACCOUNT-CHECKLIST.md` are still to do.

Scope: every file in `Documents\shotsbydunz` (code, docs, settings, `.env.local`, git settings and the list of tracked files), the npm packages, and a local copy of the site tested with real attack requests. The live Vercel site could not be reached from the audit workspace, but it runs the same code.

## Already safe

- No API keys, passwords or tokens anywhere in the code, docs or settings.
- `.env.local` is not tracked by git, and the email key in it is blank.
- The git remote address has no saved password.
- Packages that ship to visitors: 0 known vulnerabilities.
- Typed text is escaped on pages and in emails; script injection attempts were shown as plain text.
- The forms check everything again on the server and cap every field's length.

## Findings

| # | Problem | Proof | What it means | Risk |
| --- | --- | --- | --- | --- |
| 1 | The booking form emails a confirmation to any address typed in | A test booking addressed a confirmation to `anyone@victim.com` | Once email is on, a script can send thousands of emails from Dunz's address to strangers, with words it chooses. Her domain gets blacklisted and her real emails land in spam | High once email is on |
| 2 | No limit on how often forms can be sent | 20 messages in a row, all accepted | Bots can flood her inbox and use up the email allowance | Medium |
| 3 | The live site says "Request sent" but nothing is delivered | Production mode accepted a booking with email switched off | Real enquiries are lost, and each visitor's name, email, phone and event details are written into Vercel's logs | Medium, live now |
| 4 | No security headers | The page response had none | Browsers aren't told to block clickjacking, force HTTPS, or run only the site's own scripts | Medium |
| 5 | Other websites can submit the forms | A `text/plain` post from a fake origin was accepted | A malicious page could quietly send forms from its visitors' browsers | Low to medium |
| 6 | Some fields accept any text | Event type "FREE MONEY click evil.link" and date "9999-99-99" were accepted and put in the email subject | Junk or phishing text reaches Dunz's inbox looking official | Low |
| 7 | A malformed request crashes the contact form | Sending `null` returned a 500 error | Error noise; an easy way for bots to probe the site | Low |
| 8 | The thank-you page shows a name taken from the web address | Escaped safely, but the text is attacker-controlled | Someone could send a link that makes the page show a short message of their choosing | Low |
| 9 | 5 "high" warnings from `npm audit` | All in ESLint's tooling (`braces`) | Runs only on the developer's computer; nothing ships to visitors | Info |
| 10 | No privacy policy page | The forms collect personal details | Canadian privacy law (PIPEDA) expects a policy explaining collection and use | Compliance |

## Fix plan (run only after "Approved 1")

1. **Stop losing bookings (3).** Until email is set up, the forms say "email or text Dunz directly" instead of pretending to send, and visitor details stop going into logs.
2. **Tighten the forms (1, 5, 6, 7).** Accept only requests from her own site, accept only menu options and real dates, refuse malformed requests politely, and make the client confirmation fixed text that echoes nothing the visitor typed.
3. **Security headers (4).** Clickjacking protection, HTTPS-only, a strict list of allowed scripts and video players, and camera, microphone and location blocked.
4. **Flood protection (2, 1).** A rate limit rule in Vercel's firewall (settings only) and Cloudflare Turnstile, a free invisible bot check that needs a free account.
5. **Thank-you page (8).** Stop reading the name from the web address.
6. **Accounts (no code).**
   - GitHub: two-factor login, `main` protected so it only changes through pull requests, Dependabot and secret scanning on.
   - Vercel: two-factor login, password protection on preview links.
   - Resend, when set up: a send-only key, marked Sensitive in Vercel.
7. **Privacy policy page (10).** Drafted by Claude, confirmed with Dunz.

All fixes go on one branch, `feature/security-hardening`, and reach the site through a pull request.

## Results after the fix

Re-tested 10 October 2026 against a production build of the fixed code.

| # | Re-test | Result |
| --- | --- | --- |
| 1 | Booking with someone else's email | Their confirmation is fixed wording plus menu choices only; nothing typed is included |
| 2 | 20 messages in a row from one address | First 5 handled, the other 15 refused (429). Vercel firewall rule and Turnstile add the real limit once set up |
| 3 | Booking with email switched off | Visitor is told it wasn't sent and given Dunz's email and number (503). No visitor details in the logs |
| 4 | Page headers | CSP with nonce, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, COOP all present. No console or CSP errors on desktop or phone |
| 5 | `text/plain` from a fake origin; JSON from another site; no origin | All refused (403, 403, 403); same-site `text/plain` refused (415) |
| 6 | Event type "FREE MONEY…", date 9999-99-99, 31 February, fake menu values | All refused with field errors (422) |
| 7 | `null`, an array, broken JSON, a 20 KB body | 400, 400, 400, 413 |
| 8 | Thank-you page with `?name=` | Shows "Request sent." only |
| 9 | `npm audit` warnings | Unchanged: developer tooling only, nothing ships |
| 10 | Privacy policy | `/privacy` live as a draft for Dunz to confirm |

## Workspace note

During the audit, files in Claude's cloud workspace were edited by an unknown source, including new `src/proxy.ts` and `src/lib/security.ts`. No other Claude session was running. None of those edits were copied to Yagil's computer or GitHub, and they must not be used. Approved fixes will be written fresh.
