# Plan 2: Booking flow

Written 1 November 2026 by Claude for YAGIL Digital Studio. Status: **built 3 November 2026** on branch `feature/booking-flow`; testing with Yagil next. Setup done: domain, Resend, Supabase, Vercel keys.

## Decisions so far (Yagil, 1 Nov 2026)

- Every booking is made on the website.
- Deposits are paid by e-transfer only, and the client uploads proof of payment before the booking is submitted.
- Video is quote first. Booth packages already have fixed prices.
- Bookings and proof uploads are stored in Supabase (free tier).
- Clients are notified by email only (Resend).
- Dates stay open. The client picks a start time and a number of hours, and Dunz decides whether two bookings on the same day can both work.
- Domain: **shotsbydunz.ca**, registered under YAGIL Digital Studio so YAGIL can keep an eye on renewals, DNS and email.

## The one conflict, and how the plan solves it

Video has no price until Dunz quotes, so nobody can pay a 70% deposit when they first fill in the form. So video bookings happen in two steps:

1. **Request.** No payment yet.
2. **Booking.** The client pays and uploads proof, against Dunz's quote, before the booking is submitted.

The rule still holds: no booking is secured until the deposit is paid and the proof is uploaded.

## How it works

### Booth only (fixed price)

1. The client fills in the form: about you, package, add-ons, date, start time, venue.
2. The site works out the total and the 50% deposit. It shows Dunz's e-transfer details and a reference code, for example `SBD-4821`.
3. The client sends the e-transfer, then uploads a screenshot or PDF of the confirmation. They can't submit without it.
4. Dunz gets an email saying "New booking, deposit proof attached". The client gets an email saying "Received, awaiting confirmation".
5. Dunz checks her bank and clicks **Confirm** in her dashboard. The client gets an email saying "You're booked", with the balance due date.

### Video, or video plus booth (quote first)

1. The client fills in the same form, with no payment step. Status: **Requested**. Both sides get an email.
2. Dunz opens the request in her dashboard, enters the price and an optional note, and clicks **Send quote**.
3. The client gets an email with a private link that expires after 7 days. The link shows the quote, the 70% deposit, the e-transfer details, the reference code and the proof upload.
4. The client accepts the terms, uploads the proof and submits. Status: **Deposit submitted**.
5. Dunz checks her bank and clicks **Confirm**. The client gets an email saying "You're booked".

### Booking statuses

Every booking moves through these statuses:

Requested → Quoted → Deposit submitted → **Confirmed** → Balance paid → Delivered

Off-ramps: **Declined**, **Cancelled**, and **Proof needs fixing**. With "Proof needs fixing", Dunz asks for a new upload, and the client gets an email with the link.

### Dunz's dashboard (`/admin`)

- **Sign in:** with a one-time link sent to her email. There is no password to remember, and only her email address is allowed in.
- **Bookings list:** filtered by status and date. A day view shows everything booked on that date with times, so she can see if two bookings clash.
- **Each booking:** shows all the details, the proof image or PDF, and the buttons Send quote, Confirm, Proof needs fixing, Decline, Mark balance paid and Mark delivered. Every button sends the client the matching email.
- **Phone friendly:** she can confirm from her phone.

## Security (carries on from Findings 1)

- **Proof files:**
  - Stored in a private Supabase storage area, never public. Dunz sees them through links that expire after a few minutes.
  - Only JPG, PNG, HEIC or PDF up to 4 MB are accepted (Vercel refuses uploads over 4.5 MB; e-transfer screenshots are well under that). The file type is checked on the server, not just by its name.
- **Data access:**
  - The database blocks direct access from browsers. Only the website's server can read or write bookings.
  - The master Supabase key lives only in Vercel, marked Sensitive.
- **Quote links:** they use long random codes that can't be guessed, they expire, and each one only works for its own booking.
- **Spam limits:** the same-origin check, size limit, rate limit and Turnstile from Findings 1 apply to every new form and upload.
- **Emails:** every email uses fixed wording, so nothing a visitor types is passed on to strangers.
- **Privacy policy:** updated to cover stored proof of payment and how long it's kept.

## Third-party services to set up together (before building)

| Service | Why | Cost | Needs |
| --- | --- | --- | --- |
| Supabase | Bookings database, proof storage, Dunz's sign-in | Free tier. It pauses after 7 days with no activity; a daily Vercel scheduled check prevents that. Pro is about $25 USD a month at launch | YAGIL organization, Canada (Central) region. See `docs/SUPABASE-GUIDE.md` |
| Resend | All booking emails | Free up to 3,000 a month | **A domain.** Without one, Resend can only email its own account owner, so clients would get nothing |
| Domain: shotsbydunz.ca | Email sender, and later the site address | About $10 to $20 CAD a year | Registered under YAGIL Digital Studio at Cloudflare Registrar: the same account as Turnstile, sold at cost, with free DNS |

## Build order (after "Approved 2")

1. Set up Supabase, the domain and Resend together, and add the keys to Vercel and `.env.local`.
2. Database tables, private storage, access rules.
3. Booking form: time and hours, e-transfer step, proof upload.
4. Quote link page.
5. Dunz's dashboard and the status emails.
6. Security re-test using the Findings 1 attacks plus upload attacks (wrong file type, oversized files, someone else's quote link).
7. Test run with you, then with Dunz on the Vercel link.

## Still needed from Dunz

- The e-transfer email and name shown to clients, and whether autodeposit is on. If it isn't, clients also need a security question and answer.
- The booth balance payment method (marked "To confirm" in the PRD).
- Her media files (Google Drive folder plan, sent separately).
