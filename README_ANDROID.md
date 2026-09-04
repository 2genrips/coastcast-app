# CoastCast v0.3 — Android / GitHub Pages Guide

This folder is ready to upload directly to the ROOT of your existing CoastCast GitHub repository.

## Update your existing app from Android

1. Download and extract the CoastCast v0.3 ZIP.
2. Open your CoastCast repository on github.com in Chrome.
3. If needed, use Chrome > menu > Desktop site.
4. Upload the files from this folder to the repository root.
5. Replace the existing files when GitHub asks about duplicate names.
6. Commit the changes to the `main` branch.
7. GitHub Pages will deploy the new version automatically.
8. Open your normal CoastCast Pages URL and refresh.
9. If the installed PWA still shows an old version, close it fully and reopen it. The new service worker uses a new cache version.

## Main files

- `index.html` — all app screens and dialogs
- `styles.css` — professional mobile UI
- `app.js` — CoastCast state, scoring, live-data connections, map, shops, catches and trip planner
- `manifest.webmanifest` — Android/PWA install metadata
- `sw.js` — offline cache for the app shell
- `icon-192.png`, `icon-512.png`, `icon.svg` — app icons

## Live Data

Turn on **Live data** from the home screen or Settings.

The prototype attempts to use:
- Open-Meteo weather forecast
- Open-Meteo marine forecast
- NOAA CO-OPS tide prediction stations and high/low predictions
- OpenStreetMap Nominatim for location search/reverse geocoding
- OpenStreetMap Overpass for nearby bait/tackle discovery
- Leaflet + OpenStreetMap tiles for the interactive map

If one source fails, CoastCast keeps the UI running and fills that category with demo fallback values.

## Important prototype notes

- The fishing score is a CoastCast prototype algorithm, not a guarantee of fish activity.
- Marine/weather/tide information should not be used as the only source for safety-critical decisions.
- OpenStreetMap public services are suitable for light prototype testing. A commercial release should use a production-grade geocoding/places/backend setup and comply with provider usage policies.
- Community posts are demo/local-device content in v0.3. A real multi-user community will require a database and authentication backend.

## Best Android editing workflow

You can edit the repo from your phone at `github.dev/YOUR_USERNAME/YOUR_REPO`.

For normal visual/text changes, edit `index.html` and `styles.css`.
For behavior, data and scoring changes, edit `app.js`.
Commit to `main`, then refresh the GitHub Pages app.
