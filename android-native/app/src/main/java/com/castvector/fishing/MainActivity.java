package com.castvector.fishing;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;\nimport android.appwidget.AppWidgetManager;
import android.content.ActivityNotFoundException;
import android.content.Context;\nimport android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;
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

import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.ExistingWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import org.json.JSONObject;

import java.net.URI;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

public class MainActivity extends Activity {
    private static final int REQ_LOCATION = 41;
    private static final int REQ_FILE = 42;
    private static final int REQ_NOTIFICATIONS = 43;

    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private BillingManager billingManager;
    private String pendingGeoOrigin;
    private GeolocationPermissions.Callback pendingGeoCallback;

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
                    pendingGeoOrigin = origin;
                    pendingGeoCallback = callback;
                    requestPermissions(new String[]{
                            Manifest.permission.ACCESS_COARSE_LOCATION,
                            Manifest.permission.ACCESS_FINE_LOCATION
                    }, REQ_LOCATION);
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
                + "window.CastVectorNative.requestNotificationPermission=function(){return CastVectorAndroidBridge.requestNotificationPermission();};"
                + "window.CastVectorNative.enableSafetyWatch=function(lat,lon,name){return CastVectorAndroidBridge.enableSafetyWatch(Number(lat),Number(lon),String(name||''));};"
                + "window.CastVectorNative.disableSafetyWatch=function(){return CastVectorAndroidBridge.disableSafetyWatch();};"
                + "window.CastVectorNative.checkSafetyWatchNow=function(){return CastVectorAndroidBridge.checkSafetyWatchNow();};"
                + "window.CastVectorNative.getSafetyWatchStatus=function(){return CastVectorAndroidBridge.getSafetyWatchStatus();};"
                + "window.CastVectorNative.enableOpportunityWatch=function(lat,lon,name,species,minWater,maxWater,threshold,coast){return CastVectorAndroidBridge.enableOpportunityWatch(Number(lat),Number(lon),String(name||''),String(species||''),Number(minWater),Number(maxWater),Number(threshold),!!coast);};"
                + "window.CastVectorNative.disableOpportunityWatch=function(){return CastVectorAndroidBridge.disableOpportunityWatch();};"
                + "window.CastVectorNative.checkOpportunityWatchNow=function(){return CastVectorAndroidBridge.checkOpportunityWatchNow();};"
                + "window.CastVectorNative.getOpportunityWatchStatus=function(){return CastVectorAndroidBridge.getOpportunityWatchStatus();};"
                + "window.CastVectorNative.pinFishingWidget=function(){return CastVectorAndroidBridge.pinFishingWidget();};"
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

    private void scheduleSafetyWatch(double lat, double lon, String name) {
        SharedPreferences prefs = getSharedPreferences(WeatherWatchWorker.PREFS, MODE_PRIVATE);
        prefs.edit()
                .putBoolean("watch_enabled", true)
                .putLong("watch_lat_bits", Double.doubleToRawLongBits(lat))
                .putLong("watch_lon_bits", Double.doubleToRawLongBits(lon))
                .putString("watch_name", name == null || name.trim().isEmpty() ? "Selected fishing location" : name.trim())
                .apply();

        WeatherWatchWorker.ensureChannel(this);
        Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build();

        PeriodicWorkRequest periodic = new PeriodicWorkRequest.Builder(
                WeatherWatchWorker.class,
                30,
                TimeUnit.MINUTES
        ).setConstraints(constraints).build();

        WorkManager manager = WorkManager.getInstance(this);
        manager.enqueueUniquePeriodicWork(
                WeatherWatchWorker.UNIQUE_WORK,
                ExistingPeriodicWorkPolicy.UPDATE,
                periodic
        );

        OneTimeWorkRequest now = new OneTimeWorkRequest.Builder(WeatherWatchWorker.class)
                .setConstraints(constraints)
                .build();
        manager.enqueueUniqueWork(
                WeatherWatchWorker.UNIQUE_WORK + "_now",
                ExistingWorkPolicy.REPLACE,
                now
        );
    }

    private void scheduleOpportunityWatch(double lat, double lon, String name, String species,
                                          double idealMin, double idealMax, int threshold, boolean coast) {
        SharedPreferences prefs = getSharedPreferences(FishingOpportunityWorker.PREFS, MODE_PRIVATE);
        prefs.edit()
                .putBoolean("opp_enabled", true)
                .putLong("opp_lat_bits", Double.doubleToRawLongBits(lat))
                .putLong("opp_lon_bits", Double.doubleToRawLongBits(lon))
                .putString("opp_name", name == null || name.trim().isEmpty() ? "Watched water" : name.trim())
                .putString("opp_species", species == null || species.trim().isEmpty() ? "Target species" : species.trim())
                .putLong("opp_ideal_min_bits", Double.doubleToRawLongBits(idealMin))
                .putLong("opp_ideal_max_bits", Double.doubleToRawLongBits(idealMax))
                .putInt("opp_threshold", Math.max(60, Math.min(95, threshold)))
                .putBoolean("opp_coast", coast)
                .apply();

        FishingOpportunityWorker.ensureChannel(this);
        Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build();

        PeriodicWorkRequest periodic = new PeriodicWorkRequest.Builder(
                FishingOpportunityWorker.class,
                3,
                TimeUnit.HOURS
        ).setConstraints(constraints).build();

        WorkManager manager = WorkManager.getInstance(this);
        manager.enqueueUniquePeriodicWork(
                FishingOpportunityWorker.UNIQUE_WORK,
                ExistingPeriodicWorkPolicy.UPDATE,
                periodic
        );

        OneTimeWorkRequest now = new OneTimeWorkRequest.Builder(FishingOpportunityWorker.class)
                .setConstraints(constraints)
                .build();
        manager.enqueueUniqueWork(
                FishingOpportunityWorker.UNIQUE_WORK + "_now",
                ExistingWorkPolicy.REPLACE,
                now
        );
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
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_LOCATION && pendingGeoCallback != null) {
            boolean granted =
                    checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                    checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
            pendingGeoCallback.invoke(pendingGeoOrigin == null ? "" : pendingGeoOrigin, granted, false);
            pendingGeoOrigin = null;
            pendingGeoCallback = null;
        }
        if (requestCode == REQ_NOTIFICATIONS && webView != null) {
            boolean granted = Build.VERSION.SDK_INT < 33 ||
                    checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
            String js = "window.dispatchEvent(new CustomEvent('castvector:notification-permission',{detail:{granted:" + granted + "}}));";
            webView.evaluateJavascript(js, null);
        }
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
        public String requestNotificationPermission() {
            if (Build.VERSION.SDK_INT < 33 ||
                    checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
                if (webView != null) {
                    webView.post(() -> webView.evaluateJavascript(
                            "window.dispatchEvent(new CustomEvent('castvector:notification-permission',{detail:{granted:true}}));",
                            null
                    ));
                }
                return "granted";
            }
            runOnUiThread(() -> requestPermissions(
                    new String[]{Manifest.permission.POST_NOTIFICATIONS},
                    REQ_NOTIFICATIONS
            ));
            return "requested";
        }

        @JavascriptInterface
        public String enableSafetyWatch(double lat, double lon, String name) {
            if (!Double.isFinite(lat) || !Double.isFinite(lon)) return "invalid_location";
            if (Build.VERSION.SDK_INT >= 33 &&
                    checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                return "permission_required";
            }
            scheduleSafetyWatch(lat, lon, name);
            return "enabled";
        }

        @JavascriptInterface
        public String disableSafetyWatch() {
            SharedPreferences prefs = getSharedPreferences(WeatherWatchWorker.PREFS, MODE_PRIVATE);
            prefs.edit().putBoolean("watch_enabled", false).apply();
            WorkManager.getInstance(MainActivity.this).cancelUniqueWork(WeatherWatchWorker.UNIQUE_WORK);
            WorkManager.getInstance(MainActivity.this).cancelUniqueWork(WeatherWatchWorker.UNIQUE_WORK + "_now");
            return "disabled";
        }

        @JavascriptInterface
        public String checkSafetyWatchNow() {
            SharedPreferences prefs = getSharedPreferences(WeatherWatchWorker.PREFS, MODE_PRIVATE);
            if (!prefs.getBoolean("watch_enabled", false)) return "disabled";
            Constraints constraints = new Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build();
            OneTimeWorkRequest request = new OneTimeWorkRequest.Builder(WeatherWatchWorker.class)
                    .setConstraints(constraints)
                    .build();
            WorkManager.getInstance(MainActivity.this).enqueueUniqueWork(
                    WeatherWatchWorker.UNIQUE_WORK + "_now",
                    ExistingWorkPolicy.REPLACE,
                    request
            );
            return "queued";
        }

        @JavascriptInterface
        public String getSafetyWatchStatus() {
            try {
                SharedPreferences prefs = getSharedPreferences(WeatherWatchWorker.PREFS, MODE_PRIVATE);
                JSONObject out = new JSONObject();
                out.put("available", true);
                out.put("enabled", prefs.getBoolean("watch_enabled", false));
                out.put("name", prefs.getString("watch_name", ""));
                out.put("lastChecked", prefs.getLong("watch_last_checked", 0L));
                out.put("lastAlertCount", prefs.getInt("watch_last_alert_count", 0));
                out.put("lastStatus", prefs.getString("watch_last_status", "idle"));
                out.put("lastError", prefs.getString("watch_last_error", ""));
                out.put("lastEvent", prefs.getString("watch_last_event", ""));
                boolean granted = Build.VERSION.SDK_INT < 33 ||
                        checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
                out.put("notificationGranted", granted);
                return out.toString();
            } catch (Exception e) {
                return "{\"available\":true,\"enabled\":false,\"lastStatus\":\"error\"}";
            }
        }

        @JavascriptInterface
        public String enableOpportunityWatch(double lat, double lon, String name, String species,
                                             double idealMin, double idealMax, double threshold, boolean coast) {
            if (!Double.isFinite(lat) || !Double.isFinite(lon)) return "invalid_location";
            if (Build.VERSION.SDK_INT >= 33 &&
                    checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                return "permission_required";
            }
            scheduleOpportunityWatch(
                    lat,
                    lon,
                    name,
                    species,
                    idealMin,
                    idealMax,
                    (int)Math.round(threshold),
                    coast
            );
            return "enabled";
        }

        @JavascriptInterface
        public String disableOpportunityWatch() {
            SharedPreferences prefs = getSharedPreferences(FishingOpportunityWorker.PREFS, MODE_PRIVATE);
            prefs.edit().putBoolean("opp_enabled", false).apply();
            WorkManager.getInstance(MainActivity.this).cancelUniqueWork(FishingOpportunityWorker.UNIQUE_WORK);
            WorkManager.getInstance(MainActivity.this).cancelUniqueWork(FishingOpportunityWorker.UNIQUE_WORK + "_now");
            return "disabled";
        }

        @JavascriptInterface
        public String checkOpportunityWatchNow() {
            SharedPreferences prefs = getSharedPreferences(FishingOpportunityWorker.PREFS, MODE_PRIVATE);
            if (!prefs.getBoolean("opp_enabled", false)) return "disabled";
            Constraints constraints = new Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build();
            OneTimeWorkRequest request = new OneTimeWorkRequest.Builder(FishingOpportunityWorker.class)
                    .setConstraints(constraints)
                    .build();
            WorkManager.getInstance(MainActivity.this).enqueueUniqueWork(
                    FishingOpportunityWorker.UNIQUE_WORK + "_now",
                    ExistingWorkPolicy.REPLACE,
                    request
            );
            return "queued";
        }

        @JavascriptInterface
        public String getOpportunityWatchStatus() {
            try {
                SharedPreferences prefs = getSharedPreferences(FishingOpportunityWorker.PREFS, MODE_PRIVATE);
                JSONObject out = new JSONObject();
                out.put("available", true);
                out.put("enabled", prefs.getBoolean("opp_enabled", false));
                out.put("name", prefs.getString("opp_name", ""));
                out.put("species", prefs.getString("opp_species", ""));
                out.put("threshold", prefs.getInt("opp_threshold", 80));
                out.put("lastChecked", prefs.getLong("opp_last_checked", 0L));
                out.put("lastScore", prefs.getInt("opp_last_score", -1));
                out.put("lastBestTime", prefs.getString("opp_last_best_time", ""));
                out.put("lastStatus", prefs.getString("opp_last_status", "idle"));
                out.put("lastError", prefs.getString("opp_last_error", ""));
                out.put("lastDetail", prefs.getString("opp_last_detail", ""));
                boolean granted = Build.VERSION.SDK_INT < 33 ||
                        checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
                out.put("notificationGranted", granted);
                return out.toString();
            } catch (Exception e) {
                return "{\"available\":true,\"enabled\":false,\"lastStatus\":\"error\"}";
            }
        }

        @JavascriptInterface
        public String pinFishingWidget() {
            try {
                AppWidgetManager manager = AppWidgetManager.getInstance(MainActivity.this);
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || !manager.isRequestPinAppWidgetSupported()) {
                    return "unsupported";
                }
                ComponentName provider = new ComponentName(MainActivity.this, CastVectorWidgetProvider.class);
                boolean requested = manager.requestPinAppWidget(provider, null, null);
                return requested ? "requested" : "unavailable";
            } catch (Exception e) {
                return "error";
            }
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
