# Editing content

Every change below happens in VS Code, inside `src/content/`. Keep `npm run dev` running and the browser open at http://localhost:3000; the page updates when you save.

The files are TypeScript, which is strict about punctuation. The rules that matter:

- Text goes inside double quotes: `"like this"`.
- If the text itself contains a double quote, use a curly one (“ ”) or an apostrophe instead.
- Every item in a list ends with a comma.
- If the browser shows a red error after saving, press `Ctrl + Z` to undo and try again, or ask Claude.

## Add a real portfolio video

1. Upload the video to Vimeo or YouTube.
2. Get the embed link:
   - YouTube: Share, Embed, copy the address inside `src="..."`. It looks like `https://www.youtube.com/embed/abc123`.
   - Vimeo: Share, Embed, copy the address inside `src="..."`. It looks like `https://player.vimeo.com/video/123456`.
3. Open `src/content/portfolio.ts`.
4. Either edit a sample project or copy one whole `{ ... },` block and change it:

   ```ts
   {
     slug: "tola-and-dayo",            // web address: /portfolio/tola-and-dayo (lowercase, dashes, no spaces)
     title: "Tola and Dayo",
     category: "weddings",             // events, weddings, birthdays, personal-brands, lifestyle or bts
     orientation: "wide",              // "wide" for 16:9, "tall" for vertical 9:16
     date: "October 2026",
     location: "London, Ontario",
     services: ["Event videography"],
     story: "One or two sentences about the event.",
     quote: { text: "What the client said.", name: "Tola" },   // optional, delete the line if none
     video: "https://player.vimeo.com/video/123456",
     tone: 0,                          // placeholder colour 0 to 5, only used until a thumbnail exists
     featured: true,                   // true = shows on the home page (first 5 are used)
   },
   ```

5. Save. The "Sample" label disappears once `video` is filled in.

## Change a price

- Video services: `src/content/services.ts`, change `startingFrom: "$350"`.
- Booth packages: `src/content/booths.ts`, change `price: 350` (a plain number, no `$`).
- Booth add-ons and raw footage: change the `price` text in the same files.

## Edit an FAQ

Open `src/content/faq.ts`. Each question is:

```ts
{ q: "The question?", a: "The answer." },
```

Add, edit or delete these inside the right group. New groups show up on the FAQ page automatically.

## Change contact details or policies

`src/content/site.ts` holds the phone, email, socials and every deposit, delivery and travel rule. The booking form, FAQ and booth page all read from here, so one edit updates everywhere.

If the phone number changes, update `phone`, `phoneHref` and `smsHref` together. The last two use the number with no spaces: `tel:+15195550101`.

## Add the showreel to the home page

1. Export a short loop (15 to 30 seconds, no sound, under 4 MB for phones) as MP4.
2. Put it in the `public` folder, for example `public/showreel.mp4`.
3. In `src/app/page.tsx`, change `<Viewfinder>` to `<Viewfinder videoSrc="/showreel.mp4">`.

For a larger file, host it on Vimeo and use its direct MP4 link instead.

## Turn off the preview banner

When the content is real and the client has signed off, set `NEXT_PUBLIC_PREVIEW_MODE` to `false` in Vercel (and in `.env.local`). This also lets Google index the site.
