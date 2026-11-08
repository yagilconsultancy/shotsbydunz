# Plan 5: Dunz's booking requests

Requested by Dunz via Yagil on 8 November 2026. Status: **approved 8 November 2026, built and tested (37/37 checks)**. Needs `004_availability.sql` run in Supabase before it goes live. Yagil's answers of 8 November are included (five requests; the client calls; wording confirmed; blocks of 30 minutes before and after).

## 1. Photography: confirm by phone

**What exists:** nothing about a confirmation call.

**Change** (confirmed: the client calls Dunz): when a client picks **Event photography**:
- The booking form shows: "Photography bookings are confirmed by phone. Please call Dunz at +1 548 468 2830 within 48 hours of booking to confirm your date." The client ticks a box to agree.
- The same line goes on the Event photography page, in the "request received" email, and in the terms.

## 2. Block booked times, keep the rest of the day open

**What exists:** no availability check. Clients can request any date and time, even one Dunz is already booked for. The dashboard only lists other bookings on the same day.

**Change:**
- **When Dunz confirms a booking, its time is blocked automatically.** The block runs from 30 minutes before the start (arrival and setup) to 30 minutes after the booked hours end (the overrun allowance in #5). Dunz can adjust the block on the booking page.
- **Dunz can also block time by hand** (a day off, an outside job): a **Blocked times** tab in the dashboard with date, from, to and an optional private note.
- **Booking form:**
  - after the client picks a date, it shows which times are already taken that day, for example "Booked 2:00 pm – 8:30 pm"
  - a start time whose booked hours would overlap a block can't be chosen
  - all other times stay open
- **The website's server re-checks** on submit, and again when Dunz confirms, so two people can't take the same slot. If a confirm would overlap another confirmed booking, Dunz sees a warning and can still choose to go ahead.
- **Privacy:** the public form only sees "taken from – to", never names, events or notes.
- **Database:** one new setup file, `004_availability.sql`, which you run once in Supabase. It adds a `blocked_times` table, locked the same way as the others, and a `venue` column.

## 3. Decline with a reason

**What exists:** an optional note. The email calls it "A note from Dunz".

**Change:**
- When declining, Dunz must pick a reason:
  - Date already booked
  - Outside my service area
  - Not the kind of event I cover
  - Timeline too short
  - Other
- She can add a message. For "Other", the message is required.
- The client's email shows "Reason: …" plus the message. The reason is kept in the booking's history.

## 4. Address and start time

**What exists:** start time is already asked and required (step 3, "Start time"). Location is one box, "Venue or city".

**Change:**
- **Event address** (street, city), required.
- **Venue name**, optional.
- Start time stays required. It moves to sit beside the address and gets the hint "When your event begins". It's shown with the address on the review step, in the emails and on the dashboard.

## 5. Arrival and timing clause

**Wording (confirmed by Yagil, 8 November):**

> Dunz arrives early to set up. Your booked time starts counting 30 minutes after she arrives, so you have time to settle in if your programme isn't ready yet. If your programme starts late, coverage ends no more than 30 minutes after your booked end time.

**Where it appears:**
- the booking form's review step (part of what the client agrees to)
- every "booking confirmed" email
- the deposit page
- the terms

The automatic block in #2 already allows for the 30-minute arrival and the 30-minute overrun.

## Security

- **Availability checks:** the new public check has the same attempt limits and same-site checks as the forms. It answers only with times.
- **Re-checking:** everything the form checks is checked again on the website's server.
- **Dashboard actions:** blocking times and changing a block go through the same sign-in gate (password plus two-step) as every other dashboard action.
- **Data handling:** addresses are personal information. They're stored like the rest of a booking and deleted by the existing 12-month clean-up for unbooked enquiries.

## Testing before shipping

- the full booking flow on phone and desktop
- a confirmed booking blocking only its own window
- a manual block
- an overlapping start time refused in the form and on the server
- a decline with each reason
- the emails showing the new clauses
- lint, build and the key scan

## Test results (8 November 2026)

37 of 37 checks passed on a stand-in database, phone and desktop:

- **Form:** an open day says "This day is open"; a short address is refused; the review step shows the timing clause and "venue, address"; photography can't be sent without the call box; taken times are listed ("12:30 pm – 3:30 pm"); an overlapping start is refused; a start that fits around it goes through; venue and address are saved.
- **Server:** a time confirmed by Dunz while the client was on the last step is refused, and the form jumps back to the date step.
- **Dashboard:** confirming holds start − 30 min to end + 30 min; an overlapping confirm is stopped once with a warning, then goes through with "Confirm anyway"; the held window can be changed, including past midnight, and the next day sees the spill-over; cancelling releases the hold.
- **Decline:** "Other" needs a message; the reason is saved, logged and emailed as "Reason: …" with the message.
- **Blocked times tab:** lists booking holds (no Remove button) and manual blocks; an all-day block closes the day to the public; the private note never reaches the public; removing reopens the time; signed-out visitors are sent to sign-in.
- **Emails:** the request email asks photography clients to call; the confirmed email carries the timing clause.
- **Privacy:** the public availability answer is times only (`from`, `to`).
- Lint, build and the key scan are clean. The dashboard tabs now wrap to plain links on phones so four tabs fit.

## Built

- `lib/booking.ts`: address rule, call box rule, `bookingSpan` (30 minutes either side), `overlaps`, `clockLabel`.
- `lib/availability.ts`, `app/api/availability/route.ts` (60 checks per 10 minutes per address, times only, never cached).
- `app/api/booking/route.ts`: venue, call box, re-check before saving.
- `components/BookingForm.tsx`: taken times, address and venue, call box, timing clause.
- Dashboard: hold on confirm with "Confirm anyway", held-time editor, decline reasons, release on decline and cancel, new **Blocked times** tab (`/admin/blocks`). Manual blocks that ended over 30 days ago are cleared when a new one is added.
- Emails, terms, Event photography page and deposit page carry the clauses. Wording lives in `content/site.ts` (`bookingClauses`, `declineReasons`).
- `docs/supabase/004_availability.sql`.
