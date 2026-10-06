# ShotsByDunz website

Website for ShotsByDunz (event videography and social content) and SBD Booths (photobooth rental), London, Ontario. Built by YAGIL Digital Studio.

The site is a Next.js app. Every word, price and video link lives in `src/content/`, so most changes never touch page code.

## Run it on your computer

You need Node.js 20 or newer. Check with `node -v` in the VS Code terminal.

1. Open this folder in VS Code (File, Open Folder, choose `shotsbydunz`).
2. Open the terminal (View, Terminal).
3. Install everything the site needs. You only do this once, or again after `package.json` changes:

   ```
   npm install
   ```

4. Copy the settings file so the preview banner shows:

   ```
   copy .env.example .env.local
   ```

5. Start the site:

   ```
   npm run dev
   ```

6. Open http://localhost:3000 in your browser. Pages reload by themselves when you save a file.

Stop the site with `Ctrl + C` in the terminal.

Before pushing, run `npm run build`. If it finishes without red errors, Vercel will be able to build it too.

## Where things are

| You want to change | Open this file |
| --- | --- |
| Phone, email, socials, deposit and travel rules | `src/content/site.ts` |
| Video services, prices, raw footage add-ons | `src/content/services.ts` |
| Booth packages, add-ons, setup details | `src/content/booths.ts` |
| Portfolio projects and video links | `src/content/portfolio.ts` |
| About text, reviews | `src/content/about.ts` |
| FAQ answers | `src/content/faq.ts` |
| Terms and conditions | `src/content/terms.ts` |
| Booking form options and rules | `src/lib/booking.ts` |
| Colours and fonts | `src/app/globals.css` |

Anything still marked `SAMPLE` in those files is placeholder content. The full list is in `docs/CONTENT-TRACKER.md`.

## Documentation

| Document | What it covers |
| --- | --- |
| `docs/PRD.md` | What the site does, page by page, as built |
| `docs/CONTENT-TRACKER.md` | Every placeholder still waiting on Dunz |
| `docs/EDITING-CONTENT.md` | Step-by-step: add a video, change a price, edit an FAQ |
| `docs/THIRD-PARTY-SERVICES.md` | GitHub, Vercel, email, video hosting, domain: what each is for and its status |
| `docs/DEPLOYMENT.md` | Git branch and pull request workflow, Vercel preview, going live |
| `docs/DESIGN-SYSTEM.md` | Colours, type, components |
| `docs/CHANGELOG.md` | What changed and when |
| `docs/client/` | The proposal PDF and open client questions |
