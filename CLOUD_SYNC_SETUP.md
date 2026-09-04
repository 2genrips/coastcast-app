# CoastCast v2.0 — Cloud Sync + Community Beta

Cloud Sync is optional. CoastCast still works locally without Supabase.

## Existing users upgrading from v1.7
Run the new `SUPABASE_SETUP.sql` once in your existing Supabase project. It keeps the private `coastcast_user_data` table and adds:

- `community_catches` — public catch posts created only when an angler taps **Publish to Community**
- `community_reactions` — Community Beta likes

## Setup from Android
1. Open your Supabase project in Chrome.
2. Open **SQL Editor**.
3. Paste the complete contents of `SUPABASE_SETUP.sql` and run it.
4. In CoastCast open **Profile → Cloud Sync**.
5. Enter your project URL and anon/publishable key, then sign in.
6. Open **Community → Refresh**.

## Privacy model
- Private catches remain private in your CoastCast logbook.
- Publishing to Community is a separate explicit action.
- **General water area** is the default share precision.
- General posts round map coordinates before upload and display only the generalized location label.
- **Hidden** uploads no public latitude/longitude.
- **Exact spot** is accepted only when the saved catch itself is marked Public.
- A CoastCast catch-card image never prints raw coordinates.

## Photos
Community Beta can store the already-compressed catch photo directly in a post for testing. This is suitable for a beta, but before a large public launch CoastCast should move community photos to Supabase Storage/CDN instead of database text rows.

## CoastCast 3.1 membership note
Premium entitlement is intentionally **not** stored in normal CoastCast backup/cloud payloads. At launch, paid, family, complimentary and lifetime access must come from the authenticated server-side entitlement record. See `PREMIUM_ARCHITECTURE.md` and `ENTITLEMENT_SETUP.sql`.
