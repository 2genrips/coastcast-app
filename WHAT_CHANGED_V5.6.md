# CastVector 5.6 — Store Launch Candidate 1

- Adds native Google Play Billing bridge hooks to the existing $4.99/month Premium screen.
- Free signed-in users can start or restore Premium from the native Android build.
- Purchases are never trusted locally; the purchase token is sent to the Supabase verification Edge Function.
- Server-verified entitlement remains the only authority for paid Premium.
- Existing Family Premium, Complimentary Premium, Lifetime Premium, owner/admin access and Community Live remain compatible.
- PWA/web builds do not attempt external digital checkout; store purchase controls explain that checkout is available in the native store app.
- PWA cache and icon filenames bumped for launch testing.
- Full GitHub-ready package restored so app.js/styles.css/service worker/manifest are included.
