# CastVector v5.6 Android-only Play build

You do not need Android Studio.

## Keep your existing upload signing key
If you already created the CastVector upload key/secrets, keep using the same four signing secrets. Do not create a different upload key after your first Play upload.

## 1. Update Android source secret
Open:
`CastVector_ANDROID_SOURCE_BASE64_v5.6.txt`

Copy all text.

GitHub:
Repository > Settings > Secrets and variables > Actions

Create or update:
`CASTVECTOR_ANDROID_SOURCE_BASE64`

Paste the full value.

## 2. Confirm signing secrets still exist
- `CASTVECTOR_KEYSTORE_BASE64`
- `CASTVECTOR_KEYSTORE_PASSWORD`
- `CASTVECTOR_KEY_ALIAS`
- `CASTVECTOR_KEY_PASSWORD`

Never put these in normal repository files.

## 3. Workflow
At repository root create/update:
`.github/workflows/build-castvector-android.yml`

Use `build-castvector-android-v5.6.yml` from this folder.

## 4. Build
GitHub > Actions > Build CastVector Play Bundle > Run workflow.

Artifacts:
- `CastVector-debug-apk` — direct phone test
- `CastVector-release-aab` — Google Play upload

## 5. Test order
Upload the AAB to Google Play Internal testing first.
After basic install/sign-in/live-data/community testing, create the monthly subscription and test Play Billing.
Then start the closed test if your account is subject to the 12-testers/14-days requirement.
