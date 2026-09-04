# CoastCast 2.1 — Premium Rebrand + Destination Intelligence

## Rebrand integration
- New CoastCast compass/fish/wave emblem is now the primary in-app mark.
- Rebuilt Android/PWA icons from the new emblem.
- Added the new semi-transparent CoastCast watermark behind the app.
- Refined the navy/aqua visual system, header, panels, navigation, buttons and score presentation.
- Added new social/open-graph artwork.
- Added a v2.1 brand guide and reusable brand assets.

## New Destination Intelligence
Home now includes a Destination Intelligence panel that combines:
- coastal region
- best current target species
- species score
- public fishing/access place count
- public-access source status
- verified/live tackle-shop count
- water temperature
- live-data confidence

The panel has direct actions to:
- scan and rank nearby fishing spots
- search verified tackle shops around the fishing destination

## Data integrity
- v2.0.2 tackle verification remains intact.
- Unrelated businesses are still rejected from Bait/Tackle pins.
- Dedicated tackle radius and optional Geoapify integration remain available.
- Existing v2.0.x data migrates into v2.1.

## Storage
New local state key: `coastcast-v21-state`.
Previous CoastCast state remains readable for migration.
