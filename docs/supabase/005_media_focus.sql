-- Focus point for each photo: the spot that must stay visible when a frame crops it.
-- Percent from the left (x) and from the top (y). Empty means the site default
-- (centred left to right, a quarter of the way down), which keeps faces in tall photos.
alter table public.media
  add column if not exists focus_x smallint check (focus_x between 0 and 100),
  add column if not exists focus_y smallint check (focus_y between 0 and 100);
