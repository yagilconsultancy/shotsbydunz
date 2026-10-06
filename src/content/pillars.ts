// The three ways to work with Dunz. Each has its own page and shares the booking flow.

export type PillarId = "content" | "photo-film" | "booth";

export type Pillar = {
  id: PillarId;
  name: string;
  href: string;
  line: string;
  intro: string;
  image: string;
  imageAlt: string;
};

export const pillars: Pillar[] = [
  {
    id: "photo-film",
    name: "Photo & Film",
    href: "/photo-film",
    line: "Weddings, milestones and launches, photographed and filmed.",
    intro:
      "I cover the whole day without directing it: the arrivals, the speeches, the dance floor at midnight. You get a film and a gallery that feel like the night did.",
    image: "/images/anniversary.jpg",
    imageAlt: "Family clapping around a couple dancing at an anniversary party",
  },
  {
    id: "content",
    name: "Content",
    href: "/content",
    line: "Reels, brand shoots and behind-the-scenes, made to post.",
    intro:
      "For creators, stylists and small businesses who need steady, good-looking content without filming it themselves. One session, a month of posts.",
    image: "/images/braider.jpg",
    imageAlt: "Close-up of hands braiding hair in warm window light",
  },
  {
    id: "booth",
    name: "SBD Booth",
    href: "/booths",
    line: "The photobooth your guests line up for, run by our team.",
    intro:
      "Instant sharing, unlimited prints, keychains and guest books, styled to your event and staffed from setup to the last print.",
    image: "/images/booth-wedding.jpg",
    imageAlt: "Newlyweds and friends laughing at the SBD photobooth",
  },
];

export function getPillar(id: PillarId) {
  return pillars.find((p) => p.id === id)!;
}
