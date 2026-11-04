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
| Photo & Film | `/photo-film` | Pillar page: photo hero, intro, "What you can book" (rows that open in place to show what's included, with a pre-filled Book button), recent work, call to book |
| Content | `/content` | Same layout for reels, brand content and BTS |
| Home | `/` | Depth-reel hero: six projects in a line receding into the distance, dragged, swiped or arrowed through, with a synced project list and a rolling "No." counter. Then three service cards, Meet Dunz (portrait, intro, three facts), the SBD Booth card with prices and photo strips, four step cards, a client quote |
| About | `/about` | Dunz's story, three-part approach, off-camera facts, BTS clip |
| Rates | `/services` | All six services with starting prices, raw footage add-ons, deposit/delivery/revision/travel rules |
| Service detail | `/services/[service]` | Intro, ideal for, included, deliverables, examples, raw footage prices, common questions, "Book this service" (pre-fills the form) |
| Work | `/portfolio` | Work filtered by All, Photo & Film, Content and SBD Booth, with counts. The filter is kept in the URL so it can be shared |
| Project | `/portfolio/[project]` | Title, credits (client, event, year, location, role), full-width film or cover, story, quote, photo lightbox, next project |
| SBD Booths | `/booths` | Booth hero, five features, both packages with prices, add-ons, event types, gallery, how it works, space and setup needs, video plus booth bundle, booth FAQ |
| Book Me | `/book` | Four-step booking form (below) |
| Request sent | `/book/thanks` | Confirmation and what happens next (separate wording after a booth deposit) |
| Pay deposit | `/deposit/[link]` | Private 7-day link from a quote or a "new screenshot" request: quote, e-transfer details, proof upload |
| Dashboard | `/admin` | Dunz's bookings: sign-in by email link, lists, day view, booking page with proof and actions. Not in search results |
| Media | `/admin/media` | Dunz's photo folders (replace, undo, descriptions) and portfolio projects (add, edit, reorder, hide, delete, cover, gallery, video link) |
| FAQ | `/faq` | Questions grouped by Booking, Coverage, Delivery, Music, SBD Booths. Includes FAQ structured data for Google |
| Contact | `/contact` | Call and text buttons, email, socials, service area, hours, short message form |
| Terms | `/terms` | Video terms (from Dunz's T&C) and booth terms |
| Privacy | `/privacy` | What the forms collect, why, who else handles it, how long it's kept and how to have it deleted (PIPEDA). Draft for Dunz to confirm |
| Not found | any bad link | Friendly 404 with links back |

Every page has a sticky "Book Me" button: in the header on desktop, as a bar at the bottom on phones. On the booth page the phone bar becomes "Check booth availability".

## Booking form

Every booking is made on the website. Steps, in order:

1. **About you**: name, email, phone (all required), best way to reach you.
2. **What you need**: services (one or more, required), booth package (required if booth chosen), number of videos (required if video chosen), hours (required), add-ons (raw footage for video; keychains with a quantity of 50 or more, guest books and prints upgrade for booth).
3. **Your event**: date and start time (required), venue or city (required), event type (required), guest count (booth only), song choices and song mix (video only).
4. **The details**: ideas, schedule of the day (video only), reference links, budget, how they found Dunz, a summary with the price or deposit rules, and a required terms and privacy checkbox.
5. **Deposit** (booth only): price breakdown, 50% deposit, e-transfer details with a reference code like `SBD-7KQ4P2` (also the security answer if autodeposit is off), and a required upload of the e-transfer screenshot or PDF.

Services come before the date on purpose: the earliest allowed date depends on what's booked.

### Two paths

- **Booth only (fixed price):** the site works out the total (package + hours over 3 at $100 + add-ons) and the 50% deposit. The client pays and uploads proof before submitting. Status: Deposit to check.
- **Anything with video (quote first):** the client sends a request with no payment. Dunz sends a quote from the dashboard (total, deposit, optional note). The client gets a 7-day private link to pay the deposit and upload proof. Status: Requested, then Quote sent, then Deposit to check.

Dunz checks her bank and confirms. Statuses: Requested → Quote sent → Deposit to check → Confirmed → Balance paid → Delivered, plus Proof needs fixing, Declined and Cancelled. Dates stay open: several bookings can share a date, and the booking page lists the others on that day so Dunz can spot clashes.

### Rules the form enforces, in the browser and again on the server

- Video bookings need at least 48 hours' notice; anything including a booth needs 72 hours.
- Required fields as listed above; email and phone must look valid; every menu field only accepts its listed options; dates must be real and no more than two years ahead.
- Proof files: JPG, PNG, HEIC or PDF, checked by their contents, up to 4 MB (Vercel's upload limit is 4.5 MB).
- A hidden "website" field catches spam bots.
- The server accepts forms only from the site itself, at most 5 times in 10 minutes from one address. Cloudflare Turnstile adds a bot check when its keys are set.

Links can pre-fill the form: `/book?service=event-videography`, `/book?service=booth&package=unlimited-prints`, `/book?event=weddings`, `/book?service=booth&bundle=1`.

### Emails

Each step emails the client and Dunz. Client emails use fixed wording plus menu choices, dates, amounts and Dunz's own notes; nothing the visitor typed. Dunz's emails carry every field and a link to the booking in her dashboard.

### Data

Bookings and a history of every change live in Supabase (Canada). Proof files sit in a private bucket and Dunz sees them through links that expire after 5 minutes. Browsers can't read the database; only the website's server can, after checking that the visitor is signed in and on the `ADMIN_EMAILS` list.

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
| Payment | E-transfer to shotsbydunz@gmail.com | E-transfer deposit (balance method to confirm) |

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
