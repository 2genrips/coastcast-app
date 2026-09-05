# CastVector v5.5 — Community Pro + Launch Moderation

CastVector v5.5 upgrades the working Community Live system without changing your existing Supabase project, Owner account, Lifetime Premium, complimentary users, fishing data, or `coastcast-config.js`.

## Existing v5.4 users
1. Run `CASTVECTOR_COMMUNITY_V5.5_UPGRADE_ANDROID.txt` in Supabase -> SQL Editor.
2. Upload everything inside this folder to the same GitHub Pages repository and replace matching files.
3. Keep the existing `coastcast-config.js`; this package intentionally does not include it.
4. Commit to `main`, wait for Pages, fully close CastVector, and reopen it.

## Test
- Trips should show the Community Live online count.
- Community should show channel unread badges, typing status, pinned staff messages, Rules, and Safety.
- Profile -> Owner Console should show Community Moderation for the Owner account.
- Use two phones/accounts to verify realtime chat, typing, online count, reports, and a temporary mute.

## Fresh Community install
For a Supabase project that never had Community Live installed, run the combined `CASTVECTOR_COMMUNITY_LIVE_SETUP_ANDROID.txt` instead of the smaller upgrade file.
