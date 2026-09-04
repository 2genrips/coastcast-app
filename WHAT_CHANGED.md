# CoastCast v1.1 Beta

## New in this build

- New **Profile** experience accessible from the top-right avatar.
- Angler display name, home coast, favorite species and default fishing style.
- Profile dashboard for catches, favorites, trips and alerts.
- New **Data Vault** to export a portable CoastCast JSON backup and restore it on another device/browser.
- Optional **Supabase Cloud Sync Beta** with email/password authentication.
- Manual **Sync now** and **Restore from cloud** controls.
- Optional auto-sync of local changes after sign-in.
- Includes `SUPABASE_SETUP.sql` with a single user-owned JSON record table and Row Level Security policies.
- Includes `CLOUD_SYNC_SETUP.md` with Android-friendly setup steps.
- Service worker now includes future web-push event hooks so the PWA is ready for a later notification backend.
- Honest background-alert readiness panel: 24/7 checks still require a scheduled backend worker and push delivery.
- v1.0 local data migrates automatically into v1.1.
