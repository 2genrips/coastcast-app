# CoastCast v0.7.1 — Android Hotfix

This hotfix repairs the **Scan Fishing Area** and bait/tackle discovery requests seen as `Places 0 • Search unavailable` on some Android/GitHub Pages installs.

## Install
1. Download `coastcast_v0.7.1_map_search_hotfix.zip`.
2. Extract it on Android.
3. Open your existing CoastCast GitHub repository.
4. Upload every file from inside the extracted folder.
5. Replace matching files and commit to `main`.
6. Wait for GitHub Pages to redeploy.
7. Close CoastCast completely, reopen it, then go to **Map → Scan fishing area**.

No new repository or Pages site is needed. Saved local CoastCast data remains compatible.

## What changed
- Replaced stale public Overpass endpoints.
- Uses current public Overpass servers first.
- Sends map/place queries with POST instead of very long GET URLs, which is more reliable on mobile browsers and proxies.
- Uses the same fix for nearby bait/tackle discovery.
- Removed the old Nominatim POI-search fallback from this path.
- Bumped the PWA cache to v0.7.1 so Android receives the fix.
