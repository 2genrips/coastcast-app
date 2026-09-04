# AnglerSignal v5.0 — Google Play Premium setup

Target subscription: **AnglerSignal Premium — $4.99/month**.

The v5.0 app/backend foundation treats payment and access as separate concepts. Google Play is one way to create a Premium entitlement; Family, Complimentary, Lifetime and Promo grants resolve through the same server-side access check.

## Production flow
1. Create the Android app in Google Play Console.
2. Create the monthly subscription product (recommended internal ID: `coastcast_premium_monthly`).
3. Android purchase flow returns a purchase token.
4. The Android wrapper sends the token to the trusted AnglerSignal backend.
5. Backend verifies the token with Google Play Developer API `purchases.subscriptionsv2.get`.
6. Backend grants/updates `source=play` in `coastcast_entitlements`.
7. AnglerSignal calls `coastcast_my_access()` and unlocks Premium.
8. Renewals/cancellations/refunds should later be kept in sync using Google Play Real-time Developer Notifications.

Never place a Google service-account private key or Supabase secret/service-role key in the GitHub Pages frontend.

The included SQL creates `coastcast_play_purchases` as a backend-only ledger. Purchase verification is intentionally not faked in the browser build.


## AnglerSignal v5.2 rename note
The public app name is now **AnglerSignal Fishing Forecast** and the planned native package ID is `com.anglersignal.fishing`. The existing Supabase entitlement schema and legacy `coastcast_premium_monthly` product placeholder are intentionally left compatible until the Play Console product is created.
