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
import java.util.Locale;

public class FishingOpportunityWorker extends Worker {
    public static final String PREFS = "castvector_native";
    public static final String UNIQUE_WORK = "castvector_background_bite_watch";
    public static final String CHANNEL_ID = "castvector_bite_alerts";

    public FishingOpportunityWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!prefs.getBoolean("opp_enabled", false)) return Result.success();

        double lat = Double.longBitsToDouble(prefs.getLong("opp_lat_bits", Double.doubleToLongBits(Double.NaN)));
        double lon = Double.longBitsToDouble(prefs.getLong("opp_lon_bits", Double.doubleToLongBits(Double.NaN)));
        String name = prefs.getString("opp_name", "Watched water");
        String species = prefs.getString("opp_species", "Target species");
        int threshold = prefs.getInt("opp_threshold", 80);
        boolean coast = prefs.getBoolean("opp_coast", true);
        double idealMin = Double.longBitsToDouble(prefs.getLong("opp_ideal_min_bits", Double.doubleToLongBits(Double.NaN)));
        double idealMax = Double.longBitsToDouble(prefs.getLong("opp_ideal_max_bits", Double.doubleToLongBits(Double.NaN)));

        if (!Double.isFinite(lat) || !Double.isFinite(lon)) return Result.success();

        try {
            JSONObject weather = fetchJson(String.format(Locale.US,
                    "https://api.open-meteo.com/v1/forecast?latitude=%.5f&longitude=%.5f&timezone=auto&forecast_days=2&wind_speed_unit=mph&hourly=precipitation_probability,wind_speed_10m,pressure_msl",
                    lat, lon));

            JSONObject marine = null;
            if (coast) {
                try {
                    marine = fetchJson(String.format(Locale.US,
                            "https://marine-api.open-meteo.com/v1/marine?latitude=%.5f&longitude=%.5f&timezone=auto&forecast_days=2&length_unit=imperial&cell_selection=sea&hourly=wave_height,sea_surface_temperature",
                            lat, lon));
                } catch (Exception ignored) {}
            }

            ScoreResult best = scoreForecast(weather, marine, coast, idealMin, idealMax);
            if (best == null) throw new Exception("No opportunity forecast");

            int priorScore = prefs.getInt("opp_last_score", -1);
            long lastNotified = prefs.getLong("opp_last_notified", 0L);
            int lastNotifiedScore = prefs.getInt("opp_last_notified_score", -1);
            long now = System.currentTimeMillis();

            boolean crossed = priorScore < threshold && best.score >= threshold;
            boolean materiallyBetter = best.score >= threshold && best.score >= lastNotifiedScore + 5;
            boolean reminderWindow = best.score >= threshold && now - lastNotified >= 12L * 60L * 60L * 1000L;
            boolean shouldNotify = crossed || materiallyBetter || reminderWindow;

            if (shouldNotify) {
                postNotification(context, name, species, best, threshold);
                prefs.edit()
                        .putLong("opp_last_notified", now)
                        .putInt("opp_last_notified_score", best.score)
                        .apply();
            }

            prefs.edit()
                    .putLong("opp_last_checked", now)
                    .putInt("opp_last_score", best.score)
                    .putString("opp_last_best_time", best.timeLabel)
                    .putString("opp_last_status", "ok")
                    .putString("opp_last_error", "")
                    .putString("opp_last_detail", best.detail)
                    .apply();

            CastVectorWidgetProvider.updateAll(context);
            return Result.success();
        } catch (Exception e) {
            prefs.edit()
                    .putLong("opp_last_checked", System.currentTimeMillis())
                    .putString("opp_last_status", "error")
                    .putString("opp_last_error", e.getMessage() == null ? "Opportunity watch failed" : e.getMessage())
                    .apply();
            CastVectorWidgetProvider.updateAll(context);
            return Result.retry();
        }
    }

    private ScoreResult scoreForecast(JSONObject weather, JSONObject marine, boolean coast, double idealMin, double idealMax) throws Exception {
        JSONObject wh = weather.optJSONObject("hourly");
        if (wh == null) return null;

        JSONArray times = wh.optJSONArray("time");
        JSONArray winds = wh.optJSONArray("wind_speed_10m");
        JSONArray rains = wh.optJSONArray("precipitation_probability");
        JSONArray pressures = wh.optJSONArray("pressure_msl");
        if (times == null || winds == null) return null;

        JSONObject mh = marine == null ? null : marine.optJSONObject("hourly");
        JSONArray mTimes = mh == null ? null : mh.optJSONArray("time");
        JSONArray waves = mh == null ? null : mh.optJSONArray("wave_height");
        JSONArray waters = mh == null ? null : mh.optJSONArray("sea_surface_temperature");
        String waterUnit = marine == null ? "" : marine.optJSONObject("hourly_units") == null ? "" : marine.optJSONObject("hourly_units").optString("sea_surface_temperature", "");

        int limit = Math.min(24, times.length());
        ScoreResult best = null;

        for (int i = 0; i < limit; i++) {
            String time = times.optString(i, "");
            double wind = numberAt(winds, i, 10);
            double rain = numberAt(rains, i, 0);
            double pressure = numberAt(pressures, i, 1015);
            double wave = Double.NaN;
            double water = Double.NaN;

            if (coast && mTimes != null && waves != null) {
                int mi = indexOf(mTimes, time);
                if (mi >= 0) {
                    wave = numberAt(waves, mi, Double.NaN);
                    water = numberAt(waters, mi, Double.NaN);
                    if (Double.isFinite(water) && !waterUnit.toLowerCase(Locale.US).contains("f")) {
                        water = water * 9.0 / 5.0 + 32.0;
                    }
                }
            }

            int score = 50;
            if (wind <= 5) score += 14;
            else if (wind <= 10) score += 10;
            else if (wind <= 15) score += 5;
            else if (wind > 20) score -= 12;

            if (rain <= 20) score += 6;
            else if (rain <= 50) score += 2;
            else if (rain >= 75) score -= 8;

            if (pressure >= 1008 && pressure <= 1024) score += 4;

            int hour = hourFromLocalIso(time);
            if (hour >= 5 && hour <= 9) score += 8;
            else if (hour >= 17 && hour <= 20) score += 6;
            else if (hour >= 11 && hour <= 15) score -= 2;

            if (coast && Double.isFinite(wave)) {
                if (wave <= 1.5) score += 8;
                else if (wave <= 3.0) score += 4;
                else if (wave > 5.0) score -= 10;
            }

            if (coast && Double.isFinite(water) && Double.isFinite(idealMin) && Double.isFinite(idealMax)) {
                if (water >= idealMin && water <= idealMax) score += 8;
                else {
                    double d = water < idealMin ? idealMin - water : water - idealMax;
                    if (d <= 5) score += 2;
                    else score -= Math.min(8, (int)Math.round(d * 0.7));
                }
            }

            score = Math.max(25, Math.min(98, score));
            String detail = String.format(Locale.US, "%.0f mph wind • %.0f%% rain%s",
                    wind, rain, Double.isFinite(wave) ? String.format(Locale.US, " • %.1f ft wave", wave) : "");
            ScoreResult candidate = new ScoreResult(score, labelTime(time), detail);
            if (best == null || candidate.score > best.score) best = candidate;
        }
        return best;
    }

    private void postNotification(Context context, String name, String species, ScoreResult best, int threshold) {
        if (Build.VERSION.SDK_INT >= 33
                && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return;
        }

        ensureChannel(context);
        Intent intent = new Intent(context, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                1200,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        String body = species + " • best around " + best.timeLabel + " • " + best.detail;
        Notification.Builder builder = new Notification.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentTitle("CastVector bite watch: " + best.score + "/100 at " + name)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setCategory(Notification.CATEGORY_RECOMMENDATION)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent);

        try {
            NotificationManager manager = context.getSystemService(NotificationManager.class);
            if (manager != null) manager.notify(12001, builder.build());
        } catch (SecurityException ignored) {}
    }

    public static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) return;
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Fishing opportunity alerts",
                NotificationManager.IMPORTANCE_DEFAULT
        );
        channel.setDescription("Background CastVector alerts when a watched fishing destination reaches your selected opportunity threshold.");
        manager.createNotificationChannel(channel);
    }

    private JSONObject fetchJson(String endpoint) throws Exception {
        HttpURLConnection c = null;
        try {
            c = (HttpURLConnection) new URL(endpoint).openConnection();
            c.setConnectTimeout(12000);
            c.setReadTimeout(12000);
            c.setRequestProperty("Accept", "application/json");
            c.setRequestProperty("User-Agent", "CastVector/12.0 (https://2genrips.github.io/coastcast-app/)");
            int code = c.getResponseCode();
            if (code == 429 || code >= 500) throw new Exception("Forecast source temporarily unavailable (" + code + ")");
            if (code < 200 || code >= 300) throw new Exception("Forecast HTTP " + code);
            return new JSONObject(readAll(c.getInputStream()));
        } finally {
            if (c != null) c.disconnect();
        }
    }

    private double numberAt(JSONArray a, int index, double fallback) {
        if (a == null || index < 0 || index >= a.length() || a.isNull(index)) return fallback;
        return a.optDouble(index, fallback);
    }

    private int indexOf(JSONArray a, String value) {
        if (a == null) return -1;
        for (int i = 0; i < a.length(); i++) if (value.equals(a.optString(i, ""))) return i;
        return -1;
    }

    private int hourFromLocalIso(String iso) {
        try {
            if (iso != null && iso.length() >= 13) return Integer.parseInt(iso.substring(11, 13));
        } catch (Exception ignored) {}
        return 12;
    }

    private String labelTime(String iso) {
        int hour = hourFromLocalIso(iso);
        String ampm = hour >= 12 ? "PM" : "AM";
        int h = hour % 12;
        if (h == 0) h = 12;
        return h + ":00 " + ampm;
    }

    private String readAll(InputStream input) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8));
        StringBuilder out = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) out.append(line);
        reader.close();
        return out.toString();
    }

    private static class ScoreResult {
        final int score;
        final String timeLabel;
        final String detail;
        ScoreResult(int score, String timeLabel, String detail) {
            this.score = score;
            this.timeLabel = timeLabel;
            this.detail = detail;
        }
    }
}
