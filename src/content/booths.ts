// Prices and inclusions here are confirmed from Dunz's SBD Booth price list.

export const boothPackages = [
  {
    id: "digital",
    name: "Digital Experience",
    price: 350,
    hours: 3,
    includes: [
      "3 hours of coverage",
      "Custom design template",
      "Custom welcome screen",
      "Instant sharing by email, QR code or text",
      "Choice of filters",
      "GIFs and boomerangs",
      "Fun props",
      "Attendant on site",
      "Choice of backdrop",
    ],
  },
  {
    id: "unlimited-prints",
    name: "Unlimited Prints Experience",
    price: 450,
    hours: 3,
    highlight: true,
    includes: [
      "Everything in Digital",
      "Unlimited 2×6 and 4×6 prints",
      "Online gallery",
    ],
  },
];

export const boothAddOns = [
  { id: "extra-hour", name: "Additional hour", price: "$100 per hour" },
  { id: "keychains", name: "Photo keychains", price: "$5 each, minimum 50" },
  { id: "photo-guestbook", name: "Photo guest book", price: "$120" },
  { id: "audio-guestbook", name: "Audio guest book", price: "$150 for 2 hours" },
  { id: "prints-upgrade", name: "Unlimited prints upgrade", price: "$150" },
];

export const boothEvents = [
  "Weddings",
  "Birthdays",
  "Corporate events",
  "Graduations",
  "Baby showers",
  "Brand launches",
];

export const boothSteps = [
  { title: "Book your date", body: "Pick a package and pay the 50% deposit. Your date is held from that moment." },
  { title: "Design your prints", body: "We match the print template and welcome screen to your theme, names or logo." },
  { title: "We set up", body: "We arrive early, set up the booth and backdrop, and test everything before guests arrive." },
  { title: "Guests take it away", body: "Prints, keychains and digital copies go home with your guests on the night." },
];

// SAMPLE: setup details to confirm with Dunz.
export const boothSpecs = [
  { label: "Space needed", value: "About 3 m × 3 m, near a power outlet" },
  { label: "Setup time", value: "45 to 60 minutes before start" },
  { label: "Indoor or outdoor", value: "Indoor, or covered outdoor space" },
];
