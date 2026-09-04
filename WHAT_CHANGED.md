# CoastCast 3.1.1 — Ocean Network browser hotfix

- Fixes the Android/GitHub Pages **Failed to fetch** problem shown by direct NDBC text feeds.
- Ocean Network now tries NDBC observations first, then automatically falls back to NOAA CO-OPS observed coastal stations.
- CO-OPS fallback can provide measured wind, water temperature and barometric pressure when those sensors are available.
- Model Agreement now works with the observed fields that are actually available; a missing wave sensor no longer makes the whole Ocean Network fail.
- Station provenance is shown as NDBC or CO-OPS.
- Existing live weather, marine forecast, NOAA tides, tackle, membership and all saved user data remain unchanged.
- NDBC direct browser access is still best-effort; full observed-wave coverage will eventually move behind the CoastCast backend/proxy for launch reliability.
