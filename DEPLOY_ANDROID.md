# Deploy the v5.6 Play verification function from your phone

Before testing paid Premium:

1. Supabase > Edge Functions.
2. Open or create `verify-play-subscription`.
3. Replace the function code with `index.ts` from this folder.
4. Set required Edge Function secrets:
   - `GOOGLE_PLAY_PACKAGE_NAME` = `com.castvector.fishing`
   - `CASTVECTOR_PREMIUM_PRODUCT_ID` = `castvector_premium_monthly`
   - `GOOGLE_SERVICE_ACCOUNT_JSON` = your Google Play service-account JSON
5. Deploy.
6. Do not put the service-account JSON, Supabase secret key, or any private key in GitHub.

The function verifies the subscription with Google Play, stores the paid entitlement, and acknowledges an initial purchase when Google reports acknowledgement is pending.
