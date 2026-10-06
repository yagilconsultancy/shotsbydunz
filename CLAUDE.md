# Working on this project

ShotsByDunz website for YAGIL Digital Studio's client Dunz (videography + SBD Booths photobooth, London, Ontario). Next.js 16 App Router, React 19, TypeScript, plain CSS modules. Hosted on Vercel from the GitHub repo `yagilconsultancy/shotsbydunz`.

Yagil is a designer and PM, not a programmer. Explain commands in plain language and give PowerShell commands one per line.

## Rules

- Git: every change goes on a branch (`feature/<name>` or `update-<name>`) and reaches `main` through a pull request. Never commit to `main` directly. Vercel deploys `main`.
- Content (text, prices, videos, policies) lives only in `src/content/`. Pages read from there; don't hard-code copy in components.
- Placeholder content is marked with a `SAMPLE` comment and listed in `docs/CONTENT-TRACKER.md`. When replacing one, remove the comment and tick the tracker.
- Booking rules live in `src/lib/booking.ts` and are checked in the browser and again in `src/app/api/booking/route.ts`. Change both behaviours through that one file.
- Colours and type come from the tokens in `src/app/globals.css`. Don't add new hex values in components.
- Write code like a person would: no banner comments, no comments that repeat the code, comments only for the "why".
- Before saying a change is done: `npm run lint` and `npm run build` both pass, and the page has been checked at phone and desktop widths.
- Update `docs/CHANGELOG.md` with every pull request, and `docs/PRD.md` when pages or rules change.
- Any new outside service (email, analytics, payments, video hosting) gets an entry in `docs/THIRD-PARTY-SERVICES.md`, and Yagil is told before it's set up.
- Secrets go in `.env.local` and Vercel environment variables only. Never commit them.
