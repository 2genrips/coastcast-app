# CastVector iPhone / App Store launch path

Android closed testing should start first because a new personal Google Play account may have a 14-day testing clock. The iPhone build can proceed in parallel after the developer enrollment decision.

## Brand / seller-name decision
If enrolled in Apple Developer as an individual, the public seller/developer name is the individual's legal name.
If you want a CastVector business name shown as seller, enroll as an organization/legal entity. Apple requires organization verification, including a D-U-N-S number, work email on the organization's domain, and a functional public website.

## Subscription
CastVector Premium unlocks digital app functionality, so the iPhone build will use Apple's In-App Purchase / StoreKit for the $4.99/month subscription flow.
Family, Complimentary and Lifetime Premium remain CastVector server entitlements; they do not require a separate purchase by the recipient.

## Account deletion
Keep the in-app account deletion option. CastVector already has this in the web app and backend foundation.

## Planned iOS package
- Bundle ID target: `com.castvector.fishing`
- App display name: CastVector
- Subscription display: CastVector Premium
- U.S. target: $4.99/month
- Web app core: same CastVector production web URL
- Native additions: StoreKit subscription bridge, restore purchases, app lifecycle, notification permission, file/photo picker support

## Next build
After Google Play Internal testing is running, create the iOS wrapper and TestFlight cloud-build/signing path. Apple signing requires Apple Developer credentials/certificates that cannot be safely invented or embedded in the public GitHub repository.
