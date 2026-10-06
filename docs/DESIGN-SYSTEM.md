# Design system

The idea: an editorial film magazine seen through a camera. Photography is the hero; type is a high-contrast serif that reads like a film credit or a magazine cover. The site looks through a camera: The home page opens inside a viewfinder (corner marks, a red recording light and a running timecode), and every video tile carries the same corner marks. SBD Booths keeps the same structure but switches to a pink accent and photo-strip prints, so it reads as a sibling brand.

The direction is "dark cinematic", chosen 5 October 2026 while we wait for Dunz's own brand assets. Swap the tokens below when they arrive.

## Colour

All colours are CSS variables at the top of `src/app/globals.css`.

| Token | Hex | Used for |
| --- | --- | --- |
| `--ink` | `#120e14` | Page background (plum-tinted black) |
| `--surface` | `#1c1720` | Footer, form fields, cards |
| `--raise` | `#262029` | Image placeholders |
| `--bone` | `#f2ece4` | Main text |
| `--muted` | `#aba0ae` | Secondary text |
| `--amber` | `#f2b33d` | Buttons, links, prices, focus outline |
| `--tally` | `#e8433f` | Recording light only, plus error borders |
| `--booth` | `#ff6fa5` | SBD Booths accent |
| `--paper` | `#f6f1ea` | Booth package section and photo strips |

Amber on ink and bone on ink both pass WCAG AA contrast for body text.

## Type

| Role | Font | Notes |
| --- | --- | --- |
| Headings, prices, logo | Bodoni Moda (variable, optical sizes), weight 400 to 500 | High-contrast editorial serif; italic for quotes, the logo's "by" and booth event lists |
| Everything else | Instrument Sans | Body at 16 px, line-height 1.6 |

Sizes (`--step--1` to `--step-5`) scale with screen width. The hero heading is the only element allowed above `--step-5`.

## Layout

- Content is left-aligned. Max width 1240 px plus a 16 px gutter on phones and 32 px from 768 px up.
- Sections use `.section` (64 to 128 px vertical padding) or `.section-tight`.
- Lists of things (services, raw footage, specs) are ruled rows, not cards. Cards are kept for the two booth packages, where comparing them side by side matters.

## Components

| Component | File | Notes |
| --- | --- | --- |
| Header | `src/components/Header.tsx` | Sticky; full-screen menu on phones |
| Mobile booking bar | `src/components/MobileBookBar.tsx` | Fixed at the bottom on phones; hidden on `/book` |
| Viewfinder | `src/components/Viewfinder.tsx` | Home hero; accepts a video |
| Frame | `src/components/Frame.tsx` | Every photo goes through this; shows a quiet titled frame if a file is missing |
| Work tile | `src/components/WorkTile.tsx` | Photo, runtime badge, title and credit line; links to the project page |
| Pillar panels | `src/components/PillarPanels.tsx` | The three full-height doors into Photo & Film, Content and SBD Booth |
| Pillar page | `src/components/PillarPage.tsx` | Shared layout for `/photo-film` and `/content` |
| Stills gallery | `src/components/StillsGallery.tsx` | Project photos with a full-screen lightbox (arrow keys, Escape) |
| Service list | `src/components/ServiceList.tsx` | Ruled rows with price |
| Photo strip | `src/components/PhotoStrip.tsx` | Booth graphic |
| Steps | `src/components/Steps.tsx` | Numbered, only for real sequences |
| Booking form | `src/components/BookingForm.tsx` | Four steps; styles shared with the contact form |

## Motion

One orchestrated moment: on load, the hero photo settles from a slight zoom while the headline and buttons rise in sequence, then the recording light blinks and the timecode runs. Photos zoom 3 to 4% on hover with a mouse only. Everything else changes only in response to the visitor (hover, menu, form steps). Visitors who turn on reduced motion get no animation.

## Buttons and copy

- Primary action is always amber, or pink on booth-only actions. One primary button per section.
- Buttons say exactly what happens: "Book Me", "Send booking request", "Choose Digital Experience".
- Sentence case everywhere. No all-caps labels.
