# CoastCast Premium architecture

## Target product
- Free tier: useful core fishing answer and basic planning.
- CoastCast Premium: **$4.99/month** target price.
- Family Premium: invited family members receive Premium without a separate subscription.
- Complimentary Premium: CoastCast owner/admin can grant Premium without payment, optionally expiring or lifetime.
- Lifetime Premium: optional owner-granted entitlement for selected people.

## One entitlement check
The client should never ask “did this person pay?” It should ask: **does this account currently have Premium entitlement?**

Valid sources can include:
- `play` — paid Google Play subscription
- `family` — inherited from a paying family owner
- `complimentary` — manually granted by CoastCast admin
- `lifetime` — non-expiring admin grant
- `promo` — time-limited promotion
- `beta` — development/testing only

## Production security
The app must not trust localStorage, hidden buttons, client JavaScript, or a user-editable database row for paid access. Production flow should be:
1. Google Play Billing / approved store completes purchase.
2. A CoastCast backend validates the purchase token.
3. Backend writes/updates the user's entitlement.
4. CoastCast reads the authenticated user's entitlement.
5. Family/complimentary access is written only by trusted backend/admin actions.

## Family model
A Premium owner has a family group. Invited members resolve to `source=family` while the owner entitlement remains active. If owner billing expires, family entitlements should end after any configured grace period. Seat count can be decided before launch.

## Complimentary model
Private admin dashboard should support:
- user/email lookup
- reason/note
- starts_at
- expires_at or lifetime
- revoke immediately
- audit trail / granted_by

## Beta build
CoastCast 3.1 includes a local entitlement **preview** solely to test the UI. Remove/disable this simulator in a release build.
