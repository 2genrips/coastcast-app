# AnglerSignal native wrapper scaffold

This is the store-wrapper starting point for Android and iOS. It is NOT the final store binary yet.

Why a native wrapper: AnglerSignal sells digital Premium functionality, so the store builds need native store subscription flows and platform features such as purchase restoration. The existing PWA remains the shared UI/data engine.

Working identifiers:
- App/store title: AnglerSignal Fishing Forecast (subject to final name clearance)
- Android package / iOS bundle ID: com.anglersignal.fishing
- Premium product: coastcast_premium_monthly

Before generating native projects:
1. Lock the final store name and bundle/package ID.
2. Copy production web assets into native/www, including your existing configured coastcast-config.js.
3. Install Capacitor dependencies.
4. Add Android/iOS platforms.
5. Integrate Google Play Billing and StoreKit. Do not submit a web wrapper that bypasses the platform's required subscription flow.

Android can be built on Windows/Linux/macOS or CI. Final iOS signing/submission requires Apple's toolchain/signing environment (typically macOS/Xcode or a compatible cloud build service).
