# Bookings dashboard: guide for Dunz

Your bookings live at **/admin** on the website, for example `shotsbydunz.vercel.app/admin`. It works on your phone.

## Signing in

**The first time** (or if you forget your password):

1. Go to `/admin` and tap **First time, or forgot your password?**
2. Enter your email. Open the email on the **same phone or computer** and tap the link. It works once, within an hour.
3. Choose your password:
   - at least 12 characters
   - letters, at least one number and one symbol
   - three random words with a number and a symbol works well
   
   Only you know it.
4. **Turn on two-step sign-in:**
   1. Install a free authenticator app: Google Authenticator, Microsoft Authenticator or 1Password.
   2. In the app, tap **+**, scan the QR code on the screen, and type the 6-digit code it shows.

**Every time after that:**

1. Go to `/admin`, enter your email and password.
2. Open your authenticator app and type the 6-digit code for ShotsByDunz. The code changes every 30 seconds.

You stay signed in on that device while you use it. After a week without using the dashboard, you sign in again. Tap **Sign out** on shared computers.

- **Change your password:** the **Password** tab at the top of the dashboard. It asks for your code first.
- **Lost your phone?** Ask YAGIL to reset two-step. Then tap **First time, or forgot your password?**, open the email, choose **Keep my current password** (or set a new one) and set up the app on your new phone.
- **Never share your password or codes.** Nobody from ShotsByDunz or YAGIL will ever ask for them.

Only emails on the approved list can sign in. YAGIL adds or removes people.

## The lists

| Tab | Shows |
| --- | --- |
| **Needs you** | New requests to quote, and deposits to check |
| **Upcoming** | Everything from today on that isn't declined or cancelled |
| **All** | Every booking |
| **Show day** | Every booking on one date, by start time, so you can see clashes |

## What to do with each booking

| Status | What it means | What you do |
| --- | --- | --- |
| **Requested** | Video (or video plus booth) request; no payment yet | Enter the total and deposit (usually 70% for video), add a note if you like, then **Send quote**. The client gets a 7-day link to pay |
| **Quote sent** | Waiting for the client to pay | Nothing. You can **Send quote again** to change the price or give them a fresh link |
| **Deposit to check** | The client paid and uploaded proof | Check your bank for the amount with the booking reference (for example `SBD-7KQ4P2`) in the message. If it's there, **Confirm booking**. If not, **Ask for a new screenshot** and say what's wrong |
| **Proof needs fixing** | Waiting for a new screenshot | Nothing, or confirm if the money has arrived |
| **Confirmed** | Date secured; its time is now held (see below) | Tap **Mark balance paid** when the balance arrives |
| **Balance paid** | All paid | Tap **Mark delivered** when the photos or video are delivered |

Booth-only bookings skip the quote: the price is fixed, so clients pay the 50% deposit and upload proof as they book.

Every button sends the client a short email. Their replies come to your inbox.

**Declining:** open **Decline this booking**, pick a reason, and add a message if you like (needed for "Other"). The client sees both.

## Held and blocked times

- **When you confirm a booking**, its time is held automatically: from 30 minutes before the start to 30 minutes after the booked hours end. Nobody else can pick a start time that overlaps it. The rest of the day stays open.
- **To change the window** (say you need longer to set up), use **Held time** on the booking page. An end time earlier than the start means past midnight.
- **If a booking you're confirming overlaps one already held**, you'll see a warning. Check the Same day list; if it's fine, tick **Confirm anyway**.
- **Days off or outside jobs:** open the **Blocked times** tab, choose the date and the hours (or **All day**), add a note for yourself and tap **Block this time**. Clients only see that the time is taken, never your note. Tap **Remove** to open it again.
- Declining or cancelling a booking frees its time.

## Photos and portfolio (Media tab)

Tap **Media** at the top of the dashboard. Each folder is a place on the website, and it tells you:

- **Where** the photo appears
- **What** goes in it
- **What shape** to use: landscape (phone sideways), portrait (phone upright) or any
- **How many** photos it holds

**Replacing a photo**

1. Tap **Replace** (or **Upload your photo** if it still shows a built-in sample).
2. Pick the photo. Big camera files are fine: the dashboard shrinks them on your phone first.
3. Write a short **Description** of what's in the photo, for example "Bride and groom's first dance". Blind visitors and Google rely on it.
4. Tap **Put it on the site**. The change is live straight away.

Changed your mind? **Undo to previous** brings back the last photo.

**Accepted files:** JPG, PNG or WebP. iPhone photos (HEIC) work when you upload from your iPhone.
**Not accepted:**
- Videos: put them on YouTube or Vimeo and paste the link into a project
- Camera RAW files: export them as JPG first

**The folders**

| Folder | Where it shows | Shape |
| --- | --- | --- |
| Home and About: portrait of Dunz | The "Meet Dunz" card on the home page, and on About | Portrait |
| Home: booth photo strips | The two tilted strips in the pink SBD Booth card on the home page, with an event name under each | Portrait |
| Doors: Photo & Film, Content, SBD Booth | The three service cards on the home page, and the top of each section's page | Portrait |
| About: behind the scenes | Next to "Off camera" on About | Portrait |
| SBD Booth page: main photo | Top of the booth page | Landscape |
| SBD Booth page: at the booth, prints | Two tall photos on the booth page | Portrait |
| SBD Booth page: gallery | A gallery on the booth page (up to 12); the first three become photo strips | Any |
| Link preview | The picture when the site is shared on WhatsApp, Instagram or iMessage | Wide banner |

**Portfolio projects**

- **New project:** tap **Add a project**, then fill in:
  - title
  - at least one category
  - type of event
  - client, year, location
  - what you did
  - story
  - optional video link and client quote
- **Show it:** add a **cover photo**, then tap **Show on site**. New projects stay hidden until then.
- **Gallery:** up to 20 photos that open full screen.
- **Order:** the arrows on the Media page set the order on the Work page.
- **Home page:** tick "Show on the home page" to feature a project. The first 6 ticked projects open the home page as the line of projects visitors drag through. With fewer than 6 ticked, the next projects in your order fill the line.
- **Hide:** takes a project off the site but keeps it.
- **Delete:** removes it and its photos for good, after you tick the confirm box.

## Good to know

- The proof picture link stops working after 5 minutes. Reload the page for a new one.
- **Decline** (before confirming) and **Cancel** (after) both email the client. Refunds, if any, are handled outside the site.
- The **History** box lists every change, with the time and who made it.
