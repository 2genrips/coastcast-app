# CastVector v5.4 — Community Live

## New
- Realtime signed-in fishing chat backed by the existing Supabase project.
- Approximate live angler count using Supabase Realtime Presence.
- Four launch channels: General, Tips & Rigs, Local Conditions, and App Help.
- Public chat nickname separate from email.
- Replies, message deletion for your own messages, reporting, blocking and unblock controls.
- Owner/admin message removal hook and backend ban/unban RPC foundation.
- Server-enforced 3-second anti-spam rate limit and 600-character message limit.
- Staff badge is assigned by the server, not trusted from the browser.
- Community chat does not automatically attach exact fishing coordinates.
- Privacy Policy and Terms updated for live chat, reports, blocks and temporary online presence.

## Access model
Community Live is available to signed-in CastVector accounts, including Free accounts. This is intentional: the community should be useful and active without putting normal conversation behind Premium. Premium remains focused on advanced fishing intelligence and planning tools.

## Backend activation
Run `CASTVECTOR_COMMUNITY_LIVE_SETUP_ANDROID.txt` in the same Supabase SQL Editor used for CastVector v5.0. The script is safe to re-run.

## Important
Online count is approximate. It represents connected CastVector Community Live sessions and is not a count of every person who has the app installed.
