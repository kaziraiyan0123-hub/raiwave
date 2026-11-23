import { useState } from 'react'
import {
  Globe,
  ShieldCheck,
  ChevronUp,
  Smartphone,
  Monitor,
  ExternalLink,
} from 'lucide-react'
import { SITE_CONFIG } from '../../config/siteConfig'

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

interface WebsiteFooterProps {
  onDownloadAndroid: () => void
  onDownloadWindows: () => void
  onLaunchWeb?: () => void
}

export function WebsiteFooter({
  onDownloadAndroid,
  onDownloadWindows,
}: WebsiteFooterProps) {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative bg-[#08050E] border-t border-white/10 pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-white/70 overflow-hidden">
      {/* Background Soft Ambient Light */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] rounded-full blur-[180px] pointer-events-none opacity-10 bg-purple-600" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Column 1 & 2: Brand & Developer Statement */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center p-1.5 shadow-md">
                <div className="flex items-end gap-0.5 h-3.5">
                  <span className="w-0.5 h-2 bg-white rounded-full animate-pulse" />
                  <span className="w-0.5 h-3 bg-white rounded-full animate-pulse delay-75" />
                  <span className="w-0.5 h-2.5 bg-white rounded-full animate-pulse delay-150" />
                  <span className="w-0.5 h-3.5 bg-white rounded-full animate-pulse delay-100" />
                </div>
              </div>
              <span className="text-xl font-black tracking-wider text-white font-heading">
                {SITE_CONFIG.appName}
              </span>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-[#94A3B8] max-w-sm leading-relaxed">
              Discover a new way to experience music. Built for your moments, your moods, and your world. Dedicated to
              high-fidelity streaming and acoustic immersion.
            </p>

            <div className="mt-6 flex items-center gap-2 text-xs text-white/50">
              <span>Created & Developed by</span>
              <span className="font-bold text-white bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                {SITE_CONFIG.developer.name}
              </span>
            </div>

            {/* Social / GitHub */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href={SITE_CONFIG.developer.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer border border-white/5"
                title="Developer GitHub Profile"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href={SITE_CONFIG.developer.socials.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer border border-white/5"
                title="GitHub Project Repository"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 3: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Explore</h4>
            <ul className="space-y-2.5 text-xs text-[#94A3B8]">
              {SITE_CONFIG.navigation.map((nav) => (
                <li key={nav.label}>
                  <a
                    href={nav.href}
                    className="hover:text-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault()
                      const el = document.querySelector(nav.href)
                      if (el) el.scrollIntoView({ behavior: 'smooth' })
                    }}
                  >
                    {nav.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Official Downloads */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Downloads</h4>
            <ul className="space-y-2.5 text-xs text-[#94A3B8]">
              <li>
                <button
                  onClick={onDownloadAndroid}
                  className="flex items-center gap-1.5 hover:text-purple-300 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                  <span>Android APK ({SITE_CONFIG.downloads.android.version})</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onDownloadWindows}
                  className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Windows Desktop (x64)</span>
                </button>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.developer.socials.repository + '/releases'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>Release Notes</span>
                  <ExternalLink className="w-3 h-3 text-white/40" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal & Privacy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Trust & Ethics</h4>
            <ul className="space-y-2.5 text-xs text-[#94A3B8]">
              <li>
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy Commitment
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms & Intellectual Property
                </button>
              </li>
              <li>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400/90">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Zero Ad Tracking</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back To Top */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>
            © 2026 RAIWAVE. Created & Developed by{' '}
            <strong className="text-white/80">{SITE_CONFIG.developer.name}</strong>. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Privacy Commitment Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#140F24] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-left shadow-2xl relative">
            <h3 className="text-lg font-bold text-white font-heading">Privacy Commitment</h3>
            <p className="mt-3 text-xs text-[#CBD5E1] leading-relaxed">
              RAIWAVE was engineered by Raiyan under a strict privacy-first philosophy. The application does not collect,
              sell, or transmit your listening history, personal profile, or behavioral analytics to any third-party
              marketing broker.
            </p>
            <p className="mt-2 text-xs text-[#CBD5E1] leading-relaxed">
              Your playback preferences, playlists, and theme states are stored exclusively in your local device
              storage (LocalStorage or Android app sandbox).
            </p>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="mt-6 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Terms & IP Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#140F24] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-left shadow-2xl relative">
            <h3 className="text-lg font-bold text-white font-heading">Terms & Intellectual Property</h3>
            <p className="mt-3 text-xs text-[#CBD5E1] leading-relaxed">
              RAIWAVE is an independent software application created and maintained by Raiyan. All audio streams, music
              titles, and album artwork rendered within the player are copyright and intellectual property of their
              respective recording artists and distributors.
            </p>
            <button
              onClick={() => setShowTermsModal(false)}
              className="mt-6 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  )
}
