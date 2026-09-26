-- CastVector launch hardening
-- Applied to production on 2026-09-25.
-- Safe to use after the main CastVector backend + Community Live setup.

create table if not exists public.castvector_account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'pending'
    check (status in ('pending','verified','completed','rejected','canceled')),
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verified_at timestamptz,
  completed_at timestamptz,
  note text
);
alter table public.castvector_account_deletion_requests enable row level security;
create index if not exists castvector_account_deletion_requests_email_idx
  on public.castvector_account_deletion_requests (lower(email), requested_at desc);
comment on table public.castvector_account_deletion_requests is
  'Backend-only queue for public CastVector account deletion requests. No client RLS policies by design.';

-- Remove default PUBLIC/anonymous EXECUTE from SECURITY DEFINER RPCs.
revoke execute on function public.castvector_chat_admin_bans() from public, anon;
revoke execute on function public.castvector_chat_admin_reports() from public, anon;
revoke execute on function public.castvector_chat_ban_user(uuid,integer,text) from public, anon;
revoke execute on function public.castvector_chat_before_insert() from public, anon, authenticated;
revoke execute on function public.castvector_chat_is_admin() from public, anon;
revoke execute on function public.castvector_chat_pin_message(uuid,boolean) from public, anon;
revoke execute on function public.castvector_chat_remove_message(uuid,text) from public, anon;
revoke execute on function public.castvector_chat_resolve_report(uuid,text) from public, anon;
revoke execute on function public.castvector_chat_unban_user(uuid) from public, anon;

revoke execute on function public.coastcast_admin_grant_access(text,text,timestamptz,text) from public, anon;
revoke execute on function public.coastcast_admin_list_access(integer) from public, anon;
revoke execute on function public.coastcast_admin_revoke_access(text,text) from public, anon;
revoke execute on function public.coastcast_family_accept() from public, anon;
revoke execute on function public.coastcast_family_invite(text) from public, anon;
revoke execute on function public.coastcast_family_list() from public, anon;
revoke execute on function public.coastcast_family_remove(bigint) from public, anon;
revoke execute on function public.coastcast_is_admin() from public, anon;
revoke execute on function public.coastcast_my_access() from public, anon;

revoke execute on function public.coastcast_direct_entitlement_valid(public.coastcast_entitlements)
  from public, anon, authenticated;
alter function public.coastcast_direct_entitlement_valid(public.coastcast_entitlements)
  set search_path = public, auth;

-- Signed-in CastVector users intentionally call these RPCs.
grant execute on function public.castvector_chat_admin_bans() to authenticated;
grant execute on function public.castvector_chat_admin_reports() to authenticated;
grant execute on function public.castvector_chat_ban_user(uuid,integer,text) to authenticated;
grant execute on function public.castvector_chat_is_admin() to authenticated;
grant execute on function public.castvector_chat_pin_message(uuid,boolean) to authenticated;
grant execute on function public.castvector_chat_remove_message(uuid,text) to authenticated;
grant execute on function public.castvector_chat_resolve_report(uuid,text) to authenticated;
grant execute on function public.castvector_chat_unban_user(uuid) to authenticated;

grant execute on function public.coastcast_admin_grant_access(text,text,timestamptz,text) to authenticated;
grant execute on function public.coastcast_admin_list_access(integer) to authenticated;
grant execute on function public.coastcast_admin_revoke_access(text,text) to authenticated;
grant execute on function public.coastcast_family_accept() to authenticated;
grant execute on function public.coastcast_family_invite(text) to authenticated;
grant execute on function public.coastcast_family_list() to authenticated;
grant execute on function public.coastcast_family_remove(bigint) to authenticated;
grant execute on function public.coastcast_is_admin() to authenticated;
grant execute on function public.coastcast_my_access() to authenticated;
