# Optional Nationwide Tackle-Shop Accuracy Setup

CastVector works without an extra key, but open map databases can miss legitimate fishing stores. For broader nationwide POI coverage, v2.0.2 supports Geoapify Places.

## Android setup
1. Open https://myprojects.geoapify.com/ in Chrome.
2. Create a free Geoapify account/project.
3. Copy the generated API key.
4. Open CastVector → Settings.
5. Paste it into **Geoapify Places key**.
6. Set **Tackle-shop search radius** (20 miles is a good default).
7. Tap **Refresh tackle shops**.

The key is stored only in your browser/app local storage. It is not inserted into the GitHub repository and is intentionally excluded from CastVector backup/cloud-sync data.

## Protect the key
In Geoapify, restrict the key to the web origin that hosts CastVector, for example your GitHub Pages origin. This reduces misuse if someone inspects browser network traffic.

## Current free-plan note
Geoapify currently advertises a free tier with up to 3,000 credits per day and says a credit card is not required to start. Check the provider's current pricing/terms before public launch because limits and commercial-use terms can change.
