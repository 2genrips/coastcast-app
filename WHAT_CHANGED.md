# CoastCast v2.0.2 — Multi-Source Tackle Intelligence

## Why this update exists
The v2.0.1 strict filter stopped false bait pins such as government offices and libraries, but it also exposed the opposite problem: open map data can be incomplete and may miss legitimate bait/tackle businesses.

## Tackle-store improvements
- CoastCast now **merges** shop results from multiple providers instead of stopping after the first source returns something.
- Optional Geoapify Places integration for a dedicated nationwide fishing-store category.
- Expanded OpenStreetMap/Overpass search checks names, fishing shop categories, descriptions, and product tags.
- Nominatim and Photon text searches remain secondary discovery sources with strict validation.
- Separate **Tackle-shop search radius** from the normal fishing-area scan radius; default is 20 miles.
- Up to 18 validated shop results can be retained, with up to 8 shown in lists.
- Results show provenance badges: VERIFIED, PLACES, OSM, or SEARCH.
- Verified regional catalogs are **merged with** live discovery instead of being used only after total failure.
- Holden Beach now includes a larger verified fallback catalog sourced from current fishing-store/business and coastal-fishing references.
- Old v2.0.1 shop cache is bypassed with a new v3 cache key.
- CoastCast still refuses to place an unrelated business on the Bait layer just to fill the map.

## Accuracy policy
No POI/business database is perfectly complete or current. CoastCast now prioritizes dedicated fishing-store categories, verified local evidence, provider provenance, and no-fake-result behavior rather than claiming 100% completeness.
