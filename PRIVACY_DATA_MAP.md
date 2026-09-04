# AnglerSignal production privacy/data map

Use this when completing Google Play Data Safety and Apple App Privacy. Re-check against the final native build and any SDKs added later.

| Data | Why AnglerSignal uses it | Linked to account? | Public by default? |
|---|---|---|---|
| Email/account ID | sign-in, entitlement, family access | Yes | No |
| Current/destination location | forecast, tides, nearby places | Can be | No |
| Saved fishing coordinates | waypoints, catches, trips | Yes if cloud synced | No |
| Catch photos/notes | logbook, analytics, optional community | Yes if cloud synced | No |
| Community posts | sharing chosen by user | Yes | Only when user publishes |
| Purchase status/token-derived record | Premium verification | Yes | No |
| Push subscription/device endpoint | background alerts | Yes | No |
| Fishing preferences/app settings | personalization | Yes if cloud synced | No |

Third-party/public data services can receive request context such as coordinates when AnglerSignal asks for location-specific conditions or places. Final privacy disclosures must include every production SDK/provider.
