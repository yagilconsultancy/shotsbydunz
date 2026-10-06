import { policies } from "./site";

// Answers come from Dunz's confirmed terms unless marked SAMPLE.

export const faqGroups = [
  {
    title: "Booking",
    items: [
      {
        q: "How far in advance should I book?",
        a: "As early as you can, especially for summer weekends. Video bookings need to be made at least 48 hours before the event, and booth bookings must be confirmed and secured 72 hours before.",
      },
      {
        q: "What's your deposit policy?",
        a: `For video, a 70% deposit secures your date and the balance is due on the day of the event. Deposits are non-refundable. For SBD Booths, a 50% deposit reserves your date and the balance is due the day before the event.`,
      },
      {
        q: "What if I need to cancel or reschedule?",
        a: `${policies.video.reschedule}. ${policies.video.cancel}.`,
      },
      {
        q: "How do I pay?",
        a: `By e-transfer to ${"shotsbydunz@gmail.com"}. You'll get the payment details with your quote.`,
      },
    ],
  },
  {
    title: "Coverage",
    items: [
      {
        q: "Do you travel?",
        a: "Yes. I'm based in London, Ontario and travel for bookings outside the city. A $50 travel fee applies outside London, and longer trips may cost more.",
      },
      {
        q: "How many hours of coverage do I need?",
        a: "Most birthdays and parties need 2 to 3 hours. Weddings usually need 6 to 8. Tell me your schedule on the booking form and I'll suggest the right amount.", // SAMPLE guidance
      },
      {
        q: "What do you need from me before the shoot?",
        a: "Clear expectations and, for events, a schedule of the day so I don't miss the key moments. The location also needs to be accessible and ready to film.",
      },
    ],
  },
  {
    title: "Delivery",
    items: [
      { q: "What's the turnaround time?", a: "Videos are delivered in 5 to 7 days, depending on how many you've booked. There is no rush option." },
      { q: "How many revisions do I get?", a: "One revision is included free. Extra revisions are charged." },
      {
        q: "Do you offer raw footage?",
        a: "Yes, as an add-on: a single clip is $30, a full unedited video is $50, selected clips start at $50 and all raw footage starts at $150.",
      },
      {
        q: "Who owns the footage?",
        a: "ShotsByDunz keeps the copyright. You get a licence to use the final edited video for personal or business purposes. Delivered videos may carry a ShotsByDunz watermark, which must not be removed or covered.",
      },
    ],
  },
  {
    title: "Music",
    items: [
      {
        q: "Do I need to provide music?",
        a: "You can send up to 2 songs and tell me whether you'd like a one-song or two-song mix. If you don't have a preference, I'll choose for you.",
      },
    ],
  },
  {
    title: "SBD Booths",
    items: [
      { q: "How much space does the booth need?", a: "About 3 m by 3 m near a power outlet, indoors or in a covered outdoor space." }, // SAMPLE
      { q: "Is someone there to run it?", a: "Yes. Every package includes an attendant on site for the whole booking." },
      {
        q: "How do guests get their photos?",
        a: "Instantly. Guests can send photos to themselves by email, QR code or text, and the Unlimited Prints package adds printed copies and an online gallery.",
      },
    ],
  },
];
