# Updating your existing AnglerSignal v5.0 site from Android

IMPORTANT: your live GitHub `coastcast-config.js` already contains the Supabase Project URL and publishable key. This v5.2 package intentionally does NOT include that file, so uploading v5.2 will not overwrite your working connection.

1. Extract the v5.2 ZIP.
2. Open your existing AnglerSignal GitHub repository.
3. Upload everything inside `coastcast_v5.2_launch_ready`.
4. Replace matching files when GitHub prompts.
5. Leave your existing `coastcast-config.js` in the repository.
6. Commit to main.
7. Wait for GitHub Pages, fully close AnglerSignal, reopen.

Then in Supabase:
1. Run `LAUNCH_COMPLIANCE_SETUP.sql`.
2. Deploy `delete-account` Edge Function.
3. Deploy `request-account-deletion` as a public request endpoint (no JWT verification).

Before public store submission, add two extra public configuration values to your existing config:

supportEmail: 'YOUR PUBLIC SUPPORT EMAIL',
legalEntity: 'YOUR PUBLIC DEVELOPER/BUSINESS NAME',

Do not put service-role or secret keys in GitHub.
