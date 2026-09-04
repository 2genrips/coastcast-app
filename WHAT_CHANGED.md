# CoastCast v0.6.0 — Premium UI + Reliable Live Data

## Main changes
- Live status is now truthful: **Live**, **Partial live**, **Demo fallback**, **Updating**, or **Demo** are derived from the feeds that actually responded.
- Weather, Marine, NOAA Tides and Tackle Shops each show their own state.
- Fixed the Open-Meteo Marine request by removing an unsupported temperature-unit option; sea-surface temperature is converted to Fahrenheit inside CoastCast.
- Added explicit sea-grid selection for coastal marine forecasts.
- Added nearby NOAA tide-station seeds for southeastern North Carolina, including Bowen Point / Shallotte Inlet and Varnamtown, improving Holden Beach tide reliability.
- Added a second Overpass endpoint fallback for bait/tackle discovery.
- Rebuilt Current Conditions into one cleaner native-style surface instead of six separate cards.
- Species Mode now uses CoastCast initials/badges instead of emoji-heavy chips and has clearer horizontal scrolling.
- Added a Bite Trend chart to the Forecast screen.
- Added a source-status banner to Forecast.
- Refined bottom navigation and dark map styling.
- Fixed an old missing closing element around map filters.

## Data safety
CoastCast remains planning guidance, not navigation or surf-safety authority. Marine model data can be coarse close to shore. Always use local warnings and judgment.
