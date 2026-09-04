# CoastCast v0.7.1 — Map Search Hotfix

- Fixed `Places 0 / Search unavailable` caused by stale/unreliable Overpass endpoint configuration.
- Updated discovery to current public Overpass endpoints.
- Changed place and tackle searches from encoded GET queries to POST requests.
- Removed the generic Nominatim POI fallback from map/tackle discovery.
- Updated service-worker and asset versions to force a clean GitHub Pages/PWA refresh.
