import React, { useState, useEffect, useMemo } from 'react'
import { ArrowRight, Sparkles, Headphones } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { RaiwaveLogo } from './RaiwaveLogo'

const NAME_STORAGE_KEY = 'raiwave_user_name'
const ONBOARDING_KEY = 'raiwave_onboarding_completed'
const GREETING_COUNTER_KEY = 'raiwave_greeting_rotation'

function getTimeBucket(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  return 'night'
}

function pickPersonalizedGreeting(name: string): { headline: string; subline: string } {
  const cleanName = name.trim()
  let rotation = 0
  try {
    const raw = Number(localStorage.getItem(GREETING_COUNTER_KEY) || '0')
    rotation = Number.isFinite(raw) ? raw : 0
    localStorage.setItem(GREETING_COUNTER_KEY, String((rotation + 1) % 1000))
  } catch {
    rotation = new Date().getMinutes()
  }

  if (!cleanName) {
    const universalGreetings = [
      {
        headline: 'Feel every frequency.',
        subline: 'Welcome back — the soundstage is tuned and ready.',
      },
      {
        headline: 'Your world of music awaits.',
        subline: 'Atmospheric sound, personal mixes, and seamless flow.',
      },
      {
        headline: 'Step into pure sound.',
        subline: 'Good to have you here. Press play when ready.',
      },
      {
        headline: 'Ready for your next track.',
        subline: 'Curated rhythms, offline vault, and deep listening.',
      },
      {
        headline: 'Welcome back to RAIWAVE.',
        subline: 'Where clarity meets every beat you love.',
      },
    ]
    return universalGreetings[rotation % universalGreetings.length]
  }

  const bucket = getTimeBucket()
  const pool: Record<'morning' | 'afternoon' | 'evening' | 'night', Array<{ headline: string; subline: string }>> = {
    morning: [
      {
        headline: `Good morning, ${cleanName}.`,
        subline: 'Let the first notes set your rhythm today.',
      },
      {
        headline: `Rise with the sound, ${cleanName}.`,
        subline: 'Fresh morning frequencies queued up for your focus.',
      },
      {
        headline: `A crisp start awaits, ${cleanName}.`,
        subline: 'Clear melodies to ease you into the day.',
      },
    ],
    afternoon: [
      {
        headline: `Good afternoon, ${cleanName}.`,
        subline: 'Ready to keep the momentum flowing?',
      },
      {
        headline: `Back in the groove, ${cleanName}.`,
        subline: 'Your midday soundtrack is just one tap away.',
      },
      {
        headline: `Turn up the focus, ${cleanName}.`,
        subline: 'Handpicked mixes shaped by your listening taste.',
      },
    ],
    evening: [
      {
        headline: `Good evening, ${cleanName}.`,
        subline: 'Unwind in rich atmospheric sound.',
      },
      {
        headline: `Golden-hour frequencies, ${cleanName}.`,
        subline: 'Settle in — your evening mix is waiting.',
      },
      {
        headline: `Welcome back for tonight, ${cleanName}.`,
        subline: 'Slow rhythms, deep bass, zero clutter.',
      },
    ],
    night: [
      {
        headline: `Quiet hours sound deeper, ${cleanName}.`,
        subline: 'Step into tonight’s late-night session.',
      },
      {
        headline: `Midnight frequency tuned for you, ${cleanName}.`,
        subline: 'Immerse yourself in the late-night soundstage.',
      },
      {
        headline: `Still vibing late, ${cleanName}?`,
        subline: 'Soft studio acoustics and personal favorites await.',
      },
    ],
  }

  const options = pool[bucket]
  return options[rotation % options.length]
}

export const WelcomeScreen: React.FC = () => {
  const { userProfile, updateUserProfile, appMode } = usePlayer()
  const [visible, setVisible] = useState<boolean>(() => appMode === 'player')
  const [isLeaving, setIsLeaving] = useState<boolean>(false)
  const [nameInput, setNameInput] = useState<string>('')

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    try {
      const done =
        localStorage.getItem(ONBOARDING_KEY) === 'true' ||
        localStorage.getItem('raiwave_welcomed') === 'true'
      const existingName = (localStorage.getItem(NAME_STORAGE_KEY) || '').trim()
      return done || Boolean(existingName)
    } catch {
      return false
    }
  })

  const effectiveName = useMemo(() => {
    try {
      return (userProfile.name || localStorage.getItem(NAME_STORAGE_KEY) || '').trim()
    } catch {
      return (userProfile.name || '').trim()
    }
  }, [userProfile.name])

  const greeting = useMemo(() => {
    return pickPersonalizedGreeting(effectiveName)
    // Intentionally compute once per greeting state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCompletedOnboarding, effectiveName])

  const dismissScreen = () => {
    if (isLeaving) return
    setIsLeaving(true)
    window.setTimeout(() => {
      setVisible(false)
    }, 280)
  }

  // Returning user greeting transitions smoothly after 1.7s, or immediately on tap/click
  useEffect(() => {
    if (!visible || !hasCompletedOnboarding) return
    const timer = window.setTimeout(() => {
      dismissScreen()
    }, 1700)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, hasCompletedOnboarding])

  useEffect(() => {
    if (!visible || !hasCompletedOnboarding) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
        dismissScreen()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, hasCompletedOnboarding])

  if (!visible || appMode !== 'player') return null

  const completeFirstRun = (chosenName: string) => {
    const trimmed = chosenName.trim()
    try {
      if (trimmed) {
        localStorage.setItem(NAME_STORAGE_KEY, trimmed)
      }
      localStorage.setItem(ONBOARDING_KEY, 'true')
      localStorage.setItem('raiwave_welcomed', 'true')
    } catch {
      // Ignore storage failures
    }
    if (trimmed) {
      updateUserProfile({ name: trimmed })
    }
    setHasCompletedOnboarding(true)
    // Fast smooth transition straight into the player
    window.setTimeout(() => dismissScreen(), 850)
  }

  return (
    <div
      id="raiwave-welcome-screen"
      onClick={() => {
        if (hasCompletedOnboarding) dismissScreen()
      }}
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-between px-5 py-8 sm:py-12 select-none overflow-hidden transition-all duration-300 ${
        isLeaving ? 'opacity-0 scale-[1.015] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: '#07080D',
        backgroundImage:
          'radial-gradient(circle at 50% 25%, rgba(124, 58, 237, 0.28) 0%, rgba(17, 13, 30, 0.96) 52%, #07080D 100%)',
      }}
    >
      {/* Atmospheric subtle glow orbs */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[300px] rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 w-[380px] h-[240px] rounded-full bg-indigo-500/10 blur-[110px]" />

      {/* Top Spacer / Soundstage indicator */}
      <div className="relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-medium text-purple-200/80 tracking-wide">
        <Headphones className="w-3.5 h-3.5 text-purple-400" />
        <span>RAIWAVE AUDIO EXPERIENCE</span>
      </div>

      {/* Main Center Stage */}
      <div
        className="relative z-10 w-full max-w-md flex flex-col items-center text-center my-auto py-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-7 animate-in fade-in zoom-in-95 duration-500">
          <RaiwaveLogo size="xl" showText={true} />
        </div>

        {!hasCompletedOnboarding ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              completeFirstRun(nameInput)
            }}
            className="w-full bg-[#131122]/85 backdrop-blur-xl border border-purple-500/25 rounded-3xl p-5 sm:p-7 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85),0_0_45px_rgba(139,92,246,0.18)] animate-in fade-in slide-in-from-bottom-4 duration-400"
          >
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-purple-300/90 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Welcome</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight mb-2">
              Before we begin, what should we call you?
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mb-5">
              Personalize your studio greeting. You can change or clear this anytime in Settings.
            </p>

            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name..."
              autoFocus
              maxLength={32}
              className="w-full px-4 py-3.5 rounded-2xl bg-black/45 border border-white/15 focus:border-purple-400/70 focus:outline-none text-white placeholder-white/35 text-sm sm:text-base font-medium transition-colors mb-4"
            />

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 transition-all active:scale-95 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => completeFirstRun('')}
                className="py-3 px-5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/75 hover:text-white font-medium text-sm transition-colors cursor-pointer"
              >
                Skip
              </button>
            </div>
          </form>
        ) : (
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500 px-2">
            <h1 className="text-2xl sm:text-4xl font-bold text-white font-heading tracking-tight leading-tight">
              {greeting.headline}
            </h1>
            <p className="text-sm sm:text-base text-[#CBD5E1]/80 max-w-sm mx-auto leading-relaxed">
              {greeting.subline}
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={dismissScreen}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs sm:text-sm font-semibold text-white transition-all active:scale-95 cursor-pointer"
              >
                <span>Enter Player</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Developer Credit strictly separate from personal greeting */}
      <div className="relative z-10 text-center">
        <p className="text-[11px] font-medium tracking-wide text-white/35">
          Created with passion by Raiyan.
        </p>
      </div>
    </div>
  )
}
