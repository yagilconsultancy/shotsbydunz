# Changelog

## 2026-11-04: Media folders match the new home page

- Removed the "Home: main photo" folder from Dunz's Media dashboard. The home page now opens with portfolio projects, so that photo was never shown.
- Folder descriptions now say where each photo sits on the new home page:
  - the "Meet Dunz" card
  - the pink SBD Booth card
  - the three service cards
- Project cover hint: the home page crops covers to a tall frame.
- Dashboard guide updated.
- **Findings 3 closed.** Security Advisor shows 0 errors and one warning, "Leaked password protection disabled". No action is needed: Dunz signs in by email link, not password, and the check is a Pro plan feature. Revisit at the Pro upgrade.

## 2026-11-04: home page redesign and new footer

- **New opening screen (depth reel):**
  - Six portfolio projects stand in a line that recedes into a blurred, darker distance.
  - Drag, swipe, sideways trackpad swipe or the arrow keys walk the line forward, and it loops.
  - A synced project list (side on desktop, bottom on phones), a rolling "No." counter and an "Open project" link.
  - A fast flick travels further (Apple's momentum projection), and grabbing mid-motion never jumps.
  - Vertical scrolling is never captured.
  - Reduced motion: instant changes. Screen readers hear each project as it changes.
- **The rest of the page as rounded cards:** three service cards, Meet Dunz with portrait, intro and three facts (24 hrs, 5 to 7 days, from $350), the SBD Booth card, four step cards and the quote. Labels are spaced capitals.
- **New footer on every page:**
  - a booking card
  - three compact columns: brand and socials, Services and Studio links, and tap-to-contact details
  - a slim bottom bar with Terms, Privacy, credit and Back to top
- **Top menu bar is frosted glass**, solid for people who turn off transparency.
- Home page copy moved to `src/content/home.ts`.
- **Not used any more:** the Media folder "Home: main photo" (the home page now shows portfolio projects). It stays in the dashboard until Yagil decides.

## 2026-11-03: security fixes (Findings 3)

- Dunz's sign-in cookie is now hidden from page scripts (httpOnly), HTTPS-only and SameSite Lax. It lapses after a week without use, instead of 400 days.
- **Daily clean-up,** which keeps the privacy policy's promises:
  - deletes deposit screenshots 12 months after the event
  - deletes unbooked enquiries after 12 months
  - deletes abandoned photo uploads after a day
  
  It runs only when Vercel calls with `CRON_SECRET`; without the secret the job just keeps Supabase awake.
- The project Show/Hide button only returns to dashboard pages.
- New rule in `CLAUDE.md` and the Supabase guide: every future table is locked in its own setup file. "Automatically expose new tables" is turned off in Supabase.
- Lint tools updated (`zod` 4.6.7); 0 vulnerabilities in what visitors receive.
- Turnstile is live on Production.

## 2026-11-03: database moved to Canada

- The Supabase project was in us-west-2 (Oregon) by mistake. It was replaced by **shotsbydunz-ca** in Canada (Central), so client bookings, deposit screenshots and site photos are stored in Canada, as the privacy policy says.
- The three setup files were re-run, the sign-in settings and email were set up again, the keys were swapped in Vercel and `.env.local`, and the live site was redeployed and tested. No real data was lost; only test bookings existed.

## 2026-11-03: branded booking emails

- **New look for every booking email** (`src/lib/email-layout.ts`):
  - dark ShotsByDunz header with the email type
  - large serif headline and a progress bar (Request, Quote, Deposit, Confirmed; booths use Booked, Deposit check, Confirmed)
  - amounts in a highlighted box, Dunz's notes as a quote, one amber button
  - booking details table, numbered "what happens next" steps, a "Talk soon, Dunz" sign-off
  - footer with contact details and socials
- Built with tables and inline styles so it holds up in Gmail, Apple Mail and Outlook, and on phones. Every email has a plain-text version and preview text.
- **Confirmation email** has an "Add to my calendar" button (Google Calendar, Toronto time).
- **Delivered email** asks for a review or an Instagram tag.
- Dunz's own alerts use the same design, with everything the client sent and an "Open in dashboard" button.
- Client emails still contain only fixed wording, menu choices, dates, amounts and Dunz's notes; nothing a visitor typed.

## 2026-11-03: photos and portfolio in the dashboard (Plan 3)

- **Media tab** in `/admin` with 9 labelled photo folders (home, doors, about, booth page, link preview). Each shows where its photos appear, what goes in it, the shape, how many it holds and the accepted files.
- **Replacing a photo:** Replace, Undo to previous, and a required description. Photos are shrunk on Dunz's device (longest side 2,400 px, JPEG) and uploaded straight to Supabase storage with a one-file pass. The server then checks each file is a real image before it goes live.
- **Wrong files get a clear message:** video files (use YouTube or Vimeo), camera RAW files, PDFs and others.
- **Portfolio projects** are now managed in the dashboard: add, edit, reorder, hide and delete (with a confirm tick), plus a cover photo, a gallery of up to 20, and a YouTube or Vimeo link. Links become privacy-friendly embeds, and anything else is refused.
- **Site pages** read photos and projects from the database. If the database is unreachable or not set up, they fall back to the built-in photos and sample projects.
- **SBD Booth page:**
  - New gallery section; it only appears once Dunz adds photos.
  - The photo strips take their event names from the gallery.
- The link preview picture can be changed.
- `docs/supabase/003_media.sql`: tables, public `site-media` storage, and a copy of the 8 sample projects.

## 2026-11-03: booking flow (Plan 2)

- **Booth-only bookings** are fixed price. A fifth form step, Deposit, shows the price breakdown and the 50% deposit. It also shows the e-transfer details with a reference code (`SBD-XXXXXX`, which is also the security answer). The client must upload the e-transfer screenshot or PDF before submitting.
- **Bookings with video** are quote first. The request is stored, Dunz sends a quote from her dashboard, and the client gets a private 7-day link (`/deposit/...`) to pay the deposit and upload proof.
- **Start time** is now required. Booth hours over 3 are priced at $100 each, and photo keychains take a quantity (50 or more).
- **Dashboard at `/admin`:**
  - Dunz signs in with a one-time email link, and only emails in `ADMIN_EMAILS` get in.
  - Views: Needs you, Upcoming, All, and a single day.
  - Each booking page shows the details, the deposit proof (through 5-minute links), other bookings that day, and a history of every change.
  - Actions: Send quote, Confirm, Ask for a new screenshot, Decline, Mark balance paid, Mark delivered, Cancel. Every action emails the client in fixed wording.
- **Storage:** bookings are kept in Supabase (Canada). Proof files sit in a private bucket and are checked by their contents, up to 4 MB.
- **Upkeep:** a daily Vercel scheduled call keeps the free Supabase project awake.
- **Copy and settings:**
  - Privacy policy now covers proof uploads and Supabase.
  - Fixed the "I reply within 24 hours. with availability" sentence on the Book and thank-you pages.
  - The email sender name is added in code.
  - Private pages are kept out of search results.

## 2026-11-03: Next.js security update (Findings 2)

- Next.js upgraded from 16.3.8 to 16.4.2. This fixes three advisories, including one critical issue in the image optimizer.
- Next.js's image resizer (`/_next/image`) is switched off in `src/proxy.ts`. The site doesn't use it.

## 2026-10-10: security hardening (Findings 1)

- Forms are accepted only from the site itself, as JSON, up to 16 KB, and at most 5 times in 10 minutes per visitor address. Malformed requests get a polite error instead of crashing.
- Every menu field only accepts its listed options; dates must be real and no more than two years ahead.
- The client confirmation email is fixed wording plus their menu choices, so nothing typed can be relayed to a stranger. Dunz's email subject no longer includes typed text.
- Without email set up, the deployed site says so and gives Dunz's email and number, instead of claiming "Request sent". Visitor details are no longer written to the hosting logs.
- Security headers on every response: content security policy with a per-page nonce, HTTPS only, no framing, no MIME sniffing, strict referrer, camera/microphone/location blocked, and noindex while in preview. Pages now render per request so each carries its nonce.
- Optional Cloudflare Turnstile bot check, switched on by two Vercel environment variables.
- The thank-you page no longer shows a name from the web address.
- New privacy policy page (`/privacy`, draft for Dunz), linked from the footer, the booking terms checkbox and the contact form.
- New `docs/security/ACCOUNT-CHECKLIST.md` for GitHub, Vercel, Resend and Cloudflare settings.

## 2026-10-10: motion (GSAP, Lenis, React Bits)

- Smooth scrolling with Lenis, driven by GSAP's clock so scroll effects stay in sync. Switched off on touch screens (native scrolling) and for visitors who turn on reduced motion.
- GSAP ScrollTrigger effects, opted into with data attributes: sections and work tiles fade up into view (`data-reveal`), photos drift inside their frames (`data-parallax`), photo strips and the portrait float at different speeds (`data-speed`), and the hero photo eases away while its headline lifts off as you scroll past.
- React Bits components in `src/components/bits/` (adapted, licence kept): SplitText for page headlines, ScrollReveal for the home statement and pillar intros, Noise for moving film grain over the hero photos, and Magnet on the main Book Me buttons (mouse only).
- Menus and the photo lightbox pause smooth scrolling while open.
- Added a favicon.

## 2026-10-05: editorial redesign

- New structure around three connected experiences: Photo & Film (`/photo-film`), Content (`/content`) and SBD Booth (`/booths`). Services page renamed Rates and moved into the main navigation.
- Event photography added as a service (starting price is a sample until Dunz confirms).
- Editorial type: Bodoni Moda for headings, Instrument Sans for text. Square image edges, no cards except where packages are compared.
- Full-bleed photography throughout: viewfinder hero with a single load sequence, three tall pillar panels, an offset "Selected work" layout, project pages with credits, a photo lightbox (arrow keys and Escape) and a "Next project" link.
- SBD Booth page rebuilt as an event experience: photo hero, story section, side-by-side package comparison table, prints showcase with photo strips cut from real event photos.
- 11 AI-generated sample photos in `public/images` (compressed JPEGs). `scripts/get-sample-images.ps1` downloads the originals.
- Mobile polish: no grey tap flash, hover effects only on mouse devices, press feedback on buttons, 16px form fields so iPhones don't zoom, safe-area support.

## 2026-10-05: first build with sample content

- Next.js site with all pages from the PRD: Home, About, Services (plus six service pages), Work (filterable, plus project pages), SBD Booths, Book Me, Request sent, FAQ, Contact, Terms, 404.
- Four-step booking form with 48 and 72 hour notice rules, deposit summary, terms checkbox and spam trap. Emails go through Resend once it's set up; until then they're printed in the terminal.
- Contact form.
- Confirmed client details in place: travel fee, deposits, delivery, revisions, raw footage prices, booth packages and add-ons, music rules, video terms.
- Placeholders for videos, photos, reviews, video prices and social handles, listed in `docs/CONTENT-TRACKER.md`.
- Preview banner and search-engine blocking while `NEXT_PUBLIC_PREVIEW_MODE=true`.
- Documentation in `docs/`.

## 2026-09-25: discovery

- PRD and client proposal written; client answered pricing, policy and terms questions.
