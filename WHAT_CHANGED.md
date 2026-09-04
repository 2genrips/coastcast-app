# CoastCast v0.5.1 Hotfix

- Removed runtime dependence on the nested `branding/` folder for the header, score dial and footer.
- Embedded the CoastCast mark directly in `index.html` so Android/GitHub uploads cannot break it.
- Hardened refresh, settings and best-window SVG icons for Chrome/Android rendering.
- Fixed the score-breakdown button styling on mobile browsers.
- Improved long fishing-location wrapping.
- Added cache-busting for CSS and JavaScript and bumped the service-worker cache to v0.5.1.
- Preserved the v0.5 live forecast engine, data model, saved catches, spots and settings.
