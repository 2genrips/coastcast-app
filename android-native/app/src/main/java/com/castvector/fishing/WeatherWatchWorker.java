package com.castvector.fishing;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

public class WeatherWatchWorker extends Worker {
    public static final String PREFS = "castvector_native";
    public static final String UNIQUE_WORK = "castvector_background_weather_watch";
    public static final String CHANNEL_ID = "castvector_safety_alerts";

    public WeatherWatchWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!prefs.getBoolean("watch_enabled", false)) return Result.success();

        double lat = Double.longBitsToDouble(prefs.getLong("watch_lat_bits", Double.doubleToLongBits(Double.NaN)));
        double lon = Double.longBitsToDouble(prefs.getLong("watch_lon_bits", Double.doubleToLongBits(Double.NaN)));
        String name = prefs.getString("watch_name", "Selected fishing location");
        if (!Double.isFinite(lat) || !Double.isFinite(lon)) return Result.success();

        HttpURLConnection connection = null;
        try {
            String endpoint = String.format(Locale.US,
                    "https://api.weather.gov/alerts/active?point=%.4f,%.4f", lat, lon);
            connection = (HttpURLConnection) new URL(endpoint).openConnection();
            connection.setConnectTimeout(12000);
            connection.setReadTimeout(12000);
            connection.setRequestProperty("Accept", "application/geo+json, application/json");
            connection.setRequestProperty("User-Agent", "CastVector/10.0 (https://2genrips.github.io/coastcast-app/)");
            connection.setRequestProperty("Cache-Control", "no-cache");

            int code = connection.getResponseCode();
            if (code == 429 || code >= 500) {
                saveStatus(prefs, "retry", 0, "NWS HTTP " + code, "");
                return Result.retry();
            }
            if (code < 200 || code >= 300) {
                saveStatus(prefs, "error", 0, "NWS HTTP " + code, "");
                return Result.success();
            }

            String body = readAll(connection.getInputStream());
            JSONObject root = new JSONObject(body);
            JSONArray features = root.optJSONArray("features");
            int count = features == null ? 0 : features.length();

            Set<String> prior = new HashSet<>(prefs.getStringSet("watch_seen_alert_ids", new HashSet<>()));
            Set<String> current = new HashSet<>();
            int notified = 0;
            String latestEvent = "";

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

                    if (isHighImpact(event, severity) && !id.isEmpty() && !prior.contains(id) && notified < 3) {
                        postNotification(context, id, event, headline, area, name);
                        notified++;
                    }
                }
            }

            prefs.edit()
                    .putStringSet("watch_seen_alert_ids", current)
                    .putLong("watch_last_checked", System.currentTimeMillis())
                    .putInt("watch_last_alert_count", count)
                    .putString("watch_last_status", "ok")
                    .putString("watch_last_error", "")
                    .putString("watch_last_event", latestEvent)
                    .apply();
            return Result.success();
        } catch (Exception e) {
            saveStatus(prefs, "error", 0, e.getMessage() == null ? "Weather watch failed" : e.getMessage(), "");
            return Result.retry();
        } finally {
            if (connection != null) connection.disconnect();
        }
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

    private void postNotification(Context context, String id, String event, String headline, String area, String locationName) {
        if (Build.VERSION.SDK_INT >= 33
                && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return;
        }

        ensureChannel(context);
        Intent intent = new Intent(context, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                Math.abs(id.hashCode()),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        String body = headline == null || headline.isEmpty() ? event : headline;
        if (area != null && !area.isEmpty()) body += " • " + area;
        if (locationName != null && !locationName.isEmpty()) body += " • Watching " + locationName;

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentTitle("CastVector safety: " + event)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent);

        try {
            NotificationManagerCompat.from(context).notify(Math.abs(id.hashCode()), builder.build());
        } catch (SecurityException ignored) {}
    }

    public static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) return;
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Fishing safety alerts",
                NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("New high-impact National Weather Service alerts for your selected fishing destination.");
        manager.createNotificationChannel(channel);
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
}
