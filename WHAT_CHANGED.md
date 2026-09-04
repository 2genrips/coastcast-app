# CoastCast v0.7.2 — Verified Holden Beach fallback

- Keeps live Overpass discovery, but no longer depends on it to find Holden Beach access.
- Adds a verified Holden Beach public-access fallback based on Town/Brunswick Islands and NCWRC sources.
- Includes the NCWRC Holden Beach Boating Access Area with official GPS coordinates.
- Geocodes additional verified beach-access addresses through Nominatim with Photon fallback.
- Adds a verified local tackle-shop fallback for Rigged & Ready and The Rod & Reel Shop.
- Map status now distinguishes `Verified local catalog` from live OSM results.
- Shortens Overpass timeouts so a failed public server does not leave the user waiting as long.
