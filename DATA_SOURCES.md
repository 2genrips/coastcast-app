# CoastCast v2.0.2 Data Sources

## Forecast and marine
- Open-Meteo weather forecast
- Open-Meteo marine forecast
- NOAA CO-OPS tide predictions
- National Weather Service point alerts

## Fishing access / map discovery
- Official/state public coastal-access datasets where integrated
- OpenStreetMap / Overpass
- Nominatim / Photon as secondary location discovery
- CoastCast verified regional access catalogs where available

## Bait & tackle intelligence
CoastCast v2.0.2 uses a multi-source merge:
1. **Geoapify Places** (optional key) — dedicated `commercial.outdoor_and_sport.fishing` category.
2. **OpenStreetMap / Overpass** — fishing-store tags plus fishing-specific names/descriptions/products.
3. **Nominatim / Photon** — strict text discovery, never accepted solely because a geocoder returned a nearby business.
4. **CoastCast verified regional catalogs** — high-confidence local fallbacks built from current official/business sources.

Every tackle result must pass a fishing-business validation rule or be explicitly marked as a verified fishing-supply business. CoastCast prefers showing no pin over knowingly showing an unrelated business.

## Important limitation
Business openings, closures, inventory and category data can change. CoastCast cannot guarantee that every existing shop is indexed or that every indexed shop is still open. A dedicated commercial Places provider improves nationwide completeness, but final navigation/business details should still be verified before driving.
