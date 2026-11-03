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
- **Project** holds one database and its storage. Ours is **shotsbydunz**, in region **Canada (Central)**, which keeps Canadian clients' data in Canada.

The left sidebar inside a project:

| Sidebar item | What it's for | What you'll do there |
| --- | --- | --- |
| Project overview (Home) | Health, usage, quick links | Check the project is running, not paused |
| **Table Editor** | The data, shown like a spreadsheet | Look at bookings. Treat it as read-only: change bookings through Dunz's dashboard, not here |
| SQL Editor | Run database commands | Claude gives you scripts to paste here during setup |
| Database | Tables, columns, backups, access rules | Mostly leave it alone. Backups live here (Pro plan) |
| **Authentication** | Who can sign in | Users: check that Dunz's email is the only one. URL Configuration: the site address for magic links |
| **Storage** | Files | The `deposit-proofs` bucket. It must show **Private**, never Public |
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
| `001_booking_setup.sql` | Tables, private proof storage, access rules | Done 2 Nov 2026 |
| `002_keychains.sql` | Adds the keychain quantity | Run before testing the booking flow |

## Your monthly check (5 minutes)

1. Home: project is running, and usage is well under the free limits (500 MB database, 1 GB files).
2. Advisors, then Security Advisor: no red errors.
3. Storage: `deposit-proofs` is still Private.
4. Authentication, then Users: only Dunz (and you, if added) can sign in.

## Setup day (we do this together after "Approved 2")

1. Create the organization and project: Canada (Central) region, with a strong database password saved in your password manager.
2. Paste the setup script Claude provides into the SQL Editor. It creates the tables, private storage and access rules.
3. Authentication: add the site addresses, and turn off public sign-ups so only invited users can sign in.
4. Copy the URL and keys into Vercel and `.env.local`.
5. Run the Security Advisor.
