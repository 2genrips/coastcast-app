package com.castvector.fishing;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

public class RouteTrackingService extends Service implements LocationListener {
    public static final String PREFS = "castvector_route_tracking";
    public static final String ACTION_START = "com.castvector.fishing.ROUTE_START";
    public static final String ACTION_STOP = "com.castvector.fishing.ROUTE_STOP";
    public static final String EXTRA_SESSION = "session_id";
    public static final String EXTRA_NAME = "route_name";
    private static final String CHANNEL_ID = "castvector_route_tracking";
    private static final int NOTIFICATION_ID = 14001;
    private static final int MAX_POINTS = 1500;

    private LocationManager locationManager;
    private String sessionId = "";
    private String routeName = "Fishing session";

    @Override
    public void onCreate() {
        super.onCreate();
        ensureChannel(this);
        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent == null ? "" : intent.getAction();
        if (ACTION_STOP.equals(action)) {
            stopTracking();
            return START_NOT_STICKY;
        }

        String requestedSession = intent == null ? "" : intent.getStringExtra(EXTRA_SESSION);
        String requestedName = intent == null ? "" : intent.getStringExtra(EXTRA_NAME);
        if (requestedSession == null) requestedSession = "";
        if (requestedName == null || requestedName.trim().isEmpty()) requestedName = "Fishing session";

        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        String priorSession = prefs.getString("session_id", "");
        boolean newSession = !requestedSession.equals(priorSession);

        sessionId = requestedSession;
        routeName = requestedName.trim();

        SharedPreferences.Editor editor = prefs.edit()
                .putBoolean("active", true)
                .putString("session_id", sessionId)
                .putString("route_name", routeName)
                .putLong("started_at", newSession ? System.currentTimeMillis() : prefs.getLong("started_at", System.currentTimeMillis()))
                .putString("status", "tracking")
                .putString("last_error", "");
        if (newSession) {
            editor.putString("points", "[]")
                    .putInt("point_count", 0)
                    .putLong("last_point_at", 0L)
                    .putLong("last_lat_bits", 0L)
                    .putLong("last_lon_bits", 0L);
        }
        editor.apply();

        startForeground(NOTIFICATION_ID, buildNotification());
        requestUpdates();
        return START_STICKY;
    }

    private void requestUpdates() {
        if (locationManager == null) return;
        if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            setError("Location permission is not granted.");
            stopTracking();
            return;
        }

        try {
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 7000L, 8f, this);
            }
        } catch (Exception ignored) {}

        try {
            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 12000L, 15f, this);
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onLocationChanged(Location location) {
        if (location == null) return;
        if (location.hasAccuracy() && location.getAccuracy() > 120f) return;

        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        if (!prefs.getBoolean("active", false)) return;

        long at = location.getTime() > 0 ? location.getTime() : System.currentTimeMillis();
        double lat = location.getLatitude();
        double lon = location.getLongitude();

        long lastAt = prefs.getLong("last_point_at", 0L);
        long lastLatBits = prefs.getLong("last_lat_bits", 0L);
        long lastLonBits = prefs.getLong("last_lon_bits", 0L);

        if (lastAt > 0 && lastLatBits != 0L && lastLonBits != 0L) {
            double lastLat = Double.longBitsToDouble(lastLatBits);
            double lastLon = Double.longBitsToDouble(lastLonBits);
            float[] result = new float[1];
            Location.distanceBetween(lastLat, lastLon, lat, lon, result);
            long elapsed = Math.max(0L, at - lastAt);
            if (result[0] < 12f && elapsed < 25000L) return;
        }

        try {
            JSONArray points = new JSONArray(prefs.getString("points", "[]"));
            JSONObject point = new JSONObject();
            point.put("lat", lat);
            point.put("lon", lon);
            point.put("at", at);
            point.put("accuracy", location.hasAccuracy() ? location.getAccuracy() : JSONObject.NULL);
            point.put("speedMps", location.hasSpeed() ? Math.max(0f, location.getSpeed()) : JSONObject.NULL);
            points.put(point);

            if (points.length() > MAX_POINTS) {
                JSONArray trimmed = new JSONArray();
                int start = Math.max(0, points.length() - MAX_POINTS);
                for (int i = start; i < points.length(); i++) trimmed.put(points.get(i));
                points = trimmed;
            }

            prefs.edit()
                    .putString("points", points.toString())
                    .putInt("point_count", points.length())
                    .putLong("last_point_at", at)
                    .putLong("last_lat_bits", Double.doubleToRawLongBits(lat))
                    .putLong("last_lon_bits", Double.doubleToRawLongBits(lon))
                    .putString("status", "tracking")
                    .putString("last_error", "")
                    .apply();
        } catch (Exception e) {
            setError(e.getMessage());
        }
    }

    @Override
    public void onProviderDisabled(String provider) {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString("status", "gps_waiting").apply();
    }

    @Override
    public void onProviderEnabled(String provider) {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putString("status", "tracking").apply();
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {}

    private void stopTracking() {
        try {
            if (locationManager != null) locationManager.removeUpdates(this);
        } catch (Exception ignored) {}
        getSharedPreferences(PREFS, MODE_PRIVATE).edit()
                .putBoolean("active", false)
                .putString("status", "stopped")
                .putLong("stopped_at", System.currentTimeMillis())
                .apply();
        stopForeground(true);
        stopSelf();
    }

    private void setError(String message) {
        getSharedPreferences(PREFS, MODE_PRIVATE).edit()
                .putString("status", "error")
                .putString("last_error", message == null ? "Unknown route tracking error" : message)
                .apply();
    }

    private android.app.Notification buildNotification() {
        Intent open = new Intent(this, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pending = PendingIntent.getActivity(
                this, 0, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentTitle("CastVector is tracking your fishing route")
                .setContentText(routeName + " • Tap to return to your live session")
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setContentIntent(pending)
                .build();
    }

    public static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null) return;
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Fishing route tracking",
                NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Persistent notification while Track My Water records a fishing route.");
        manager.createNotificationChannel(channel);
    }

    public static String statusJson(Context context) {
        try {
            SharedPreferences p = context.getSharedPreferences(PREFS, MODE_PRIVATE);
            JSONObject out = new JSONObject();
            out.put("available", true);
            out.put("active", p.getBoolean("active", false));
            out.put("sessionId", p.getString("session_id", ""));
            out.put("name", p.getString("route_name", ""));
            out.put("status", p.getString("status", "idle"));
            out.put("pointCount", p.getInt("point_count", 0));
            out.put("startedAt", p.getLong("started_at", 0L));
            out.put("stoppedAt", p.getLong("stopped_at", 0L));
            out.put("lastPointAt", p.getLong("last_point_at", 0L));
            out.put("lastError", p.getString("last_error", ""));
            return out.toString();
        } catch (Exception e) {
            return "{\"available\":true,\"active\":false,\"status\":\"error\"}";
        }
    }

    public static String pointsJson(Context context) {
        SharedPreferences p = context.getSharedPreferences(PREFS, MODE_PRIVATE);
        return p.getString("points", "[]");
    }

    public static void clear(Context context) {
        SharedPreferences p = context.getSharedPreferences(PREFS, MODE_PRIVATE);
        p.edit()
                .putString("points", "[]")
                .putInt("point_count", 0)
                .putLong("last_point_at", 0L)
                .putLong("last_lat_bits", 0L)
                .putLong("last_lon_bits", 0L)
                .apply();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
