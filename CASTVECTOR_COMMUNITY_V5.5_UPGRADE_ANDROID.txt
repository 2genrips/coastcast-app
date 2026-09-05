-- CastVector v5.5 — Community Pro Upgrade
-- Run this in the SAME Supabase project where Community Live v5.4 already works.
-- Safe to re-run.

-- Add pinned-message and last-active support.
alter table public.castvector_chat_messages
  add column if not exists is_pinned boolean not null default false;

create index if not exists castvector_chat_messages_pinned_idx
  on public.castvector_chat_messages(channel, is_pinned, created_at desc)
  where is_pinned = true and is_removed = false;

alter table public.castvector_chat_profiles
  add column if not exists last_seen_at timestamptz;

-- Only CastVector staff can pin/unpin. Pinning one message automatically unpins the old one in that channel.
create or replace function public.castvector_chat_pin_message(
  p_message_id uuid,
  p_pin boolean default true
)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_channel text;
  target_user uuid;
begin
  if not public.castvector_chat_is_admin() then
    raise exception 'Admin access required';
  end if;

  select channel, user_id into target_channel, target_user
  from public.castvector_chat_messages
  where id = p_message_id and is_removed = false;

  if target_channel is null then return false; end if;

  if coalesce(p_pin, true) then
    update public.castvector_chat_messages
      set is_pinned = false
      where channel = target_channel and is_pinned = true;
    update public.castvector_chat_messages
      set is_pinned = true
      where id = p_message_id;
    insert into public.castvector_chat_moderation_log(actor_user_id, action, target_user_id, message_id, reason)
      values(auth.uid(), 'pin_message', target_user, p_message_id, 'Pinned by CastVector staff');
  else
    update public.castvector_chat_messages
      set is_pinned = false
      where id = p_message_id;
    insert into public.castvector_chat_moderation_log(actor_user_id, action, target_user_id, message_id, reason)
      values(auth.uid(), 'unpin_message', target_user, p_message_id, 'Unpinned by CastVector staff');
  end if;

  return true;
end;
$$;
grant execute on function public.castvector_chat_pin_message(uuid,boolean) to authenticated;

-- Owner moderation report queue. Returns only the fields the owner needs to review a report.
create or replace function public.castvector_chat_admin_reports()
returns table (
  id uuid,
  reporter_user_id uuid,
  message_id uuid,
  reported_user_id uuid,
  reported_display_name text,
  message_body text,
  channel text,
  details text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.castvector_chat_is_admin() then
    raise exception 'Admin access required';
  end if;

  return query
  select
    r.id,
    r.reporter_user_id,
    r.message_id,
    r.reported_user_id,
    coalesce(m.display_name, p.display_name, 'Angler') as reported_display_name,
    m.body as message_body,
    m.channel,
    r.details,
    r.status,
    r.created_at
  from public.castvector_chat_reports r
  left join public.castvector_chat_messages m on m.id = r.message_id
  left join public.castvector_chat_profiles p on p.user_id = r.reported_user_id
  where r.status in ('open','reviewed')
  order by r.created_at desc
  limit 100;
end;
$$;
grant execute on function public.castvector_chat_admin_reports() to authenticated;

-- Owner list of currently active posting restrictions.
create or replace function public.castvector_chat_admin_bans()
returns table (
  user_id uuid,
  display_name text,
  reason text,
  banned_until timestamptz,
  updated_at timestamptz,
  last_seen_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.castvector_chat_is_admin() then
    raise exception 'Admin access required';
  end if;

  return query
  select
    b.user_id,
    coalesce(p.display_name, 'Angler-' || upper(left(replace(b.user_id::text, '-', ''), 5))) as display_name,
    b.reason,
    b.banned_until,
    b.updated_at,
    p.last_seen_at
  from public.castvector_chat_bans b
  left join public.castvector_chat_profiles p on p.user_id = b.user_id
  where b.banned_until is null or b.banned_until > now()
  order by b.updated_at desc;
end;
$$;
grant execute on function public.castvector_chat_admin_bans() to authenticated;

-- Owner can resolve or dismiss reports from the in-app moderation queue.
create or replace function public.castvector_chat_resolve_report(
  p_report_id uuid,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  resolved_status text := lower(trim(coalesce(p_status,'')));
  target_user uuid;
  target_message uuid;
begin
  if not public.castvector_chat_is_admin() then
    raise exception 'Admin access required';
  end if;

  if resolved_status not in ('reviewed','actioned','dismissed') then
    raise exception 'Invalid report status';
  end if;

  select reported_user_id, message_id into target_user, target_message
  from public.castvector_chat_reports
  where id = p_report_id;

  if target_user is null then return false; end if;

  update public.castvector_chat_reports
    set status = resolved_status
    where id = p_report_id;

  insert into public.castvector_chat_moderation_log(actor_user_id, action, target_user_id, message_id, reason)
    values(auth.uid(), 'resolve_report', target_user, target_message, resolved_status);

  return true;
end;
$$;
grant execute on function public.castvector_chat_resolve_report(uuid,text) to authenticated;

-- Keep pinned state locked down by the existing message policies/triggers.
-- Normal signed-in users can read the is_pinned flag but cannot update messages.

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

-- CastVector v5.5 Community Pro upgrade complete.
