import { useState, useEffect } from 'react'
import {
  Download,
  Monitor,
  Play,
  Sparkles,
  ArrowRight,
  Disc,
  Activity,
  Compass,
} from 'lucide-react'
import { SITE_CONFIG } from '../../config/siteConfig'

interface HeroSectionProps {
  onDownloadAndroid: () => void
  onDownloadWindows: () => void
  onLaunchApp: () => void
  onExploreExperience: () => void
}

export function HeroSection({
  onDownloadAndroid,
  onDownloadWindows,
  onLaunchApp,
  onExploreExperience,
}: HeroSectionProps) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [activeAccent, setActiveAccent] = useState<'purple' | 'cyan' | 'amber' | 'emerald'>('purple')

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const accents = {
    purple: {
      glow: 'rgba(168, 85, 247, 0.28)',
      highlight: '#A855F7',
      gradient: 'from-purple-500 via-indigo-500 to-pink-500',
    },
    cyan: {
      glow: 'rgba(6, 182, 212, 0.28)',
      highlight: '#06B6D4',
      gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    },
    amber: {
      glow: 'rgba(245, 158, 11, 0.28)',
      highlight: '#F59E0B',
      gradient: 'from-amber-400 via-orange-500 to-rose-500',
    },
    emerald: {
      glow: 'rgba(16, 185, 129, 0.28)',
      highlight: '#10B981',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    },
  }

  const currentTheme = accents[activeAccent]

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {/* Dynamic Cursor-Reactive Ambient Glow Background */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] h-[450px] sm:h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle, ${currentTheme.glow} 0%, transparent 70%)`,
          transform: `translate(calc(-50% + ${(mousePos.x - 0.5) * 50}px), calc(-50% + ${(mousePos.y - 0.5) * 50}px))`,
        }}
      />
      <div
        className="absolute -bottom-10 right-10 w-[400px] h-[400px] rounded-full blur-[160px] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }}
      />

      {/* Hero Content Wrapper */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#18122B]/80 backdrop-blur-xl border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] mb-8 transition-transform hover:scale-105">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4" />
          <span className="text-xs font-semibold tracking-wide uppercase text-white/80">
            {SITE_CONFIG.appName} {SITE_CONFIG.version} Official Release
          </span>
          <span className="text-white/30 text-xs">•</span>
          <span className="text-xs font-medium text-purple-300">Android & Windows</span>
        </div>

        {/* Cinematic Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white uppercase font-heading leading-[1.08] max-w-4xl">
          Music is more than sound.{' '}
          <span className={`bg-gradient-to-r ${currentTheme.gradient} bg-clip-text text-transparent block mt-2`}>
            It's a world of its own.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-[#94A3B8] max-w-2xl font-normal leading-relaxed">
          {SITE_CONFIG.subtitle}
        </p>

        {/* Call to Actions (CTAs) */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 w-full max-w-2xl">
          {/* Primary CTA: Download for Android */}
          <button
            onClick={onDownloadAndroid}
            className="flex-1 min-w-[220px] sm:min-w-0 sm:flex-initial flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm sm:text-base shadow-[0_0_30px_rgba(147,51,234,0.45)] border border-purple-400/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
          >
            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            <span>DOWNLOAD FOR ANDROID</span>
          </button>

          {/* Secondary CTA: Download for Desktop */}
          <button
            onClick={onDownloadWindows}
            className="flex-1 min-w-[220px] sm:min-w-0 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm sm:text-base backdrop-blur-xl border border-white/15 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
          >
            <Monitor className="w-5 h-5 text-cyan-400" />
            <span>DOWNLOAD FOR DESKTOP</span>
          </button>

          {/* Third CTA: Explore the Experience */}
          <button
            onClick={onExploreExperience}
            className="flex-1 min-w-[220px] sm:min-w-0 sm:flex-initial flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-purple-300 hover:text-white bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/20 font-semibold text-sm sm:text-base transition-all cursor-pointer group"
          >
            <Compass className="w-5 h-5 text-purple-400 group-hover:rotate-45 transition-transform" />
            <span>EXPLORE THE EXPERIENCE</span>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Supplementary Launch Web Player Link */}
        <div className="mt-4">
          <button
            onClick={onLaunchApp}
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current text-purple-400" />
            <span>Or launch live Web Player directly in your browser</span>
          </button>
        </div>

        {/* Dynamic Atmosphere Accent Selector */}
        <div className="mt-8 flex items-center gap-2 text-xs text-white/50">
          <span className="font-medium tracking-wide">Atmosphere:</span>
          {(['purple', 'cyan', 'emerald', 'amber'] as const).map((color) => (
            <button
              key={color}
              onClick={() => setActiveAccent(color)}
              className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                activeAccent === color ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                backgroundColor:
                  color === 'purple'
                    ? '#A855F7'
                    : color === 'cyan'
                    ? '#06B6D4'
                    : color === 'emerald'
                    ? '#10B981'
                    : '#F59E0B',
              }}
              title={`Switch to ${color} accent`}
            />
          ))}
        </div>
      </div>

      {/* Hero Visual Centerpiece: Real Device Mockup with Animated Waves & Floating Art */}
      <div className="relative mt-14 sm:mt-20 w-full max-w-4xl mx-auto flex items-center justify-center">
        {/* Animated Soundwave Rings Radiating Outward */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full border border-purple-500/20 animate-ping opacity-25"
            style={{ animationDuration: '4s' }}
          />
          <div
            className="w-[440px] sm:w-[650px] h-[440px] sm:h-[650px] rounded-full border border-indigo-500/15 animate-ping opacity-15"
            style={{ animationDuration: '6s' }}
          />
        </div>

        {/* Floating Left Album Art Card */}
        <div className="hidden lg:flex absolute -left-12 top-1/4 -translate-y-1/2 flex-col items-center p-3 rounded-2xl bg-[#140F24]/85 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-20 animate-bounce duration-[4000ms] pointer-events-none">
          <div className="w-28 h-28 rounded-xl overflow-hidden shadow-md">
            <img
              src="/showcase/vis_spectrum.png"
              alt="Live Visualizer Spectrum"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-2 text-left w-full px-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider">
              <Activity className="w-3 h-3" />
              <span>Spectrum Mode</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">64-Band Real-Time</p>
          </div>
        </div>

        {/* Floating Right Album Art Card */}
        <div className="hidden lg:flex absolute -right-12 bottom-1/4 flex-col items-center p-3 rounded-2xl bg-[#140F24]/85 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-20 animate-pulse duration-[3000ms] pointer-events-none">
          <div className="w-28 h-28 rounded-xl overflow-hidden shadow-md">
            <img
              src="/showcase/vis_wave.png"
              alt="Dynamic Wave Ribbon"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-2 text-left w-full px-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              <Disc className="w-3 h-3" />
              <span>Harmonic Wave</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">GPU Accelerated</p>
          </div>
        </div>

        {/* Centerpiece Device Phone Mockup with Actual App Screenshot */}
        <div className="relative z-10 w-[280px] sm:w-[320px] rounded-[42px] p-3 bg-gradient-to-b from-white/20 via-white/5 to-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl border border-white/20 transition-all duration-500 hover:scale-[1.02]">
          {/* Mobile Bezel & Screen Container */}
          <div className="relative rounded-[32px] overflow-hidden bg-black aspect-[9/19.5] border border-black shadow-inner">
            {/* Dynamic Camera Island / Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#111] mr-3" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A24]" />
            </div>

            {/* Actual Verified Mobile App Screenshot */}
            <img
              src="/showcase/mobile_player.png"
              alt="RAIWAVE Actual Mobile Music Player"
              className="w-full h-full object-cover select-none"
            />

            {/* Subtle Glass Glare Reflex */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
          </div>

          {/* Bottom Floating Badge */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full bg-[#1A1230]/95 backdrop-blur-xl border border-purple-400/30 shadow-xl flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-bold tracking-wide text-white uppercase">
              Dynamic Ambient Theme
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
