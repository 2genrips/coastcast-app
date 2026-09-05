# CastVector v5.6 Google Play Closed-Test Kit

This kit is designed for an Android-only workflow using GitHub Actions.

## Already set
- App: CastVector
- Package: `com.castvector.fishing`
- Version: 5.6.0 (`56000`)
- Target SDK: Android 16 / API 36
- Minimum SDK: 26
- Google Play Billing: 8.3.0
- Premium product: `castvector_premium_monthly`
- Planned U.S. monthly price: $4.99
- Web URL: `https://2genrips.github.io/cc/`

## Build path from your phone
1. Keep using the same private upload key pack you already generated.
2. Replace/update the GitHub secret `CASTVECTOR_ANDROID_SOURCE_BASE64` using the v5.6 source text in this kit.
3. Keep the four signing secrets unchanged.
4. Keep/create `.github/workflows/build-castvector-android.yml`.
5. GitHub > Actions > Build CastVector Play Bundle > Run workflow.
6. Download `CastVector-debug-apk` for direct testing.
7. Download `CastVector-release-aab` for Play Console.
8. Upload the AAB to Internal testing first.

## Important
The native app is a secure wrapper around your live CastVector web app and adds Google Play Billing. Paid Premium is not granted by JavaScript or localStorage; the Play purchase token must be verified by the Supabase backend.

Before paid testing, deploy the updated `verify-play-subscription` Edge Function included in the v5.6 kit.
