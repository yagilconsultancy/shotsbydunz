# Security Findings 3

Audited 3 November 2026 by Claude for YAGIL Digital Studio. Status: **closed 4 Nov 2026.** Fixed, shipped (pull request #7) and checked live.

**Scope:** everything added since Findings 1:
- the booking flow and deposit uploads
- Dunz's dashboard and sign-in
- the Media manager and portfolio
- the branded emails
- the Canada database
- Turnstile and the Vercel firewall

**How it was checked:**
- a code review of every server route and dashboard action
- a key scan of every file
- `npm audit`
- the earlier end-to-end attack tests against a stand-in database

## Already safe

- **No keys exposed.** None in any file; `.env.local` is git-ignored. Turnstile, Resend and Supabase keys live only in Vercel and `.env.local`.
- **Packages that reach visitors:** 0 known vulnerabilities (Next.js 16.4.2).
- **Every dashboard action** (17 of them, booking and media) checks the person is signed in and on `ADMIN_EMAILS` before doing anything. Only "send sign-in link" and "sign out" are open, by design.
- **Database:** browsers can't read or write any table (row level security on, no public access). Deposit screenshots are in private storage and Dunz sees them through 5-minute links.
- **Deposit links** are 256-bit random codes. Only a hash is stored, they expire after 7 days and work once.
- **Uploads:**
  - Files are checked by their contents, not their name.
  - SVG and HTML can never be uploaded, so there's no way to plant a script.
  - Site photos only accept JPG, PNG and WebP.
- **Emails:** everything is escaped. Client emails contain nothing a visitor typed, so the site can't be used to send spam.
- **Video links** become YouTube or Vimeo embeds only, and the page rules allow no other players.
- **Spam and floods:** Turnstile on all three forms, the Vercel firewall (10 form posts per minute per address), same-site checks and size limits.
- **Page rules (CSP) with a fresh nonce on every page view.** Sign-in links only return to the site's own address. Private pages are hidden from search engines.
- **Data stays in Canada:** the database moved to Canada (Central).

## Findings

| # | Problem | What it means | Risk |
| --- | --- | --- | --- |
| 1 | Dunz's sign-in cookie can be read by page scripts, isn't marked "HTTPS only", and lasts 400 days (the Supabase library defaults) | If a script ever got onto the site, it could copy her session and act as her in the dashboard. The page rules make that very hard, but the cookie should not rely on that alone. The site never needs to read this cookie in the browser | Medium |
| 2 | The privacy policy promises deletion (e-transfer screenshots within 12 months of the event, unbooked enquiries within 12 months), but nothing deletes them | A promise in the policy that isn't kept is a compliance problem under PIPEDA, and storage slowly fills | Medium (compliance) |
| 3 | The daily keep-alive address can be called by anyone, because `CRON_SECRET` isn't set | Harmless today (one tiny database read, and the firewall limits it). Once it also runs the clean-up in #2, only Vercel should be able to trigger it | Low |
| 4 | The project Show/Hide button sends Dunz back to whatever address the form says | Only Dunz can press it, and the site's own action checks stop outside sites from faking it. Still, it should only ever go back to the dashboard | Low |
| 5 | The new Supabase project has "Automatically expose new tables" on | Our tables are locked, but a table added later would start open to the public API unless its setup file locks it | Low |
| 6 | Spam bookings could fill the 1 GB of free storage with 4 MB screenshots | Turnstile and the firewall make this hard. Nothing alerts you if it starts | Low |
| 7 | `npm audit` warnings: 17 in developer tools (`zod`, `minimatch`, used by the lint checker) | Runs only on the developer's computer; nothing ships to visitors | Info |
| 8 | Old versions of replaced site photos stay reachable if someone has their exact link | Needed for "Undo to previous"; they are public photos anyway | Info |
| 9 | Vercel shows 3 build warnings (checked from the build log, 3 Nov) | None affects the site: (a) "Unknown env config cache-dir" comes from Vercel's own build machine, not our project. (b) ESLint 9 is out of support; it's a developer-only lint tool, and moving to ESLint 10 waits until Next.js's lint config supports it. (c) npm blocked the install script of `unrs-resolver` (a lint-tool helper). Blocking unapproved install scripts is safer, and the site builds without it | Info, no action |

## Fix plan (approved)

1. **Sign-in cookie (1):** HTTP-only (scripts can't read it), Secure (HTTPS only), SameSite Lax, and a 7-day lifetime. Dunz signs in again weekly with one email link.
2. **Automatic clean-up (2, 3):** the daily job also:
   - deletes deposit screenshots 12 months after the event
   - deletes unbooked requests (requested, quoted, declined, cancelled) after 12 months
   - deletes leftover abandoned uploads
   - logs each run without personal details
   
   The job only runs when Vercel calls it with `CRON_SECRET`. Yagil adds one secret in Vercel.
3. **Redirect (4):** Show/Hide only returns to dashboard pages.
4. **Future tables (5):**
   - A rule in `CLAUDE.md` and the Supabase guide: every new setup file must lock its tables.
   - Yagil turns off "Automatically expose new tables" in Supabase → Project Settings → Data API, after confirming the site still works.
   - Yagil runs the Security Advisor on shotsbydunz-ca.
5. **Storage watch (6):**
   - The clean-up in step 2 also removes uploads left behind by failed bookings.
   - Storage use is added to the monthly 5-minute check in the Supabase guide.
   - Supabase already emails the owner as a free project nears its limits.
6. **Developer tools (7):** `npm audit fix` (no breaking changes) for the lint tools, then lint and build.
7. **Build warnings (9):** none to fix. Leave the install script blocked, and revisit ESLint 10 when Next.js supports it.
8. Re-test, update the docs and changelog, and ship on branch `update-security-findings-3`.

## Results (tested 4 Nov 2026 against the stand-in database)

| # | Fix | Test result |
| --- | --- | --- |
| 1 | Sign-in cookie | In the browser the cookie is HTTP-only, SameSite Lax and lasts 7 days; page scripts see nothing. Secure (HTTPS only) switches on in production. The dashboard still signs in and refreshes |
| 2 | Clean-up | Seeded old and new records, then ran the job. The screenshot of a confirmed booking from 2025 was deleted and the booking kept. A 2025 enquiry was deleted. A 2025 abandoned photo was deleted. Recent bookings, current photos and uploads under a day old were untouched |
| 3 | Daily job | No secret or a wrong secret gets "401 not allowed". With the secret, the clean-up runs |
| 4 | Redirect | Show/Hide returns only to that project's page or the Media page |
| 5 | Future tables | Rule added to `CLAUDE.md` and the Supabase guide |
| 6 | Storage | The clean-up removes abandoned uploads. The Usage check is added to the monthly routine |
| 7 | Dev tools | `zod` 4.6.7. 0 vulnerabilities in what visitors receive. 16 moderate in `minimatch` (lint only) need a breaking upgrade; left until Next.js's lint config moves |
| All | Checks | Lint and a clean build pass; key scan clean |

## Your steps

1. Ship the branch (pull request, merge).
2. In Vercel, add `CRON_SECRET`:
   - Secret, Production only
   - a long random string
   
   Then redeploy.
3. In Supabase on `shotsbydunz-ca`:
   1. Check the live site and dashboard still work.
   2. Turn off **Project Settings → Data API → Automatically expose new tables**.
   3. Open **Advisors → Security Advisor** and send Claude a screenshot.

## Closing check (4 Nov 2026)

- Keep-alive without the secret answers 401. Vercel's run logged `Clean-up { proofs: 0, enquiries: 0, orphanPhotos: 0 }`.
- "Automatically expose new tables" is off; 0 of 5 tables exposed. Site and dashboard still work.
- Security Advisor: 0 errors. 5 info notes: tables locked with no public rules, as intended.
- One warning: **Leaked password protection disabled**. This checks passwords against known leaks. No action, because:
  - Dunz signs in with an email link and never uses a password.
  - Sign-ups are off.
  - The feature needs Supabase Pro.
  
  Turn it on when the project moves to Pro at launch.
