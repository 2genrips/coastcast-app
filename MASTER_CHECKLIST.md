# CastVector v5.6 closed-test launch checklist

## Already prepared
- [x] Public brand locked: CastVector
- [x] Package ID: `com.castvector.fishing`
- [x] Android target/compile SDK: API 36
- [x] Play Billing 8.3.0 bridge
- [x] Premium product ID: `castvector_premium_monthly`
- [x] $4.99/month Premium plan architecture
- [x] Server-verified entitlements
- [x] Family / Complimentary / Lifetime Premium architecture
- [x] Community Live + owner moderation
- [x] Account deletion flow
- [x] Privacy / Terms / Support pages
- [x] GitHub Actions phone-only Android build route
- [x] Play app icon + feature graphic
- [x] Store listing copy draft
- [x] Data Safety worksheet draft
- [x] App access/reviewer notes draft
- [x] Closed-test tester plan
- [x] API 36 requirement checked for September 2026

## Next actions in your accounts
- [ ] Upload CastVector v5.6 web build and verify it
- [ ] Deploy the updated `verify-play-subscription` Edge Function before paid testing
- [ ] Finish Google Play developer account
- [ ] Create CastVector app record in Play Console
- [ ] Use the existing CastVector upload signing key; do not generate a different key after first Play upload
- [ ] Add/update GitHub Android-source secret for v5.6
- [ ] Run GitHub Actions and download the signed AAB
- [ ] Upload AAB to Internal testing first
- [ ] Create subscription `castvector_premium_monthly` with monthly base plan, U.S. target $4.99
- [ ] Add license testers for billing
- [ ] Test Free -> Paid Premium -> Restore purchase
- [ ] Test Family / Complimentary / Lifetime access remains separate from store purchase
- [ ] Complete Play Console App content and Data Safety forms
- [ ] Replace any placeholder support email / legal entity text
- [ ] Capture 4–6 final phone screenshots
- [ ] Start closed testing (use a buffer such as 15 testers if the 12-for-14-days rule applies)
- [ ] Keep at least 12 testers continuously opted in for 14 days
- [ ] Apply for production access
