# CastVector v5.5 — Community Pro + Launch Moderation

## New community features
- Live unread counters for Community Live and each chat channel.
- Live anglers-online count is surfaced on the Trips community card before opening Community.
- Realtime typing indicator using Supabase Realtime broadcast.
- Staff-pinned message for each channel.
- First-post Community Rules acknowledgement.
- Improved posting restriction feedback for muted users.

## Owner moderation
The existing server-verified Owner account now gets a Community Moderation section inside Owner Console:
- open report count and report queue
- remove reported messages
- dismiss reports
- 24-hour mute directly from a report
- active mute list
- unmute controls
- pin/unpin staff messages
- mute a user directly from a chat message

## Privacy / safety
- Chat presence remains approximate and does not attach exact fishing coordinates.
- Typing signals are realtime/transient and are not stored as chat history.
- Community rules prohibit harassment, spam, privacy-invasive posts, illegal activity, and knowingly unsafe advice.
- Normal Community Live conversation remains available to signed-in Free users; core social participation is not paywalled.

## Backend step
Existing v5.4 users only need to run:
`CASTVECTOR_COMMUNITY_V5.5_UPGRADE_ANDROID.txt`

Fresh installs can run the combined:
`CASTVECTOR_COMMUNITY_LIVE_SETUP_ANDROID.txt`
