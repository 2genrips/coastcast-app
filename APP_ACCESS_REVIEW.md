# Google Play app-access review notes

CastVector has useful functionality available without sign-in, but account-only and Premium areas exist.

Before submission, create a dedicated reviewer account in Supabase:
- reviewer email: create a new address you control
- entitlement: Complimentary Premium
- do not use your Owner account

In Play Console > App content > App access:
1. Tell Google that parts of the app require login.
2. Provide the reviewer email and password.
3. Explain: "Use Profile > Sign in / create account. After sign-in, tap Refresh server access. This reviewer account has Complimentary Premium so all reviewable Premium features are available."
4. Do not require 2FA, SMS, or a one-time code for the reviewer account.
