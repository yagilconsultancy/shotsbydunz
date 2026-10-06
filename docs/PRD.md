# ShotsByDunz website: product requirements (as built)

Last updated: 5 October 2026. Owner: YAGIL Digital Studio.

The original PRD and the client-facing proposal live in Claude Docs. This file describes what has actually been built, so it stays accurate as the code changes. Update it in the same pull request as any change to pages or rules.

## What the site is for

A video-first website for two businesses run by Dunz in London, Ontario:

- **ShotsByDunz**: event videography, personal brand content, behind-the-scenes coverage, highlight videos and reels.
- **SBD Booths**: photobooth rental (Instagram @sbdboothsca).

Its job is to turn people who see Dunz's work on Instagram and TikTok into complete booking requests, so she can quote on the first reply instead of chasing details in DMs.

## Goals and how we measure them

| Goal | Measure (first 90 days after launch) |
| --- | --- |
| Show work fast | Mobile page load (Largest Contentful Paint) under 2.5 s |
| Complete requests | 100% of booking requests have date, location, event type, service and hours (the form enforces this) |
| Requests from the site, not DMs | At least 8% of visitors start the booking form; at least 50% of those finish it |
| SBD Booths stands on its own | At least 25% of requests include the booth |

Analytics is not installed yet (see `THIRD-PARTY-SERVICES.md`), so these can't be measured until it is.

## Technology

| Part | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript | Fast pages, works out of the box on Vercel, one codebase for pages and the form backend |
| Styling | Plain CSS with design tokens in `src/app/globals.css` and one CSS module per component | No extra framework to learn; colours and fonts change in one place |
| Fonts | Big Shoulders Display and Instrument Sans, bundled through Fontsource | No external font requests, works offline in development |
| Content | TypeScript files in `src/content/` | Dunz's text and prices sit in a few readable files, separate from page code |
| Hosting | Vercel (planned) | Free preview links for the client, automatic deploys from GitHub |
| Email | Resend (planned) | Sends booking notifications and client confirmations |
| Video | Vimeo or YouTube embeds (planned) | Large video files never sit on our hosting |

The earlier PRD suggested Webflow or Framer. We chose Next.js because the booking rules (different lead times, deposits and add-ons for video and booths) need real logic, and because the whole project is built and maintained through Claude and VS Code.

## Pages

| Page | URL | What it does |
| --- | --- | --- |
| Photo & Film | `/photo-film` | Pillar page: photo hero, intro, bookable services with prices, recent work, call to book |
| Content | `/content` | Same layout for reels, brand content and BTS |
| Home | `/` | Full-bleed viewfinder hero, who Dunz is, three pillar panels (Photo & Film, Content, SBD Booth), offset selected work, SBD Booth band with prices and photo strips, a client quote, how booking works |
| About | `/about` | Dunz's story, three-part approach, off-camera facts, BTS clip |
| Rates | `/services` | All six services with starting prices, raw footage add-ons, deposit/delivery/revision/travel rules |
| Service detail | `/services/[service]` | Intro, ideal for, included, deliverables, examples, raw footage prices, common questions, "Book this service" (pre-fills the form) |
| Work | `/portfolio` | Work filtered by All, Photo & Film, Content and SBD Booth, with counts. The filter is kept in the URL so it can be shared |
| Project | `/portfolio/[project]` | Title, credits (client, event, year, location, role), full-width film or cover, story, quote, photo lightbox, next project |
| SBD Booths | `/booths` | Booth hero, five features, both packages with prices, add-ons, event types, gallery, how it works, space and setup needs, video plus booth bundle, booth FAQ |
| Book Me | `/book` | Four-step booking form (below) |
| Request sent | `/book/thanks` | Confirmation and what happens next |
| FAQ | `/faq` | Questions grouped by Booking, Coverage, Delivery, Music, SBD Booths. Includes FAQ structured data for Google |
| Contact | `/contact` | Call and text buttons, email, socials, service area, hours, short message form |
| Terms | `/terms` | Video terms (from Dunz's T&C) and booth terms |
| Not found | any bad link | Friendly 404 with links back |

Every page has a sticky "Book Me" button: in the header on desktop, as a bar at the bottom on phones. On the booth page the phone bar becomes "Check booth availability".

## Booking form

Steps, in order:

1. **About you**: name, email, phone (all required), best way to reach you.
2. **What you need**: services (one or more, required), booth package (required if booth chosen), number of videos (required if video chosen), hours (required), add-ons (raw footage for video, booth add-ons for booth).
3. **Your event**: date (required), start time, venue or city (required), event type (required), guest count (booth only), song choices and song mix (video only).
4. **The details**: ideas, schedule of the day (video only), reference links, budget, how they found Dunz, a summary of the request with the deposit rules, and a required terms checkbox.

Services come before the date on purpose: the earliest allowed date depends on what's booked.

Rules the form enforces, in the browser and again on the server:

- Video bookings need at least 48 hours' notice; anything including a booth needs 72 hours.
- Required fields as listed above; email and phone must look valid.
- Terms must be accepted.
- A hidden "website" field catches spam bots; anything that fills it is silently dropped.

Links can pre-fill the form: `/book?service=event-videography`, `/book?service=booth&package=unlimited-prints`, `/book?event=weddings`, `/book?service=booth&bundle=1`.

When a request is sent:

- Dunz gets an email with every field, with reply-to set to the client.
- The client gets a confirmation email with their services, date, location and deposit rules.
- The visitor lands on `/book/thanks`.

Until Resend is set up, both emails are printed in the terminal (or the Vercel log) instead of being sent. The form still works end to end.

## Business rules shown on the site

| Rule | Video | SBD Booths |
| --- | --- | --- |
| Deposit | 70%, non-refundable | 50% |
| Balance | Day of the event | Day before the event |
| Notice | 48 hours | 72 hours |
| Delivery | 5 to 7 days | On the day |
| Rush | Not offered | Not offered |
| Revisions | 1 free, extra charged | n/a |
| Travel | $50 outside London, more for longer trips | Same |
| Payment | E-transfer to shotsbydunz@gmail.com | To confirm |

Booth packages: Digital Experience $350, Unlimited Prints Experience $450 (both 3 hours). Booth add-ons: extra hour $100, keychains $5 each (min. 50), photo guest book $120, audio guest book $150 for 2 hours, unlimited prints upgrade $150. Raw footage: single clip $30, full video $50, selected clips from $50, all footage from $150.

## Quality bar

- Designed for phones first, checked at 390 px and 1440 px wide.
- Keyboard focus is always visible; the form moves focus to each new step and announces errors.
- Animation is limited to the hero's recording light and timecode, and switches off for visitors who turn on reduced motion.
- While `NEXT_PUBLIC_PREVIEW_MODE=true`, a banner marks the site as a preview and search engines are told not to index it.

## Not in this version

- Online deposit payment (planned with Stripe or Square once Dunz confirms).
- Blocking already-booked dates on the form (needs a calendar connection).
- A visual editor for Dunz; content changes go through us for now.
- Analytics, video hosting, email sending: code is ready or easy to add, but each needs an account first.

## Open questions for Dunz

Tracked in `docs/client/CLIENT-QUESTIONS.md`.
