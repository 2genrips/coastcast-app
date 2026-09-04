# CastVector v5.3 — Google Play Premium setup

Target subscription: **CastVector Premium — $4.99/month**.

The CastVector app/backend foundation treats payment and access as separate concepts. Google Play is one way to create a Premium entitlement; Family, Complimentary, Lifetime and Promo grants resolve through the same server-side access check.

## Production flow
1. Create the Android app in Google Play Console.
2. Create the monthly subscription product (recommended internal ID: `castvector_premium_monthly`).
3. Android purchase flow returns a purchase token.
4. The Android wrapper sends the token to the trusted CastVector backend.
5. Backend verifies the token with Google Play Developer API `purchases.subscriptionsv2.get`.
6. Backend grants/updates `source=play` in `coastcast_entitlements`.
7. CastVector calls `coastcast_my_access()` and unlocks Premium.
8. Renewals/cancellations/refunds should later be kept in sync using Google Play Real-time Developer Notifications.

Never place a Google service-account private key or Supabase secret/service-role key in the GitHub Pages frontend.

The included SQL creates `coastcast_play_purchases` as a backend-only ledger. Purchase verification is intentionally not faked in the browser build.


## CastVector v5.3 rename note
The public app name is now **CastVector Fishing Forecast** and the planned native package ID is `com.castvector.fishing`. The existing Supabase entitlement schema keeps its historical `coastcast_*` identifiers for compatibility. Create the store subscription with the new public product ID `castvector_premium_monthly` before launch.
