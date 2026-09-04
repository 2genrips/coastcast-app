# Update CoastCast v5.1 to AnglerSignal v5.2 from Android

1. Download and extract the AnglerSignal v5.2 ZIP.
2. Upload everything inside the folder to the same GitHub Pages repository, replacing matching files.
3. **Do not delete your existing `coastcast-config.js`.** The v5.2 ZIP intentionally does not include that live config file, so your Supabase connection stays intact.
4. Commit to `main` and wait for GitHub Pages.
5. Fully close the installed app and reopen it.
6. If the old app name remains under the Android home-screen icon, remove the installed PWA and reinstall it after the site update; Android may cache installed-app names/icons.

Existing Supabase accounts, Owner access, Lifetime Premium, Complimentary Premium, catches, trips and other stored data remain compatible because the backend and storage identifiers are intentionally preserved.
