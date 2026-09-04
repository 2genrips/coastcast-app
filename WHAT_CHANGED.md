# CoastCast v2.0 — Command Center Launch Candidate

## Big additions
- CoastCast Command Center: one recommendation from species, 7-day forecast, wind, surf, weather, safety and data confidence.
- Four planning priorities: Max Bite, Calm Water, Best Weather and Most Certain.
- One-tap Complete Command Plan that connects target species, best day/window, bait plan and Smart Departure.
- 7-day Opportunity Matrix across the top regional species.
- Trip Mission Control with plan completeness and guarded one-tap Go Fishing Mode launch.
- Forecast Data Confidence score based on which live sources actually responded.
- Angler Analytics dashboard that learns your repeated species, bait, water, time, tide and condition patterns from your private logbook.
- Command Brief sharing for Android.
- v2.0 state/backup migration preserves v1.8 data.

## Safety
Command Center and Mission Control are planning aids. A strong score is not a declaration that surf or weather is safe. Official warnings, local beach flags, access rules and fishing regulations remain authoritative.


## v2.0.1 tackle-shop accuracy hotfix
- Bait/tackle map pins now require a strict fishing-store match.
- Explicitly rejects government offices, sheriff/police, libraries, schools, churches, hospitals and other unrelated geocoder results.
- Live mode no longer leaves demo shops on the map when real shop lookup fails.
- Shop cache key was versioned so previously cached false-positive businesses are discarded.
- Overpass search now prefers `shop=fishing` and fishing-specific sports/outdoor stores.
- Text-geocoder fallbacks are accepted only when the returned business name itself looks like a fishing/bait/tackle store.
- If CoastCast cannot verify a tackle shop, it now shows no tackle pin rather than a wrong one.
