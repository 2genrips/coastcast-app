# CoastCast Premium — v5.0 production architecture

Target price: **$4.99/month** for CoastCast Premium.

## Effective access types
- `free` — core CoastCast.
- `play` — paid Google Play Premium.
- `family` — Premium inherited from an active Premium family owner; no second subscription.
- `complimentary` — owner/admin granted Premium, expiring or non-expiring.
- `lifetime` — owner/admin granted permanent Premium.
- `promo` — time-limited promotional Premium.
- `beta` — tester/development grant.

The client asks one question: **does this signed-in account have effective Premium access?** It does not infer payment from local browser state.

## Security boundary
- Browser uses only a Supabase publishable key + authenticated user token.
- Direct entitlement tables have no normal client write policies.
- Admin/family mutations use security-definer RPC functions that validate the signed-in account.
- Google Play purchase verification happens in a trusted Edge Function/backend.
- Google/Supabase secret keys never ship in the browser.

## Owner-controlled free Premium
The Owner Console can grant selected existing accounts:
- Complimentary Premium
- Lifetime Premium
- Promotional Premium
- Beta/tester Premium

Each grant can carry a private note and optional expiration, and can be revoked.

## Family Premium
Family access is derived from the owner's active direct Premium entitlement. Family members do not buy another subscription. Before launch, choose the final family-seat limit and add invitation email delivery.
