# CoastCast v0.6 Data Sources

## Weather
Open-Meteo Weather API: temperature, feels-like, weather code, rain probability, humidity, visibility, UV, wind, gusts, pressure, sunrise and sunset.

## Marine
Open-Meteo Marine API: wave height/direction/period, swell height/direction/period, sea-surface temperature and ocean-current model data where available. CoastCast requests imperial wave lengths, selects a sea grid cell, converts SST from °C to °F, and converts current velocity from km/h to mph. Marine model resolution can be coarse near shore and must not be used for navigation.

## Tides
NOAA CO-OPS Data API for high/low tide predictions. NOAA station metadata is used for station discovery, with a small verified southeastern-NC seed list as a reliability fallback.

## Bait & tackle
OpenStreetMap / Overpass results around the selected fishing destination. CoastCast tries two public Overpass endpoints before falling back to demo listings. Store hours/services should be confirmed before driving.

## Map
Leaflet + OpenStreetMap map tiles.

No forecast should be treated as a guarantee of fishing success or as navigation/surf-safety guidance.
