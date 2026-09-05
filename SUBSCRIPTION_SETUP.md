# Google Play subscription setup — CastVector v5.6

Create:
- Product ID: `castvector_premium_monthly`
- Product type: Subscription
- Base plan ID suggestion: `monthly`
- Auto-renewing: Yes
- U.S. target price: $4.99/month

Google Play displays the authoritative localized price and renewal terms.

## Entitlement mapping
- Google Play verified active/grace subscription -> Paid Premium
- Family Crew -> Family Premium
- Owner-granted -> Complimentary / Lifetime / Promo / Beta Premium

Only the Android Play build launches Google Play Billing for paid access.
Never grant paid Premium from local browser storage.

## Required server flow
1. User signs in to CastVector.
2. Native Google Play checkout returns a purchase token.
3. CastVector sends the token to `verify-play-subscription`.
4. The backend calls `purchases.subscriptionsv2.get`.
5. Only an entitled subscription state grants Paid Premium.
6. The initial purchase is acknowledged from the backend when needed.
7. CastVector refreshes server access.

Deploy the v5.6 Edge Function before billing tests.
