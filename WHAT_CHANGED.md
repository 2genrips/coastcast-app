# CoastCast v0.8.0 — Nationwide U.S. Coast

## What changed
- CoastCast is no longer designed around North Carolina as the default coverage model.
- Nationwide destination search now supports the Atlantic, Gulf, Pacific, Alaska and Hawaiʻi coasts.
- Added popular coast presets from Maine to Hawaiʻi for quick testing.
- NOAA tide-station discovery remains nationwide and now has more seed stations for resilience.
- Added Pacific, Alaska, Gulf/Florida and Hawaiʻi target species to Species Mode.
- Spot Intelligence now reports the detected U.S. coast region.
- Official state access layers are treated as optional provider adapters; NC remains the first registered official state layer.
- Public map discovery continues nationwide through OpenStreetMap plus text/geocoder fallbacks.
- When no public-access source returns a result, CoastCast no longer becomes unusable: it loads the selected coastal coordinate as a clearly labeled **Forecast point only**. This is not represented as verified public access.
- Nearby tackle search now has nationwide text-search fallbacks in addition to map data.
- Location search has a second provider fallback.

## Important access note
Forecasting can work at any coastal coordinate, but legal/public fishing access is not standardized nationally. CoastCast labels unverified points clearly. State and local official access providers can be added to the provider registry over time without changing the nationwide core.
