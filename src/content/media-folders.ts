// The photo folders Dunz manages in /admin/media. Each folder names where its photos appear
// on the site; `fallback` is the built-in photo shown until she uploads her own.

export type Shape = "landscape" | "portrait" | "any" | "share";

export type FolderPhoto = { src: string; alt: string; caption?: string; orientation?: "wide" | "tall" | "square" };

export type MediaFolder = {
  key: string;
  title: string;
  where: string;
  what: string;
  shape: Shape;
  max: number;
  // Fixed folders have one named spot per photo; list folders hold up to `max` photos.
  kind: "fixed" | "list";
  spots?: string[];
  captions?: string;
  fallback: FolderPhoto[];
};

export const shapeHelp: Record<Shape, { label: string; tip: string; ratio: string }> = {
  landscape: { label: "Landscape (wide)", tip: "Hold the phone sideways. About 3:2.", ratio: "3 / 2" },
  portrait: { label: "Portrait (tall)", tip: "Hold the phone upright. About 4:5.", ratio: "4 / 5" },
  any: { label: "Any shape", tip: "Wide, tall or square all work.", ratio: "1 / 1" },
  share: { label: "Wide banner", tip: "1200 × 630, like a YouTube thumbnail. Keep faces in the middle.", ratio: "1200 / 630" },
};

export const fileTypes = "JPG, PNG or WebP. iPhone photos (HEIC) work when you upload from your iPhone. No videos or camera RAW files.";

export const mediaFolders: MediaFolder[] = [
  {
    key: "dunz-portrait",
    title: "Home and About: portrait of Dunz",
    where: "The portrait card in “Meet Dunz” on the home page, and at the top of the About page.",
    what: "You, ideally holding a camera or at an event.",
    shape: "portrait",
    max: 1,
    kind: "fixed",
    fallback: [{ src: "/images/dunz-portrait.jpg", alt: "Dunz filming at an evening event" }],
  },
  {
    key: "home-booth",
    title: "Home: booth photo strips",
    where: "The two tilted photo strips in the pink SBD Booth card on the home page.",
    what: "Fun booth moments. Faces near the middle work best, because each strip crops four frames from one photo.",
    shape: "portrait",
    max: 2,
    kind: "fixed",
    spots: ["Left strip", "Right strip"],
    captions: "Event name printed under the strip, e.g. “Amara & Tobi”",
    fallback: [
      { src: "/images/booth-wedding.jpg", alt: "Guests laughing at the SBD photobooth", caption: "Amara & Tobi" },
      { src: "/images/rooftop-birthday.jpg", alt: "Friends toasting on a rooftop", caption: "Kemi at 30" },
    ],
  },
  {
    key: "doors",
    title: "Doors: Photo & Film, Content, SBD Booth",
    where: "The three service cards under “Three ways to book me” on the home page. Each photo also sits at the top of its own page.",
    what: "One photo that sums up each service.",
    shape: "portrait",
    max: 3,
    kind: "fixed",
    spots: ["Photo & Film", "Content", "SBD Booth"],
    fallback: [
      { src: "/images/anniversary.jpg", alt: "Family clapping around a couple dancing at an anniversary party" },
      { src: "/images/braider.jpg", alt: "Close-up of hands braiding hair in warm window light" },
      { src: "/images/booth-wedding.jpg", alt: "Newlyweds and friends laughing at the SBD photobooth" },
    ],
  },
  {
    key: "about-bts",
    title: "About: behind the scenes",
    where: "The tall photo next to “Off camera” on the About page.",
    what: "You at work on a shoot: setting up a light, filming, directing.",
    shape: "portrait",
    max: 1,
    kind: "fixed",
    fallback: [{ src: "/images/fashion-bts.jpg", alt: "Behind the scenes on a studio shoot" }],
  },
  {
    key: "booth-hero",
    title: "SBD Booth page: main photo",
    where: "Full screen at the top of the SBD Booth page.",
    what: "The booth set up at an event, with the backdrop showing.",
    shape: "landscape",
    max: 1,
    kind: "fixed",
    fallback: [{ src: "/images/booth-setup.jpg", alt: "The SBD booth styled with a sequin backdrop and balloon garland" }],
  },
  {
    key: "booth-pair",
    title: "SBD Booth page: at the booth, prints",
    where: "The two tall photos further down the SBD Booth page.",
    what: "First: guests having fun at the booth. Second: a close-up of prints and keychains.",
    shape: "portrait",
    max: 2,
    kind: "fixed",
    spots: ["At the booth", "Prints and keychains"],
    fallback: [
      { src: "/images/booth-wedding.jpg", alt: "Newlyweds and friends laughing at the booth" },
      { src: "/images/booth-prints.jpg", alt: "Printed strips and photo keychains on a table" },
    ],
  },
  {
    key: "booth-gallery",
    title: "SBD Booth page: gallery",
    where: "A photo gallery on the SBD Booth page. The first three also become the tilted photo strips.",
    what: "Your best booth photos from different events.",
    shape: "any",
    max: 12,
    kind: "list",
    captions: "Event name, used on the photo strips, e.g. “Glow Studio launch”",
    fallback: [
      { src: "/images/booth-wedding.jpg", alt: "Guests at the booth", caption: "Amara & Tobi" },
      { src: "/images/rooftop-birthday.jpg", alt: "Friends on a rooftop", caption: "Kemi at 30" },
      { src: "/images/studio-launch.jpg", alt: "A studio launch party", caption: "Glow Studio" },
    ],
  },
  {
    key: "link-preview",
    title: "Link preview",
    where: "The picture that appears when someone shares the website on WhatsApp, Instagram, iMessage or Facebook.",
    what: "A bright, simple photo. It is cropped to a wide banner, so keep faces in the middle.",
    shape: "share",
    max: 1,
    kind: "fixed",
    fallback: [{ src: "/images/hero-wedding.jpg", alt: "ShotsByDunz" }],
  },
];

export const projectFolders = {
  cover: { key: "project-cover", title: "Cover photo", max: 1 },
  gallery: { key: "project-gallery", title: "Gallery", max: 20 },
};

export const getFolder = (key: string) => mediaFolders.find((f) => f.key === key);
