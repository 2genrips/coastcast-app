# Current Google Play requirements — checked September 2026

## Target API
Starting August 31, 2026, new apps and app updates must target Android 16 / API 36 or higher.
CastVector targets API 36.

Official:
https://support.google.com/googleplay/android-developer/answer/11926878
https://developer.android.com/google/play/requirements/target-sdk

## New personal developer account testing
For personal Play developer accounts created after November 13, 2023:
- complete app setup
- run a closed test
- at least 12 testers
- those testers continuously opted in for at least 14 days
- then apply for production access

Internal testing is optional but recommended before closed testing.

Official:
https://support.google.com/googleplay/android-developer/answer/14151465
https://support.google.com/googleplay/android-developer/answer/9845334

## Play Billing
CastVector v5.6 uses Google Play Billing Library 8.3.0.
Paid Premium is $4.99/month in the planned U.S. base plan.
The Play-distributed app starts checkout through Play Billing; it does not grant Premium locally.

Official:
https://developer.android.com/google/play/billing/release-notes
https://developer.android.com/google/play/billing/security

## Purchase security
- Purchase tokens go to the Supabase `verify-play-subscription` Edge Function.
- The backend verifies with Google Play before granting the Paid Premium entitlement.
- Initial subscription purchases must be acknowledged after entitlement is granted.
- CastVector v5.6 server verification includes acknowledgement handling.
- Family, Complimentary and Lifetime Premium remain separate server-side entitlement sources.

## Account deletion
CastVector supports account creation, so the launch build keeps an in-app delete-account flow and public deletion page.
