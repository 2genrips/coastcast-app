# CastVector Google Play billing backend

Production Edge Function: `verify-play-subscription`

## App identity

- Android package: `com.castvector.fishing`
- Premium subscription product ID: `castvector_premium_monthly`
- Planned US price: $4.99/month

## Google Play service account

The verifier requires a Google Cloud service account with access to the Google Play Developer API.

Google Play permissions required for Billing API access:

- View financial data, orders, and cancellation survey responses
- Manage orders and subscriptions

The Google Play Developer API must be enabled for the Google Cloud project.

## Supabase production secret

Store the complete downloaded service-account JSON as:

`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

Do not place that JSON, its private key, or any service-role/secret API key in GitHub, the Android build, GitHub Pages, or client JavaScript.

The deployed function also supports optional server-only overrides:

- `CASTVECTOR_PACKAGE_NAME` (defaults to `com.castvector.fishing`)
- `CASTVECTOR_PLAY_PRODUCT_ID` (defaults to `castvector_premium_monthly`)

## Verification behavior

The backend:

1. Requires an authenticated CastVector user.
2. Verifies the purchase token with Google Play `purchases.subscriptionsv2.get`.
3. Rejects a token already linked to another CastVector account.
4. Stores only a SHA-256 hash of the token in the database.
5. Stores a sanitized purchase summary rather than Google profile details.
6. Grants `source=play` Premium only for a currently entitled subscription.
7. Treats active grace-period access as Premium.
8. Keeps canceled-but-not-expired access through the paid expiry time.
9. Expires Play entitlement when the verified subscription no longer grants access.
10. Acknowledges a valid new subscription when Google reports acknowledgement pending.

## Testing before production

Use a Google Play license tester / test subscription and confirm:

- purchase completes in Play Billing
- CastVector shows server-verified Premium
- Owner Console shows PLAY / ACTIVE
- `coastcast_play_purchases` contains one verified test purchase
- Restore purchase re-verifies correctly
- an expired/canceled test eventually removes paid access according to Google state
