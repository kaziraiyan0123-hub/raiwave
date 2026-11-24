package com.raiwave.app;

import com.raiwave.app.BuildConfig;

import android.Manifest;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONObject;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_RECORD_AUDIO = 101;
    private static final int PERMISSION_REQUEST_POST_NOTIFICATIONS = 102;
    private static final String APP_URL = "https://raiwave.vercel.app/#app";

    private static MainActivity instance;
    private BackgroundAudioWebView webView;
    private PermissionRequest pendingPermissionRequest;
    private final ConcurrentHashMap<String, AtomicBoolean> activeDownloadCancels = new ConcurrentHashMap<>();

    private String sanitizeId(String trackId) {
        if (trackId == null) return "unknown";
        return trackId.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private File getOfflineDir() {
        File dir = new File(getFilesDir(), "offline_audio");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return dir;
    }

    private File getOfflineAudioFile(String trackId) {
        return new File(getOfflineDir(), sanitizeId(trackId) + ".audio");
    }

    private void emitDownloadJsEvent(final String script) {
        if (webView != null) {
            runOnUiThread(() -> {
                if (webView != null) {
                    webView.evaluateJavascript(script, null);
                }
            });
        }
    }

    public static void handleMediaAction(String action) {
        if (instance != null && instance.webView != null) {
            instance.runOnUiThread(() -> {
                instance.webView.evaluateJavascript(
                        "window.__raiwaveMediaControl && window.__raiwaveMediaControl('" + action + "')",
                        null
                );
            });
        }
    }

    /**
     * Custom WebView that keeps Chromium rendering, audio, and timers active in background
     * by intercepting visibility and focus callbacks to prevent background throttling or pausing.
     */
    private static class BackgroundAudioWebView extends WebView {
        public BackgroundAudioWebView(Context context) {
            super(context);
        }

        @Override
        protected void onWindowVisibilityChanged(int visibility) {
            // Keep Chromium's audio, video, and JS timers running when app is minimized or phone locked
            super.onWindowVisibilityChanged(View.VISIBLE);
        }

        @Override
        public void dispatchWindowVisibilityChanged(int visibility) {
            super.dispatchWindowVisibilityChanged(View.VISIBLE);
        }

        @Override
        protected void onVisibilityChanged(View changedView, int visibility) {
            super.onVisibilityChanged(changedView, View.VISIBLE);
        }

        @Override
        public void onWindowFocusChanged(boolean hasWindowFocus) {
            super.onWindowFocusChanged(true);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        instance = this;

        // Route physical volume rocker keys directly to media playback stream
        setVolumeControlStream(AudioManager.STREAM_MUSIC);

        // Immersive dark status bar & navigation bar
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor("#090D13"));
        window.setNavigationBarColor(Color.parseColor("#090D13"));

        webView = new BackgroundAudioWebView(this);
        webView.setBackgroundColor(Color.parseColor("#090D13"));
        setContentView(webView);

        configureWebView();
        checkPermissions();

        // Custom back button handling
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });

        webView.loadUrl(APP_URL);
    }

    private void configureWebView() {
        WebView.setWebContentsDebuggingEnabled(true);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setLoadsImagesAutomatically(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // Desktop User-Agent: Crucial to bypass YouTube's mobile-only background auto-pause restriction!
        String desktopUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 RAIWAVE-Android-Standalone";
        settings.setUserAgentString(desktopUserAgent);

        // Enable first-party and third-party cookies for YouTube embed handshake
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        // Native Android Media & Update Bridge
        webView.addJavascriptInterface(new RaiwaveMediaBridge(), "AndroidMedia");

        // Native Download Listener so offline music and APK downloads work seamlessly
        webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
            try {
                if (url.startsWith("blob:") || url.startsWith("data:")) {
                    return;
                }
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                request.setMimeType(mimetype);
                String cookies = CookieManager.getInstance().getCookie(url);
                request.addRequestHeader("cookie", cookies);
                request.addRequestHeader("User-Agent", userAgent);
                request.setDescription("Downloading file...");
                String filename = URLUtil.guessFileName(url, contentDisposition, mimetype);
                request.setTitle(filename);
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename);

                DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                if (dm != null) {
                    dm.enqueue(request);
                    Toast.makeText(MainActivity.this, "Downloading " + filename + " to Downloads folder...", Toast.LENGTH_SHORT).show();
                }
            } catch (Exception e) {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                } catch (Exception ignored) {}
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Nullable
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri reqUri = request.getUrl();
                if (reqUri != null && "raiwave-offline.local".equals(reqUri.getHost())) {
                    try {
                        String path = reqUri.getPath();
                        if (path != null && path.startsWith("/track/")) {
                            String rawId = path.substring("/track/".length());
                            File audioFile = getOfflineAudioFile(rawId);
                            if (audioFile.exists() && audioFile.length() > 1024) {
                                long totalLen = audioFile.length();
                                String rangeHeader = request.getRequestHeaders() != null
                                        ? request.getRequestHeaders().get("Range")
                                        : null;

                                Map<String, String> headers = new HashMap<>();
                                headers.put("Access-Control-Allow-Origin", "*");
                                headers.put("Accept-Ranges", "bytes");
                                headers.put("Cache-Control", "no-store");

                                if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                                    String rangeSpec = rangeHeader.substring("bytes=".length()).trim();
                                    String[] parts = rangeSpec.split("-", 2);
                                    long start = parts[0].isEmpty() ? 0 : Long.parseLong(parts[0]);
                                    long end = (parts.length > 1 && !parts[1].isEmpty())
                                            ? Math.min(totalLen - 1, Long.parseLong(parts[1]))
                                            : (totalLen - 1);
                                    if (start < 0 || start >= totalLen || end < start) {
                                        start = 0;
                                        end = totalLen - 1;
                                    }
                                    final long sliceLen = end - start + 1;
                                    final FileInputStream fis = new FileInputStream(audioFile);
                                    if (start > 0) {
                                        long skipped = 0;
                                        while (skipped < start) {
                                            long n = fis.skip(start - skipped);
                                            if (n <= 0) break;
                                            skipped += n;
                                        }
                                    }
                                    InputStream bounded = new InputStream() {
                                        private long remaining = sliceLen;
                                        @Override
                                        public int read() throws java.io.IOException {
                                            if (remaining <= 0) return -1;
                                            int b = fis.read();
                                            if (b != -1) remaining--;
                                            return b;
                                        }
                                        @Override
                                        public int read(byte[] b, int off, int len) throws java.io.IOException {
                                            if (remaining <= 0) return -1;
                                            int toRead = (int) Math.min(len, remaining);
                                            int count = fis.read(b, off, toRead);
                                            if (count > 0) remaining -= count;
                                            return count;
                                        }
                                        @Override
                                        public void close() throws java.io.IOException {
                                            fis.close();
                                        }
                                    };
                                    headers.put("Content-Range", "bytes " + start + "-" + end + "/" + totalLen);
                                    headers.put("Content-Length", String.valueOf(sliceLen));
                                    return new WebResourceResponse("audio/mpeg", null, 206, "Partial Content", headers, bounded);
                                }

                                headers.put("Content-Length", String.valueOf(totalLen));
                                return new WebResourceResponse("audio/mpeg", null, 200, "OK", headers, new FileInputStream(audioFile));
                            }
                            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null, new ByteArrayInputStream(new byte[0]));
                        }
                    } catch (Exception e) {
                        Log.w("RAIWAVE_OFFLINE", "Failed serving offline file", e);
                    }
                }
                return super.shouldInterceptRequest(view, request);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                view.evaluateJavascript(
                        "(function() {" +
                        "  try {" +
                        "    Object.defineProperty(document, 'hidden', { get: function() { return false; }, configurable: true });" +
                        "    Object.defineProperty(document, 'visibilityState', { get: function() { return 'visible'; }, configurable: true });" +
                        "    Object.defineProperty(document, 'webkitHidden', { get: function() { return false; }, configurable: true });" +
                        "    Object.defineProperty(document, 'webkitVisibilityState', { get: function() { return 'visible'; }, configurable: true });" +
                        "  } catch(e) {}" +
                        "})()",
                        null
                );
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d("RAIWAVE_JS", "[" + consoleMessage.messageLevel() + "] "
                        + consoleMessage.message() + " (" + consoleMessage.sourceId() + ":"
                        + consoleMessage.lineNumber() + ")");
                return true;
            }

            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    for (String resource : request.getResources()) {
                        if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                            if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO)
                                    == PackageManager.PERMISSION_GRANTED) {
                                request.grant(request.getResources());
                            } else {
                                pendingPermissionRequest = request;
                                ActivityCompat.requestPermissions(
                                        MainActivity.this,
                                        new String[]{Manifest.permission.RECORD_AUDIO},
                                        PERMISSION_REQUEST_RECORD_AUDIO
                                );
                            }
                            return;
                        }
                    }
                    request.grant(request.getResources());
                });
            }
        });
    }

    public class RaiwaveMediaBridge {
        @JavascriptInterface
        public void updateMedia(String title, String artist, String coverUrl, boolean isPlaying) {
            updateMediaWithDetails(title, artist, "RAIWAVE Universal Stream", coverUrl, isPlaying, 0, 0);
        }

        @JavascriptInterface
        public void updateMediaWithDetails(String title, String artist, String album, String coverUrl, boolean isPlaying, long durationSec, long positionSec) {
            Intent intent = new Intent(MainActivity.this, MediaNotificationService.class);
            intent.setAction(MediaNotificationService.ACTION_UPDATE);
            intent.putExtra("title", title);
            intent.putExtra("artist", artist);
            intent.putExtra("album", album);
            intent.putExtra("coverUrl", coverUrl);
            intent.putExtra("isPlaying", isPlaying);
            intent.putExtra("durationMs", durationSec * 1000L);
            intent.putExtra("positionMs", positionSec * 1000L);

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    ContextCompat.startForegroundService(MainActivity.this, intent);
                } else {
                    startService(intent);
                }
            } catch (Exception e) {
                try {
                    startService(intent);
                } catch (Exception ignored) {}
            }
        }

        @JavascriptInterface
        public void downloadAndInstallApk(String apkUrl) {
            runOnUiThread(() -> {
                try {
                    DownloadManager.Request request = new DownloadManager.Request(Uri.parse(apkUrl));
                    request.setMimeType("application/vnd.android.package-archive");
                    request.setDescription("Downloading latest RAIWAVE APK update...");
                    request.setTitle("RAIWAVE Update (v" + BuildConfig.VERSION_NAME + ")");
                    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "RAIWAVE.apk");

                    DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                    if (dm != null) {
                        final long downloadId = dm.enqueue(request);
                        Toast.makeText(MainActivity.this, "Downloading RAIWAVE update... Pull down notifications to view progress.", Toast.LENGTH_LONG).show();

                        BroadcastReceiver onComplete = new BroadcastReceiver() {
                            @Override
                            public void onReceive(Context context, Intent intent) {
                                long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                                if (id == downloadId) {
                                    try {
                                        Uri apkUri = dm.getUriForDownloadedFile(downloadId);
                                        if (apkUri != null) {
                                            Intent installIntent = new Intent(Intent.ACTION_VIEW);
                                            installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                                            installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                                            startActivity(installIntent);
                                        }
                                    } catch (Exception ex) {
                                        ex.printStackTrace();
                                    }
                                    try {
                                        unregisterReceiver(this);
                                    } catch (Exception ignored) {}
                                }
                            }
                        };

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            registerReceiver(onComplete, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), Context.RECEIVER_NOT_EXPORTED);
                        } else {
                            registerReceiver(onComplete, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
                        }
                    }
                } catch (Exception e) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl));
                        startActivity(intent);
                    } catch (Exception ignored) {}
                }
            });
        }

        @JavascriptInterface
        public void downloadOfflineAudio(final String trackId, final String audioUrl) {
            if (trackId == null || audioUrl == null ||
                    !(audioUrl.startsWith("https://") || audioUrl.startsWith("http://"))) {
                emitDownloadJsEvent("window.__raiwaveNativeDownloadComplete && window.__raiwaveNativeDownloadComplete("
                        + JSONObject.quote(trackId == null ? "" : trackId)
                        + ", false, 'Unsupported or missing audio URL', 0, '')");
                return;
            }

            final String safeId = sanitizeId(trackId);
            final AtomicBoolean cancelled = new AtomicBoolean(false);
            AtomicBoolean prevCancel = activeDownloadCancels.put(safeId, cancelled);
            if (prevCancel != null) {
                prevCancel.set(true);
            }

            new Thread(() -> {
                File tmpFile = new File(getOfflineDir(), safeId + ".tmp");
                File finalFile = getOfflineAudioFile(trackId);
                HttpURLConnection conn = null;
                try {
                    if (finalFile.exists() && finalFile.length() > 1024) {
                        String localUrl = "https://raiwave-offline.local/track/" + safeId;
                        emitDownloadJsEvent("window.__raiwaveNativeDownloadComplete && window.__raiwaveNativeDownloadComplete("
                                + JSONObject.quote(trackId) + ", true, '', " + finalFile.length() + ", "
                                + JSONObject.quote(localUrl) + ")");
                        activeDownloadCancels.remove(safeId, cancelled);
                        return;
                    }

                    long existingBytes = tmpFile.exists() ? tmpFile.length() : 0;
                    URL url = new URL(audioUrl);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setConnectTimeout(15000);
                    conn.setReadTimeout(20000);
                    conn.setInstanceFollowRedirects(true);
                    conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36");
                    if (existingBytes > 0) {
                        conn.setRequestProperty("Range", "bytes=" + existingBytes + "-");
                    }

                    int status = conn.getResponseCode();
                    boolean appendMode = (status == HttpURLConnection.HTTP_PARTIAL && existingBytes > 0);
                    if (status != HttpURLConnection.HTTP_OK && status != HttpURLConnection.HTTP_PARTIAL) {
                        if (tmpFile.exists()) tmpFile.delete();
                        throw new Exception("HTTP " + status);
                    }

                    long totalBytes = conn.getContentLengthLong();
                    if (appendMode && totalBytes > 0) {
                        totalBytes += existingBytes;
                    } else if (!appendMode) {
                        existingBytes = 0;
                    }

                    String contentType = conn.getContentType();
                    if (contentType != null && !contentType.startsWith("audio/") && !contentType.contains("octet-stream")) {
                        throw new Exception("Invalid audio content type: " + contentType);
                    }

                    long downloaded = existingBytes;
                    int lastPct = -1;
                    try (InputStream in = conn.getInputStream();
                         FileOutputStream out = new FileOutputStream(tmpFile, appendMode)) {
                        byte[] buf = new byte[16384];
                        int n;
                        while ((n = in.read(buf)) != -1) {
                            if (cancelled.get()) {
                                throw new InterruptedException("CANCELLED");
                            }
                            out.write(buf, 0, n);
                            downloaded += n;
                            if (totalBytes > 0) {
                                int pct = (int) Math.min(99, (downloaded * 100L) / totalBytes);
                                if (pct != lastPct) {
                                    lastPct = pct;
                                    emitDownloadJsEvent("window.__raiwaveNativeDownloadProgress && window.__raiwaveNativeDownloadProgress("
                                            + JSONObject.quote(trackId) + ", " + pct + ", " + downloaded + ", " + totalBytes + ")");
                                }
                            }
                        }
                        out.getFD().sync();
                    }

                    if (cancelled.get()) {
                        throw new InterruptedException("CANCELLED");
                    }

                    if (!tmpFile.exists() || tmpFile.length() <= 1024 || (totalBytes > 0 && tmpFile.length() < totalBytes)) {
                        throw new Exception("Incomplete audio file downloaded");
                    }

                    if (finalFile.exists()) finalFile.delete();
                    if (!tmpFile.renameTo(finalFile)) {
                        throw new Exception("Failed to save audio file");
                    }

                    String localUrl = "https://raiwave-offline.local/track/" + safeId;
                    emitDownloadJsEvent("window.__raiwaveNativeDownloadComplete && window.__raiwaveNativeDownloadComplete("
                            + JSONObject.quote(trackId) + ", true, '', " + finalFile.length() + ", "
                            + JSONObject.quote(localUrl) + ")");
                } catch (InterruptedException cancelEx) {
                    if (tmpFile.exists()) tmpFile.delete();
                    emitDownloadJsEvent("window.__raiwaveNativeDownloadComplete && window.__raiwaveNativeDownloadComplete("
                            + JSONObject.quote(trackId) + ", false, 'cancelled', 0, '')");
                } catch (Exception e) {
                    emitDownloadJsEvent("window.__raiwaveNativeDownloadComplete && window.__raiwaveNativeDownloadComplete("
                            + JSONObject.quote(trackId) + ", false, "
                            + JSONObject.quote(e.getMessage() != null ? e.getMessage() : "Download failed")
                            + ", 0, '')");
                } finally {
                    if (conn != null) conn.disconnect();
                    activeDownloadCancels.remove(safeId, cancelled);
                }
            }).start();
        }

        @JavascriptInterface
        public boolean cancelOfflineAudio(String trackId) {
            String safeId = sanitizeId(trackId);
            AtomicBoolean flag = activeDownloadCancels.get(safeId);
            if (flag != null) {
                flag.set(true);
                return true;
            }
            return false;
        }

        @JavascriptInterface
        public boolean deleteOfflineAudio(String trackId) {
            String safeId = sanitizeId(trackId);
            File tmpFile = new File(getOfflineDir(), safeId + ".tmp");
            if (tmpFile.exists()) tmpFile.delete();
            File f = getOfflineAudioFile(trackId);
            return !f.exists() || f.delete();
        }

        @JavascriptInterface
        public String getOfflineAudioInfo(String trackId) {
            try {
                String safeId = sanitizeId(trackId);
                File f = getOfflineAudioFile(trackId);
                JSONObject obj = new JSONObject();
                boolean exists = f.exists() && f.length() > 1024;
                obj.put("exists", exists);
                obj.put("sizeBytes", exists ? f.length() : 0);
                obj.put("localUrl", exists ? ("https://raiwave-offline.local/track/" + safeId) : "");
                return obj.toString();
            } catch (Exception e) {
                return "{\"exists\":false,\"sizeBytes\":0,\"localUrl\":\"\"}";
            }
        }

        @JavascriptInterface
        public String getNativeVersion() {
            return BuildConfig.VERSION_NAME;
        }
    }

    private void checkPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                    this,
                    new String[]{Manifest.permission.RECORD_AUDIO},
                    PERMISSION_REQUEST_RECORD_AUDIO
            );
        }

        // Post Notifications permission for Android 13+ (API 33+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                        this,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS},
                        PERMISSION_REQUEST_POST_NOTIFICATIONS
                );
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_RECORD_AUDIO) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                if (pendingPermissionRequest != null) {
                    pendingPermissionRequest.grant(pendingPermissionRequest.getResources());
                    pendingPermissionRequest = null;
                }
            } else {
                if (pendingPermissionRequest != null) {
                    pendingPermissionRequest.deny();
                    pendingPermissionRequest = null;
                }
            }
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Do NOT pause WebView audio or timers when minimized so music continues in background!
    }

    @Override
    protected void onStop() {
        super.onStop();
        // Do NOT pause WebView audio or timers when minimized or phone screen is locked!
    }

    @Override
    protected void onDestroy() {
        instance = null;
        super.onDestroy();
    }
}
