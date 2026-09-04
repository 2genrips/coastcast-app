# CoastCast v0.7.0 — Map + Spot Intelligence

## New map intelligence
- Scans real OpenStreetMap public-place data around the selected fishing destination.
- Discovers named beaches, piers, fishing access, marinas, docks and boat ramps where mapped.
- Ranks nearby public places with an **Area Match** preview based on current CoastCast conditions, selected fishing style and distance.
- The Area Match is intentionally labeled as a preview; **Analyze live** moves CoastCast to the exact place and reloads its live forecast before you plan a trip.
- Top-match score pins appear directly on the map.
- Map filters now include Top matches, Public access, Saved spots, Catches and Bait.
- Public places can be saved as private waypoints with one tap.
- Added best-day intelligence directly on the Map page.

## Bait & tackle upgrades
- Broader OpenStreetMap / Overpass search for fishing, bait, tackle, angler and outfitter businesses.
- Tries three public Overpass endpoints.
- Uses bounded OpenStreetMap/Nominatim map search as a fallback.
- Caches successful real results for six hours to reduce repeated free-service requests.
- Adds **Shop → spot** routing for the last leg of your fishing trip.

## Privacy
Saved user waypoints remain local/private by default. Private catches remain offset on the map as before. Public map-place discovery does not publish your saved locations.

## Important
Area Match is a planning aid, not a guarantee that fishing is allowed at a place or that access is open. Check posted rules, ownership, hours, closures and local regulations before fishing.
