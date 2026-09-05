package com.castvector.fishing;

import android.app.Activity;
import android.webkit.WebView;
import android.widget.Toast;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryProductDetailsResult;
import com.android.billingclient.api.QueryPurchasesParams;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class BillingManager implements PurchasesUpdatedListener {
    // Server verification performs required subscription acknowledgement before paid access is finalized.
    private final Activity activity;
    private final WebView webView;
    private BillingClient billingClient;
    private ProductDetails premiumDetails;

    BillingManager(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        connect();
    }

    private void connect() {
        PendingPurchasesParams pending = PendingPurchasesParams.newBuilder()
                .enableOneTimeProducts()
                .build();

        billingClient = BillingClient.newBuilder(activity)
                .setListener(this)
                .enablePendingPurchases(pending)
                .build();

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    queryPremiumDetails();
                    restorePurchases(false);
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                emit("castvector:billing-status", json("status", "disconnected"));
            }
        });
    }

    private void queryPremiumDetails() {
        QueryProductDetailsParams.Product product =
                QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(BuildConfig.PREMIUM_PRODUCT_ID)
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build();

        QueryProductDetailsParams params =
                QueryProductDetailsParams.newBuilder()
                        .setProductList(Collections.singletonList(product))
                        .build();

        billingClient.queryProductDetailsAsync(params, (billingResult, queryResult) -> {
            if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                List<ProductDetails> list = queryResult.getProductDetailsList();
                if (list != null && !list.isEmpty()) {
                    premiumDetails = list.get(0);
                    String price = "";
                    List<ProductDetails.SubscriptionOfferDetails> offers = premiumDetails.getSubscriptionOfferDetails();
                    if (offers != null && !offers.isEmpty()
                            && offers.get(0).getPricingPhases() != null
                            && !offers.get(0).getPricingPhases().getPricingPhaseList().isEmpty()) {
                        price = offers.get(0).getPricingPhases().getPricingPhaseList().get(0).getFormattedPrice();
                    }
                    JSONObject o = new JSONObject();
                    try {
                        o.put("status", "ready");
                        o.put("productId", BuildConfig.PREMIUM_PRODUCT_ID);
                        o.put("price", price);
                    } catch (Exception ignored) {}
                    emit("castvector:billing-status", o.toString());
                } else {
                    emit("castvector:billing-status", json("status", "product_unavailable"));
                }
            } else {
                emit("castvector:billing-status", json("status", "query_failed"));
            }
        });
    }

    void launchPremiumPurchase() {
        if (billingClient == null || !billingClient.isReady()) {
            Toast.makeText(activity, "Google Play Billing is connecting. Try again in a moment.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (premiumDetails == null) {
            queryPremiumDetails();
            Toast.makeText(activity, "Premium purchase is not ready yet.", Toast.LENGTH_SHORT).show();
            return;
        }

        List<ProductDetails.SubscriptionOfferDetails> offers = premiumDetails.getSubscriptionOfferDetails();
        if (offers == null || offers.isEmpty()) {
            Toast.makeText(activity, "No active Premium offer was found in Google Play.", Toast.LENGTH_LONG).show();
            return;
        }

        BillingFlowParams.ProductDetailsParams productParams =
                BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(premiumDetails)
                        .setOfferToken(offers.get(0).getOfferToken())
                        .build();

        BillingFlowParams flowParams = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(productParams))
                .build();

        BillingResult result = billingClient.launchBillingFlow(activity, flowParams);
        if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
            Toast.makeText(activity, "Unable to start Google Play purchase.", Toast.LENGTH_LONG).show();
        }
    }

    void restorePurchases(boolean notifyUser) {
        if (billingClient == null || !billingClient.isReady()) return;

        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build();

        billingClient.queryPurchasesAsync(params, (result, purchases) -> {
            if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                boolean found = false;
                for (Purchase p : purchases) {
                    if (p.getProducts().contains(BuildConfig.PREMIUM_PRODUCT_ID)) {
                        found = true;
                        emitPurchase(p, "restore");
                    }
                }
                if (notifyUser) {
                    Toast.makeText(activity,
                            found ? "Premium purchase found. Verifying access..." : "No active CastVector Premium purchase found.",
                            Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase purchase : purchases) emitPurchase(purchase, "purchase");
        } else if (result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            emit("castvector:billing-status", json("status", "canceled"));
        } else {
            emit("castvector:billing-status", json("status", "purchase_failed"));
        }
    }

    private void emitPurchase(Purchase purchase, String source) {
        JSONObject o = new JSONObject();
        try {
            o.put("source", source);
            o.put("productId", BuildConfig.PREMIUM_PRODUCT_ID);
            o.put("purchaseToken", purchase.getPurchaseToken());
            o.put("purchaseState", purchase.getPurchaseState());
            o.put("acknowledged", purchase.isAcknowledged());
        } catch (Exception ignored) {}
        emit("castvector:play-purchase", o.toString());
    }

    private void emit(String eventName, String json) {
        String js = "window.dispatchEvent(new CustomEvent(" +
                JSONObject.quote(eventName) + ",{detail:" + json + "}));";
        activity.runOnUiThread(() -> webView.evaluateJavascript(js, null));
    }

    private String json(String key, String value) {
        JSONObject o = new JSONObject();
        try { o.put(key, value); } catch (Exception ignored) {}
        return o.toString();
    }

    void destroy() {
        if (billingClient != null) billingClient.endConnection();
    }
}
