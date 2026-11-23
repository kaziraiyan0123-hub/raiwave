import { Heart, Globe, Code2, Sparkles, Terminal, Award } from 'lucide-react'
import { SITE_CONFIG } from '../../config/siteConfig'

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}

export function DeveloperSection() {
  const { developer } = SITE_CONFIG

  return (
    <section id="developer" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto overflow-hidden">
      {/* Background Ambient Radial Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[170px] pointer-events-none opacity-25 bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-pink-600/30" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-400/20 text-pink-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Independent Craftsmanship</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase font-heading">
          The Person Behind The Music
        </h2>
        <p className="mt-3 text-base text-[#94A3B8]">
          Built with passion, curiosity, and an unwavering commitment to design perfection.
        </p>
      </div>

      {/* Developer Card Surface */}
      <div className="relative rounded-3xl p-8 sm:p-12 bg-[#140F24]/90 border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] backdrop-blur-3xl overflow-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none bg-purple-500/20" />

        <div className="flex flex-col md:flex-row gap-8 sm:gap-12 items-start justify-between">
          {/* Left Column: Creator Identity & Credentials */}
          <div className="flex flex-col items-start max-w-xs flex-shrink-0">
            {/* Avatar / Monogram Shield */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-2xl flex items-center justify-center">
                <div className="w-full h-full rounded-[22px] bg-[#0E0A1A] flex items-center justify-center">
                  <span className="text-3xl font-black font-heading tracking-wider bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                    R
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#1A1230] border border-purple-400/40 text-purple-300 shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Creator Name & Title */}
            <h3 className="text-2xl font-black text-white font-heading tracking-wide mt-5">
              {developer.name}
            </h3>
            <p className="text-sm font-semibold text-purple-400 mt-0.5">{developer.role}</p>
            <p className="text-xs text-white/50 mt-1">{developer.title}</p>

            {/* Credentials / Pillars */}
            <div className="mt-6 space-y-2 w-full text-xs text-white/70">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span>Frontend & Audio Engineer</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Android & Desktop Architect</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>UI/UX Interaction Specialist</span>
              </div>
            </div>

            {/* Verified Social / Code Links */}
            <div className="mt-8 flex items-center gap-3">
              <a
                href={developer.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-all hover:scale-105 cursor-pointer"
                title="Developer GitHub Profile"
              >
                <GithubIcon className="w-4 h-4 text-white/80" />
                <span>GitHub</span>
              </a>

              <a
                href={developer.socials.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-medium text-xs border border-purple-500/30 transition-all hover:scale-105 cursor-pointer"
                title="Source Repository"
              >
                <Globe className="w-4 h-4" />
                <span>Project Code</span>
              </a>
            </div>
          </div>

          {/* Right Column: Original Personal Message & Philosophy */}
          <div className="flex-1 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-10">
            <div className="space-y-4 text-sm sm:text-base text-[#CBD5E1] leading-relaxed font-light">
              <p className="text-lg sm:text-xl font-medium text-white italic">
                "Every great creation starts with an idea."
              </p>

              <p>
                I created this application because I wanted to build something more than just another music player. I
                wanted to create an experience where music, design, and technology come together.
              </p>

              <p>
                This project represents my creativity, curiosity, passion, and the journey of learning and building
                something of my own. From hand-tuning real-time 60 FPS audio visualizers to architecting seamless
                Android lockscreen services, every detail was crafted with care and intention.
              </p>

              <p>Thank you for being part of this journey.</p>
            </div>

            {/* Stylized Digital Signature */}
            <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-2xl sm:text-3xl font-serif italic text-purple-300 tracking-wider font-light">
                  — Raiyan
                </span>
                <span className="text-xs text-white/40 block mt-1">Creator & Developer of RAIWAVE</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Independent Project</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
