// SAMPLE prices: Dunz chose "starting from" pricing but hasn't sent the amounts yet.

import type { PillarId } from "./pillars";

export type Service = {
  slug: string;
  pillar: Exclude<PillarId, "booth">;
  name: string;
  summary: string;
  intro: string;
  idealFor: string[];
  included: string[];
  deliverables: string[];
  turnaround: string;
  startingFrom: string;
};

export const services: Service[] = [
  {
    slug: "event-videography",
    pillar: "photo-film",
    name: "Event videography",
    summary: "The whole day, cut into a film you'll rewatch every year.",
    intro:
      "I cover your event from first arrivals to the last dance, then cut it into a highlight film with the speeches, the surprises and the people who made it.",
    idealFor: ["Weddings", "Milestone birthdays", "Baby showers", "Corporate events"],
    included: [
      "Coverage for the hours you book",
      "Planning call before the day",
      "Licensed music, or up to 2 songs you choose",
      "One round of revisions",
    ],
    deliverables: ["3 to 5 minute highlight film (16:9)", "One vertical teaser for social media (9:16)"],
    turnaround: "5 to 7 days",
    startingFrom: "$350",
  },
  {
    slug: "event-photography",
    pillar: "photo-film",
    name: "Event photography",
    summary: "A full gallery of the day, edited and delivered online.",
    intro:
      "Candid and portrait photography of your event, edited in the same warm, cinematic style as the films. Book it alone or alongside video so one person covers both.",
    idealFor: ["Weddings", "Birthdays", "Launches", "Family celebrations"],
    included: ["Coverage for the hours you book", "Colour-graded edit of every keeper", "Online gallery to share and download"],
    deliverables: ["Edited high-resolution gallery", "Web-sized copies for social media"],
    turnaround: "5 to 7 days",
    startingFrom: "$300", // SAMPLE: photography wasn't on the original list; confirm with Dunz
  },
  {
    slug: "personal-brand",
    pillar: "content",
    name: "Personal brand content",
    summary: "A month of posts filmed in one session.",
    intro:
      "For creators, stylists and small business owners who need steady video without filming it themselves. We plan the shots together, film in one session and I edit a batch you can post all month.",
    idealFor: ["Creators", "Beauty and hair professionals", "Coaches", "Small businesses"],
    included: ["Concept and shot list", "One filming session", "Captions on request", "One round of revisions"],
    deliverables: ["Batch of edited vertical clips", "Cover frames for each clip"],
    turnaround: "5 to 7 days",
    startingFrom: "$250",
  },
  {
    slug: "bts-coverage",
    pillar: "content",
    name: "Behind-the-scenes coverage",
    summary: "The making-of for your shoot, launch or show.",
    intro:
      "Photographers, artists and brands book me to film what happens around the main event, so their audience sees the work behind the result.",
    idealFor: ["Photo shoots", "Music videos", "Product launches", "Fashion shows"],
    included: ["Coverage for the hours you book", "Vertical-first filming", "One round of revisions"],
    deliverables: ["2 to 4 vertical BTS edits"],
    turnaround: "5 to 7 days",
    startingFrom: "$200",
  },
  {
    slug: "highlight-videos",
    pillar: "photo-film",
    name: "Highlight videos",
    summary: "A 60 to 90 second recap made to be shared.",
    intro:
      "Short, fast and made for the group chat. A highlight video captures the feel of your event in about a minute, ready to post the same week.",
    idealFor: ["Birthdays", "Parties", "Graduations", "Community events"],
    included: ["Coverage for the hours you book", "Licensed music, or a song you choose", "One round of revisions"],
    deliverables: ["60 to 90 second recap, in vertical or wide format"],
    turnaround: "5 to 7 days",
    startingFrom: "$200",
  },
  {
    slug: "reels",
    pillar: "content",
    name: "Reels and short-form",
    summary: "Scroll-stopping vertical edits for Instagram and TikTok.",
    intro:
      "Single reels or bundles, edited to trend formats and your own style. Bring a reference you love and I'll match the pace and feel.",
    idealFor: ["Instagram", "TikTok", "YouTube Shorts"],
    included: ["Filming or editing your own footage", "Captions on request", "One round of revisions"],
    deliverables: ["15 to 60 second vertical videos"],
    turnaround: "5 to 7 days",
    startingFrom: "$120",
  },
  {
    slug: "custom",
    pillar: "photo-film",
    name: "Custom packages",
    summary: "Something different in mind? Let's build it together.",
    intro:
      "Mix services, combine video with an SBD Booth, or plan something that doesn't fit a box. Tell me what you have in mind and I'll put together a quote.",
    idealFor: ["Multi-day events", "Video plus photobooth", "Ongoing content"],
    included: ["Planning call", "A quote built around your event"],
    deliverables: ["Whatever your event needs"],
    turnaround: "Agreed with you",
    startingFrom: "Quote",
  },
];

export const rawFootage = [
  { name: "Single clip", price: "$30", detail: "One specific unedited clip of your choice" },
  { name: "Full video or clip", price: "$50", detail: "The complete unedited version of one video" },
  { name: "Selected clips", price: "From $50", detail: "Several specific clips from your event or session" },
  { name: "Full raw footage", price: "From $150", detail: "All available unedited footage from your booking" },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
