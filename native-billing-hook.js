(() => {
  // CastVector native billing bridge.
  // This file does NOT grant Premium itself. It forwards a Google Play purchase
  // token to the existing server-side verification flow.
  window.addEventListener('castvector:play-purchase', async (event) => {
    const detail = event?.detail || {};
    if (!detail.purchaseToken) return;

    window.dispatchEvent(new CustomEvent('castvector:premium-verification-needed', {
      detail: {
        platform: 'google_play',
        productId: detail.productId || 'castvector_premium_monthly',
        purchaseToken: detail.purchaseToken
      }
    }));
  });

  window.CastVectorPlay = {
    available() {
      return !!(window.CastVectorNative && window.CastVectorNative.isAndroid);
    },
    buyPremium() {
      if (!this.available()) throw new Error('Google Play Billing is only available in the Android app.');
      window.CastVectorNative.buyPremium();
    },
    restore() {
      if (!this.available()) throw new Error('Google Play Billing is only available in the Android app.');
      window.CastVectorNative.restorePurchases();
    }
  };
})();
