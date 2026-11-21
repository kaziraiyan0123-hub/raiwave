using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace Raiwave;

public partial class Form1 : Form
{
    private WebView2? _webView;

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

            var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
            await _webView.EnsureCoreWebView2Async(env);

            _webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            _webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
            _webView.CoreWebView2.Settings.IsZoomControlEnabled = false;

            // Direct live stream application
            _webView.CoreWebView2.Navigate("https://raiwave.vercel.app");
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
}
