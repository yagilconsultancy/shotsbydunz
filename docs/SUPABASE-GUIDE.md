# Supabase guide

What Supabase is, why we chose it over Neon or Cloudflare, and how to find your way around it for ShotsByDunz.

## What it is, in one line

A Postgres database with file storage, user sign-in and an admin dashboard, all in one account. You can think of it as "Airtable plus Google Drive plus login", built for developers.

## Why Supabase for this project

| | Supabase | Neon | Cloudflare (D1 + R2) |
| --- | --- | --- | --- |
| Database | Postgres | Postgres | SQLite (D1) |
| File storage (proof uploads) | Built in, private buckets | None, so we'd add Vercel Blob or R2 | R2, a separate product |
| Login for Dunz's dashboard | Built in, with email magic links | None, so we'd add Clerk or Auth.js | None, so we'd add Access or another tool |
| Spreadsheet-style view of the data | Yes (Table Editor) | Basic | Basic |
| Works with Vercel | Official integration | Official integration | Possible, but built for Cloudflare's own hosting |
| Free tier catch | **Pauses after 7 days with no database activity** | Sleeps when idle but wakes up by itself | Generous; no pausing |

Neon or Cloudflare would mean two or three accounts stitched together. Supabase covers bookings, proof files and Dunz's sign-in in one place.

**About the pausing:** we prevent it with a free daily check (a Vercel scheduled job that reads the database once a day). At launch, consider Supabase Pro (about $25 USD a month), which never pauses and adds daily backups. If it ever does pause, Supabase emails a warning first. To bring it back, open the project and click **Resume project**. The data is kept.

## Moving around the dashboard

Sign in at supabase.com/dashboard.

- **Organization** (top level) holds billing and team members. Make one called **YAGIL Digital Studio**.
- **Project** holds one database and its storage. Ours is **shotsbydunz-ca**, in region **Canada (Central)** (`ca-central-1`), which keeps Canadian clients' data in Canada. When creating a project, pick the specific region: the default "Americas" means the US. (The first project was created in us-west-2 by mistake and replaced on 3 Nov 2026.)

The left sidebar inside a project:

| Sidebar item | What it's for | What you'll do there |
| --- | --- | --- |
| Project overview (Home) | Health, usage, quick links | Check the project is running, not paused |
| **Table Editor** | The data, shown like a spreadsheet | Look at bookings. Treat it as read-only: change bookings through Dunz's dashboard, not here |
| SQL Editor | Run database commands | Claude gives you scripts to paste here during setup |
| Database | Tables, columns, backups, access rules | Mostly leave it alone. Backups live here (Pro plan) |
| **Authentication** | Who can sign in | Users: check that Dunz's email is the only one. URL Configuration: the site address for magic links |
| **Storage** | Files | `deposit-proofs` must always show **Private**. `site-media` is **Public** on purpose: it holds the photos shown on the website |
| Edge Functions, Realtime | Advanced features | Not used here |
| **Advisors**, Security Advisor | Automatic security check | Open it after any change. It should show no red errors |
| Logs | What happened and when | For troubleshooting with Claude |
| **Project Settings**, API Keys | The keys the website uses | Copy keys into Vercel. See below |

## The keys, and which ones are secret

| Key | Looks like | Where it goes | Secret? |
| --- | --- | --- | --- |
| Project URL | `https://xxxx.supabase.co` | Vercel and `.env.local` | No |
| Publishable key | `sb_publishable_...` | Vercel and `.env.local` | No, it's safe in the browser, but access rules still apply |
| **Secret key** | `sb_secret_...` | Vercel (marked **Sensitive**) and `.env.local` only | **Yes.** It bypasses all access rules. Never paste it into chat, code, email or screenshots |

Older projects show "anon" and "service_role" keys instead. They work the same way, and service_role is the secret one.

If the secret key is ever exposed: go to Project Settings, then API Keys, create a new secret key, update Vercel, then delete the old one.

## Database updates

Database changes come as numbered files in `docs/supabase/`. Run each one once, in order: open the SQL Editor, click **New query**, paste the file and click **Run**.

| File | What it does | Run? |
| --- | --- | --- |
| `001_booking_setup.sql` | Tables, private proof storage, access rules | Done (re-run on shotsbydunz-ca 3 Nov 2026) |
| `002_keychains.sql` | Adds the keychain quantity | Done (re-run on shotsbydunz-ca 3 Nov 2026) |
| `003_media.sql` | Photo folders, portfolio projects, the public `site-media` storage, and a copy of the 8 sample projects | Done 3 Nov 2026 |

## Locking future tables

Since 3 Nov 2026, **Automatically expose new tables** is off (Project Settings → Data API). This means a new table starts with no access for anyone, the website's server included. So every new setup file must:
- turn row level security on
- revoke access from `anon` and `authenticated`
- grant `select, insert, update, delete` to `service_role`

Existing tables are unaffected.

## Password and two-step sign-in

Since Plan 4, the dashboard uses a password plus a 6-digit code from an authenticator app.

**Settings (one time):**

1. **Authentication → Sign In / Providers → Email:**
   - Email: on
   - Minimum password length: **12**
   - Password requirements: **Lowercase, uppercase letters, digits and symbols**
   - Save
2. **Authentication → Multi-Factor:** Authenticator app (TOTP) **Enabled**. It's on by default; just check it.

**Add a person** (Supabase sign-ups are off, so each user is added by hand):

1. **Authentication → Users → Add user → Create new user.**
2. Enter their email, tick **Auto Confirm User**, and type any long random password. Don't save it anywhere; they'll replace it.
3. In Vercel, add the email to `ADMIN_EMAILS` (comma-separated, Production and Preview), then redeploy.
4. Tell them to open `/admin` → **First time, or forgot your password?**

**Lost phone:**

1. **Authentication → Users →** their email → **MFA factors →** delete the authenticator.
2. They sign in with **Email me a sign-in link instead** and set two-step up again on the new phone.

**Leaked password protection** (checks passwords against known breaches) needs the Pro plan. Turn it on at the Pro upgrade.

## Your monthly check (5 minutes)

1. Home: project is running, and usage is well under the free limits (500 MB database, 1 GB files).
2. Advisors, then Security Advisor: no red errors.
3. Storage: `deposit-proofs` is still Private (`site-media` is meant to be Public). Check **Home → Usage**: file storage should stay well under 1 GB. A sudden jump means spam uploads; tell Claude.
4. Authentication, then Users: only Dunz (and you, if added) can sign in.

## Setup day (we do this together after "Approved 2")

1. Create the organization and project: Canada (Central) region, with a strong database password saved in your password manager.
2. Paste the setup script Claude provides into the SQL Editor. It creates the tables, private storage and access rules.
3. Authentication: add the site addresses, and turn off public sign-ups so only invited users can sign in.
4. Copy the URL and keys into Vercel and `.env.local`.
5. Run the Security Advisor.
