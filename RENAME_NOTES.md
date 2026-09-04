# CastVector public brand migration

CastVector is the public product name beginning with v5.3.

## Preserved intentionally
The existing Supabase database objects, RPC names, local-storage migration keys, and `window.COASTCAST_CONFIG` configuration object retain their historical `coastcast_*` identifiers. These are private implementation details and are intentionally preserved so existing accounts, Owner access, Complimentary Premium, Family data, catches, trips, and cloud backups keep working.

## Public identity
- App: **CastVector Fishing Forecast**
- Brand: **CASTVECTOR**
- Tagline: **Plan Smarter. Fish Better.**
- Future Android/iOS package ID: `com.castvector.fishing`
- Future Premium product ID: `castvector_premium_monthly`

Do not rename the existing Supabase tables/functions unless a later database migration explicitly does so.
