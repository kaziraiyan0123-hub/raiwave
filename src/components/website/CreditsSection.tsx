import { BookOpen, ExternalLink } from 'lucide-react'
import { SITE_CONFIG, type CreditItem } from '../../config/siteConfig'

export function CreditsSection() {
  return (
    <section id="credits" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Transparency & Open Standards</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase font-heading">
          Credits & Technical Attribution
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-[#94A3B8]">
          Honoring the open-source foundations, frameworks, and tools powering the RAIWAVE ecosystem.
        </p>
      </div>

      {/* Credits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SITE_CONFIG.credits.map((item: CreditItem, idx: number) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#110D1D]/70 border border-white/5 hover:border-white/15 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-1">
                {item.role}
              </span>
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span>{item.name}</span>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </h4>
              <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Legal & Open Source Notice */}
      <div className="mt-10 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-white/40 max-w-3xl mx-auto leading-relaxed">
        RAIWAVE is an independent software project created by Raiyan. All music, artwork, trademarks, and third-party
        intellectual property belong to their respective copyright holders and artists. Released under the open-source
        MIT License.
      </div>
    </section>
  )
}
