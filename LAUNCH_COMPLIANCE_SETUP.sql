-- AnglerSignal v5.1 Launch Compliance
-- Run AFTER SUPABASE_SETUP.sql and COASTCAST_LAUNCH_BACKEND.sql.
-- Adds a non-destructive public account-deletion request queue.

create table if not exists public.coastcast_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'requested' check (status in ('requested','verified','completed','rejected')),
  requested_at timestamptz not null default now(),
  verified_at timestamptz,
  completed_at timestamptz,
  note text
);

alter table public.coastcast_deletion_requests enable row level security;
-- No browser policies. Public requests are inserted only by the Edge Function using the service role.

create index if not exists coastcast_deletion_requests_email_idx
on public.coastcast_deletion_requests(lower(email), requested_at desc);

-- Admins can review deletion requests from SQL or a future owner dashboard RPC.
create or replace function public.coastcast_admin_deletion_requests()
returns table(id uuid,email text,status text,requested_at timestamptz,verified_at timestamptz,completed_at timestamptz,note text)
language sql
stable
security definer
set search_path=public,auth
as $$
  select r.id,r.email,r.status,r.requested_at,r.verified_at,r.completed_at,r.note
  from public.coastcast_deletion_requests r
  where public.coastcast_is_admin()
  order by r.requested_at desc
  limit 200;
$$;
grant execute on function public.coastcast_admin_deletion_requests() to authenticated;
