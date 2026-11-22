import React from 'react'
import { Search, X, Bell } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { RaiwaveLogo } from '../RaiwaveLogo'

export const MobileTopBar: React.FC = () => {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = searchQuery.trim()
      if (trimmed) {
        playCustomUrlOrId(trimmed)
      }
    }
  }

  return (
    <header className="md:hidden flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-[#090D13]/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 select-none">
      {/* Left: RAIWAVE Luminous Logo */}
      <div
        className="flex items-center cursor-pointer flex-shrink-0"
        onClick={() => navigateTo('home')}
        title="RAIWAVE Home"
      >
        <RaiwaveLogo size="sm" showText={false} />
      </div>

      {/* Center: Real Full Search Bar (identical to PC version) */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#929DA8]">
          <Search className="w-3.5 h-3.5 text-[#B6F36B]" />
        </div>
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={searchQuery}
          onFocus={() => {
            if (currentView !== 'search') navigateTo('search')
          }}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (currentView !== 'search') navigateTo('search')
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-8 pr-8 py-2 bg-[#141A23] focus:bg-[#1B232E] text-white text-xs font-medium rounded-full border border-white/10 focus:border-[#B6F36B] focus:outline-none transition-all placeholder-[#929DA8] shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#929DA8] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right: Android Notification Card Toggle & User Profile Avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={toggleNotification}
          className={`p-1.5 rounded-full border transition-all active:scale-95 ${
            isNotificationOpen
              ? 'bg-[#B6F36B]/20 border-[#B6F36B]/50 text-[#B6F36B]'
              : 'bg-[#141A23] border-white/10 text-[#929DA8]'
          }`}
          title="Toggle Android Notification Card"
        >
          <Bell className="w-4 h-4" />
        </button>

        <div
          onClick={toggleProfile}
          className="relative cursor-pointer flex-shrink-0 active:scale-95 transition-transform"
          title="Account Profile & Settings"
        >
          <img
            src={userProfile.avatarUrl}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-[#B6F36B]/50 shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#B6F36B] ring-2 ring-[#090D13]" />
        </div>
      </div>
    </header>
  )
}
