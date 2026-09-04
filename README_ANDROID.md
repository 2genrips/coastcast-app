# CoastCast v2.0.2 — Android / GitHub Pages

## Install over your current CoastCast app
1. Extract the ZIP on Android.
2. Open your existing CoastCast GitHub repository.
3. Upload everything inside `coastcast_v2.0.2` to the repository root.
4. Replace matching files and commit to `main`.
5. Wait for GitHub Pages to redeploy.
6. Fully close CoastCast and reopen it. If the old UI remains, open the Pages URL in Chrome and refresh once.

Your existing CoastCast v2.0 data migrates forward.

## First tackle-store accuracy test
1. Select Holden Beach, NC.
2. Turn on Live Data.
3. Open Map and enable the Bait layer.
4. Open Settings and set **Tackle-shop search radius** to 20 miles.
5. Tap **Refresh tackle shops**.

Holden Beach now has a merged verified local fallback catalog, so CoastCast should show multiple real fishing-supply options instead of only a pier or unrelated businesses.

## Optional nationwide Places provider
Open **Settings → Geoapify Places key**.

A Geoapify Places key adds a dedicated nationwide fishing-store POI source using the `commercial.outdoor_and_sport.fishing` category. The key is saved only on this device and is not written to GitHub, backups, or cloud-sync payloads.

For a public GitHub Pages app, restrict the API key to your CoastCast Pages origin in the Geoapify dashboard.

See `PLACES_ACCURACY_SETUP.md` for the simple phone-only setup.
