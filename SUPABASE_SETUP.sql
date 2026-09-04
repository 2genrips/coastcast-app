-- CoastCast v1.1 Cloud Sync Beta
-- Run this in Supabase Dashboard > SQL Editor for YOUR project.

create table if not exists public.coastcast_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.coastcast_user_data enable row level security;

drop policy if exists "coastcast_select_own" on public.coastcast_user_data;
create policy "coastcast_select_own" on public.coastcast_user_data
for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "coastcast_insert_own" on public.coastcast_user_data;
create policy "coastcast_insert_own" on public.coastcast_user_data
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "coastcast_update_own" on public.coastcast_user_data;
create policy "coastcast_update_own" on public.coastcast_user_data
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
