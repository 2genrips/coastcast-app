# CoastCast 5.0 — Android / GitHub Pages update

CoastCast 5.0 keeps the nationwide fishing app working as a GitHub Pages PWA and adds the launch-security foundation for real accounts and Premium access.

## Update the app from Android
1. Extract the CoastCast v5.0 ZIP.
2. Open your existing CoastCast GitHub repository.
3. Choose **Add file → Upload files**.
4. Upload everything from inside the `coastcast_v5.0` folder, including the new SQL/docs and `supabase` folder.
5. Replace the matching app files and commit to `main`.
6. Wait for GitHub Pages to redeploy, then fully close/reopen CoastCast.

Your previous CoastCast local data migrates forward from v4.0.

## What works without a backend
All normal fishing features continue working. Premium UI remains available in development preview mode so you can keep testing.

## Turn on real accounts + entitlements
When ready:
1. Create/use your Supabase project.
2. Run `SUPABASE_SETUP.sql`.
3. Run `COASTCAST_LAUNCH_BACKEND.sql`.
4. Put the public Supabase URL and publishable key into `coastcast-config.js` (or use the in-app Account setup during development).
5. Create your CoastCast account in **Profile → CoastCast Account**.
6. Follow `ADMIN_SETUP.md` once to make your account the CoastCast owner/admin.
7. Tap **Refresh server access** in the app.

After the launch backend is detected, the local Premium simulator is disabled for the signed-in account and CoastCast uses server-verified access.

## Important
Never put these in GitHub Pages:
- Supabase secret/service-role key
- Google Play service-account JSON/private key
- VAPID private key

Public Supabase publishable keys are designed for browser use when Row Level Security is correctly configured.
