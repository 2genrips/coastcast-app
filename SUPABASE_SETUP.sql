-- CoastCast v1.8 Cloud Sync + Community Beta
-- Run in Supabase Dashboard > SQL Editor for YOUR project.
-- Re-running is safe; policies are replaced where needed.

create table if not exists public.coastcast_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.coastcast_user_data enable row level security;

drop policy if exists "coastcast_select_own" on public.coastcast_user_data;
create policy "coastcast_select_own" on public.coastcast_user_data
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "coastcast_insert_own" on public.coastcast_user_data;
create policy "coastcast_insert_own" on public.coastcast_user_data
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "coastcast_update_own" on public.coastcast_user_data;
create policy "coastcast_update_own" on public.coastcast_user_data
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public CoastCast Community catch posts.
-- IMPORTANT: CoastCast only writes the location precision selected by the angler.
create table if not exists public.community_catches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_catch_id text not null,
  display_name text not null default 'CoastCast Angler',
  species text not null,
  catch_date timestamptz,
  length_in numeric,
  weight_lb numeric,
  bait text,
  caption text,
  location_label text not null default 'Location hidden',
  location_precision text not null default 'hidden' check (location_precision in ('hidden','general','exact')),
  public_lat double precision,
  public_lon double precision,
  coastcast_score integer,
  conditions text,
  photo_data text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, source_catch_id)
);

alter table public.community_catches enable row level security;

drop policy if exists "community_read_public" on public.community_catches;
create policy "community_read_public" on public.community_catches
for select to anon, authenticated using (true);

drop policy if exists "community_insert_own" on public.community_catches;
create policy "community_insert_own" on public.community_catches
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "community_update_own" on public.community_catches;
create policy "community_update_own" on public.community_catches
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "community_delete_own" on public.community_catches;
create policy "community_delete_own" on public.community_catches
for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.community_reactions (
  post_id uuid not null references public.community_catches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null default 'like' check (reaction in ('like')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.community_reactions enable row level security;

drop policy if exists "community_reactions_read" on public.community_reactions;
create policy "community_reactions_read" on public.community_reactions
for select to anon, authenticated using (true);

drop policy if exists "community_reactions_insert_own" on public.community_reactions;
create policy "community_reactions_insert_own" on public.community_reactions
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "community_reactions_delete_own" on public.community_reactions;
create policy "community_reactions_delete_own" on public.community_reactions
for delete to authenticated using (auth.uid() = user_id);

create index if not exists community_catches_created_idx on public.community_catches(created_at desc);
create index if not exists community_catches_species_idx on public.community_catches(species);
