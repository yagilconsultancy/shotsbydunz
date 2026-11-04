import { boothPackages } from "./booths";

export const homeHero = {
  title: "Nights worth keeping.",
  lede: "Weddings, birthdays and launches, photographed, filmed and remembered.",
};

export const homeIntro =
  "I’m Dunz. I photograph and film weddings, birthdays and launches, make content for brands, and run the photobooth everyone ends up crowding.";

// Each figure repeats a promise made elsewhere on the site (site.ts, services.ts, booths.ts).
export const homeFacts = [
  { figure: "24 hrs", label: "to hear back with availability and a quote" },
  { figure: "5–7 days", label: "from your event to your finished film" },
  { figure: `$${Math.min(...boothPackages.map((p) => p.price))}`, label: "is where SBD Booth packages start" },
];

export const howItWorks = [
  { title: "Tell me about the day", body: "Send the booking form. Within 24 hours you get availability and a quote." },
  { title: "Lock the date", body: "A deposit holds your date. Then we plan the schedule, key moments and music together." },
  { title: "I shoot, you enjoy it", body: "I arrive early, stay out of the way and catch what matters." },
  { title: "Your film arrives", body: "Edited and delivered in 5 to 7 days, with one round of changes included." },
];

export const homeBooth = {
  title: "The corner of the room everyone ends up in.",
  lede: "Instant sharing, unlimited prints, keychains and guest books. Styled to your event and run by our attendant from setup to the last print.",
};
