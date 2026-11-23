import { useState } from 'react'
import {
  Download,
  Smartphone,
  Monitor,
  Globe,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'
import { SITE_CONFIG } from '../../config/siteConfig'

interface DownloadSectionProps {
  onSelectPlatform: (platform: 'android' | 'windows') => void
  onLaunchWeb: () => void
}

export function DownloadSection({ onSelectPlatform, onLaunchWeb }: DownloadSectionProps) {
  const [showAndroidChangelog, setShowAndroidChangelog] = useState(false)
  const [showWindowsInstructions, setShowWindowsInstructions] = useState(false)

  const { android, windows, web } = SITE_CONFIG.downloads

  return (
    <section id="download" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[180px] pointer-events-none opacity-20 bg-indigo-600/30" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Download className="w-3.5 h-3.5" />
          <span>Official Distribution</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase font-heading">
          Get RAIWAVE Today
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#94A3B8]">
          Direct official releases. Zero ads, zero subscriptions, and complete respect for your privacy.
        </p>
      </div>

      {/* Download Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* ================================================================= */}
        {/* CARD 1: ANDROID APK */}
        {/* ================================================================= */}
        <div className="relative rounded-3xl p-7 bg-[#140F24]/90 border border-purple-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col justify-between overflow-hidden group hover:border-purple-400/60 transition-all duration-300">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-purple-600/20 group-hover:bg-purple-600/30 transition-all" />

          <div>
            {/* Top Row: Icon + Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Smartphone className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {android.version}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-2xl font-bold text-white font-heading">{android.title}</h3>
            <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">{android.subtitle}</p>

            {/* Specs Table */}
            <div className="mt-6 space-y-2.5 py-4 border-y border-white/10 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Package Format</span>
                <span className="font-semibold text-white">Direct APK File</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">File Size</span>
                <span className="font-bold text-purple-300">{android.fileSize}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Minimum OS</span>
                <span className="font-semibold text-white">{android.requirements}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Released</span>
                <span className="font-semibold text-white">{android.releaseDate}</span>
              </div>
            </div>

            {/* Changelog Toggle */}
            <div className="mt-4">
              <button
                onClick={() => setShowAndroidChangelog((prev) => !prev)}
                className="flex items-center justify-between w-full text-xs font-semibold text-purple-300 hover:text-purple-200 transition-colors py-1 cursor-pointer"
              >
                <span>What's new in {android.version}</span>
                {showAndroidChangelog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAndroidChangelog && android.changelog && (
                <ul className="mt-2.5 space-y-1.5 pl-2 border-l border-purple-500/30 text-[11px] text-[#94A3B8] animate-in fade-in duration-200">
                  {android.changelog.map((log, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{log}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-4">
            <button
              onClick={() => onSelectPlatform('android')}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_24px_rgba(147,51,234,0.4)] border border-purple-400/40 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
            >
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              <span>DOWNLOAD APK ({android.fileSize})</span>
            </button>
            <p className="mt-2 text-center text-[10px] text-white/40">Direct download • No Google Play account needed</p>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CARD 2: WINDOWS DESKTOP */}
        {/* ================================================================= */}
        <div className="relative rounded-3xl p-7 bg-[#140F24]/90 border border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col justify-between overflow-hidden group hover:border-cyan-400/60 transition-all duration-300">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-cyan-600/20 group-hover:bg-cyan-600/30 transition-all" />

          <div>
            {/* Top Row: Icon + Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Monitor className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {windows.version}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-2xl font-bold text-white font-heading">{windows.title}</h3>
            <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">{windows.subtitle}</p>

            {/* Specs Table */}
            <div className="mt-6 space-y-2.5 py-4 border-y border-white/10 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Architecture</span>
                <span className="font-semibold text-white">x64 (64-Bit Portable)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">File Size</span>
                <span className="font-bold text-cyan-300">{windows.fileSize}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">System</span>
                <span className="font-semibold text-white truncate max-w-[180px] text-right">Windows 10 / 11</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Released</span>
                <span className="font-semibold text-white">{windows.releaseDate}</span>
              </div>
            </div>

            {/* Installation Guide Toggle */}
            <div className="mt-4">
              <button
                onClick={() => setShowWindowsInstructions((prev) => !prev)}
                className="flex items-center justify-between w-full text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors py-1 cursor-pointer"
              >
                <span>How to run on Windows</span>
                {showWindowsInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showWindowsInstructions && windows.instructions && (
                <ul className="mt-2.5 space-y-1.5 pl-2 border-l border-cyan-500/30 text-[11px] text-[#94A3B8] animate-in fade-in duration-200">
                  {windows.instructions.map((step, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-4">
            <button
              onClick={() => onSelectPlatform('windows')}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-[0_0_24px_rgba(6,182,212,0.4)] border border-cyan-400/40 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
            >
              <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              <span>DOWNLOAD FOR WINDOWS</span>
            </button>
            <p className="mt-2 text-center text-[10px] text-white/40">Single-file executable • Portable, no installation wizard</p>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CARD 3: WEB PLAYER */}
        {/* ================================================================= */}
        <div className="relative rounded-3xl p-7 bg-[#140F24]/90 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col justify-between overflow-hidden group hover:border-white/20 transition-all duration-300">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-emerald-600/15 group-hover:bg-emerald-600/25 transition-all" />

          <div>
            {/* Top Row: Icon + Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Globe className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Instant Access
              </span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-2xl font-bold text-white font-heading">{web.title}</h3>
            <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">{web.subtitle}</p>

            {/* Specs Table */}
            <div className="mt-6 space-y-2.5 py-4 border-y border-white/10 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Platform</span>
                <span className="font-semibold text-white">Browser (Cross-Platform)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Installation</span>
                <span className="font-bold text-emerald-300">Zero Setup Required</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Compatible</span>
                <span className="font-semibold text-white truncate max-w-[180px] text-right">Chrome, Safari, Firefox, Edge</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">PWA Offline</span>
                <span className="font-semibold text-white">Full ServiceWorker Support</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-[#94A3B8] leading-relaxed">
              Prefer listening right in your browser? Stream effortlessly with full playback, queue management, and
              visualizer access.
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-8 pt-4">
            <button
              onClick={onLaunchWeb}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/15 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
            >
              <span>LAUNCH WEB PLAYER</span>
              <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <p className="mt-2 text-center text-[10px] text-white/40">Runs on mobile and desktop web browsers instantly</p>
          </div>
        </div>
      </div>

      {/* Trust & Transparency Banner */}
      <div className="mt-16 p-6 rounded-3xl bg-[#110D1D] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Official & Verified Developer Builds</h4>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              All binaries are compiled directly from source and signed by Raiyan. No third-party download mirrors, no
              bundled promotional software, and no tracking cookies.
            </p>
          </div>
        </div>

        <a
          href={SITE_CONFIG.developer.socials.repository}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
        >
          <span>View GitHub Source Code</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  )
}
