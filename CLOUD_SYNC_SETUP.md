# CoastCast v1.1 — Cloud Sync Setup (Supabase)

Cloud sync is **optional**. The app continues to work locally without it.

## One-time setup

1. Create/open your Supabase project.
2. Open **SQL Editor** in Supabase.
3. Paste the contents of `SUPABASE_SETUP.sql` and run it.
4. In Supabase, copy your **Project URL** and your **anon / publishable key**.
   - Never use a service-role key in CoastCast.
5. In CoastCast open **Profile → Cloud setup**.
6. Paste the Project URL and anon/publishable key.
7. Enter an email and password. Use **Create account**, then **Sign in** if email confirmation is required.
8. Return to Profile and tap **Sync now**.

## What syncs

- Profile
- Fishing destination/preferences
- Saved fishing spots
- Catch logbook
- Saved trips
- Smart alert rules

Your Supabase password is never saved by CoastCast. The project URL and anon/publishable key can be remembered locally because they are browser-client configuration, not admin credentials.

## Background alerts

v1.1 makes the service worker push-ready, but **24/7 alerts still require a backend worker plus web-push delivery**. The current app does not claim to monitor forecasts while fully closed.


v1.7 sync payloads can include tackle inventory, shopping lists, offline trip packs and compressed catch photos. Large photo-heavy backups may increase Supabase row size; keep catch photos compressed and reasonable in number.
