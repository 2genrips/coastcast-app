# CoastCast v5.0 launch setup order

You do not have to activate all of this immediately. Uploading v5.0 to GitHub Pages first will keep the fishing app working.

## Phase 1 — Install v5.0 app
Upload the v5.0 files to the existing CoastCast GitHub repository and commit to `main`.

## Phase 2 — Turn on real accounts
1. Create/open Supabase.
2. Run `SUPABASE_SETUP.sql`.
3. Run `COASTCAST_LAUNCH_BACKEND.sql`.
4. Add the public Supabase URL and publishable key to `coastcast-config.js`.
5. Create your CoastCast account.
6. Make yourself owner using `ADMIN_SETUP.md`.

## Phase 3 — Test access types
Use Owner Console to grant a second test account:
- Complimentary Premium
- Lifetime Premium
- Promo Premium

Then test Family Crew with another account.

## Phase 4 — Google Play
Follow `GOOGLE_PLAY_SETUP.md` and `EDGE_FUNCTIONS_SETUP.md` after the Android package exists in Play Console.

## Phase 5 — Closed-app alerts
Follow `BACKGROUND_ALERTS_SETUP.md` after accounts and entitlements are stable.
