# Native billing web hook

Do not wire the $4.99 purchase button until the Play Console subscription product exists.

When ready:
1. Upload `native-billing-hook.js` to the CastVector website.
2. Add `<script src="native-billing-hook.js"></script>` after `app.js`.
3. The Premium button should call `CastVectorPlay.buyPremium()`.
4. Listen for `castvector:premium-verification-needed`.
5. Send the purchase token to the protected Supabase `verify-play-subscription` Edge Function.
6. Refresh server access only after the backend confirms the entitlement.

The browser must never grant itself Premium.
