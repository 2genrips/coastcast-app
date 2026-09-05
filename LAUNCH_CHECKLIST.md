# CastVector platform launch checklist

## Phase A — already working
- [x] Hosted PWA on GitHub Pages
- [x] Supabase account sign-in
- [x] Server-verified Premium entitlements
- [x] Owner Lifetime Premium
- [x] Complimentary Premium grants
- [x] Family entitlement backend foundation

## Phase B — v5.1 launch compliance
- [x] In-app delete-account path added
- [x] Public account-deletion request page added
- [x] Privacy Policy page added
- [x] Terms page added
- [x] Support page added
- [x] Store-listing drafts added
- [x] Native-wrapper scaffold added
- [ ] Add final public support email to live coastcast-config.js
- [ ] Run LAUNCH_COMPLIANCE_SETUP.sql
- [ ] Deploy delete-account Edge Function
- [ ] Deploy request-account-deletion Edge Function with JWT verification disabled for that request-only function
- [ ] Decide final store-facing name after name/trademark review

## Google Play
- [ ] Create Full Distribution developer account
- [ ] Verify developer identity/device as requested
- [ ] Create app record and reserve package ID
- [ ] Create subscription product castvector_premium_monthly
- [ ] Integrate native Play Billing purchase flow
- [ ] Connect purchase token to existing verify-play-subscription backend
- [ ] Complete Data Safety and account-deletion URL
- [ ] Upload screenshots/feature graphic/icon
- [ ] If account is a new personal developer account, complete required closed testing before production
- [ ] Internal test -> closed test -> production

## Apple App Store
- [ ] Enroll in Apple Developer Program
- [ ] Create App Store Connect app record and bundle ID
- [ ] Build native iOS wrapper
- [ ] Add StoreKit auto-renewable subscription
- [ ] Add Restore Purchases
- [ ] Connect App Store entitlement verification to CastVector backend
- [ ] Complete App Privacy
- [ ] Add privacy/support URLs
- [ ] TestFlight test
- [ ] App Review submission

## Web/PWA
- [ ] Keep GitHub Pages production URL stable
- [ ] Add custom domain before major marketing if possible
- [ ] Configure supportEmail/legalEntity in coastcast-config.js
- [ ] Confirm privacy/terms/deletion pages are publicly accessible
