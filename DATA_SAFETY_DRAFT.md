# Google Play Data safety draft — verify before submission

This is a worksheet, not a final legal answer. Re-check it against the exact production build and every third-party SDK.

Likely data types used by CastVector:

## Account information
- Email address: collected for Supabase sign-in/account management.
- Public nickname/profile name: user-provided.

## Location
- Approximate and/or precise location: optional, used to find fishing conditions and nearby resources.
- Users can also enter/select a location manually.

## User-generated content
- Catch notes/logbook entries.
- Photos if the user chooses to attach them.
- Saved fishing locations/waypoints.
- Community Live messages, replies and reports.

## Purchases
- Subscription entitlement and Google Play purchase-token related information.
- Actual payment-card details are handled by Google Play and are not collected by CastVector.

## App activity/preferences
- Saved settings, target species, trips, favorites and other app preferences.
- Push-subscription/device token data if background notifications are enabled later.

## Sharing
Community messages are shared with other Community Live users.
Private catches and exact private waypoints should not be publicly shared by default.

## Security / deletion
- Supabase authentication and row-level security are used for protected account data.
- Account deletion is available in the app and through the public deletion page.

Before submitting:
- verify whether analytics/crash SDKs have been added
- verify whether precise or approximate location is transmitted to each forecast/place provider
- verify photo storage behavior
- verify push-notification provider behavior
- answer Play Console from observed production behavior, not from this draft
