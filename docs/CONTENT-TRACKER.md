# Content tracker

Everything on the site that is still placeholder. Search the code for `SAMPLE` to find each one. When real content arrives, replace it, remove the `SAMPLE` comment and tick it off here.

## Waiting on Dunz

| Item | Where it is | What's there now |
| --- | --- | --- |
| [ ] **All photos in `public/images`** | Used across every page | **AI-generated stand-ins.** They must all be replaced with Dunz's real work before launch. The portrait in particular is not her |
| [ ] Showreel video for the home page hero | `src/app/page.tsx` (`<Viewfinder>` takes a `videoSrc`) | Still photo with the viewfinder overlay |
| [ ] Real portfolio videos (Vimeo or YouTube links) | `src/content/portfolio.ts`, `video` field on each project | 8 sample projects; project pages say a sample still is shown |
| [ ] Portfolio project names, clients, dates, stories, quotes | `src/content/portfolio.ts` | Invented |
| [ ] Event photography: offered? Starting price? | `src/content/services.ts` | Added at $300 as a sample |
| [ ] Her story, approach and off-camera facts | `src/content/about.ts` | Written in her voice as a sample |
| [ ] 3 to 5 client reviews | `src/content/about.ts`, `testimonials` | Invented |
| [ ] "Starting from" price for each video service | `src/content/services.ts`, `startingFrom` | $350, $250, $200, $200, $120 |
| [ ] Service descriptions and deliverables | `src/content/services.ts` | Written by us from the PRD |
| [ ] ShotsByDunz Instagram and TikTok handles | `src/content/site.ts`, `socials` | `@shotsbydunz` (guessed) |
| [ ] Phone number for video bookings | `src/content/site.ts`, `phone` | Booth number +1 548 468 2830 |
| [ ] Business hours | `src/content/site.ts`, `hours` | Mon to Sat, 10am to 7pm |
| [ ] Booth space, setup time, indoor/outdoor | `src/content/booths.ts`, `boothSpecs` | Typical industry values |
| [ ] Booth photos for the gallery | `src/app/booths/page.tsx` | 6 placeholder boxes |
| [ ] Booth rescheduling and cancellation terms | `src/content/terms.ts`, `boothTerms` | "Being finalised" |
| [ ] Booking lead time: 48 or 72 hours for video | `src/lib/booking.ts`, `minimumHours` | 48 for video, 72 if a booth is included |
| [ ] Video plus booth bundle price | `src/app/booths/page.tsx` | "Bundle price", no amount |
| [ ] Drone footage or second shooter? | Not on the site | Left out until she confirms |
| [ ] Logo and brand colours | `src/components/Logo.tsx`, `src/app/globals.css` | Text wordmark with a red recording dot; colours chosen by us |
| [ ] Domain name | Vercel and `NEXT_PUBLIC_SITE_URL` | None yet |

## Confirmed and live

- Based in London, Ontario; $50 travel fee outside London.
- "Starting from" pricing for both brands.
- Video: 70% non-refundable deposit, balance on the day, reschedule once with 72 hours' notice, cancel within 48 hours forfeits deposit, 5 to 7 day delivery, no rush, 1 free revision.
- Booth: 50% deposit, balance the day before, confirmed 72 hours before, delivery on the day.
- Raw footage prices.
- Booth packages, inclusions and add-on prices.
- Music: up to 2 songs, one-song or two-song mix.
- Full video terms and conditions.
- Booth Instagram @sbdboothsca, payment email shotsbydunz@gmail.com.
