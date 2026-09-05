# CastVector v5.5 — Android update

You already have Community Live v5.4 working, so do not recreate accounts or Premium access.

1. In Supabase -> SQL Editor -> New query, run `CASTVECTOR_COMMUNITY_V5.5_UPGRADE_ANDROID.txt`.
2. Upload the v5.5 app files to the same GitHub Pages repository, replacing matching files.
3. Keep your existing `coastcast-config.js`. This package does not contain it.
4. Commit to `main`, wait for GitHub Pages, fully close CastVector, then reopen it.
5. Test Community -> General with two signed-in phones.
6. Open Profile -> Owner Console to test the Community Moderation section.

If the upgrade SQL is not run, normal chat can still load, but pinned messages and the Owner moderation dashboard will show that the v5.5 backend upgrade is required.
