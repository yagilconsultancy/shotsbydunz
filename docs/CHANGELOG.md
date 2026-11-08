# Changelog

## 2026-11-08: set-password email works on any device

- The set-password link failed when opened in a different browser from the one that asked for it, for example tapping it in the Gmail app. It now goes to the new `/auth/confirm`, which uses a one-time token (Supabase's recommended method for this kind of site). It still works once, for an hour, and only for approved emails.
- Needs the Supabase "Reset Password" email template updated (Supabase guide, step 4).
- "Link didn't work" now shows the form to ask for a new one.

## 2026-11-08: sign-in link removed

- No more "email me a sign-in link". Signing in is password plus authenticator code only.
- **First time** (and after a lost phone or forgotten password): "First time, or forgot your password?" → email → choose a password (or keep the current one) → set up the authenticator.
- Someone with a password but no authenticator app yet is asked to confirm by email before setting one up.

## 2026-11-08: password sign-in with two-step (Plan 4)

- **Dashboard sign-in** is now email and password, plus a 6-digit code from an authenticator app. Email-link sign-in stays as a backup.
- **New pages:** choose / reset password, two-step setup (QR code), two-step code, and a Password tab in the dashboard.
- **Protection:**
  - every dashboard page and action now needs the code for this sign-in
  - setting up two-step needs an email link
  - wrong email and wrong password look the same
  - attempt limits and the bot check on all sign-in forms
  - email links can only return to this site
- New: `lib/password.ts` (password rules), `components/admin/FormCheck.tsx`. `lib/admin.ts` checks the two-step level.
- Details and test results in `docs/plans/PLAN-4-PASSWORD-SIGN-IN.md`.

## 2026-11-05: Work page and project pages redesign

- **Work page:**
  - big "Work" title with intro and project count
  - one sliding amber underline on the filter
  - tiles glide to their new places when the filter changes (View Transitions API in Chrome, Edge and Safari; instant elsewhere and for reduced motion)
  - screen readers hear how many projects are showing
- **Project tiles, everywhere they appear:** small radius, "No." number, stacked title and details, "View" cue on hover, titles that fit two phone columns.
- **Project pages:**
  - "‹ section" back link and a "No. 01 / 08" counter
  - credits on a hairline; inset player, with the sample-still note as a caption
  - quote with an amber rule; "Stills" heading with photo count, three-column gallery
  - large "Next project" panel, plus Previous and All work links
- **Contact-sheet pattern** is now a shared `.contact-sheet` class in `globals.css`, used on Home, Work and project pages.
- **Fix:** "Book something like this" (project pages) and "Book Me" (Photo & Film, Content) sent `?pillar=`, which the form ignores. Both now use `bookingHref()` in `lib/booking.ts`, which pre-selects event videography, personal brand content or the booth.

## 2026-11-05: contact-sheet pattern on the home page

- Below the opening screen, the black background now carries faint "+" registration marks on a 144px grid over a still film grain, like a photographer's contact sheet.
- It's drawn with inline SVG (no image files), fades in under the opening screen, and stays still. People who switch on high contrast get the plain black.

## 2026-11-05: opening screen backdrop takes its colour from the photos

- The background behind the line of projects is now the front project's photo, enlarged and blurred to soft colour under a light dark veil. It crossfades as the line moves, driven by the same position value as the cards.
- Fine film grain over it (the existing `Noise` component). It stops for people who turn off motion.
- People who turn off transparency get the plain background.

## 2026-11-05: opening screen without the project list

- Removed the side list of projects (bottom strip on phones) from the home page's opening screen. The line of projects now fills the full width, so visitors only see what's in front of them.
- Dragging, swiping, arrow keys, the "No." counter and the "Open project" link are unchanged. Screen readers still hear each project as it changes.

## 2026-11-05: calmer home page

The same restrained style as the booth page. All motion is kept.

- Opening screen: small radius, plain background with no amber glow or gradient, smaller radii on cards and list photos.
- **Three ways to book me:** the photo leads, with name, line and "Learn more" below, instead of a card holding a picture. Landscape photos on phones.
- **Meet Dunz:** portrait beside the intro. The three facts sit on hairlines instead of in boxes.
- **SBD Booth card:**
  - flat champagne, with no shine or dot pattern
  - feature labels as plain text with icons
  - package switcher on a hairline, with "Popular" as text
  - motion without overshoot
- **How it works:** numbered columns on hairlines.
- **Headings and footer:** section labels and trailing full stops removed from headings. The footer booking card is flat with a small radius.

## 2026-11-05: SBD Booth page redesign, champagne booth colour

- **Booth colour is now champagne** (`--booth` #e4c48f, ink #231a0b) everywhere the booth appears: this page, the home booth card, booth buttons and the footer tag.
- **"Build your night" price builder** replaces the comparison table:
  - pick a package card
  - set hours with a stepper (3 included, then $100 an hour)
  - switch add-ons on (keychain quantity from 50); the prints upgrade only shows for Digital
  - the total and 50% deposit roll to new values, using `boothPrice` from `lib/booking.ts`
- **"Book with these choices"** opens the booking form pre-filled with the package, hours, add-ons and keychains. The form keeps only values from its own lists (`hours`, `addons`, `keychains` link parameters).
- **Restyled to read as designed, not templated:**
  - an inset photo hero with one dark scrim
  - hairline lists instead of rows of identical cards
  - no glows, gradient fills or bouncy motion, and small radii
  - the accent colour used sparingly
- Hover fans the three print strips. FAQ rows open smoothly in browsers that support it.
- Page copy moved to `src/content/booth-page.ts`.

## 2026-11-04: SBD Booth card on the home page plays like a booth

- **When the card comes into view:**
  1. a "Smile in 3 · 2 · 1" countdown rolls
  2. a soft camera flash crosses the card
  3. the two photo strips print out of a slot and swing to rest, fanned outward
  
  Hovering a strip straightens it. "Print again" replays the sequence.
- **Package switcher** (Digital or Unlimited Prints, which is marked Popular and selected first) shows:
  - the price
  - the hours and deposit
  - what's included
  - a "Book ..." button that opens the booking form with the booth and that package already picked
- Feature labels: instant sharing, unlimited prints, photo keychains and guest books.
- Faint sequin shimmer on the pink.
- Reduced motion: the strips are already printed, with no countdown or flash.
- `PhotoStrip` can now skip its own tilt (`tilt={0}`).

## 2026-11-04: "What you can book" with motion (Photo & Film and Content pages)

- **Rows draw in as you scroll:**
  - each line draws left to right
  - number, name, description and price rise in turn
  - prices roll up character by character
- **With a mouse:**
  - the row under the pointer gets an amber wash and its name slides right
  - a photo of that kind of work trails the cursor and leans as it moves
- **Each row opens in place** (the whole row, or its + which turns into an amber ×) to show:
  - a photo and "Ideal for" labels
  - "What's included" and "You get" with check marks
  - a "Book ..." button that opens the booking form with that service already picked
  - "Full details"
  
  One row is open at a time, and the opening can be reversed mid-way.
- Deposit and travel notes are now pills, with an "All rates" link.
- Works with keyboard and screen readers. Fades only for people who turn off motion. Still shows if scripts fail.

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
