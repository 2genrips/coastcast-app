package com.castvector.fishing;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public class WeatherWatchWorker extends Worker {
    public static final String PREFS = "castvector_native";
    public static final String UNIQUE_WORK = "castvector_background_weather_watch";
    public static final String CHANNEL_ID = "castvector_safety_alerts";
    public static final String FISHING_CHANNEL_ID = "castvector_fishing_windows";

    public WeatherWatchWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!prefs.getBoolean("watch_enabled", false)) {
            CastVectorWidgetProvider.updateAll(context);
            return Result.success();
        }

        double lat = Double.longBitsToDouble(prefs.getLong("watch_lat_bits", Double.doubleToLongBits(Double.NaN)));
        double lon = Double.longBitsToDouble(prefs.getLong("watch_lon_bits", Double.doubleToLongBits(Double.NaN)));
        String name = prefs.getString("watch_name", "Selected fishing location");
        if (!Double.isFinite(lat) || !Double.isFinite(lon)) return Result.success();

        try {
            NwsResult nws = checkNws(context, prefs, lat, lon, name);

            WindowResult window = null;
            if (prefs.getBoolean("fishing_watch_enabled", false)) {
                try {
                    window = findFishingWindow(prefs, lat, lon);
                    saveWindow(prefs, window);
                    if (window != null && window.qualified && !nws.highImpact) {
                        String species = prefs.getString("watch_species", "Fishing");
                        String key = species + "|" + window.timeRaw;
                        String priorKey = prefs.getString("watch_last_window_key", "");
                        if (!key.equals(priorKey)) {
                            postFishingNotification(context, species, name, window);
                            prefs.edit().putString("watch_last_window_key", key).apply();
                        }
                    }
                } catch (RetryableException e) {
                    saveStatus(prefs, "retry", nws.count, e.getMessage(), nws.latestEvent);
                    CastVectorWidgetProvider.updateAll(context);
                    return Result.retry();
                } catch (Exception e) {
                    prefs.edit()
                            .putString("watch_last_status", "weather_error")
                            .putString("watch_last_error", e.getMessage() == null ? "Background fishing forecast failed" : e.getMessage())
                            .apply();
                }
            }

            prefs.edit()
                    .putLong("watch_last_checked", System.currentTimeMillis())
                    .putInt("watch_last_alert_count", nws.count)
                    .putString("watch_last_status", nws.highImpact ? "warning" : "ok")
                    .putString("watch_last_error", "")
                    .putString("watch_last_event", nws.latestEvent)
                    .apply();

            CastVectorWidgetProvider.updateAll(context);
            return Result.success();
        } catch (RetryableException e) {
            saveStatus(prefs, "retry", 0, e.getMessage(), "");
            CastVectorWidgetProvider.updateAll(context);
            return Result.retry();
        } catch (Exception e) {
            saveStatus(prefs, "error", 0, e.getMessage() == null ? "Weather watch failed" : e.getMessage(), "");
            CastVectorWidgetProvider.updateAll(context);
            return Result.retry();
        }
    }

    private NwsResult checkNws(Context context, SharedPreferences prefs, double lat, double lon, String name) throws Exception {
        String endpoint = String.format(Locale.US,
                "https://api.weather.gov/alerts/active?point=%.4f,%.4f", lat, lon);
        JSONObject root = fetchJson(endpoint, "application/geo+json, application/json");
        JSONArray features = root.optJSONArray("features");
        int count = features == null ? 0 : features.length();

        Set<String> prior = new HashSet<>(prefs.getStringSet("watch_seen_alert_ids", new HashSet<>()));
        Set<String> current = new HashSet<>();
        int notified = 0;
        String latestEvent = "";
        boolean highImpact = false;

        if (features != null) {
            for (int i = 0; i < features.length(); i++) {
                JSONObject feature = features.optJSONObject(i);
                if (feature == null) continue;
                JSONObject p = feature.optJSONObject("properties");
                if (p == null) p = new JSONObject();

                String id = feature.optString("id", p.optString("id", ""));
                String event = p.optString("event", "Weather alert");
                String severity = p.optString("severity", "Unknown");
                String headline = p.optString("headline", event);
                String area = p.optString("areaDesc", "");
                if (!id.isEmpty()) current.add(id);
                if (latestEvent.isEmpty()) latestEvent = event;

                boolean severe = isHighImpact(event, severity);
                if (severe) highImpact = true;
                if (severe && !id.isEmpty() && !prior.contains(id) && notified < 3) {
                    postSafetyNotification(context, id, event, headline, area, name);
                    notified++;
                }
            }
        }

        prefs.edit().putStringSet("watch_seen_alert_ids", current).apply();
        return new NwsResult(count, latestEvent, highImpact);
    }

    private WindowResult findFishingWindow(SharedPreferences prefs, double lat, double lon) throws Exception {
        String weatherUrl = String.format(Locale.US,
                "https://api.open-meteo.com/v1/forecast?latitude=%.5f&longitude=%.5f&timezone=auto&forecast_hours=48&wind_speed_unit=mph&hourly=precipitation_probability,wind_speed_10m,pressure_msl",
                lat, lon);
        JSONObject weather = fetchJson(weatherUrl, "application/json");
        JSONObject wh = weather.optJSONObject("hourly");
        if (wh == null) throw new Exception("Open-Meteo hourly forecast unavailable");

        JSONArray times = wh.optJSONArray("time");
        JSONArray winds = wh.optJSONArray("wind_speed_10m");
        JSONArray rains = wh.optJSONArray("precipitation_probability");
        JSONArray pressures = wh.optJSONArray("pressure_msl");
        if (times == null || times.length() == 0) throw new Exception("Forecast hours unavailable");

        String mode = prefs.getString("watch_water_mode", "coast");
        boolean coast = !"freshwater".equalsIgnoreCase(mode);

        Map<String, Double> waves = new HashMap<>();
        Map<String, Double> waters = new HashMap<>();
        if (coast) {
            try {
                String marineUrl = String.format(Locale.US,
                        "https://marine-api.open-meteo.com/v1/marine?latitude=%.5f&longitude=%.5f&timezone=auto&forecast_hours=48&length_unit=imperial&temperature_unit=fahrenheit&cell_selection=sea&hourly=wave_height,sea_surface_temperature",
                        lat, lon);
                JSONObject marine = fetchJson(marineUrl, "application/json");
                JSONObject mh = marine.optJSONObject("hourly");
                if (mh != null) {
                    JSONArray mt = mh.optJSONArray("time");
                    JSONArray mw = mh.optJSONArray("wave_height");
                    JSONArray temp = mh.optJSONArray("sea_surface_temperature");
                    if (mt != null) {
                        for (int i = 0; i < mt.length(); i++) {
                            String key = mt.optString(i, "");
                            if (key.isEmpty()) continue;
                            double wave = optDouble(mw, i, Double.NaN);
                            double water = optDouble(temp, i, Double.NaN);
                            if (Double.isFinite(wave)) waves.put(key, wave);
                            if (Double.isFinite(water)) waters.put(key, water);
                        }
                    }
                }
            } catch (RetryableException e) {
                throw e;
            } catch (Exception ignored) {
                // Marine context is helpful but not required for background weather-window checks.
            }
        }

        int threshold = Math.max(50, Math.min(98, prefs.getInt("watch_score_threshold", 82)));
        double maxWind = Double.longBitsToDouble(prefs.getLong("watch_max_wind_bits", Double.doubleToRawLongBits(15.0)));
        double waterMin = Double.longBitsToDouble(prefs.getLong("watch_water_min_bits", Double.doubleToRawLongBits(55.0)));
        double waterMax = Double.longBitsToDouble(prefs.getLong("watch_water_max_bits", Double.doubleToRawLongBits(80.0)));
        double waveMin = Double.longBitsToDouble(prefs.getLong("watch_wave_min_bits", Double.doubleToRawLongBits(coast ? 0.5 : 0.0)));
        double waveMax = Double.longBitsToDouble(prefs.getLong("watch_wave_max_bits", Double.doubleToRawLongBits(coast ? 4.0 : 2.0)));
        int tideBias = prefs.getInt("watch_tide_bias", 5);

        WindowResult best = null;
        WindowResult firstQualified = null;
        int limit = Math.min(48, times.length());
        for (int i = 0; i < limit; i++) {
            String time = times.optString(i, "");
            if (time.isEmpty()) continue;
            double wind = optDouble(winds, i, 99.0);
            double rain = optDouble(rains, i, 0.0);
            double pressure = optDouble(pressures, i, 1015.0);
            double waveMid = (waveMin + waveMax) / 2.0;
            double waterMid = (waterMin + waterMax) / 2.0;
            double wave = coast ? waves.getOrDefault(time, waveMid) : Math.max(0.0, waveMid);
            double water = coast ? waters.getOrDefault(time, waterMid) : waterMid;
            int hour = hourFromIso(time);
            int score = score(wind, rain, wave, water, pressure, hour, waterMin, waterMax, waveMin, waveMax, tideBias);
            boolean qualified = score >= threshold && wind <= maxWind;
            WindowResult row = new WindowResult(time, prettyTime(time), score, wind, wave, rain, qualified);

            if (best == null || row.score > best.score) best = row;
            if (qualified && firstQualified == null) firstQualified = row;
        }

        return firstQualified != null ? firstQualified : best;
    }

    private int score(double wind, double rain, double wave, double water, double pressure, int hour,
                      double waterMin, double waterMax, double waveMin, double waveMax, int tideBias) {
        int score = 32;

        if (wind <= 6) score += 16;
        else if (wind <= 10) score += 12;
        else if (wind <= 14) score += 6;
        else if (wind <= 18) score -= 4;
        else score -= 16;

        if (rain <= 15) score += 7;
        else if (rain <= 35) score += 3;
        else if (rain >= 65) score -= 10;
        else score -= 3;

        double waveMid = (waveMin + waveMax) / 2.0;
        double waveHalf = Math.max(.25, (waveMax - waveMin) / 2.0);
        if (wave >= waveMin && wave <= waveMax) {
            double closeness = Math.max(0, 1 - Math.abs(wave - waveMid) / waveHalf);
            score += 5 + (int)Math.round(closeness * 5);
        } else if (wave > waveMax) {
            score -= Math.min(16, (int)Math.round(3 + (wave - waveMax) * 4));
        } else score += 1;

        double waterMid = (waterMin + waterMax) / 2.0;
        double waterHalf = Math.max(2, (waterMax - waterMin) / 2.0);
        if (water >= waterMin && water <= waterMax) {
            double closeness = Math.max(0, 1 - Math.abs(water - waterMid) / waterHalf);
            score += 5 + (int)Math.round(closeness * 9);
        } else {
            double delta = water < waterMin ? waterMin - water : water - waterMax;
            score -= Math.min(12, (int)Math.round(2 + delta * .8));
        }

        // Background checks do not have full tide/history context. Apply a conservative
        // partial tide contribution, then re-evaluate the full score when the app opens.
        score += Math.max(0, (int)Math.round(tideBias * .6));
        if (hour >= 5 && hour <= 9) score += 8;
        else if (hour >= 17 && hour <= 20) score += 6;
        else if (hour >= 11 && hour <= 15) score -= 3;

        if (pressure >= 1008 && pressure <= 1024) score += 4;
        return Math.max(25, Math.min(98, score));
    }

    private void saveWindow(SharedPreferences prefs, WindowResult window) {
        if (window == null) return;
        prefs.edit()
                .putInt("watch_last_window_score", window.score)
                .putString("watch_last_window_time", window.label)
                .putString("watch_last_window_raw", window.timeRaw)
                .putLong("watch_last_window_wind_bits", Double.doubleToRawLongBits(window.wind))
                .putLong("watch_last_window_wave_bits", Double.doubleToRawLongBits(window.wave))
                .putBoolean("watch_last_window_qualified", window.qualified)
                .apply();
    }

    private boolean isHighImpact(String event, String severity) {
        String e = event == null ? "" : event.toLowerCase(Locale.US);
        String s = severity == null ? "" : severity.toLowerCase(Locale.US);
        if ("extreme".equals(s) || "severe".equals(s)) return true;
        return e.contains("tornado")
                || e.contains("severe thunderstorm")
                || e.contains("flash flood")
                || e.contains("hurricane")
                || e.contains("tropical storm")
                || e.contains("storm surge")
                || e.contains("tsunami")
                || e.contains("special marine warning")
                || e.contains("extreme wind");
    }

    private void postSafetyNotification(Context context, String id, String event, String headline, String area, String locationName) {
        if (!canNotify(context)) return;
        ensureChannels(context);

        Intent intent = new Intent(context, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, Math.abs(id.hashCode()), intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        String body = headline == null || headline.isEmpty() ? event : headline;
        if (area != null && !area.isEmpty()) body += " • " + area;
        if (locationName != null && !locationName.isEmpty()) body += " • Watching " + locationName;

        Notification.Builder builder = new Notification.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentTitle("CastVector safety: " + event)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setCategory(Notification.CATEGORY_ALARM)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent);

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager != null) manager.notify(Math.abs(id.hashCode()), builder.build());
    }

    private void postFishingNotification(Context context, String species, String locationName, WindowResult window) {
        if (!canNotify(context)) return;
        ensureChannels(context);

        Intent intent = new Intent(context, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 9201, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        String body = window.label + " • " + Math.round(window.wind) + " mph wind";
        if (window.wave > 0.05) body += " • " + String.format(Locale.US, "%.1f ft", window.wave);
        body += " • Open CastVector for full tide, safety and personal analysis.";

        Notification.Builder builder = new Notification.Builder(context, FISHING_CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentTitle(species + " window: " + window.score + "/100")
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body + " • " + locationName))
                .setCategory(Notification.CATEGORY_RECOMMENDATION)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent);

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager != null) manager.notify(9201, builder.build());
    }

    private boolean canNotify(Context context) {
        return Build.VERSION.SDK_INT < 33
                || context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    public static void ensureChannel(Context context) {
        ensureChannels(context);
    }

    public static void ensureChannels(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) return;

        NotificationChannel safety = new NotificationChannel(
                CHANNEL_ID,
                "Fishing safety alerts",
                NotificationManager.IMPORTANCE_HIGH
        );
        safety.setDescription("New high-impact National Weather Service alerts for your selected fishing destination.");
        manager.createNotificationChannel(safety);

        NotificationChannel fishing = new NotificationChannel(
                FISHING_CHANNEL_ID,
                "Fishing window alerts",
                NotificationManager.IMPORTANCE_DEFAULT
        );
        fishing.setDescription("Background CastVector fishing-window notifications for the water and target you chose.");
        manager.createNotificationChannel(fishing);
    }

    private JSONObject fetchJson(String endpoint, String accept) throws Exception {
        HttpURLConnection connection = null;
        try {
            connection = (HttpURLConnection) new URL(endpoint).openConnection();
            connection.setConnectTimeout(12000);
            connection.setReadTimeout(12000);
            connection.setRequestProperty("Accept", accept);
            connection.setRequestProperty("User-Agent", "CastVector/12.0 (https://2genrips.github.io/coastcast-app/)");
            connection.setRequestProperty("Cache-Control", "no-cache");

            int code = connection.getResponseCode();
            if (code == 429 || code >= 500) throw new RetryableException("Provider HTTP " + code);
            if (code < 200 || code >= 300) throw new Exception("Provider HTTP " + code);
            return new JSONObject(readAll(connection.getInputStream()));
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private double optDouble(JSONArray arr, int index, double fallback) {
        if (arr == null || index < 0 || index >= arr.length() || arr.isNull(index)) return fallback;
        double value = arr.optDouble(index, fallback);
        return Double.isFinite(value) ? value : fallback;
    }

    private int hourFromIso(String iso) {
        try {
            if (iso != null && iso.length() >= 13) return Integer.parseInt(iso.substring(11, 13));
        } catch (Exception ignored) {}
        return 7;
    }

    private String prettyTime(String iso) {
        try {
            LocalDateTime dt = LocalDateTime.parse(iso);
            return dt.format(DateTimeFormatter.ofPattern("EEE h:mm a", Locale.US));
        } catch (Exception ignored) {
            return iso == null ? "Upcoming window" : iso.replace('T', ' ');
        }
    }

    private void saveStatus(SharedPreferences prefs, String status, int count, String error, String event) {
        prefs.edit()
                .putLong("watch_last_checked", System.currentTimeMillis())
                .putInt("watch_last_alert_count", count)
                .putString("watch_last_status", status)
                .putString("watch_last_error", error == null ? "" : error)
                .putString("watch_last_event", event == null ? "" : event)
                .apply();
    }

    private String readAll(InputStream input) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(input));
        StringBuilder out = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) out.append(line);
        reader.close();
        return out.toString();
    }

    private static class NwsResult {
        final int count;
        final String latestEvent;
        final boolean highImpact;
        NwsResult(int count, String latestEvent, boolean highImpact) {
            this.count = count;
            this.latestEvent = latestEvent == null ? "" : latestEvent;
            this.highImpact = highImpact;
        }
    }

    private static class WindowResult {
        final String timeRaw;
        final String label;
        final int score;
        final double wind;
        final double wave;
        final double rain;
        final boolean qualified;
        WindowResult(String timeRaw, String label, int score, double wind, double wave, double rain, boolean qualified) {
            this.timeRaw = timeRaw;
            this.label = label;
            this.score = score;
            this.wind = wind;
            this.wave = wave;
            this.rain = rain;
            this.qualified = qualified;
        }
    }

    private static class RetryableException extends Exception {
        RetryableException(String message) { super(message); }
    }
}
