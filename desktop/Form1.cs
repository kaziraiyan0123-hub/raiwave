using System;
using System.Collections.Concurrent;
using System.Drawing;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace Raiwave;

public partial class Form1 : Form
{
    private WebView2? _webView;
    private static readonly HttpClient _httpClient = new HttpClient();
    private readonly ConcurrentDictionary<string, CancellationTokenSource> _activeDownloads = new();
    private string _offlineDir = "";

    public Form1()
    {
        InitializeComponent();
        ConfigureWindow();
        InitializeWebView();
    }

    private void ConfigureWindow()
    {
        this.Text = "RAIWAVE — Feel Every Frequency | Developer: Kazi Raiyan";
        this.Size = new Size(1380, 880);
        this.MinimumSize = new Size(960, 640);
        this.StartPosition = FormStartPosition.CenterScreen;
        this.BackColor = Color.FromArgb(9, 13, 19); // Midnight Black #090D13

        // Load RAIWAVE icon for window titlebar and taskbar
        try
        {
            // 1. Extract associated icon from executable itself (works in single-file exe)
            string? exePath = Environment.ProcessPath ?? Application.ExecutablePath;
            if (!string.IsNullOrEmpty(exePath) && File.Exists(exePath))
            {
                var assocIcon = Icon.ExtractAssociatedIcon(exePath);
                if (assocIcon != null)
                {
                    this.Icon = assocIcon;
                }
            }
        }
        catch { }

        if (this.Icon == null)
        {
            try
            {
                // 2. Load from embedded resource stream
                using var stream = typeof(Form1).Assembly.GetManifestResourceStream("Raiwave.app.ico");
                if (stream != null)
                {
                    this.Icon = new Icon(stream);
                }
            }
            catch { }
        }

        if (this.Icon == null)
        {
            try
            {
                // 3. Fallback to loose app.ico beside executable
                string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app.ico");
                if (File.Exists(iconPath))
                {
                    this.Icon = new Icon(iconPath);
                }
            }
            catch { }
        }
    }

    private async void InitializeWebView()
    {
        _webView = new WebView2
        {
            Dock = DockStyle.Fill,
            BackColor = Color.FromArgb(9, 13, 19)
        };

        this.Controls.Add(_webView);

        try
        {
            // Persistent user data folder for Gmail login, recordings, and playlists
            string userDataFolder = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "RAIWAVE",
                "UserData"
            );
            Directory.CreateDirectory(userDataFolder);
            _offlineDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "RAIWAVE",
                "OfflineAudio"
            );
            Directory.CreateDirectory(_offlineDir);

            var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
            await _webView.EnsureCoreWebView2Async(env);

            _webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            _webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
            _webView.CoreWebView2.Settings.IsZoomControlEnabled = false;
            _webView.CoreWebView2.Settings.UserAgent += " RAIWAVE-Desktop-Standalone";

            _webView.CoreWebView2.AddWebResourceRequestedFilter("https://raiwave-offline.local/*", CoreWebView2WebResourceContext.All);
            _webView.CoreWebView2.WebResourceRequested += (s, args) =>
            {
                try
                {
                    var uri = new Uri(args.Request.Uri);
                    if (uri.Host == "raiwave-offline.local" && uri.AbsolutePath.StartsWith("/track/"))
                    {
                        var safeId = SanitizeId(uri.AbsolutePath.Substring("/track/".Length));
                        var filePath = Path.Combine(_offlineDir, safeId + ".audio");
                        if (File.Exists(filePath))
                        {
                            var fileInfo = new FileInfo(filePath);
                            long totalLen = fileInfo.Length;
                            if (totalLen > 1024)
                            {
                                string? rangeHeader = null;
                                if (args.Request.Headers.Contains("Range"))
                                {
                                    rangeHeader = args.Request.Headers.GetHeader("Range");
                                }

                                if (!string.IsNullOrEmpty(rangeHeader) && rangeHeader.StartsWith("bytes="))
                                {
                                    var rangeSpec = rangeHeader.Substring("bytes=".Length).Split(',')[0].Trim();
                                    var parts = rangeSpec.Split('-');
                                    long start = string.IsNullOrEmpty(parts[0]) ? 0 : long.Parse(parts[0]);
                                    long end = (parts.Length > 1 && !string.IsNullOrEmpty(parts[1])) ? long.Parse(parts[1]) : (totalLen - 1);
                                    start = Math.Max(0, Math.Min(start, totalLen - 1));
                                    end = Math.Max(start, Math.Min(end, totalLen - 1));
                                    long sliceLen = end - start + 1;

                                    byte[] sliceBuf = new byte[sliceLen];
                                    using (var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read))
                                    {
                                        fs.Seek(start, SeekOrigin.Begin);
                                        int offset = 0;
                                        while (offset < sliceLen)
                                        {
                                            int read = fs.Read(sliceBuf, offset, (int)(sliceLen - offset));
                                            if (read <= 0) break;
                                            offset += read;
                                        }
                                    }

                                    var mem = new MemoryStream(sliceBuf);
                                    args.Response = _webView.CoreWebView2.Environment.CreateWebResourceResponse(
                                        mem, 206, "Partial Content",
                                        $"Content-Type: audio/mpeg\r\nAccept-Ranges: bytes\r\nAccess-Control-Allow-Origin: *\r\nContent-Range: bytes {start}-{end}/{totalLen}\r\nContent-Length: {sliceLen}"
                                    );
                                    return;
                                }

                                var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
                                var response = _webView.CoreWebView2.Environment.CreateWebResourceResponse(
                                    stream, 200, "OK",
                                    $"Content-Type: audio/mpeg\r\nAccept-Ranges: bytes\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: {totalLen}"
                                );
                                args.Response = response;
                                return;
                            }
                        }
                        args.Response = _webView.CoreWebView2.Environment.CreateWebResourceResponse(null, 404, "Not Found", "");
                    }
                }
                catch { }
            };

            _webView.CoreWebView2.WebMessageReceived += async (s, args) =>
            {
                try
                {
                    using var doc = JsonDocument.Parse(args.WebMessageAsJson);
                    var root = doc.RootElement;
                    if (!root.TryGetProperty("action", out var actionProp)) return;
                    var action = actionProp.GetString();
                    var trackId = root.TryGetProperty("trackId", out var idProp) ? (idProp.GetString() ?? "") : "";
                    var audioUrl = root.TryGetProperty("audioUrl", out var urlProp) ? (urlProp.GetString() ?? "") : "";

                    if (action == "downloadOfflineAudio")
                    {
                        _ = DownloadDesktopAudioAsync(trackId, audioUrl);
                    }
                    else if (action == "cancelOfflineAudio")
                    {
                        var safeId = SanitizeId(trackId);
                        if (_activeDownloads.TryRemove(safeId, out var cts)) cts.Cancel();
                    }
                    else if (action == "deleteOfflineAudio")
                    {
                        var safeId = SanitizeId(trackId);
                        var path = Path.Combine(_offlineDir, safeId + ".audio");
                        var tmpPath = Path.Combine(_offlineDir, safeId + ".tmp");
                        try { if (File.Exists(tmpPath)) File.Delete(tmpPath); } catch { }
                        try { if (File.Exists(path)) File.Delete(path); } catch { }
                    }
                    else if (action == "checkOfflineAudio")
                    {
                        var safeId = SanitizeId(trackId);
                        var path = Path.Combine(_offlineDir, safeId + ".audio");
                        var info = new FileInfo(path);
                        bool exists = info.Exists && info.Length > 1024;
                        string localUrl = exists ? $"https://raiwave-offline.local/track/{safeId}" : "";
                        await EmitJsAsync($"window.__raiwaveDesktopAudioCheck && window.__raiwaveDesktopAudioCheck({JsonSerializer.Serialize(trackId)}, {(exists ? "true" : "false")}, {(exists ? info.Length : 0)}, {JsonSerializer.Serialize(localUrl)})");
                    }
                }
                catch { }
            };

            // Direct standalone desktop music player application
            _webView.CoreWebView2.Navigate("https://raiwave.vercel.app/#app");
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                $"Could not initialize RAIWAVE desktop audio engine: {ex.Message}\n\nPlease ensure Microsoft Edge WebView2 is installed.",
                "RAIWAVE Audio Engine Error",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
        }
    }

    private static string SanitizeId(string id) => Regex.Replace(id ?? "unknown", @"[^a-zA-Z0-9._-]", "_");

    private Task EmitJsAsync(string script)
    {
        if (this.IsDisposed || _webView?.CoreWebView2 == null) return Task.CompletedTask;
        try
        {
            this.BeginInvoke(() =>
            {
                if (!this.IsDisposed && _webView?.CoreWebView2 != null)
                {
                    _ = _webView.CoreWebView2.ExecuteScriptAsync(script);
                }
            });
        }
        catch { }
        return Task.CompletedTask;
    }

    private async Task DownloadDesktopAudioAsync(string trackId, string audioUrl)
    {
        if (string.IsNullOrEmpty(trackId) || string.IsNullOrEmpty(audioUrl) ||
            !(audioUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase) || audioUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase)))
        {
            await EmitJsAsync($"window.__raiwaveNativeDownloadComplete && window.__raiwaveNativeDownloadComplete({JsonSerializer.Serialize(trackId)}, false, 'Unsupported or missing audio URL', 0, '')");
            return;
        }

        var safeId = SanitizeId(trackId);
        var finalPath = Path.Combine(_offlineDir, safeId + ".audio");
        var tmpPath = Path.Combine(_offlineDir, safeId + ".tmp");

        if (File.Exists(finalPath) && new FileInfo(finalPath).Length > 1024)
        {
            var len = new FileInfo(finalPath).Length;
            await EmitJsAsync($"window.__raiwaveNativeDownloadComplete && window.__raiwaveNativeDownloadComplete({JsonSerializer.Serialize(trackId)}, true, '', {len}, {JsonSerializer.Serialize($"https://raiwave-offline.local/track/{safeId}")})");
            return;
        }

        if (_activeDownloads.TryRemove(safeId, out var oldCts)) oldCts.Cancel();
        var cts = new CancellationTokenSource();
        _activeDownloads[safeId] = cts;

        try
        {
            using var resp = await _httpClient.GetAsync(audioUrl, HttpCompletionOption.ResponseHeadersRead, cts.Token);
            if (!resp.IsSuccessStatusCode) throw new Exception($"HTTP {(int)resp.StatusCode}");

            var totalBytes = resp.Content.Headers.ContentLength ?? -1;
            using (var input = await resp.Content.ReadAsStreamAsync(cts.Token))
            using (var output = new FileStream(tmpPath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                var buffer = new byte[16384];
                long downloaded = 0;
                int lastPct = -1;
                int read;
                while ((read = await input.ReadAsync(buffer, 0, buffer.Length, cts.Token)) > 0)
                {
                    await output.WriteAsync(buffer, 0, read, cts.Token);
                    downloaded += read;
                    if (totalBytes > 0)
                    {
                        int pct = (int)Math.Min(99, (downloaded * 100L) / totalBytes);
                        if (pct != lastPct)
                        {
                            lastPct = pct;
                            await EmitJsAsync($"window.__raiwaveNativeDownloadProgress && window.__raiwaveNativeDownloadProgress({JsonSerializer.Serialize(trackId)}, {pct}, {downloaded}, {totalBytes})");
                        }
                    }
                }
                await output.FlushAsync(cts.Token);
            }

            var tmpInfo = new FileInfo(tmpPath);
            if (!tmpInfo.Exists || tmpInfo.Length <= 1024 || (totalBytes > 0 && tmpInfo.Length < totalBytes))
            {
                throw new Exception("Incomplete audio download");
            }

            File.Move(tmpPath, finalPath, true);
            await EmitJsAsync($"window.__raiwaveNativeDownloadComplete && window.__raiwaveNativeDownloadComplete({JsonSerializer.Serialize(trackId)}, true, '', {tmpInfo.Length}, {JsonSerializer.Serialize($"https://raiwave-offline.local/track/{safeId}")})");
        }
        catch (OperationCanceledException)
        {
            try { if (File.Exists(tmpPath)) File.Delete(tmpPath); } catch { }
            await EmitJsAsync($"window.__raiwaveNativeDownloadComplete && window.__raiwaveNativeDownloadComplete({JsonSerializer.Serialize(trackId)}, false, 'cancelled', 0, '')");
        }
        catch (Exception ex)
        {
            await EmitJsAsync($"window.__raiwaveNativeDownloadComplete && window.__raiwaveNativeDownloadComplete({JsonSerializer.Serialize(trackId)}, false, {JsonSerializer.Serialize(ex.Message)}, 0, '')");
        }
        finally
        {
            _activeDownloads.TryRemove(safeId, out _);
        }
    }
}
