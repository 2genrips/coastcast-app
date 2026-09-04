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
