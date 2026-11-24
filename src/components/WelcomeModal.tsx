import React, { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, X } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { RaiwaveLogo } from './RaiwaveLogo'

export const WelcomeModal: React.FC = () => {
  const { userProfile, updateUserProfile, showToast } = usePlayer()
  const [isOpen, setIsOpen] = useState(false)
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    try {
      const completed =
        localStorage.getItem('raiwave_onboarding_completed') ||
        localStorage.getItem('raiwave_welcomed')
      const savedName =
        localStorage.getItem('raiwave_user_name') || userProfile.name
      if (!completed && !savedName) {
        // Small delay so initial mount animations complete smoothly
        const timer = setTimeout(() => setIsOpen(true), 600)
        return () => clearTimeout(timer)
      }
    } catch {}
  }, [userProfile.name])

  if (!isOpen) return null

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = nameInput.trim()
    if (trimmed) {
      try {
        localStorage.setItem('raiwave_user_name', trimmed)
        localStorage.setItem('raiwave_onboarding_completed', 'true')
        localStorage.setItem('raiwave_welcomed', 'true')
      } catch {}
      updateUserProfile({ name: trimmed })
      showToast(`Welcome to RAIWAVE, ${trimmed}!`)
    } else {
      try {
        localStorage.setItem('raiwave_onboarding_completed', 'true')
        localStorage.setItem('raiwave_welcomed', 'true')
      } catch {}
      showToast('Welcome to RAIWAVE!')
    }
    setIsOpen(false)
  }

  const handleSkip = () => {
    try {
      localStorage.setItem('raiwave_onboarding_completed', 'true')
      localStorage.setItem('raiwave_welcomed', 'true')
    } catch {}
    setIsOpen(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in duration-300"
      id="welcome-onboarding-modal"
    >
      <div
        className="relative w-full max-w-md bg-[#131024]/95 border border-purple-500/25 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(139,92,246,0.25)] overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.2) 0%, rgba(19,16,36,0.98) 80%)',
        }}
      >
        {/* Soft Accent Light Bleed */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 shadow-lg">
            <RaiwaveLogo size="md" showText={false} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/20 text-[#C084FC] text-[11px] font-bold uppercase tracking-wider font-heading">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Developer Greeting</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            Welcome to RAIWAVE
          </h3>

          <p className="text-xs sm:text-sm text-white/70 leading-relaxed px-2">
            Hey! I'm <span className="text-[#A78BFA] font-bold">Raiyan</span>,
            the creator of RAIWAVE. What should we call you as you explore music
            across your devices?
          </p>
        </div>

        {/* Name Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1.5 ml-1">
              What should we call you?
            </label>
            <input
              type="text"
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter your name or nickname..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-purple-400 focus:bg-white/10 rounded-2xl text-white text-sm placeholder-white/40 focus:outline-none transition-all shadow-inner"
              maxLength={30}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(139,92,246,0.4)] active:scale-[0.98] cursor-pointer"
            >
              <span>Start Listening</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-2 text-xs font-semibold text-white/50 hover:text-white/80 transition-colors cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
