package com.raiwave.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.SystemClock;
import android.support.v4.media.MediaMetadataCompat;
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
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private AudioManager.OnAudioFocusChangeListener audioFocusChangeListener;
    private PowerManager.WakeLock wakeLock;
    private Bitmap cachedArtwork = null;
    private String lastCoverUrl = "";
    private boolean isForegroundStarted = false;

    @Override
    public void onCreate() {
        super.onCreate();
        notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        createNotificationChannel();

        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        audioFocusChangeListener = focusChange -> {
            // Audio focus is managed directly by Chromium within the same app process.
            // We intentionally do not interfere with WebView playback.
        };

        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (powerManager != null) {
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "RAIWAVE:MediaPlaybackWakeLock");
            wakeLock.setReferenceCounted(false);
        }

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
            public void onSeekTo(long pos) {
                long posSec = pos / 1000L;
                MainActivity.handleMediaAction("seek:" + posSec);
            }

            @Override
            public void onStop() {
                MainActivity.handleMediaAction("pause");
                abandonAudioFocus();
                if (wakeLock != null && wakeLock.isHeld()) {
                    wakeLock.release();
                }
                stopForeground(true);
                isForegroundStarted = false;
                stopSelf();
            }
        });
    }

    private void requestAudioFocus() {
        // No-op: Do NOT steal audio focus from the in-app Chromium WebView!
        // Chromium's AudioFocusDelegate manages native media stream focus directly.
    }

    private void abandonAudioFocus() {
        // No-op
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "RAIWAVE Music Playback",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Shows active Spotify-style playback controls on lock screen and notification shade");
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
            abandonAudioFocus();
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
            stopForeground(true);
            isForegroundStarted = false;
            stopSelf();
        } else if (ACTION_UPDATE.equals(action)) {
            String title = intent.getStringExtra("title");
            String artist = intent.getStringExtra("artist");
            String album = intent.getStringExtra("album");
            String coverUrl = intent.getStringExtra("coverUrl");
            boolean isPlaying = intent.getBooleanExtra("isPlaying", false);
            long durationMs = intent.getLongExtra("durationMs", 0);
            long positionMs = intent.getLongExtra("positionMs", 0);

            if (title == null || title.isEmpty()) title = "RAIWAVE Music";
            if (artist == null || artist.isEmpty()) artist = "Universal Stream";
            if (album == null || album.isEmpty()) album = "RAIWAVE Lossless";

            if (isPlaying) {
                requestAudioFocus();
                if (wakeLock != null && !wakeLock.isHeld()) {
                    wakeLock.acquire(1000 * 60 * 360); // 6 hours timeout
                }
            } else {
                if (wakeLock != null && wakeLock.isHeld()) {
                    wakeLock.release();
                }
            }

            updatePlaybackState(isPlaying, positionMs);
            buildAndShowNotification(title, artist, album, coverUrl, isPlaying, durationMs, positionMs);
        }

        return START_NOT_STICKY;
    }

    private void updatePlaybackState(boolean isPlaying, long positionMs) {
        if (mediaSession == null) return;
        long actions = PlaybackStateCompat.ACTION_PLAY |
                PlaybackStateCompat.ACTION_PAUSE |
                PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
                PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
                PlaybackStateCompat.ACTION_PLAY_PAUSE |
                PlaybackStateCompat.ACTION_SEEK_TO;

        PlaybackStateCompat state = new PlaybackStateCompat.Builder()
                .setActions(actions)
                .setState(
                        isPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED,
                        positionMs >= 0 ? positionMs : PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN,
                        isPlaying ? 1.0f : 0.0f,
                        SystemClock.elapsedRealtime()
                )
                .build();
        mediaSession.setPlaybackState(state);
    }

    private void buildAndShowNotification(
            final String title,
            final String artist,
            final String album,
            final String coverUrl,
            final boolean isPlaying,
            final long durationMs,
            final long positionMs
    ) {
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

        // Set Media Metadata on MediaSession (Critical for Android 11+ Quick Settings / Lockscreen Media Card)
        MediaMetadataCompat.Builder metaBuilder = new MediaMetadataCompat.Builder()
                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
                .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist)
                .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, album);

        if (durationMs > 0) {
            metaBuilder.putLong(MediaMetadataCompat.METADATA_KEY_DURATION, durationMs);
        }

        if (cachedArtwork != null && coverUrl != null && coverUrl.equals(lastCoverUrl)) {
            metaBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, cachedArtwork);
            metaBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ART, cachedArtwork);
        }

        if (mediaSession != null) {
            mediaSession.setMetadata(metaBuilder.build());
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher)
                .setContentTitle(title)
                .setContentText(artist)
                .setSubText(album)
                .setContentIntent(pOpenApp)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
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

        // Android 10+ (API 29+) and Android 14+ (API 34+) require foregroundServiceType parameter
        if (!isForegroundStarted) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
                } else {
                    startForeground(NOTIFICATION_ID, notification);
                }
                isForegroundStarted = true;
            } catch (Exception e) {
                notificationManager.notify(NOTIFICATION_ID, notification);
            }
        } else {
            notificationManager.notify(NOTIFICATION_ID, notification);
        }

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
                        metaBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, bitmap);
                        metaBuilder.putBitmap(MediaMetadataCompat.METADATA_KEY_ART, bitmap);
                        if (mediaSession != null) {
                            mediaSession.setMetadata(metaBuilder.build());
                        }
                        notificationManager.notify(NOTIFICATION_ID, builder.build());
                    }
                } catch (Exception ignored) {}
            }).start();
        }
    }

    @Override
    public void onDestroy() {
        abandonAudioFocus();
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
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
