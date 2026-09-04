# CoastCast v0.7.2 data sources

Forecast sources remain Open-Meteo weather/marine and NOAA CO-OPS tides.

Map place discovery uses OpenStreetMap Overpass first. For Holden Beach, CoastCast now has a verified fallback catalog based on the Town of Holden Beach / Brunswick Islands public-access information and NC Wildlife Resources Commission fishing-access data. Address-only verified places are geocoded with Nominatim, then Photon as a fallback.

The Holden Beach Boating Access Area is anchored with NCWRC's published coordinates: 33.91625683, -78.26749257.

Tackle search uses Overpass first, then verified Holden Beach shop addresses if needed.
