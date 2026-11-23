import { useState } from 'react'
import {
  Smartphone,
  Monitor,
  Activity,
  Layers,
  BellRing,
  ChevronRight,
} from 'lucide-react'
import { SITE_CONFIG } from '../../config/siteConfig'

type ShowcaseCategory = 'mobile' | 'visualizer' | 'desktop' | 'system'

interface ShowcaseItem {
  id: string
  category: ShowcaseCategory
  title: string
  subtitle: string
  description: string
  image: string
  deviceType: 'mobile' | 'desktop'
  tags: string[]
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'mobile-home',
    category: 'mobile',
    title: 'Mobile Home & Dynamic Carousels',
    subtitle: 'Native Handheld Ergonomics',
    description:
      'Engineered specifically for touchscreens with fluid horizontal carousels, instant mood stations, and clean edge-to-edge dark surfaces.',
    image: SITE_CONFIG.screenshots.mobileHome,
    deviceType: 'mobile',
    tags: ['Horizontal Carousels', 'Mood Radio', 'Zero Popup Clutter'],
  },
  {
    id: 'mobile-player',
    category: 'mobile',
    title: 'Full-Screen Music Player',
    subtitle: 'Ambient Color Atmospheres',
    description:
      'Dynamic real-time artwork color extraction that washes subtle, breathing ambient hues across the playback stage, scrubbers, and transport controls.',
    image: SITE_CONFIG.screenshots.mobilePlayer,
    deviceType: 'mobile',
    tags: ['Dynamic Artwork Colors', 'Arc Scrubber', 'Floating Mini-Player'],
  },
  {
    id: 'mobile-search',
    category: 'mobile',
    title: 'Universal Instant Search',
    subtitle: 'Direct Streaming Pipeline',
    description:
      'Search across global discographies, international charts, and regional legends with instant live results and zero-delay playback initiation.',
    image: SITE_CONFIG.screenshots.mobileSearch,
    deviceType: 'mobile',
    tags: ['Live Results', 'Artist Catalog', 'One-Tap Queue'],
  },
  {
    id: 'vis-spectrum',
    category: 'visualizer',
    title: 'Spectrum Equalizer Mode',
    subtitle: '64-Band Real-Time Frequency',
    description:
      'High-precision audio frequency spectrum analyzer with floating peak caps, dynamic gravity physics, and high-performance canvas rendering.',
    image: SITE_CONFIG.screenshots.visSpectrum,
    deviceType: 'mobile',
    tags: ['60 FPS Engine', 'Peak Hold Caps', 'Tap to Toggle HUD'],
  },
  {
    id: 'vis-wave',
    category: 'visualizer',
    title: 'Harmonic Wave Mode',
    subtitle: 'Fluid Frequency Waves',
    description:
      'Undulating harmonic frequency ribbon that pulses with mid and treble acoustic energy, accompanied by soft atmospheric backdrops.',
    image: SITE_CONFIG.screenshots.visWave,
    deviceType: 'mobile',
    tags: ['Multi-Harmonic', 'Gradient Glow', '15s Auto-Hide HUD'],
  },
  {
    id: 'vis-particles',
    category: 'visualizer',
    title: 'Particle Swarm Mode',
    subtitle: 'Kinetic Particle Physics',
    description:
      'Floating particles reacting dynamically to bass drops with radial repulsion physics and acoustic gravitational forces.',
    image: SITE_CONFIG.screenshots.visParticles,
    deviceType: 'mobile',
    tags: ['Bass Shockwaves', 'Acoustic Gravity', 'Hardware Back Support'],
  },
  {
    id: 'vis-rings',
    category: 'visualizer',
    title: 'Concentric Rings & Vinyl Mode',
    subtitle: 'Radial Shockwaves',
    description:
      'Concentric shockwaves emitting outward from a spinning album artwork vinyl disc, accompanied by frequency rays along the circumference.',
    image: SITE_CONFIG.screenshots.visRings,
    deviceType: 'mobile',
    tags: ['Spinning Vinyl Art', 'Radial Rays', 'Full Immersion'],
  },
  {
    id: 'vis-cinematic',
    category: 'visualizer',
    title: 'Cinematic Minimal Mode',
    subtitle: 'Atmospheric Music Stage',
    description:
      'Minimalist dark room with deep ambient backdrop lighting that breathes softly with low-frequency acoustic warmth.',
    image: SITE_CONFIG.screenshots.visCinematic,
    deviceType: 'mobile',
    tags: ['Dark Room Glow', 'Breathing Pulse', 'Focused Listening'],
  },
  {
    id: 'desktop-main',
    category: 'desktop',
    title: 'Full Desktop Companion Workspace',
    subtitle: 'Expanded Studio Architecture',
    description:
      'Rich multi-column layout with left navigation sidebar, central fluid workspace, companion right pane for Top Hits, and persistent player bar.',
    image: SITE_CONFIG.screenshots.desktopMain,
    deviceType: 'desktop',
    tags: ['Keyboard Shortcuts', 'Companion Right Pane', 'Single-File Portable EXE'],
  },
  {
    id: 'system-notification',
    category: 'system',
    title: 'System Lockscreen & Notification Controls',
    subtitle: 'Deep Android Media Integration',
    description:
      'Native Android MediaStyle foreground service providing hardware lockscreen album artwork, headphone button support, and notification shade controls.',
    image: SITE_CONFIG.screenshots.androidNotification,
    deviceType: 'mobile',
    tags: ['Android MediaSession', 'Lockscreen Artwork', 'Zero Battery Drain'],
  },
]

export function AppShowcase() {
  const [activeCategory, setActiveCategory] = useState<ShowcaseCategory>('mobile')
  const [selectedId, setSelectedId] = useState<string>('mobile-home')

  const filteredItems = SHOWCASE_ITEMS.filter((item) => item.category === activeCategory)
  const currentItem = SHOWCASE_ITEMS.find((item) => item.id === selectedId) || filteredItems[0]

  const handleCategoryChange = (cat: ShowcaseCategory) => {
    setActiveCategory(cat)
    const firstOfCat = SHOWCASE_ITEMS.find((item) => item.category === cat)
    if (firstOfCat) {
      setSelectedId(firstOfCat.id)
    }
  }

  return (
    <section id="showcase" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Background Subtle Gradient Lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none opacity-25 bg-purple-600/30" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none opacity-20 bg-cyan-600/30" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Layers className="w-3.5 h-3.5" />
          <span>Product Showcase</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase font-heading">
          Engineered for Mobile & Desktop
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#94A3B8]">
          One unified identity. Cross-platform parity. Explore real screenshots captured directly from our production
          builds.
        </p>

        {/* Category Navigation Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-[#140F24]/90 backdrop-blur-2xl border border-white/10 max-w-fit mx-auto shadow-2xl">
          {[
            { id: 'mobile', label: 'Mobile App', icon: Smartphone },
            { id: 'visualizer', label: '6-Mode Visualizer', icon: Activity },
            { id: 'system', label: 'System Media', icon: BellRing },
            { id: 'desktop', label: 'Desktop App', icon: Monitor },
          ].map((cat) => {
            const Icon = cat.icon
            const isSelected = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id as ShowcaseCategory)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-[0_0_16px_rgba(147,51,234,0.5)] border border-purple-400/40'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Showcase Stage: Interactive Selector on Left + Realistic Device Mockup on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive Screen Selector List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="text-xs font-bold text-white/50 uppercase tracking-widest px-2 mb-1">
            Available Screens ({filteredItems.length})
          </div>

          {filteredItems.map((item) => {
            const isSelected = currentItem.id === item.id
            return (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`group p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#18122B]/95 border-purple-500/50 shadow-[0_10px_30px_rgba(147,51,234,0.25)] translate-x-1'
                    : 'bg-[#110D1D]/60 hover:bg-[#161125] border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                      {item.subtitle}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors mt-0.5">
                      {item.title}
                    </h3>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${
                      isSelected ? 'text-purple-400 translate-x-1' : 'text-white/30 group-hover:text-white/60'
                    }`}
                  />
                </div>

                <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Column: Realistic Device Frame Mockup */}
        <div className="lg:col-span-7 flex justify-center items-center">
          {currentItem.deviceType === 'desktop' ? (
            /* Desktop Application Mockup Window */
            <div className="w-full max-w-2xl rounded-2xl bg-[#140F24] border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-500">
              {/* Window Header Bar */}
              <div className="px-4 py-3 bg-[#0E0A1A] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-xs font-semibold text-white/70 tracking-wide">
                  RAIWAVE Desktop v1.2.9
                </div>
                <div className="w-12" />
              </div>

              {/* Desktop Screenshot */}
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <img
                  src={currentItem.image}
                  alt={currentItem.title}
                  className="w-full h-full object-cover transition-all duration-700 select-none"
                />
              </div>
            </div>
          ) : (
            /* Mobile Phone Mockup */
            <div className="relative w-[300px] sm:w-[330px] rounded-[48px] p-3.5 bg-gradient-to-b from-white/20 via-white/5 to-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.95)] backdrop-blur-3xl border border-white/20 transition-all duration-500">
              <div className="relative rounded-[36px] overflow-hidden bg-black aspect-[9/19.5] border border-black shadow-inner">
                {/* Dynamic Camera Island Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#111] mr-3" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A24]" />
                </div>

                {/* Mobile Screenshot */}
                <img
                  src={currentItem.image}
                  alt={currentItem.title}
                  className="w-full h-full object-cover select-none transition-all duration-700"
                />

                {/* Screen Glare Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
