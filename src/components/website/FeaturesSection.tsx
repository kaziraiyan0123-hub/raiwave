import { useState } from 'react'
import {
  Activity,
  Sparkles,
  Search,
  ListMusic,
  Smartphone,
  Monitor,
  SmartphoneCharging,
  ShieldCheck,
  Disc,
  Radio,
  Sliders,
  ChevronRight,
} from 'lucide-react'
import { SITE_CONFIG, type FeatureItem } from '../../config/siteConfig'

const ICON_MAP: Record<string, React.ElementType> = {
  Activity,
  Sparkles,
  Search,
  ListMusic,
  Smartphone,
  Monitor,
  SmartphoneCharging,
  ShieldCheck,
  Disc,
  Radio,
  Sliders,
}

export function FeaturesSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <section id="features" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Subtle Wash */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[170px] pointer-events-none opacity-20 bg-purple-700/30" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Core Capabilities</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase font-heading">
          Crafted for Music Purists
        </h2>
        <p className="mt-4 text-base sm:text-lg text-[#94A3B8]">
          Every feature is hand-crafted and refined. No bloat, no artificial clutter — just pure, focused acoustic
          immersion.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SITE_CONFIG.features.map((feature: FeatureItem) => {
          const Icon = ICON_MAP[feature.iconName] || Sparkles
          const isHovered = hoveredId === feature.id

          return (
            <div
              key={feature.id}
              onMouseEnter={() => setHoveredId(feature.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative rounded-3xl p-6 bg-[#130E22]/80 hover:bg-[#18122B]/95 border border-white/5 hover:border-purple-500/40 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle Ambient Hover Glow */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity duration-500"
                style={{
                  background: feature.accentColor,
                  opacity: isHovered ? 0.35 : 0.05,
                }}
              />

              <div>
                {/* Top Row: Icon + Category/Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="p-3 rounded-2xl border transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${feature.accentColor}18`,
                      borderColor: `${feature.accentColor}35`,
                      color: feature.accentColor,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {feature.badge ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      {feature.badge}
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                      {feature.category}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-xs text-[#94A3B8] leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Interactive Accent Bar */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white/50 group-hover:text-white transition-colors">
                  Learn more
                </span>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
