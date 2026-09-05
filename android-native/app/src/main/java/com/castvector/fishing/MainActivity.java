package com.castvector.fishing;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;
import android.webkit.SafeBrowsingResponse;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import java.net.URI;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final int REQ_LOCATION = 41;
    private static final int REQ_FILE = 42;

    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private BillingManager billingManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final int appBackground = Color.rgb(6, 17, 29);
        getWindow().setStatusBarColor(appBackground);
        getWindow().setNavigationBarColor(appBackground);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(appBackground);

        webView = new WebView(this);
        webView.setBackgroundColor(appBackground);
        FrameLayout.LayoutParams webParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        );
        root.addView(webView, webParams);

        root.setOnApplyWindowInsetsListener((view, insets) -> {
            int topInset;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                topInset = insets.getInsetsIgnoringVisibility(
                        WindowInsets.Type.statusBars() | WindowInsets.Type.displayCutout()
                ).top;
            } else {
                topInset = Math.max(0, insets.getStableInsetTop());
            }

            FrameLayout.LayoutParams lp = (FrameLayout.LayoutParams) webView.getLayoutParams();
            if (lp.topMargin != topInset) {
                lp.topMargin = topInset;
                webView.setLayoutParams(lp);
            }
            return insets;
        });

        setContentView(root);
        root.requestApplyInsets();

        configureWebView();
        billingManager = new BillingManager(this, webView);
        webView.addJavascriptInterface(new NativeBridge(), "CastVectorAndroidBridge");

        String url = BuildConfig.CASTVECTOR_WEB_URL;
        if (url == null || url.contains("YOUR_") || !url.startsWith("https://")) {
            showConfigurationPage();
        } else {
            webView.loadUrl(url);
        }
    }

    private void configureWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setGeolocationEnabled(true);
        s.setLoadsImagesAutomatically(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setUserAgentString(s.getUserAgentString() + " CastVectorAndroid/" + BuildConfig.VERSION_NAME);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.US);
                if ("https".equals(scheme) || "http".equals(scheme)) {
                    try {
                        URI app = URI.create(BuildConfig.CASTVECTOR_WEB_URL);
                        if (app.getHost() != null && app.getHost().equalsIgnoreCase(uri.getHost())) {
                            return false;
                        }
                    } catch (Exception ignored) {}
                    openExternal(uri);
                    return true;
                }
                if ("mailto".equals(scheme) || "tel".equals(scheme) || "geo".equals(scheme)) {
                    openExternal(uri);
                    return true;
                }
                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                injectNativeHelpers();
            }

            @Override
            public void onSafeBrowsingHit(WebView view, WebResourceRequest request, int threatType, SafeBrowsingResponse callback) {
                callback.backToSafety(true);
                Toast.makeText(MainActivity.this, "CastVector blocked an unsafe page.", Toast.LENGTH_LONG).show();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                    checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    callback.invoke(origin, true, false);
                } else {
                    requestPermissions(new String[]{
                            Manifest.permission.ACCESS_COARSE_LOCATION,
                            Manifest.permission.ACCESS_FINE_LOCATION
                    }, REQ_LOCATION);
                    callback.invoke(origin, false, false);
                }
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent intent = params.createIntent();
                try {
                    startActivityForResult(intent, REQ_FILE);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    Toast.makeText(MainActivity.this, "No file picker is available.", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });

        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
            try {
                DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
                req.addRequestHeader("User-Agent", userAgent);
                req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                String ext = MimeTypeMap.getSingleton().getExtensionFromMimeType(mimeType);
                String name = "CastVector-download" + (ext == null ? "" : "." + ext);
                req.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
                ((DownloadManager) getSystemService(DOWNLOAD_SERVICE)).enqueue(req);
                Toast.makeText(this, "Download started.", Toast.LENGTH_SHORT).show();
            } catch (Exception e) {
                openExternal(Uri.parse(url));
            }
        });
    }

    private void injectNativeHelpers() {
        String js = "(function(){"
                + "window.CastVectorNative=window.CastVectorNative||{};"
                + "window.CastVectorNative.isAndroid=true;"
                + "window.CastVectorNative.version='" + BuildConfig.VERSION_NAME + "';"
                + "window.CastVectorNative.buyPremium=function(){CastVectorAndroidBridge.buyPremium();};"
                + "window.CastVectorNative.restorePurchases=function(){CastVectorAndroidBridge.restorePurchases();};"
                + "window.dispatchEvent(new CustomEvent('castvector:native-ready',{detail:{platform:'android',version:'" + BuildConfig.VERSION_NAME + "'}}));"
                + "})();";
        webView.evaluateJavascript(js, null);
    }

    private void openExternal(Uri uri) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (Exception e) {
            Toast.makeText(this, "Unable to open link.", Toast.LENGTH_SHORT).show();
        }
    }

    private void showConfigurationPage() {
        String html = "<html><body style='background:#06111d;color:#eaf8ff;font-family:sans-serif;padding:28px'>"
                + "<h2>CastVector Android setup</h2>"
                + "<p>The app URL has not been configured.</p>"
                + "<p>Edit <b>gradle.properties</b> and set <code>CASTVECTOR_WEB_URL</code> to your live HTTPS GitHub Pages URL, then rebuild.</p>"
                + "</body></html>";
        webView.loadDataWithBaseURL(null, html, "text/html", "utf-8", null);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (billingManager != null) billingManager.restorePurchases(false);
    }

    @Override
    protected void onDestroy() {
        if (billingManager != null) billingManager.destroy();
        if (webView != null) webView.destroy();
        super.onDestroy();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_FILE) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null) {
                if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    result = new Uri[count];
                    for (int i = 0; i < count; i++) result[i] = data.getClipData().getItemAt(i).getUri();
                } else if (data.getData() != null) {
                    result = new Uri[]{data.getData()};
                }
            }
            if (fileCallback != null) fileCallback.onReceiveValue(result);
            fileCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    public class NativeBridge {
        @JavascriptInterface
        public void buyPremium() {
            runOnUiThread(() -> billingManager.launchPremiumPurchase());
        }

        @JavascriptInterface
        public void restorePurchases() {
            runOnUiThread(() -> billingManager.restorePurchases(true));
        }

        @JavascriptInterface
        public String getVersion() {
            return BuildConfig.VERSION_NAME;
        }

        @JavascriptInterface
        public String openAppSettings() {
            try {
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.parse("package:" + getPackageName()));
                startActivity(intent);
                return "ok";
            } catch (Exception e) {
                return "error";
            }
        }
    }
}
