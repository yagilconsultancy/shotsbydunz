# Third-party services

Everything outside our own code that the site depends on, or will. Each one needs an account, so we set them up together when we reach that step.

| Service | What it's for | Needed for | Status | Cost |
| --- | --- | --- | --- | --- |
| GitHub | Stores the code and its history | Everything | **Next step.** Create a private repo `shotsbydunz` under `yagilconsultancy` | Free |
| Vercel | Hosts the site, gives a shareable preview link, rebuilds on every merge to `main` | Client preview, launch | **Next step.** Sign in with GitHub, import the repo | Free (Hobby) to start |
| Resend | Sends booking, quote, confirmation and sign-in emails from shotsbydunz.ca | Every booking email | **Live.** Domain verified; keys `shotsbydunz-website` (Vercel) and `shotsbydunz-supabase-auth` (Supabase SMTP) | Free up to 3,000 emails a month |
| Domain shotsbydunz.ca | Email sender now; the site address at launch | Email, launch | **Registered** under YAGIL at Cloudflare Registrar, auto-renew on | At cost, about $10 to $20 CAD a year |
| Supabase | Bookings database, private proof storage, Dunz's dashboard sign-in | Booking flow | **Live.** Organization yagilconsultancy, project shotsbydunz, Canada (Central). See `docs/SUPABASE-GUIDE.md` | Free; Pro about $25 USD a month at launch |
| Vercel Cron | Calls `/api/cron/keepalive` once a day so Supabase's free plan doesn't pause | Booking flow | Set in `vercel.json`; optional `CRON_SECRET` | Free |
| Vimeo or YouTube | Hosts portfolio and showreel videos | Real portfolio | Waiting on Dunz's videos | YouTube free; Vimeo Starter about $12 USD a month (no ads, cleaner player) |
| Google Analytics or Vercel Analytics | Visits, bookings started and finished | Measuring the goals in the PRD | Not started | Free |
| Cloudflare Turnstile | Invisible bot check on the booking and contact forms | Recommended before launch (Findings 1) | Code ready and switched off; turns on when its two keys are added to Vercel | Free |
| Vercel Firewall | Rate limit on the form addresses (`/api/*`) | Launch | Settings only, see `docs/security/ACCOUNT-CHECKLIST.md` | Free on Hobby |
| Stripe or Square | Online deposit payment | Later phase | Not started; Dunz uses e-transfer today | About 2.9% + 30¢ per payment |

## Code libraries

These are installed with `npm install` and need no account.

| Library | What it does on the site | Licence |
| --- | --- | --- |
| GSAP (`gsap`, `@gsap/react`) | Scroll effects (ScrollTrigger) and headline animation (SplitText) | Free GSAP "no charge" licence, including commercial sites |
| Lenis (`lenis`) | Smooth scrolling | MIT |
| React Bits (copied into `src/components/bits/`) | SplitText, ScrollReveal, Noise (film grain), Magnet | MIT with Commons Clause: fine to use in this website; the components can't be resold on their own. Keep `src/components/bits/LICENSE.md` |

## Setting up Resend (when we get there)

1. Create an account at resend.com with the studio email.
2. Add and verify the domain (needs access to its DNS settings). Until there's a domain, Resend's test sender only delivers to the account owner's own email.
3. Create an API key.
4. In Vercel, Project, Settings, Environment Variables, add:
   - `RESEND_API_KEY`: the key
   - `BOOKING_FROM_EMAIL`: e.g. `ShotsByDunz <bookings@shotsbydunz.com>`
   - `BOOKING_TO_EMAIL`: where Dunz wants requests, e.g. `shotsbydunz@gmail.com`
5. Redeploy. Send a test booking and check both inboxes.

Never put the API key in the code or commit it. It only goes in Vercel and in your local `.env.local`, which git ignores.

## Setting up Cloudflare Turnstile (when we get there)

1. Create a free Cloudflare account and open Turnstile, then Add widget.
2. Name it ShotsByDunz, add the hostnames (`shotsbydunz.vercel.app`, later the real domain, and `localhost` for testing) and choose Managed.
3. In Vercel, Project, Settings, Environment Variables, add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (the site key) and `TURNSTILE_SECRET_KEY` (the secret key, marked Sensitive).
4. Redeploy. A small check appears above the Send buttons and the server refuses forms without a valid pass.

## Accounts and ownership

Decide before launch whether these accounts belong to YAGIL Digital Studio (and the client pays through us) or to Dunz directly. The domain at least should be registered in her name.
