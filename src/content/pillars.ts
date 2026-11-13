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
      "I cover the whole day without directing it, from the speeches to the dance floor late at night. Afterwards you get a film and a photo gallery of the day as it happened.",
    image: "/images/anniversary.jpg",
    imageAlt: "Family clapping around a couple dancing at an anniversary party",
  },
  {
    id: "content",
    name: "Content",
    href: "/content",
    line: "Reels, brand shoots and behind-the-scenes, made to post.",
    intro:
      "For creators, stylists and small businesses who need steady, good-looking content without filming it themselves. We film in one session and you get enough clips to post for a month.",
    image: "/images/braider.jpg",
    imageAlt: "Close-up of hands braiding hair in warm window light",
  },
  {
    id: "booth",
    name: "SBD Booth",
    href: "/booths",
    line: "A photobooth for your event, run by our team.",
    intro:
      "Guests send photos to their phones straight away. Packages can add unlimited prints, keychains and guest books, and our attendant stays with the booth for the whole booking.",
    image: "/images/booth-wedding.jpg",
    imageAlt: "Newlyweds and friends laughing at the SBD photobooth",
  },
];

export function getPillar(id: PillarId) {
  return pillars.find((p) => p.id === id)!;
}
