# Plan 4: email and password sign-in, with two-step

Approved by Yagil on 8 November 2026 ("Approved plan 4"; two-step: yes). Dunz's dashboard email: `shotsbydunz@gmail.com`.

## What changes

- **Sign-in page** (`/admin/login`):
  - email and password only
  - "First time, or forgot your password?" sends a link to choose a password
  - The email sign-in link was removed on 8 November at Yagil's request. The first time is now: choose a password by email, then turn on the authenticator.
- **Choose a password** (`/admin/set-password`):
  - reached from that link, or from the dashboard's Password tab
  - at least 12 characters, letters with a number and a symbol
  - no email, business name or common words
- **Two-step sign-in**, required for everyone on `ADMIN_EMAILS`:
  - after the password, a 6-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password)
  - set up once at `/admin/two-step/setup` by scanning a QR code
- **Every dashboard page and action** needs all of: an approved email, a valid session, and the code for this sign-in. A password alone opens nothing.

## Protection

- Nobody else knows the password: not YAGIL, not Claude. It isn't in the code, in Vercel or in any email. Dunz chooses it on the site.
- Wrong email and wrong password get the same message, so the page can't reveal who has access.
- 5 tries per 15 minutes per address and per account for sign-in, codes and links (3 for password emails, 10 for choosing a password). Cloudflare's bot check is on the sign-in forms. Supabase also limits attempts on its side.
- **Setting up two-step needs the set-password email.** You can only add an authenticator app after arriving through that link. Someone who signs in with a password but has no app yet is asked to confirm by email first, then may keep their password and set up the app. A password that leaked before two-step was on still can't attach someone else's phone.
- **The set-password email works on any device.** It goes to `/auth/confirm` with a one-time token, so it opens correctly from the Gmail app or another phone. Supabase's "Reset Password" email template must point there (see the Supabase guide). Like before, it works once, for an hour, and only for approved emails.
- **Email links only lead back to this site.** The "next" value is compared with one fixed word and is never used as an address.
- The sign-in cookie stays as before: hidden from page scripts, HTTPS-only, a week without use.
- **Lost phone:**
  1. YAGIL deletes the factor in Supabase (Authentication → Users → the user → MFA factors).
  2. The person uses "First time, or forgot your password?".
  3. They keep or change their password, then set up two-step again.

## Tested (8 November 2026, stand-in database): 27 of 27 checks passed

- Strangers are sent to sign in.
- A wrong password and an unknown email get the same message.
- The password email flow works: link → choose password → two-step setup.
- Weak passwords, passwords with the business name, and mismatches are refused.
- A wrong setup code keeps the same app. The right code turns two-step on.
- At the next sign-in, a password then the code opens the dashboard.
- The Media page and password change are blocked until the code is entered.
- The setup page closes once two-step is on.
- Signing in with a password alone can't set up two-step without the email. After it, the person can keep their password and set up the app.
- There's no "email me a sign-in link" option on the page.
- The set-password link opened in a different browser (for example, the Gmail app on a phone) works.
- Used a second time, it's refused. Other link types and unknown accounts are refused too.
- An email link can't redirect off the site.
- The sixth wrong try is slowed down.

## Yagil's steps

See `docs/SUPABASE-GUIDE.md` → "Password and two-step sign-in".
