-- ShotsByDunz booking setup (Plan 2). Paste the whole file into Supabase, SQL Editor, New query, Run.
-- Safe to run once on a new project.

create extension if not exists pgcrypto;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'requested' check (status in (
    'requested', 'quoted', 'deposit_submitted', 'proof_needs_fixing',
    'confirmed', 'balance_paid', 'delivered', 'declined', 'cancelled'
  )),
  pricing text not null check (pricing in ('fixed', 'quote')),

  name text not null check (char_length(name) <= 120),
  email text not null check (char_length(email) <= 200),
  phone text not null check (char_length(phone) <= 40),
  contact_method text not null,

  services text[] not null,
  booth_package text,
  videos smallint check (videos between 1 and 50),
  hours text not null,
  add_ons text[] not null default '{}',

  event_date date not null,
  start_time time not null,
  location text not null check (char_length(location) <= 300),
  event_type text not null,
  guests integer check (guests between 1 and 9999),
  songs text check (char_length(songs) <= 500),
  song_mix text,
  schedule text check (char_length(schedule) <= 2000),
  details text check (char_length(details) <= 2000),
  reference_links text check (char_length(reference_links) <= 1000),
  budget text,
  referral text,

  total_cents integer check (total_cents >= 0),
  deposit_cents integer check (deposit_cents >= 0),
  quote_note text check (char_length(quote_note) <= 1000),
  quote_token_hash text unique,
  quote_expires_at timestamptz,

  proof_path text,
  proof_uploaded_at timestamptz,
  confirmed_at timestamptz,
  balance_paid_at timestamptz,
  delivered_at timestamptz,
  status_note text check (char_length(status_note) <= 1000)
);

create index bookings_event_date_idx on public.bookings (event_date);
create index bookings_status_idx on public.bookings (status);

create table public.booking_events (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings (id) on delete cascade,
  at timestamptz not null default now(),
  action text not null,
  actor text not null
);
create index booking_events_booking_idx on public.booking_events (booking_id);

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();

-- Row level security on with no policies: browsers (publishable key) can read and write
-- nothing. Only the website's server, using the secret key, can reach these tables.
alter table public.bookings enable row level security;
alter table public.booking_events enable row level security;
revoke all on public.bookings, public.booking_events from anon, authenticated;

-- Private bucket for e-transfer screenshots and PDFs, 10 MB max.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'deposit-proofs', 'deposit-proofs', false, 10485760,
  array['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf']
);
