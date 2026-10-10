package com.castvector.fishing;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.widget.RemoteViews;

import androidx.work.Constraints;
import androidx.work.ExistingWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;

import java.text.DateFormat;
import java.util.Date;

public class CastVectorWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_REFRESH = "com.castvector.fishing.WIDGET_REFRESH";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) update(context, manager, id);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) {
            Constraints constraints = new Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build();
            OneTimeWorkRequest request = new OneTimeWorkRequest.Builder(WeatherWatchWorker.class)
                    .setConstraints(constraints)
                    .build();
            WorkManager.getInstance(context).enqueueUniqueWork(
                    WeatherWatchWorker.UNIQUE_WORK + "_widget",
                    ExistingWorkPolicy.REPLACE,
                    request
            );
            updateAll(context);
        }
    }

    public static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName provider = new ComponentName(context, CastVectorWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(provider);
        for (int id : ids) update(context, manager, id);
    }

    private static void update(Context context, AppWidgetManager manager, int id) {
        SharedPreferences prefs = context.getSharedPreferences(WeatherWatchWorker.PREFS, Context.MODE_PRIVATE);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.castvector_widget);

        boolean enabled = prefs.getBoolean("watch_enabled", false);
        boolean fishing = prefs.getBoolean("fishing_watch_enabled", false);
        String location = prefs.getString("watch_name", "Open CastVector to choose water");
        String species = prefs.getString("watch_species", "Fishing watch");
        int score = prefs.getInt("watch_last_window_score", 0);
        String window = prefs.getString("watch_last_window_time", "");
        int alerts = prefs.getInt("watch_last_alert_count", 0);
        long checked = prefs.getLong("watch_last_checked", 0L);
        String status = prefs.getString("watch_last_status", "idle");

        views.setTextViewText(R.id.widget_location, location == null || location.isEmpty() ? "CastVector" : location);
        views.setTextViewText(R.id.widget_species, fishing ? species : "Safety watch");
        views.setTextViewText(R.id.widget_score, fishing && score > 0 ? score + "/100" : "—");
        views.setTextViewText(R.id.widget_window, fishing && window != null && !window.isEmpty() ? window : (enabled ? "Watching conditions" : "Open CastVector to arm"));
        views.setTextViewText(R.id.widget_safety, alerts > 0 ? alerts + " NWS ALERT" + (alerts == 1 ? "" : "S") : "NO ACTIVE NWS ALERT");
        String updated = checked > 0 ? "Checked " + DateFormat.getTimeInstance(DateFormat.SHORT).format(new Date(checked)) : status.toUpperCase();
        views.setTextViewText(R.id.widget_updated, updated);

        Intent open = new Intent(context, MainActivity.class);
        open.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent openIntent = PendingIntent.getActivity(
                context, 9101, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, openIntent);

        Intent refresh = new Intent(context, CastVectorWidgetProvider.class);
        refresh.setAction(ACTION_REFRESH);
        PendingIntent refreshIntent = PendingIntent.getBroadcast(
                context, 9102, refresh,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_refresh, refreshIntent);

        manager.updateAppWidget(id, views);
    }
}
