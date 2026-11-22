package com.raiwave.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.IBinder;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MediaNotificationService extends Service {

    public static final String ACTION_UPDATE = "com.raiwave.app.ACTION_UPDATE";
    public static final String ACTION_PLAY_PAUSE = "com.raiwave.app.ACTION_PLAY_PAUSE";
    public static final String ACTION_PREV = "com.raiwave.app.ACTION_PREV";
    public static final String ACTION_NEXT = "com.raiwave.app.ACTION_NEXT";
    public static final String ACTION_STOP = "com.raiwave.app.ACTION_STOP";

    public static final String CHANNEL_ID = "raiwave_media_playback";
    public static final int NOTIFICATION_ID = 1010;

    private MediaSessionCompat mediaSession;
    private NotificationManager notificationManager;
    private Bitmap cachedArtwork = null;
    private String lastCoverUrl = "";

    @Override
    public void onCreate() {
        super.onCreate();
        notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        createNotificationChannel();

        mediaSession = new MediaSessionCompat(this, "RAIWAVE_MediaSession");
        mediaSession.setActive(true);
        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                MainActivity.handleMediaAction("play");
            }

            @Override
            public void onPause() {
                MainActivity.handleMediaAction("pause");
            }

            @Override
            public void onSkipToNext() {
                MainActivity.handleMediaAction("next");
            }

            @Override
            public void onSkipToPrevious() {
                MainActivity.handleMediaAction("prev");
            }

            @Override
            public void onStop() {
                MainActivity.handleMediaAction("pause");
                stopForeground(true);
                stopSelf();
            }
        });
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "RAIWAVE Music Playback",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shows active playback controls on lock screen and notification drawer");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) return START_NOT_STICKY;

        String action = intent.getAction();
        if (ACTION_PLAY_PAUSE.equals(action)) {
            MainActivity.handleMediaAction("play_pause");
        } else if (ACTION_PREV.equals(action)) {
            MainActivity.handleMediaAction("prev");
        } else if (ACTION_NEXT.equals(action)) {
            MainActivity.handleMediaAction("next");
        } else if (ACTION_STOP.equals(action)) {
            MainActivity.handleMediaAction("pause");
            stopForeground(true);
            stopSelf();
        } else if (ACTION_UPDATE.equals(action)) {
            String title = intent.getStringExtra("title");
            String artist = intent.getStringExtra("artist");
            String coverUrl = intent.getStringExtra("coverUrl");
            boolean isPlaying = intent.getBooleanExtra("isPlaying", false);

            if (title == null || title.isEmpty()) {
                title = "RAIWAVE Music";
            }
            if (artist == null || artist.isEmpty()) {
                artist = "Universal Stream";
            }

            updatePlaybackState(isPlaying);
            buildAndShowNotification(title, artist, coverUrl, isPlaying);
        }

        return START_NOT_STICKY;
    }

    private void updatePlaybackState(boolean isPlaying) {
        if (mediaSession == null) return;
        long actions = PlaybackStateCompat.ACTION_PLAY |
                PlaybackStateCompat.ACTION_PAUSE |
                PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
                PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
                PlaybackStateCompat.ACTION_PLAY_PAUSE;

        PlaybackStateCompat state = new PlaybackStateCompat.Builder()
                .setActions(actions)
                .setState(
                        isPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED,
                        PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN,
                        1.0f
                )
                .build();
        mediaSession.setPlaybackState(state);
    }

    private void buildAndShowNotification(final String title, final String artist, final String coverUrl, final boolean isPlaying) {
        // Pending intent to return to main activity
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pOpenApp = PendingIntent.getActivity(
                this, 0, openAppIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        // Media Action Pending Intents
        Intent prevIntent = new Intent(this, MediaNotificationService.class).setAction(ACTION_PREV);
        PendingIntent pPrev = PendingIntent.getService(this, 1, prevIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        Intent playPauseIntent = new Intent(this, MediaNotificationService.class).setAction(ACTION_PLAY_PAUSE);
        PendingIntent pPlayPause = PendingIntent.getService(this, 2, playPauseIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        Intent nextIntent = new Intent(this, MediaNotificationService.class).setAction(ACTION_NEXT);
        PendingIntent pNext = PendingIntent.getService(this, 3, nextIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher)
                .setContentTitle(title)
                .setContentText(artist)
                .setContentIntent(pOpenApp)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(isPlaying)
                .addAction(android.R.drawable.ic_media_previous, "Previous", pPrev)
                .addAction(
                        isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                        isPlaying ? "Pause" : "Play",
                        pPlayPause
                )
                .addAction(android.R.drawable.ic_media_next, "Next", pNext)
                .setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                        .setMediaSession(mediaSession.getSessionToken())
                        .setShowActionsInCompactView(0, 1, 2));

        if (cachedArtwork != null && coverUrl != null && coverUrl.equals(lastCoverUrl)) {
            builder.setLargeIcon(cachedArtwork);
        }

        Notification notification = builder.build();
        startForeground(NOTIFICATION_ID, notification);

        // Fetch artwork in background thread if changed
        if (coverUrl != null && !coverUrl.isEmpty() && !coverUrl.equals(lastCoverUrl)) {
            lastCoverUrl = coverUrl;
            new Thread(() -> {
                try {
                    URL url = new URL(coverUrl);
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setDoInput(true);
                    conn.setConnectTimeout(4000);
                    conn.setReadTimeout(4000);
                    conn.connect();
                    InputStream input = conn.getInputStream();
                    Bitmap bitmap = BitmapFactory.decodeStream(input);
                    if (bitmap != null) {
                        cachedArtwork = bitmap;
                        builder.setLargeIcon(bitmap);
                        notificationManager.notify(NOTIFICATION_ID, builder.build());
                    }
                } catch (Exception ignored) {}
            }).start();
        }
    }

    @Override
    public void onDestroy() {
        if (mediaSession != null) {
            mediaSession.release();
        }
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
