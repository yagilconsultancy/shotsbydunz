-- ShotsByDunz photos and portfolio (Plan 3). Paste the whole file into Supabase, SQL Editor,
-- New query, Run. Run it once. It also copies the 8 sample projects so the Work page keeps
-- working; Dunz can edit or delete them from the dashboard.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,80}$'),
  title text not null check (char_length(title) between 1 and 120),
  pillars text[] not null default '{}',
  kind text check (char_length(kind) <= 60),
  client text check (char_length(client) <= 120),
  year text check (char_length(year) <= 10),
  location text check (char_length(location) <= 120),
  role text[] not null default '{}',
  orientation text not null default 'wide' check (orientation in ('wide', 'tall')),
  story text check (char_length(story) <= 2000),
  quote_text text check (char_length(quote_text) <= 400),
  quote_name text check (char_length(quote_name) <= 80),
  video_url text check (char_length(video_url) <= 300),
  runtime text check (char_length(runtime) <= 10),
  featured boolean not null default false,
  hidden boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

-- One row per photo. replaced_at is null for the photo currently on the site; older
-- versions stay so "Undo to previous" can bring them back.
create table public.media (
  id uuid primary key default gen_random_uuid(),
  folder text not null check (folder ~ '^[a-z-]{2,40}$'),
  project_id uuid references public.projects (id) on delete cascade,
  position smallint not null default 0 check (position between 0 and 99),
  path text not null check (char_length(path) <= 300),
  alt text not null default '' check (char_length(alt) <= 200),
  caption text check (char_length(caption) <= 60),
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  replaced_at timestamptz
);
create index media_live_idx on public.media (folder, project_id, position) where replaced_at is null;

create table public.media_events (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  action text not null,
  actor text not null
);

alter table public.projects enable row level security;
alter table public.media enable row level security;
alter table public.media_events enable row level security;
revoke all on public.projects, public.media, public.media_events from anon, authenticated;

-- Public bucket: these are the photos shown on the website. Only the server can hand out
-- upload passes, and deposit proofs stay in their own private bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- The 8 sample projects, pointing at the photos already in the site.
with p as (
  insert into public.projects (slug, title, pillars, kind, client, year, location, role, orientation, story, quote_text, quote_name, video_url, runtime, featured, position)
  values ('amara-and-tobi', 'Amara and Tobi', array['photo-film', 'booth']::text[], 'Wedding', 'Amara and Tobi Okafor', '2026', 'London, Ontario', array['Film', 'Photography', 'SBD Booth']::text[], 'wide', 'A traditional ceremony in the morning and a reception that ran past midnight. The film follows both families from getting ready to the last song, and the booth kept the dance floor''s energy going in the corner all night.', 'We''ve watched it more times than we can count.', 'Amara', null, '04:12', true, 0)
  returning id
)
insert into public.media (folder, project_id, position, path, alt, width, height)
select 'project-cover', id, 0, '/images/hero-wedding.jpg', 'Guests dancing around the couple under warm string lights', 2400, 1600 from p
union all select 'project-gallery', id, 0, '/images/booth-wedding.jpg', 'The couple laughing with friends at the photobooth', 1600, 2000 from p
union all select 'project-gallery', id, 1, '/images/booth-prints.jpg', 'Photo strips and keychains printed on the night', 1600, 2000 from p;

with p as (
  insert into public.projects (slug, title, pillars, kind, client, year, location, role, orientation, story, quote_text, quote_name, video_url, runtime, featured, position)
  values ('kemi-at-30', 'Kemi at 30', array['photo-film']::text[], 'Birthday', 'Kemi A.', '2026', 'Toronto, Ontario', array['Highlight film']::text[], 'tall', 'An all-white rooftop party at golden hour, recapped in 75 seconds for the group chat.', null, null, null, '01:15', true, 1)
  returning id
)
insert into public.media (folder, project_id, position, path, alt, width, height)
select 'project-cover', id, 0, '/images/rooftop-birthday.jpg', 'Friends in white toasting on a rooftop at sunset', 1600, 2000 from p;

with p as (
  insert into public.projects (slug, title, pillars, kind, client, year, location, role, orientation, story, quote_text, quote_name, video_url, runtime, featured, position)
  values ('glow-studio-launch', 'Glow Studio opening', array['photo-film', 'content']::text[], 'Launch', 'Glow Studio', '2026', 'London, Ontario', array['Event film', 'Reels']::text[], 'wide', 'Opening night for a new beauty studio: the ribbon, the first clients and a room full of people who''d been waiting for it. One event film, plus three reels cut for launch week.', null, null, null, '02:40', true, 2)
  returning id
)
insert into public.media (folder, project_id, position, path, alt, width, height)
select 'project-cover', id, 0, '/images/studio-launch.jpg', 'The owner cutting a gold ribbon as friends cheer', 2400, 1600 from p;

with p as (
  insert into public.projects (slug, title, pillars, kind, client, year, location, role, orientation, story, quote_text, quote_name, video_url, runtime, featured, position)
  values ('braids-by-q', 'Braids by Q', array['content']::text[], 'Personal brand', 'Braids by Q', '2026', 'London, Ontario', array['Brand content', 'Reels']::text[], 'tall', 'A month of content filmed in one afternoon, from the first parting to the finished look.', 'My bookings went up the week I started posting these.', 'Q', null, '00:30', true, 3)
  returning id
)
insert into public.media (folder, project_id, position, path, alt, width, height)
select 'project-cover', id, 0, '/images/braider.jpg', 'Hands braiding hair in warm window light', 1600, 2000 from p;

with p as (
  insert into public.projects (slug, title, pillars, kind, client, year, location, role, orientation, story, quote_text, quote_name, video_url, runtime, featured, position)
  values ('studio-day', 'Studio day', array['content']::text[], 'Behind the scenes', 'Independent editorial', '2026', 'Kitchener, Ontario', array['BTS film']::text[], 'tall', 'The making of a fashion editorial, cut vertical for the photographer''s launch post.', null, null, null, '00:45', true, 4)
  returning id
)
insert into public.media (folder, project_id, position, path, alt, width, height)
select 'project-cover', id, 0, '/images/fashion-bts.jpg', 'A model on set under a softbox with the crew in the foreground', 1600, 2000 from p;

with p as (
  insert into public.projects (slug, title, pillars, kind, client, year, location, role, orientation, story, quote_text, quote_name, video_url, runtime, featured, position)
  values ('sunday-market', 'Sunday market', array['content']::text[], 'Lifestyle reel', 'Personal project', '2026', 'London, Ontario', array['Reel']::text[], 'tall', 'A slow Sunday at the market, shot handheld as a single reel.', null, null, null, '00:38', false, 5)
  returning id
)
insert into public.media (folder, project_id, position, path, alt, width, height)
select 'project-cover', id, 0, '/images/farmers-market.jpg', 'A woman choosing peaches at a farmers market in soft morning light', 1600, 2000 from p;

with p as (
  insert into public.projects (slug, title, pillars, kind, client, year, location, role, orientation, story, quote_text, quote_name, video_url, runtime, featured, position)
  values ('the-adeyemis-25', 'The Adeyemis, 25 years', array['photo-film']::text[], 'Anniversary', 'The Adeyemi family', '2026', 'Mississauga, Ontario', array['Film', 'Photography']::text[], 'wide', 'A silver anniversary with three generations on the dance floor.', null, null, null, '03:05', true, 6)
  returning id
)
insert into public.media (folder, project_id, position, path, alt, width, height)
select 'project-cover', id, 0, '/images/anniversary.jpg', 'Family clapping around the couple on the dance floor', 2400, 1600 from p;

with p as (
  insert into public.projects (slug, title, pillars, kind, client, year, location, role, orientation, story, quote_text, quote_name, video_url, runtime, featured, position)
  values ('booth-nights', 'Booth nights', array['booth']::text[], 'SBD Booth', 'Various events', '2026', 'Southwestern Ontario', array['SBD Booth']::text[], 'tall', 'A season of weddings, birthdays and launches through the booth''s lens.', null, null, null, null, false, 7)
  returning id
)
insert into public.media (folder, project_id, position, path, alt, width, height)
select 'project-cover', id, 0, '/images/booth-setup.jpg', 'The SBD booth set up with a sequin backdrop and balloon garland', 1600, 2000 from p
union all select 'project-gallery', id, 0, '/images/booth-prints.jpg', 'Printed strips and keychains', 1600, 2000 from p
union all select 'project-gallery', id, 1, '/images/booth-wedding.jpg', 'Guests mid-laugh at the booth', 1600, 2000 from p;

