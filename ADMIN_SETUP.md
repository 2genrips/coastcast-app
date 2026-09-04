# CastVector Owner/Admin setup — Android friendly

v5.3 can use real server-side entitlements once Supabase is configured.

1. In Supabase, run `SUPABASE_SETUP.sql` if you have not already.
2. Run `CASTVECTOR_LAUNCH_BACKEND.sql` in SQL Editor.
3. In CastVector, sign up/sign in under **Profile → CastVector Account**.
4. In Supabase Dashboard → Authentication → Users, copy your CastVector account UUID.
5. In SQL Editor run:

```sql
insert into public.coastcast_admins(user_id,role)
values ('PASTE-YOUR-USER-UUID-HERE','owner')
on conflict(user_id) do update set role='owner';
```

6. Reopen CastVector and tap **Refresh server access**.

The **Owner Console** will then appear on your Profile screen. It can grant selected existing CastVector accounts Complimentary, Lifetime or Promo Premium, or revoke a grant.

Direct entitlement writes have no normal client policies. The browser calls security-definer RPC functions that first verify the signed-in account exists in `coastcast_admins`.
