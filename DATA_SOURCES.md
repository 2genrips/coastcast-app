# CoastCast 3.1 Data Sources

## Forecast & marine
- Open-Meteo weather forecast
- Open-Meteo marine forecast
- NOAA CO-OPS tide predictions
- National Weather Service point alerts

## Ocean Network reality check
- NOAA/NDBC latest observations: `https://www.ndbc.noaa.gov/data/latest_obs/latest_obs.txt`
- NDBC station realtime files: `https://www.ndbc.noaa.gov/data/realtime2/{station}.txt`
- NDBC station pages: `https://www.ndbc.noaa.gov/station_page.php?station={station}`

NDBC station data can be offshore or exposed differently than the beach. CoastCast treats it as a regional reality check for the forecast, not a measurement at the angler's feet.

## Coast Watch
Coast Watch uses the weather and marine forecast services to query saved fishing destinations separately. Its comparison score is a planning preview. Open a destination with **Analyze** to load its exact-location NOAA tide and full forecast context before making a trip decision.

## Fishing access / map discovery
- Official/state public coastal-access datasets where integrated
- OpenStreetMap / Overpass
- Nominatim / Photon secondary location discovery
- CoastCast verified regional access catalogs where available

## Bait & tackle intelligence
CoastCast merges multiple sources:
1. Geoapify Places (optional key) using its fishing/outdoor retail category
2. OpenStreetMap / Overpass fishing-store tags and fishing-specific metadata
3. Nominatim / Photon strict text discovery
4. CoastCast verified regional business catalogs

Results must pass fishing-business validation or be explicitly verified. CoastCast prefers no bait pin over knowingly labeling an unrelated business as tackle.

## Premium / entitlement architecture
CoastCast 3.1 includes the membership UI/state preview and server-side database schema, but Google Play Billing and secure entitlement validation are **not yet connected**. The beta access selector exists only for UI testing and must not be treated as payment security.

See `PREMIUM_ARCHITECTURE.md` and `ENTITLEMENT_SETUP.sql`.
