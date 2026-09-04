# CastVector Background Alerts — backend foundation

v5.3 creates a `coastcast_push_subscriptions` table and keeps the PWA service worker push-ready.

For true closed-app alerts, production still needs:
1. A VAPID key pair.
2. Browser push-subscription registration from CastVector.
3. A trusted scheduled backend worker that evaluates saved forecast watches.
4. Web Push delivery to matching subscriptions.
5. For the Google Play packaged app, notification permission and Android-specific testing.

Do not put VAPID private keys, Supabase secret keys or other backend credentials in GitHub Pages.
