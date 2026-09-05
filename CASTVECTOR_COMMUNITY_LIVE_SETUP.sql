-- CastVector v5.4 — Community Live
-- Real-time fishing chat, online presence support, replies, reports, blocks and moderation hooks.
-- Safe to re-run. Run in the SAME Supabase project already connected to CastVector.

create extension if not exists pgcrypto;

-- ---------- Public chat profiles ----------
create table if not exists public.castvector_chat_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.castvector_chat_profiles enable row level security;
drop policy if exists "chat users read own public profile" on public.castvector_chat_profiles;
create policy "chat users read own public profile" on public.castvector_chat_profiles
for select to authenticated using (auth.uid() = user_id);
drop policy if exists "chat users create own public profile" on public.castvector_chat_profiles;
create policy "chat users create own public profile" on public.castvector_chat_profiles
for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "chat users update own public profile" on public.castvector_chat_profiles;
create policy "chat users update own public profile" on public.castvector_chat_profiles
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.castvector_chat_profiles to authenticated;

-- ---------- Messages ----------
create table if not exists public.castvector_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  author_badge text check (author_badge is null or author_badge in ('STAFF')),
  channel text not null default 'general' check (channel in ('general','tips','conditions','help')),
  body text not null check (char_length(trim(body)) between 1 and 600),
  reply_to uuid references public.castvector_chat_messages(id) on delete set null,
  is_removed boolean not null default false,
  removed_at timestamptz,
  removed_by uuid references auth.users(id) on delete set null,
  moderation_reason text,
  created_at timestamptz not null default now()
);
create index if not exists castvector_chat_messages_channel_created_idx
  on public.castvector_chat_messages(channel, created_at desc);
create index if not exists castvector_chat_messages_user_created_idx
  on public.castvector_chat_messages(user_id, created_at desc);
alter table public.castvector_chat_messages replica identity full;
alter table public.castvector_chat_messages enable row level security;

drop policy if exists "signed in users read active chat" on public.castvector_chat_messages;
create policy "signed in users read active chat" on public.castvector_chat_messages
for select to authenticated using (is_removed = false);

drop policy if exists "signed in users send own chat" on public.castvector_chat_messages;
create policy "signed in users send own chat" on public.castvector_chat_messages
for insert to authenticated with check (auth.uid() = user_id and is_removed = false);

drop policy if exists "users delete own chat" on public.castvector_chat_messages;
create policy "users delete own chat" on public.castvector_chat_messages
for delete to authenticated using (auth.uid() = user_id);

grant select, insert, delete on public.castvector_chat_messages to authenticated;

-- ---------- User reports ----------
create table if not exists public.castvector_chat_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  message_id uuid not null references public.castvector_chat_messages(id) on delete cascade,
  reported_user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null default 'user_report',
  details text check (details is null or char_length(details) <= 300),
  status text not null default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at timestamptz not null default now(),
  unique(reporter_user_id, message_id)
);
create index if not exists castvector_chat_reports_status_idx on public.castvector_chat_reports(status, created_at desc);
alter table public.castvector_chat_reports enable row level security;

drop policy if exists "users submit own chat reports" on public.castvector_chat_reports;
create policy "users submit own chat reports" on public.castvector_chat_reports
for insert to authenticated with check (auth.uid() = reporter_user_id and auth.uid() <> reported_user_id);

drop policy if exists "users read own chat reports" on public.castvector_chat_reports;
create policy "users read own chat reports" on public.castvector_chat_reports
for select to authenticated using (auth.uid() = reporter_user_id);

grant select, insert on public.castvector_chat_reports to authenticated;

-- ---------- Personal block list ----------
create table if not exists public.castvector_chat_blocks (
  blocker_user_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  blocked_display_name text,
  created_at timestamptz not null default now(),
  primary key (blocker_user_id, blocked_user_id),
  check (blocker_user_id <> blocked_user_id)
);
alter table public.castvector_chat_blocks enable row level security;
drop policy if exists "users manage own chat blocks" on public.castvector_chat_blocks;
create policy "users manage own chat blocks" on public.castvector_chat_blocks
for all to authenticated using (auth.uid() = blocker_user_id) with check (auth.uid() = blocker_user_id);
grant select, insert, update, delete on public.castvector_chat_blocks to authenticated;

-- ---------- Server-side moderation bans ----------
create table if not exists public.castvector_chat_bans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reason text,
  banned_until timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.castvector_chat_bans enable row level security;
-- No direct regular-user access. Admin functions below manage this table.

create table if not exists public.castvector_chat_moderation_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  message_id uuid references public.castvector_chat_messages(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);
alter table public.castvector_chat_moderation_log enable row level security;

-- ---------- Admin helper ----------
create or replace function public.castvector_chat_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists(select 1 from public.coastcast_admins a where a.user_id = auth.uid());
$$;
grant execute on function public.castvector_chat_is_admin() to authenticated;

-- Admins can inspect reports and moderation logs.
drop policy if exists "chat admins read reports" on public.castvector_chat_reports;
create policy "chat admins read reports" on public.castvector_chat_reports
for select to authenticated using (public.castvector_chat_is_admin());
drop policy if exists "chat admins update reports" on public.castvector_chat_reports;
create policy "chat admins update reports" on public.castvector_chat_reports
for update to authenticated using (public.castvector_chat_is_admin()) with check (public.castvector_chat_is_admin());
grant update on public.castvector_chat_reports to authenticated;

drop policy if exists "chat admins read moderation log" on public.castvector_chat_moderation_log;
create policy "chat admins read moderation log" on public.castvector_chat_moderation_log
for select to authenticated using (public.castvector_chat_is_admin());
grant select on public.castvector_chat_moderation_log to authenticated;

-- ---------- Message guard ----------
-- Enforces signed-in ownership, server-derived public name, staff badge, basic rate limiting and bans.
create or replace function public.castvector_chat_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
  public_name text;
  active_ban boolean := false;
begin
  if uid is null or new.user_id <> uid then
    raise exception 'Authentication required';
  end if;

  new.body := trim(new.body);
  if char_length(new.body) < 1 or char_length(new.body) > 600 then
    raise exception 'Message must be 1 to 600 characters';
  end if;

  select display_name into public_name
  from public.castvector_chat_profiles
  where user_id = uid;

  if public_name is null then
    public_name := 'Angler-' || upper(left(replace(uid::text, '-', ''), 5));
    insert into public.castvector_chat_profiles(user_id, display_name)
    values(uid, public_name)
    on conflict(user_id) do nothing;
  end if;

  select exists(
    select 1 from public.castvector_chat_bans b
    where b.user_id = uid and (b.banned_until is null or b.banned_until > now())
  ) into active_ban;
  if active_ban then
    raise exception 'Chat access is temporarily restricted';
  end if;

  if exists(
    select 1 from public.castvector_chat_messages m
    where m.user_id = uid and m.created_at > now() - interval '3 seconds'
  ) then
    raise exception 'Slow down before sending another message';
  end if;

  new.display_name := public_name;
  new.author_badge := case when exists(select 1 from public.coastcast_admins a where a.user_id = uid) then 'STAFF' else null end;
  new.is_removed := false;
  new.removed_at := null;
  new.removed_by := null;
  new.moderation_reason := null;
  return new;
end;
$$;

drop trigger if exists castvector_chat_message_guard on public.castvector_chat_messages;
create trigger castvector_chat_message_guard
before insert on public.castvector_chat_messages
for each row execute function public.castvector_chat_before_insert();

-- ---------- Owner/admin moderation RPCs ----------
create or replace function public.castvector_chat_remove_message(p_message_id uuid, p_reason text default 'Removed by moderation')
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_user uuid;
begin
  if not public.castvector_chat_is_admin() then raise exception 'Admin access required'; end if;
  select user_id into target_user from public.castvector_chat_messages where id = p_message_id;
  if target_user is null then return false; end if;
  update public.castvector_chat_messages
  set is_removed = true, removed_at = now(), removed_by = auth.uid(), moderation_reason = left(coalesce(p_reason,''),200)
  where id = p_message_id;
  insert into public.castvector_chat_moderation_log(actor_user_id,action,target_user_id,message_id,reason)
  values(auth.uid(),'remove_message',target_user,p_message_id,left(coalesce(p_reason,''),200));
  return true;
end;
$$;
grant execute on function public.castvector_chat_remove_message(uuid,text) to authenticated;

create or replace function public.castvector_chat_ban_user(p_user_id uuid, p_minutes integer default 1440, p_reason text default 'Chat policy violation')
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  until_time timestamptz;
begin
  if not public.castvector_chat_is_admin() then raise exception 'Admin access required'; end if;
  if p_user_id = auth.uid() then raise exception 'Cannot ban your own admin account'; end if;
  until_time := case when coalesce(p_minutes,0) <= 0 then null else now() + make_interval(mins => least(p_minutes,525600)) end;
  insert into public.castvector_chat_bans(user_id,reason,banned_until,created_by,updated_at)
  values(p_user_id,left(coalesce(p_reason,''),200),until_time,auth.uid(),now())
  on conflict(user_id) do update set reason=excluded.reason,banned_until=excluded.banned_until,created_by=excluded.created_by,updated_at=now();
  insert into public.castvector_chat_moderation_log(actor_user_id,action,target_user_id,reason)
  values(auth.uid(),'ban_user',p_user_id,left(coalesce(p_reason,''),200));
  return true;
end;
$$;
grant execute on function public.castvector_chat_ban_user(uuid,integer,text) to authenticated;

create or replace function public.castvector_chat_unban_user(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.castvector_chat_is_admin() then raise exception 'Admin access required'; end if;
  delete from public.castvector_chat_bans where user_id = p_user_id;
  insert into public.castvector_chat_moderation_log(actor_user_id,action,target_user_id,reason)
  values(auth.uid(),'unban_user',p_user_id,'Admin removed chat restriction');
  return true;
end;
$$;
grant execute on function public.castvector_chat_unban_user(uuid) to authenticated;

-- ---------- Realtime database changes ----------
-- Presence is realtime-only and is not stored. This publication enables instant message inserts/removals.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'castvector_chat_messages'
  ) then
    alter publication supabase_realtime add table public.castvector_chat_messages;
  end if;
end $$;

-- Finished. Community Live is now ready for signed-in CastVector accounts.
