# Plan 3: Photos and media in Dunz's dashboard

Written 2 November 2026 by Claude for YAGIL Digital Studio. Status: **approved and built 3 November 2026.** Decisions taken: Dunz can hide and delete projects (delete needs a confirm tick); no home-page video loop for now.

## Goal

Dunz can replace every photo on the site herself, and add or edit portfolio projects, from her phone, without touching code. Text and prices stay with YAGIL for now.

## What Dunz sees: `/admin`, then Media

There's a new **Media** tab next to Bookings. It is organised as folders named after the place on the site where the photos show up. Every folder shows:

- **What goes here**, in plain words.
- **The best shape** (landscape, portrait or square), with a small outline of that shape.
- **How many photos** the folder holds.
- **The file types it accepts.**
- **A preview** of each current photo, with **Replace**, **Undo to previous** and a **Description** box (one line describing the photo, for blind visitors and Google; required).

### Folders

| # | Folder | What goes here | Shape | Photos |
| --- | --- | --- | --- | --- |
| 1 | **Home: main photo** | The first big photo visitors see, full screen behind the headline. Your strongest event shot, with space in the middle for text | Landscape (wide) | 1 |
| 2 | **Home and About: portrait of Dunz** | You, ideally with a camera. Used on the home page and the About page | Portrait (tall) | 1 |
| 3 | **Home: booth photo strips** | The two tilted photo strips on the home page, each with an event name | Portrait (tall) | 2 |
| 4 | **Doors: Photo & Film, Content, SBD Booth** | The three tall photos people tap to enter each part of the site, one for each | Portrait (tall) | 3 |
| 5 | **About: behind the scenes** | You at work on a shoot | Portrait (the page shows it tall) | 1 |
| 6 | **SBD Booth page: main photo** | The top photo on the booth page: the booth set up at an event | Landscape | 1 |
| 7 | **SBD Booth page: at the booth / prints** | Guests at the booth, and a close-up of prints and keychains | Portrait | 2 |
| 8 | **SBD Booth page: gallery** | Photos from booth events; the photo-strip graphics are cut from these | Any shape | Up to 12 |
| 9 | **Link preview** | The picture that shows when someone shares the site on WhatsApp, Instagram or iMessage | Landscape (1200 × 630) | 1 |
| 10 | **Portfolio projects** | One sub-folder per project (below) | | |

### Portfolio projects (folder 10)

Each project is its own sub-folder. Dunz can **add**, **reorder**, **hide** or **delete** projects. Each one has:

| Item | What goes here | Type |
| --- | --- | --- |
| Cover photo | The photo on the Work page and home page | Landscape or portrait (she picks) |
| Gallery | Extra photos, which open full screen | Up to 20 photos, any shape |
| Video | The finished film | **A YouTube or Vimeo link**, pasted in (no video files) |
| Details | Title, client, year, location, category (Photo & Film, Content or SBD Booth), a short story, an optional client quote | Text boxes |

### File types (shown on every folder)

- **Accepted:** JPG, PNG, WebP. HEIC (iPhone photos) works when she uploads straight from her iPhone.
- **Size:** anything her phone or camera produces. The dashboard shrinks each photo on her device before uploading: longest side 2,400 px, about 300 to 600 KB. Pages stay fast and phone data isn't wasted.
- **Not accepted, with a friendly message:**
  - Camera RAW files (CR2, NEF, ARW, DNG): "export as JPG first"
  - Videos: "upload to YouTube or Vimeo and paste the link"
  - PDFs, GIFs, anything else

**Why videos stay on YouTube or Vimeo:** video files are large. They would fill the free storage after a few films and play slowly for visitors. YouTube and Vimeo stream them fast on any connection, for free. Vimeo Starter (about $12 USD a month) removes ads and branding if she prefers.

## How it works behind the scenes

1. Dunz picks a photo. Her browser shrinks it and turns it into a web-ready JPEG or WebP.
2. The site gives her an upload pass, issued only to a signed-in admin and only for one new file name. The photo goes straight to Supabase storage, which avoids Vercel's 4.5 MB limit. Supabase fixes the pass lifetime at 2 hours, but nothing goes live until step 3 checks the file.
3. The server checks the file is a real image of the right size, then swaps it in. The old photo is kept so **Undo to previous** works.
4. The site shows the new photo straight away. If a folder is ever empty, the site falls back to the current built-in photo, so a page is never blank.

## Security (same standard as bookings)

- Only emails on `ADMIN_EMAILS` can open Media or change anything.
- Every change is checked on the server: real image, allowed size, folder exists, description present.
- **Photo storage:** a new public `site-media` storage folder holds only published site photos (they're public on the website anyway). Uploads into it only work with the server's one-time pass. Deposit proofs stay in their own private folder.
- **Video links:** only `youtube.com`, `youtu.be` and `vimeo.com` links are accepted. They are turned into privacy-friendly embeds (youtube-nocookie), and the page rules already allow only those players.
- **History:** every change is logged with the time, for example "Home: main photo replaced".

## Cost and limits

- No new services or accounts. It uses the Supabase project we already have.
- Supabase free storage is 1 GB, roughly 2,000 web-sized photos. The dashboard shows how much is used.

## Build order (after "Approved Plan 3")

1. Database update `003_media.sql` (Yagil runs it in the SQL Editor), plus the new `site-media` storage folder.
2. Move today's photos into the folder system, keeping the built-in photos as fallback.
3. Media tab: folders, previews, Replace, Undo, Description.
4. Portfolio projects: add, edit, reorder, hide, delete, gallery, video link.
5. Site pages read from the folders.
6. Security tests: non-image files, oversized files, other people's upload passes, bad video links, signed-out access.
7. Phone and desktop check, docs (Dashboard guide gets a Media section), then the branch and pull request steps.

## Decisions for Yagil

1. Should Dunz also be able to **delete** portfolio projects, or only hide them? Recommended: hide and delete, with a confirm step.
2. Should the main home photo be allowed to be a **short looping video** (silent, 10 seconds, MP4) later? Not in this plan; it can be a follow-up once real footage exists.
