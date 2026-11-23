import React from 'react'
import {
  ChevronLeft,
  Search,
  X,
} from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { RaiwaveLogo } from '../RaiwaveLogo'

export const MobileTopBar: React.FC = () => {
  const {
    currentView,
    navigateTo,
    goBack,
    canGoBack,
    searchQuery,
    setSearchQuery,
    playCustomUrlOrId,
    userProfile,
    toggleProfile,
    selectedAlbum,
    selectedPlaylist,
    selectedArtist,
  } = usePlayer()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = searchQuery.trim()
      if (trimmed) {
        playCustomUrlOrId(trimmed)
      }
    }
  }

  // Determine current screen title for sub-views
  const getViewTitle = () => {
    switch (currentView) {
      case 'album':
        return selectedAlbum?.title || 'Album'
      case 'playlist':
        return selectedPlaylist?.name || 'Playlist'
      case 'artist':
        return selectedArtist?.name || 'Artist'
      case 'explore':
        return 'Explore & Charts'
      case 'search':
        return 'Search Music'
      case 'library':
        return 'Your Library'
      case 'liked':
        return 'Liked Songs'
      case 'queue':
        return 'Up Next Queue'
      case 'lyrics':
        return 'Live Synced Lyrics'
      default:
        return 'RAIWAVE'
    }
  }

  const isRootView = currentView === 'home'
  const isSearchActive = currentView === 'search'

  return (
    <header className="md:hidden flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-[#0B0D13]/95 backdrop-blur-2xl border-b border-white/8 sticky top-0 z-30 select-none safe-top">
      {/* Left Action: Back Button on sub-screens OR RAIWAVE Logo on home */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isRootView && canGoBack ? (
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white/90 border border-white/10 transition-all cursor-pointer"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>
        ) : (
          <div
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
            title="RAIWAVE Home"
          >
            <RaiwaveLogo size="sm" showText={false} />
            <span className="font-display font-black text-sm tracking-tight text-white">
              RAIWAVE
            </span>
          </div>
        )}
      </div>

      {/* Center: Search input when in Search View, or Screen Title with subtle vibe */}
      <div className="flex-1 min-w-0 px-1">
        {isSearchActive ? (
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
              <Search className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <input
              type="text"
              autoFocus
              placeholder="Search songs, artists, links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-8 pr-8 py-2 bg-[#131022] text-white text-xs font-medium rounded-full border border-purple-500/30 focus:border-purple-400 focus:outline-none transition-all placeholder-white/40 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : isRootView ? (
          <div
            onClick={() => navigateTo('search')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 text-white/50 text-xs font-medium cursor-pointer transition-colors truncate"
          >
            <Search className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span className="truncate">Search artists, songs...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center truncate px-1 text-center">
            <h2 className="text-sm font-bold text-white tracking-tight truncate font-heading">
              {getViewTitle()}
            </h2>
          </div>
        )}
      </div>

      {/* Right Action: Profile Avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* User Account / Profile Avatar */}
        <div
          onClick={toggleProfile}
          className="relative cursor-pointer flex-shrink-0 active:scale-95 transition-transform"
          title="Account Profile & Settings"
        >
          <img
            src={userProfile.avatarUrl}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-purple-500/40 shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-purple-400 ring-2 ring-[#0B0D13]" />
        </div>
      </div>
    </header>
  )
}
