# CastVector v5.4 — Android update

## What this build adds
Community Live: realtime fishing chat, online angler count, channels, replies, reports, blocks and moderation hooks.

## Update from v5.3
1. Download and extract the v5.4 ZIP.
2. Upload everything inside the `castvector_v5.4_community_live` folder to the root of your existing GitHub repository.
3. Replace matching files and commit to `main`.
4. **Do not delete your existing `coastcast-config.js`.** This ZIP intentionally does not contain it.
5. In Supabase run `CASTVECTOR_COMMUNITY_LIVE_SETUP_ANDROID.txt` using SQL Editor.
6. Wait for GitHub Pages, fully close CastVector, and reopen it.

## First test
- Confirm your Owner account still shows Lifetime Premium.
- Open Community Live.
- Save a public chat nickname.
- Send a General message.
- On a second signed-in account, open Community Live and confirm the message appears without refreshing.
- Confirm the online angler count increases.
- Test Reply, Report and Block.

Community chat is open to signed-in Free and Premium users. Premium fishing intelligence remains the paid value proposition.
