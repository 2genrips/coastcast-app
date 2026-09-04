// AnglerSignal public frontend configuration.
// Supabase project URL and publishable key are safe to ship in a browser app when RLS is configured.
// NEVER put Supabase secret/service-role keys, Google service-account JSON, or VAPID private keys here.
window.COASTCAST_CONFIG = Object.freeze({
  supabaseUrl: '',
  supabasePublishableKey: '',
  premiumProductId: 'coastcast_premium_monthly',
  premiumMonthlyPrice: '$4.99',
  vapidPublicKey: '',
  supportEmail: '',
  legalEntity: '',
  storeDisplayName: 'AnglerSignal Fishing Forecast',
  appPackageId: 'com.anglersignal.fishing'
});
