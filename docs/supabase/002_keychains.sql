-- ShotsByDunz booking update (Plan 2 build). Paste into Supabase, SQL Editor, New query, Run.
-- Adds the photo keychain quantity so booth deposits can be worked out exactly.

alter table public.bookings
  add column if not exists keychains smallint check (keychains between 50 and 2000);
