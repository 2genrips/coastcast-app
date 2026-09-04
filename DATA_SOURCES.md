# CoastCast v0.9 Data Sources

## Forecast
- Open-Meteo Weather API — weather, temperature, precipitation, pressure, wind and related forecast fields.
- Open-Meteo Marine API — waves, swell, sea-surface temperature and supported current fields.
- NOAA CO-OPS — U.S. tide predictions and tide-station data.

## Places / map
- OpenStreetMap / Leaflet and the existing CoastCast provider/fallback registry from v0.8.
- State/official public-access datasets can be added through the provider registry without changing the nationwide forecast core.

## Regulations
Regulations Watch contains official state-agency links for the 23 U.S. saltwater coastal states (Atlantic, Gulf, Pacific, Alaska and Hawaiʻi). CoastCast intentionally does not cache legal size/bag/season numbers in v0.9 because regulations can change in-season and by sub-area. Always use the linked official source for the current rule.

## Species Intelligence
Species scores are CoastCast planning estimates based on live forecast conditions, prototype species preference ranges, fishing style, tide state, daylight and a small optional personal-history signal from catches stored only on the user's device. They are not biological guarantees.


## v1.0 Smart Alerts
Forecast watches are evaluated locally against the forecast already loaded in CoastCast. They do not introduce a new external data provider. Device notifications, when permitted, are emitted only during an active app/open-refresh check. Continuous background push monitoring requires a future backend/push service.


## v1.1 optional cloud sync
Supabase is not required for forecasts and is not a CoastCast data provider. If the user connects their own Supabase project, CoastCast stores one user-owned JSON sync record protected by Supabase Auth and Row Level Security. The app never needs a service-role key.


## v1.2 CoastCast Scout
Scout performs lightweight location-specific forecast checks using:
- Open-Meteo Weather API
- Open-Meteo Marine API

Candidate locations can come from the selected coastal point, CoastCast public-map discovery, saved private waypoints, and nearby CoastCast preset coast locations. Scout currently treats tide movement as a regional moving-water factor during multi-spot screening; after the angler taps Analyze, the normal exact-location CoastCast workflow loads the nearest NOAA tide source for that selected destination.


## v1.3 personal intelligence
Catch Intelligence and Personal Pattern Match are calculated locally from the angler's own CoastCast logbook. No external AI service or third-party personal-data processor is required for these features. New catches store a structured local conditions snapshot in addition to the readable conditions text.


## v1.4 intelligence note
Bait, rig and gear suggestions are CoastCast planning heuristics built from loaded conditions, fishing style, species profiles and the user’s own catch history. They are not a substitute for local tackle-shop advice, safety judgment or official regulations. The Regulation Guard records only that the user says they reviewed the official source that day.
