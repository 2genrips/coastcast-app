# CoastCast v0.5 data sources

## Live weather
Open-Meteo Forecast API provides temperature, feels-like temperature, precipitation probability, wind, gusts, pressure, humidity, cloud cover, visibility, UV and sunrise/sunset data.

## Marine forecast
Open-Meteo Marine API provides wave height/direction/period, swell data, sea-surface temperature and ocean-current fields when the model has coverage. Marine forecasts are model guidance and must not be treated as navigation data.

## Tides
NOAA CO-OPS Data API provides tide predictions. CoastCast finds a nearby NOAA tide-prediction station and requests high/low predictions in English units.

## Places
OpenStreetMap Nominatim is used for location search/reverse geocoding. OpenStreetMap Overpass is used for nearby fishing/outdoor/bait/tackle results. Coverage varies by area.

## Fallback behavior
CoastCast keeps demo/fallback values when a live service is unavailable, and v0.5 displays source-status chips so you can see which categories are actually live.
