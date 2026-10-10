package com.castvector.fishing;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
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
        if (!ACTION_REFRESH.equals(intent.getAction())) return;

        SharedPreferences prefs = context.getSharedPreferences(WeatherWatchWorker.PREFS, Context.MODE_PRIVATE);
        Constraints connected = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build();
        WorkManager work = WorkManager.getInstance(context);

        if (prefs.getBoolean("watch_enabled", false)) {
            OneTimeWorkRequest safety = new OneTimeWorkRequest.Builder(WeatherWatchWorker.class)
                    .setConstraints(connected)
                    .build();
            work.enqueueUniqueWork(
                    WeatherWatchWorker.UNIQUE_WORK + "_widget",
                    ExistingWorkPolicy.REPLACE,
                    safety
            );
        }

        if (prefs.getBoolean("opp_enabled", false)) {
            OneTimeWorkRequest bite = new OneTimeWorkRequest.Builder(FishingOpportunityWorker.class)
                    .setConstraints(connected)
                    .build();
            work.enqueueUniqueWork(
                    FishingOpportunityWorker.UNIQUE_WORK + "_widget",
                    ExistingWorkPolicy.REPLACE,
                    bite
            );
        }

        updateAll(context);
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

        boolean safetyEnabled = prefs.getBoolean("watch_enabled", false);
        boolean biteEnabled = prefs.getBoolean("opp_enabled", false);

        String safetyName = prefs.getString("watch_name", "");
        String biteName = prefs.getString("opp_name", "");
        String location = biteEnabled && biteName != null && !biteName.isEmpty()
                ? biteName
                : (safetyEnabled && safetyName != null && !safetyName.isEmpty()
                ? safetyName
                : "Open CastVector to choose water");

        String species = prefs.getString("opp_species", "Target species");
        int score = prefs.getInt("opp_last_score", -1);
        String bestTime = prefs.getString("opp_last_best_time", "");
        String biteStatus = prefs.getString("opp_last_status", "idle");
        int alerts = prefs.getInt("watch_last_alert_count", 0);
        String safetyEvent = prefs.getString("watch_last_event", "");
        long safetyChecked = prefs.getLong("watch_last_checked", 0L);
        long biteChecked = prefs.getLong("opp_last_checked", 0L);
        long checked = Math.max(safetyChecked, biteChecked);

        views.setTextViewText(R.id.widget_location, location);
        views.setTextViewText(R.id.widget_species, biteEnabled ? species : "Safety watch");
        views.setTextViewText(R.id.widget_score, biteEnabled && score >= 0 ? score + "/100" : "—");

        String window;
        if (biteEnabled && bestTime != null && !bestTime.isEmpty()) {
            window = "Best around " + bestTime;
        } else if (biteEnabled) {
            window = "Fishing-window check pending";
        } else if (safetyEnabled) {
            window = "Safety watch armed";
        } else {
            window = "Open CastVector to arm a watch";
        }
        views.setTextViewText(R.id.widget_window, window);

        String safetyText = alerts > 0
                ? alerts + " NWS ALERT" + (alerts == 1 ? "" : "S")
                : "NO ACTIVE NWS ALERT";
        if (alerts > 0 && safetyEvent != null && !safetyEvent.isEmpty()) {
            safetyText = safetyText + " • " + safetyEvent;
        }
        views.setTextViewText(R.id.widget_safety, safetyText);

        String updated;
        if (checked > 0) {
            updated = "Checked " + DateFormat.getTimeInstance(DateFormat.SHORT).format(new Date(checked));
        } else if (biteEnabled) {
            updated = biteStatus == null ? "Waiting" : biteStatus.toUpperCase();
        } else {
            updated = "Not checked";
        }
        views.setTextViewText(R.id.widget_updated, updated);

        Intent open = new Intent(context, MainActivity.class);
        open.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent openIntent = PendingIntent.getActivity(
                context,
                12501,
                open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, openIntent);

        Intent refresh = new Intent(context, CastVectorWidgetProvider.class);
        refresh.setAction(ACTION_REFRESH);
        PendingIntent refreshIntent = PendingIntent.getBroadcast(
                context,
                12502,
                refresh,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_refresh, refreshIntent);

        manager.updateAppWidget(id, views);
    }
}
