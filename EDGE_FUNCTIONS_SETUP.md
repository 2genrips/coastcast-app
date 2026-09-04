# AnglerSignal v5.0 Edge Functions

## `verify-play-subscription`
A deployable Supabase Edge Function scaffold is included at:

`supabase/functions/verify-play-subscription/index.ts`

It authenticates the AnglerSignal user, verifies a Google Play subscription token with `purchases.subscriptionsv2.get`, checks the expected product, records a hashed purchase-token ledger entry, and writes a `source=play` server entitlement.

### Required Edge Function secrets
- `GOOGLE_PLAY_PACKAGE_NAME`
- `COASTCAST_PREMIUM_PRODUCT_ID` (recommended: `coastcast_premium_monthly`)
- `GOOGLE_SERVICE_ACCOUNT_JSON` (the entire service account JSON as a secret)

Supabase provides its own URL and publishable/secret keys to Edge Functions. Never place the Google service-account JSON or Supabase secret key in GitHub Pages.

### Not yet wired from the PWA
Google Play Billing itself runs in the packaged Android app. Once AnglerSignal is wrapped/published as Android, the native billing layer sends its purchase token to this function, then the web app simply calls `coastcast_my_access()` to see whether Premium is active.

### Renewal/cancellation follow-up
Before public launch, add Google Play Real-time Developer Notifications so renewals, cancellations, grace periods and refunds update entitlements even if the user never reopens AnglerSignal.
