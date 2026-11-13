import { boothPackages } from "./booths";

export const homeHero = {
  title: "Nights worth keeping.",
  lede: "Photography and film for weddings, birthdays and launches in London, Ontario.",
};

export const homeIntro =
  "I’m Dunz. I photograph and film weddings, birthdays and launches, make content for brands, and run SBD Booth, my photobooth business.";

// Each figure repeats a promise made elsewhere on the site (site.ts, services.ts, booths.ts).
export const homeFacts = [
  { figure: "24 hrs", label: "to hear back with availability and a quote" },
  { figure: "5 to 7 days", label: "from your event to your finished film" },
  { figure: `$${Math.min(...boothPackages.map((p) => p.price))}`, label: "is where SBD Booth packages start" },
];

export const howItWorks = [
  { title: "Tell me about the day", body: "Send the booking form. Within 24 hours you get availability and a quote." },
  { title: "Lock the date", body: "A deposit holds your date. Then we plan the schedule, key moments and music together." },
  { title: "I shoot, you enjoy it", body: "I arrive early and stay out of the way, so you can enjoy the day." },
  { title: "Your film arrives", body: "Edited and delivered in 5 to 7 days, with one round of changes included." },
];

export const homeBooth = {
  title: "Photos your guests take home on the night.",
  lede: "We style the booth to match your event, and our attendant runs it for the whole booking.",
};

export const homeBoothFeatures = [
  { icon: "share", label: "Instant sharing" },
  { icon: "print", label: "Unlimited prints" },
  { icon: "key", label: "Photo keychains" },
  { icon: "book", label: "Guest books" },
] as const;
