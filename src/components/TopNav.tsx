import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Radio,
  User,
} from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

export const TopNav: React.FC = () => {
  const {
    currentView,
    navigateTo,
    searchQuery,
    setSearchQuery,
    playCustomUrlOrId,
    userProfile,
    toggleProfile,
    isNotificationOpen,
    toggleNotification,
  } = usePlayer()
  const [urlMessage, setUrlMessage] = useState('')
  const [avatarError, setAvatarError] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = searchQuery.trim()
      if (trimmed) {
        const success = playCustomUrlOrId(trimmed)
        if (success) {
          setUrlMessage(`Streaming "${trimmed}"!`)
          setTimeout(() => setUrlMessage(''), 3000)
        }
      }
    }
  }

  return (
    <header className="hidden md:flex h-16 px-6 items-center justify-between sticky top-0 z-30 bg-[#0B0D13]/85 backdrop-blur-xl border-b border-white/5 select-none">
      {/* Navigation History & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Back/Forward buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('home')}
            className="w-8 h-8 rounded-full bg-[#12141D] hover:bg-[#181B27] border border-white/5 flex items-center justify-center text-[#94A3B8] hover:text-white transition-all active:scale-95"
            title="Go to Home"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 rounded-full bg-[#12141D]/40 border border-white/5 flex items-center justify-center text-white/20 cursor-not-allowed"
            title="Next"
            disabled
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Global Fast Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
            <Search className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <input
            type="text"
            placeholder="Search any song, artist, album worldwide..."
            value={searchQuery}
            onFocus={() => {
              if (currentView !== 'search') navigateTo('search')
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (currentView !== 'search') navigateTo('search')
            }}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-9 py-2 bg-[#12141D] hover:bg-[#181B27] focus:bg-[#181B27] text-white text-xs font-medium rounded-full border border-white/10 focus:border-[#8B5CF6] focus:outline-none transition-all placeholder-[#94A3B8] shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {urlMessage && (
            <div className="absolute -bottom-6 left-3 text-[11px] text-[#A78BFA] font-semibold animate-pulse font-heading">
              {urlMessage}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Notification Toggle & User Profile Avatar */}
      <div className="flex items-center gap-2.5">
        {/* Floating Notification Card Toggle Button */}
        <button
          onClick={toggleNotification}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-all border cursor-pointer ${
            isNotificationOpen
              ? 'bg-purple-500/15 border-purple-500/30 text-[#A78BFA] shadow-[0_0_12px_rgba(139,92,246,0.25)]'
              : 'bg-[#12141D] border-white/10 text-[#94A3B8] hover:text-white'
          }`}
          title={isNotificationOpen ? 'Hide Floating Notification Card' : 'Show Floating Notification Card'}
        >
          <Radio className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span className="hidden sm:inline">Notification Card</span>
        </button>

        <button
          data-testid="profile-trigger"
          onClick={toggleProfile}
          className="relative p-1 rounded-full bg-[#12141D] hover:bg-[#181B27] border border-white/10 cursor-pointer group transition-all"
          title="Account Profile & Settings"
        >
          {!avatarError && userProfile.avatarUrl ? (
            <img
              src={userProfile.avatarUrl}
              alt="Profile"
              onError={() => setAvatarError(true)}
              className="w-8 h-8 rounded-full object-cover border border-[#8B5CF6]/50 group-hover:scale-105 transition-transform shadow"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 border border-white/20 flex items-center justify-center text-xs font-bold text-white shadow group-hover:scale-105 transition-transform">
              {userProfile.name?.trim() ? userProfile.name.trim()[0].toUpperCase() : <User className="w-4 h-4 text-white" />}
            </div>
          )}
          <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-[#8B5CF6] ring-2 ring-[#0B0D13]" />
        </button>
      </div>
    </header>
  )
}
