# Changelog

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
