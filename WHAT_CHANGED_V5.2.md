# AnglerSignal v5.2 — Public Brand Rename

- Public product renamed from CoastCast to **AnglerSignal**.
- Store title: **AnglerSignal Fishing Forecast**.
- Existing compass/fish/wave emblem, color palette and tagline are preserved.
- Header, Premium wording, account screens, family access, Owner Console, catch cards, legal pages, store listing drafts and PWA manifest use the new public name.
- Native package/bundle ID changed to `com.anglersignal.fishing` before store records are created.
- Versioned PWA icons now use v5.2 filenames to force a fresh install manifest read.
- Existing Supabase database/functions and `coastcast-config.js` filename remain as legacy technical identifiers so the already-working account/Premium backend does not break.
- The live `coastcast-config.js` is intentionally not included in this ZIP, preserving the user's current Supabase configuration on GitHub.
