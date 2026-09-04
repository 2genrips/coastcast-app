# CoastCast v1.0 Beta — Android / GitHub Pages

1. Extract this ZIP on your Android phone.
2. Open your existing CoastCast GitHub repository.
3. Upload **all files and the branding folder from inside this folder** into the repository root.
4. Replace matching files and commit to `main`.
5. Wait for GitHub Pages to redeploy.
6. Fully close CoastCast and reopen it. If the old build remains, open the GitHub Pages URL in Chrome and refresh once.

## What to test

- Home → Quick actions → **Alert**.
- Create a forecast watch for the current location and target species.
- Trips → confirm the alert appears under Smart Alerts.
- Build a Smart Trip and confirm it appears in **Saved Trips**.
- Save the current fishing location and confirm it appears under **Favorites**.
- Tap Analyze on a favorite to reload the forecast for that spot.
- Optional: enable device notification permission. CoastCast v1.0 checks rules when the app opens or live data refreshes; it does not yet have a server-powered background push service.

Existing v0.9 catches, favorites, settings and trip plans are migrated locally.
