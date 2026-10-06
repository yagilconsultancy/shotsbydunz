# Third-party services

Everything outside our own code that the site depends on, or will. Each one needs an account, so we set them up together when we reach that step.

| Service | What it's for | Needed for | Status | Cost |
| --- | --- | --- | --- | --- |
| GitHub | Stores the code and its history | Everything | **Next step.** Create a private repo `shotsbydunz` under `yagilconsultancy` | Free |
| Vercel | Hosts the site, gives a shareable preview link, rebuilds on every merge to `main` | Client preview, launch | **Next step.** Sign in with GitHub, import the repo | Free (Hobby) to start |
| Resend | Sends booking and contact emails | Booking emails actually arriving | Code ready, account not created | Free up to 3,000 emails a month |
| Domain (e.g. shotsbydunz.com) | The real web address and a matching email sender | Launch | Waiting on Dunz: does she own one? | About $15 to $25 CAD a year |
| Vimeo or YouTube | Hosts portfolio and showreel videos | Real portfolio | Waiting on Dunz's videos | YouTube free; Vimeo Starter about $12 USD a month (no ads, cleaner player) |
| Google Analytics or Vercel Analytics | Visits, bookings started and finished | Measuring the goals in the PRD | Not started | Free |
| Cloudflare Turnstile | Stronger spam protection than the hidden field | Only if spam starts arriving | Not needed yet | Free |
| Stripe or Square | Online deposit payment | Later phase | Not started; Dunz uses e-transfer today | About 2.9% + 30¢ per payment |

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

## Accounts and ownership

Decide before launch whether these accounts belong to YAGIL Digital Studio (and the client pays through us) or to Dunz directly. The domain at least should be registered in her name.
