# CoastCast v0.7 Data Sources

## Weather
Open-Meteo Weather API.

## Marine
Open-Meteo Marine API. Coastal model data can be coarse close to shore and is not navigation guidance.

## Tides
NOAA CO-OPS tide predictions.

## Public fishing places and access
OpenStreetMap place data queried through public Overpass endpoints. CoastCast looks for mapped fishing access, named beaches, piers, marinas, boat ramps/slipways and docks. Map presence does **not** prove public fishing permission, current access, safety or operating hours.

## Bait & tackle
OpenStreetMap / Overpass business data with bounded OpenStreetMap/Nominatim search as a fallback. Successful real results are cached for six hours.

## Map
Leaflet + OpenStreetMap tiles.

Always verify local access, closures, regulations, tides and surf safety independently.
