# CoastCast v0.6 — Android / GitHub Pages Update

You already have CoastCast hosted. This ZIP updates the same app.

1. Download `coastcast_v0.6_premium_live.zip`.
2. Extract it with Android My Files.
3. Open your existing CoastCast GitHub repository.
4. Choose **Add file → Upload files**.
5. Upload the files **inside** the extracted `coastcast_v0.6` folder.
6. Replace files with the same names and commit to `main`.
7. Wait for GitHub Pages to deploy.
8. Open your existing CoastCast URL.
9. If the old version remains, close the installed PWA, open the site in Chrome, refresh once, then reopen CoastCast.

## Testing Live Data
On Home, tap **Use live data** or the refresh icon. The main badge no longer says Live just because live mode is enabled. It will report the actual state:
- **Live forecast** — Weather + Marine + NOAA tides all confirmed.
- **Partial live** — at least one core live feed confirmed; missing data uses fallback.
- **Demo fallback** — live mode is enabled, but core feeds failed to confirm.
- **Updating live data** — requests are in progress.

For Holden Beach, v0.6 has a nearby NOAA station seed for Bowen Point / Shallotte Inlet to make tide lookup more reliable.
