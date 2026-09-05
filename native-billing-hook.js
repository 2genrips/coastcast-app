(() => {
  'use strict';

  const app = () => window.CastVector;
  const cfg = () => window.COASTCAST_CONFIG || {};

  window.CastVectorPlay = window.CastVectorPlay || {
    available() {
      return !!(window.CastVectorNative && window.CastVectorNative.isAndroid && typeof window.CastVectorNative.buyPremium === 'function');
    },
    buyPremium() {
      if (!this.available()) throw new Error('Google Play Billing is only available inside the CastVector Android app.');
      window.CastVectorNative.buyPremium();
    },
    restore() {
      if (!this.available()) throw new Error('Google Play Billing is only available inside the CastVector Android app.');
      window.CastVectorNative.restorePurchases();
    }
  };

  function syncAccountButtonLabel() {
    const button = document.getElementById('cloudSetupBtn');
    if (!button) return;
    const cv = app();
    const signedIn = !!cv?.cloudSignedIn?.();
    button.textContent = signedIn ? 'Manage account' : 'Sign in / create account';
  }

  function watchAccountState() {
    syncAccountButtonLabel();
    const target = document.getElementById('serverAccessSummary') || document.getElementById('serverAccessBadge');
    if (!target || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(syncAccountButtonLabel);
    observer.observe(target, {subtree:true, childList:true, characterData:true, attributes:true});
  }

  async function verifyPurchase(detail) {
    const cv = app();
    if (!cv || !detail?.purchaseToken) return;

    if (Number(detail.purchaseState) !== 1) {
      cv.showToast?.('Purchase is still pending. Premium will unlock after Google Play confirms payment.');
      return;
    }

    if (!cv.cloudSignedIn?.()) {
      cv.showToast?.('Sign in to CastVector, then restore the purchase so it can be verified.');
      return;
    }

    const c = cv.state?.cloud || {};
    try {
      cv.$?.('storePurchaseStatus') && (cv.$('storePurchaseStatus').textContent = 'Verifying purchase securely with Google Play…');
      const res = await fetch(`${c.url}/functions/v1/verify-play-subscription`, {
        method: 'POST',
        headers: {
          'apikey': c.anonKey,
          'Authorization': `Bearer ${c.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          purchaseToken: detail.purchaseToken,
          productId: detail.productId || cfg().premiumProductId || 'castvector_premium_monthly'
        })
      });
      let body = {};
      try { body = await res.json(); } catch (_) {}
      if (!res.ok || !body?.ok) throw new Error(body?.error || 'Purchase verification failed');

      await cv.refreshServerAccess?.({quiet:true});
      cv.updateStoreBillingUI?.({status:'ready'});
      syncAccountButtonLabel();
      cv.showToast?.(body.premium ? 'CastVector Premium is active.' : 'Purchase verified, but Premium is not active yet.');
    } catch (err) {
      cv.showToast?.(err?.message || 'Could not verify Google Play purchase.');
      const el = cv.$?.('storePurchaseStatus');
      if (el) el.textContent = 'Purchase verification needs attention. Use Restore purchase after checking your connection.';
    }
  }

  window.addEventListener('castvector:billing-status', (event) => {
    app()?.updateStoreBillingUI?.(event?.detail || {});
  });

  window.addEventListener('castvector:play-purchase', (event) => {
    verifyPurchase(event?.detail || {});
  });

  window.addEventListener('castvector:native-ready', () => {
    app()?.updateStoreBillingUI?.({status:'connecting'});
    syncAccountButtonLabel();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchAccountState, {once:true});
  } else {
    watchAccountState();
  }

  setTimeout(() => {
    app()?.updateStoreBillingUI?.({status: window.CastVectorPlay.available() ? 'connecting' : 'web'});
    syncAccountButtonLabel();
  }, 250);
  setTimeout(syncAccountButtonLabel, 1200);
})();
