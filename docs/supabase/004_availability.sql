-- Plan 5: blocked times, event venue and decline reasons.
-- Run once in Supabase → SQL Editor on the shotsbydunz-ca project.

alter table public.bookings add column if not exists venue text;
alter table public.bookings add column if not exists decline_reason text;

-- Times when Dunz isn't available. A row with booking_id is the hold for a confirmed booking
-- (30 minutes before its start to 30 minutes after its end); a row without is a manual block.
-- Times are the local wall-clock time in Ontario, so no time-zone maths is needed.
create table if not exists public.blocked_times (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique references public.bookings (id) on delete cascade,
  starts_at timestamp not null,
  ends_at timestamp not null,
  note text,
  created_at timestamptz not null default now(),
  constraint blocked_times_order check (ends_at > starts_at),
  constraint blocked_times_length check (ends_at - starts_at <= interval '3 days')
);

create index if not exists blocked_times_range on public.blocked_times (starts_at, ends_at);

-- Locked like every other table: only the website's server (service_role) can read or write.
alter table public.blocked_times enable row level security;
revoke all on public.blocked_times from anon, authenticated;
grant select, insert, update, delete on public.blocked_times to service_role;
