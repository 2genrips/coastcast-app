# CoastCast v0.8.0 Data Sources

## Nationwide forecast core
- Open-Meteo Weather API — weather, temperature, rain, pressure, wind and related forecast fields.
- Open-Meteo Marine API — waves, swell, sea-surface temperature and marine forecast fields where model coverage is available.
- NOAA CO-OPS Tides & Currents — nearest tide-prediction station discovery and tide predictions across U.S. coasts.

## Nationwide location / map discovery
- OpenStreetMap / Overpass — indexed fishing access, beaches, piers, marinas, ramps and related places.
- Nominatim and Photon — location search and fallback discovery.
- State/local official access providers — optional provider adapters. NC Division of Coastal Management is currently integrated as an official state layer.

## National access-data strategy
There is no single open, documented, browser-friendly public-access API that provides complete legal beach/pier/shore access for every U.S. coastline. NOAA Fisheries maintains a large Public Fishing Access Site Register for much of the Atlantic/Gulf plus Hawaiʻi, and USGS publishes a nationwide public boat-ramp dataset, but production integration should respect each source's access method and update process.

CoastCast therefore separates **forecast coverage** from **verified access coverage**. A forecast can be calculated at a coastal coordinate even when no public-access site is returned. Unverified coordinates are never labeled as legal/public access.
