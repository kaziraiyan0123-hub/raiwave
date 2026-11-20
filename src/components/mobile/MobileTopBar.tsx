import React from 'react'
import { Bell, Search, Mic } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { RaiwaveLogo } from '../RaiwaveLogo'

export const MobileTopBar: React.FC = () => {
  const { navigateTo, userProfile, toggleProfile, toggleRecorder } = usePlayer()

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#090D13]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 select-none">
      {/* Left: User Avatar & Greeting synced with Gmail account */}
      <div
        onClick={toggleProfile}
        className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
        title="Open Profile & Settings"
      >
        <div className="relative">
          <img
            src={userProfile.avatarUrl}
            alt={userProfile.name}
            className="w-9 h-9 rounded-full object-cover border border-[#B6F36B]/40 shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#B6F36B] ring-2 ring-[#090D13]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-medium text-[#929DA8] leading-tight">Welcome,</span>
          <span className="text-xs font-bold text-white font-display truncate max-w-[110px]">
            {userProfile.name}
          </span>
        </div>
      </div>

      {/* Center: RAIWAVE Luminous Emblem */}
      <div className="flex items-center" onClick={() => navigateTo('home')}>
        <RaiwaveLogo size="sm" showText={false} />
      </div>

      {/* Right: Studio Recorder, Search & Bell */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleRecorder}
          className="p-2 text-red-400 hover:text-red-300 rounded-full hover:bg-white/5 active:scale-95 transition-all"
          title="Studio Recorder"
        >
          <Mic className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigateTo('search')}
          className="p-2 text-[#929DA8] hover:text-white rounded-full hover:bg-white/5 active:scale-95 transition-all"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          className="p-2 text-[#929DA8] hover:text-white rounded-full hover:bg-white/5 active:scale-95 transition-all relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B6F36B] shadow-[0_0_8px_#B6F36B]" />
        </button>
      </div>
    </header>
  )
}
