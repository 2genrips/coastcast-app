# CastVector v5.3 — Account + Cloud Sync

CastVector still works locally without Supabase. v5.3 upgrades Supabase from optional backup/community storage into the foundation for real signed-in accounts and server-verified access.

## Android setup order
1. Open your Supabase project in Chrome.
2. Run `SUPABASE_SETUP.sql` in SQL Editor.
3. Run `CASTVECTOR_LAUNCH_BACKEND.sql` in SQL Editor.
4. In CastVector open **Profile → CastVector Account** and sign up/sign in.
5. For easier public deployment, put your public project URL and publishable key in `coastcast-config.js` so normal users never have to enter them.
6. Follow `ADMIN_SETUP.md` once to mark your own account as CastVector owner.
7. Tap **Refresh server access**.

## What syncs
Private app data can still sync through `coastcast_user_data`: catches, favorites, trips, preferences, alert rules and other CastVector state.

## What does NOT sync through the normal backup record
Premium entitlements are deliberately excluded from user-editable CastVector backup data. Paid, family, complimentary, lifetime and promo access come from server tables/functions.

## Public browser configuration
The Supabase **publishable** key can be used in the browser with Row Level Security enabled. Never publish a secret/service-role key.

## Community privacy
Community publishing remains opt-in. Private catches and exact private locations are not automatically shared.
