import type { PillarId } from "./pillars";

// SAMPLE: every project is placeholder until Dunz sends real work. The photos in
// public/images are AI-generated stand-ins (see docs/CONTENT-TRACKER.md).
// When a real video arrives, set `video` to its Vimeo or YouTube embed URL.

export const categories = [
  { id: "all", label: "All work" },
  { id: "photo-film", label: "Photo & Film" },
  { id: "content", label: "Content" },
  { id: "booth", label: "SBD Booth" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export type Still = { src: string; alt: string; orientation: "wide" | "tall" | "square" };

export type Project = {
  slug: string;
  title: string;
  pillars: PillarId[];
  kind: string;
  client: string;
  year: string;
  location: string;
  role: string[];
  orientation: "wide" | "tall";
  cover: string;
  coverAlt: string;
  story: string;
  stills: Still[];
  quote?: { text: string; name: string };
  video?: string;
  runtime?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "amara-and-tobi",
    title: "Amara and Tobi",
    pillars: ["photo-film", "booth"],
    kind: "Wedding",
    client: "Amara and Tobi Okafor",
    year: "2026",
    location: "London, Ontario",
    role: ["Film", "Photography", "SBD Booth"],
    orientation: "wide",
    cover: "/images/hero-wedding.jpg",
    coverAlt: "Guests dancing around the couple under warm string lights",
    story:
      "A traditional ceremony in the morning and a reception that ran past midnight. The film follows both families from getting ready to the last song, and the booth kept the dance floor's energy going in the corner all night.",
    stills: [
      { src: "/images/booth-wedding.jpg", alt: "The couple laughing with friends at the photobooth", orientation: "tall" },
      { src: "/images/booth-prints.jpg", alt: "Photo strips and keychains printed on the night", orientation: "tall" },
    ],
    quote: { text: "We've watched it more times than we can count.", name: "Amara" },
    runtime: "04:12",
    featured: true,
  },
  {
    slug: "kemi-at-30",
    title: "Kemi at 30",
    pillars: ["photo-film"],
    kind: "Birthday",
    client: "Kemi A.",
    year: "2026",
    location: "Toronto, Ontario",
    role: ["Highlight film"],
    orientation: "tall",
    cover: "/images/rooftop-birthday.jpg",
    coverAlt: "Friends in white toasting on a rooftop at sunset",
    story: "An all-white rooftop party at golden hour, recapped in 75 seconds for the group chat.",
    stills: [],
    runtime: "01:15",
    featured: true,
  },
  {
    slug: "glow-studio-launch",
    title: "Glow Studio opening",
    pillars: ["photo-film", "content"],
    kind: "Launch",
    client: "Glow Studio",
    year: "2026",
    location: "London, Ontario",
    role: ["Event film", "Reels"],
    orientation: "wide",
    cover: "/images/studio-launch.jpg",
    coverAlt: "The owner cutting a gold ribbon as friends cheer",
    story:
      "Opening night for a new beauty studio: the ribbon, the first clients and a room full of people who'd been waiting for it. One event film, plus three reels cut for launch week.",
    stills: [],
    runtime: "02:40",
    featured: true,
  },
  {
    slug: "braids-by-q",
    title: "Braids by Q",
    pillars: ["content"],
    kind: "Personal brand",
    client: "Braids by Q",
    year: "2026",
    location: "London, Ontario",
    role: ["Brand content", "Reels"],
    orientation: "tall",
    cover: "/images/braider.jpg",
    coverAlt: "Hands braiding hair in warm window light",
    story: "A month of content filmed in one afternoon, from the first parting to the finished look.",
    stills: [],
    quote: { text: "My bookings went up the week I started posting these.", name: "Q" },
    runtime: "00:30",
    featured: true,
  },
  {
    slug: "studio-day",
    title: "Studio day",
    pillars: ["content"],
    kind: "Behind the scenes",
    client: "Independent editorial",
    year: "2026",
    location: "Kitchener, Ontario",
    role: ["BTS film"],
    orientation: "tall",
    cover: "/images/fashion-bts.jpg",
    coverAlt: "A model on set under a softbox with the crew in the foreground",
    story: "The making of a fashion editorial, cut vertical for the photographer's launch post.",
    stills: [],
    runtime: "00:45",
    featured: true,
  },
  {
    slug: "sunday-market",
    title: "Sunday market",
    pillars: ["content"],
    kind: "Lifestyle reel",
    client: "Personal project",
    year: "2026",
    location: "London, Ontario",
    role: ["Reel"],
    orientation: "tall",
    cover: "/images/farmers-market.jpg",
    coverAlt: "A woman choosing peaches at a farmers market in soft morning light",
    story: "A slow Sunday at the market, shot handheld as a single reel.",
    stills: [],
    runtime: "00:38",
  },
  {
    slug: "the-adeyemis-25",
    title: "The Adeyemis, 25 years",
    pillars: ["photo-film"],
    kind: "Anniversary",
    client: "The Adeyemi family",
    year: "2026",
    location: "Mississauga, Ontario",
    role: ["Film", "Photography"],
    orientation: "wide",
    cover: "/images/anniversary.jpg",
    coverAlt: "Family clapping around the couple on the dance floor",
    story: "A silver anniversary with three generations on the dance floor.",
    stills: [],
    runtime: "03:05",
    featured: true,
  },
  {
    slug: "booth-nights",
    title: "Booth nights",
    pillars: ["booth"],
    kind: "SBD Booth",
    client: "Various events",
    year: "2026",
    location: "Southwestern Ontario",
    role: ["SBD Booth"],
    orientation: "tall",
    cover: "/images/booth-setup.jpg",
    coverAlt: "The SBD booth set up with a sequin backdrop and balloon garland",
    story: "A season of weddings, birthdays and launches through the booth's lens.",
    stills: [
      { src: "/images/booth-prints.jpg", alt: "Printed strips and keychains", orientation: "tall" },
      { src: "/images/booth-wedding.jpg", alt: "Guests mid-laugh at the booth", orientation: "tall" },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function projectsFor(id: CategoryId) {
  return id === "all" ? projects : projects.filter((p) => p.pillars.includes(id));
}
