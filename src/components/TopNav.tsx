import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Bell,
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
    isPlaying,
  } = usePlayer()
  const [urlMessage, setUrlMessage] = useState('')

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
    <header className="hidden md:flex h-16 px-6 items-center justify-between sticky top-0 z-30 bg-[#090D13]/85 backdrop-blur-xl border-b border-white/5 select-none">
      {/* Navigation History & Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Back/Forward buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('home')}
            className="w-8 h-8 rounded-full bg-[#141A23] hover:bg-[#202A34] border border-white/5 flex items-center justify-center text-[#929DA8] hover:text-white transition-all active:scale-95"
            title="Go to Home"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 rounded-full bg-[#141A23]/40 border border-white/5 flex items-center justify-center text-white/20 cursor-not-allowed"
            title="Next"
            disabled
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Global Fast Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#929DA8]">
            <Search className="w-4 h-4 text-[#B6F36B]" />
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
            className="w-full pl-10 pr-9 py-2 bg-[#141A23] hover:bg-[#1B232E] focus:bg-[#1B232E] text-white text-xs font-medium rounded-full border border-white/10 focus:border-[#B6F36B] focus:outline-none transition-all placeholder-[#929DA8] shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#929DA8] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {urlMessage && (
            <div className="absolute -bottom-6 left-3 text-[11px] text-[#B6F36B] font-semibold animate-pulse font-heading">
              {urlMessage}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Android Notification Card Toggle & User Profile */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleNotification}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all active:scale-95 ${
            isNotificationOpen
              ? 'bg-[#B6F36B]/15 border-[#B6F36B]/40 text-[#B6F36B] shadow-[0_0_12px_rgba(182,243,107,0.25)]'
              : 'bg-[#141A23] hover:bg-[#1B232E] border-[#202A34] text-[#929DA8] hover:text-white'
          }`}
          title="Toggle Android Media Notification Card"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px] font-heading">Notification</span>
          {isPlaying && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#B6F36B] animate-pulse" />
          )}
        </button>

        <button
          data-testid="profile-trigger"
          onClick={toggleProfile}
          className="relative p-1 rounded-full bg-[#141A23] hover:bg-[#1B232E] border border-[#202A34] cursor-pointer group transition-all"
          title="Account Profile & Settings"
        >
          <img
            src={userProfile.avatarUrl}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-[#B6F36B]/50 group-hover:scale-105 transition-transform shadow"
          />
          <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-[#B6F36B] ring-2 ring-[#090D13]" />
        </button>
      </div>
    </header>
  )
}
