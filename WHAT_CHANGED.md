# AnglerSignal 5.0 — Launch Infrastructure

## Real account/access foundation
- AnglerSignal Account card on Profile.
- Server access refresh and status.
- Effective Premium check from `coastcast_my_access()` when backend is installed.
- Free / Paid / Family / Complimentary / Lifetime / Promo access resolve through one entitlement model.
- Local Premium preview remains only as a development fallback when server access is not active.

## Family Premium
- Real server Family Crew invite/link RPCs.
- Family members can accept a pending invite after sign-in.
- Effective Family Premium is derived server-side from the owner's active direct Premium entitlement.
- Private catches and exact private waypoints remain excluded from automatic sharing.

## Owner Console
- Hidden unless the signed-in account is a AnglerSignal admin.
- Grant Complimentary, Lifetime, Promo or Beta Premium to an existing AnglerSignal account.
- Optional expiration for grants.
- Revoke direct Premium.
- View recent account access rows.
- Entitlement audit trail in the database.

## Google Play foundation
- Backend-only Play purchase ledger.
- Included `verify-play-subscription` Supabase Edge Function scaffold.
- Verifies subscription tokens against Google Play Developer API before writing `source=play` Premium.
- No Google secrets are placed in the PWA.

## Background-alert foundation
- Push subscription database table.
- Existing service worker remains push-ready.
- Production still needs VAPID secrets and scheduled alert evaluation/deployment.

## Android/PWA
- New v5 cache namespace.
- Versioned v5 icon assets.
- Local state migrates from v4.0.
