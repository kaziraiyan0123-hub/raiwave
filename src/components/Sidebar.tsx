import React, { useState } from 'react'
import {
  Home,
  Compass,
  Bookmark,
  Plus,
  Heart,
  Music2,
  Sparkles,
  Smartphone,
  ListMusic,
  History,
} from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { SAMPLE_PLAYLISTS } from '../data/musicData'
import { CreatePlaylistModal } from './CreatePlaylistModal'
import { RaiwaveLogo } from './RaiwaveLogo'

export const Sidebar: React.FC = () => {
  const {
    currentView,
    navigateTo,
    openPlaylist,
    selectedPlaylist,
    userPlaylists,
    likedTrackIds,
  } = usePlayer()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const isLikedActive = currentView === 'liked'

  const handleRecentlyPlayedClick = () => {
    navigateTo('home')
    setTimeout(() => {
      const el = document.getElementById('recently-played-section')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handlePlaylistsClick = () => {
    navigateTo('library')
  }

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-[#0B0D13] h-full select-none text-[#94A3B8] p-3 gap-2 flex-shrink-0 border-r border-white/5">
        {/* Top Brand & Navigation Block */}
        <div className="bg-[#12141D]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
          {/* Official RAIWAVE Logo */}
          <div
            onClick={() => navigateTo('home')}
            className="cursor-pointer hover:opacity-95 transition-opacity py-1"
          >
            <RaiwaveLogo size="md" />
          </div>

          <nav className="flex flex-col gap-1 mt-1">
            {/* 1. Home */}
            <button
              onClick={() => navigateTo('home')}
              className={`flex items-center gap-3.5 px-3 py-2 rounded-xl font-medium text-xs font-heading transition-all ${
                currentView === 'home'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-bold shadow-[0_4px_16px_rgba(139,92,246,0.35)]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className={`w-4 h-4 ${currentView === 'home' ? 'text-white stroke-[2.5]' : ''}`} />
              <span>Home</span>
            </button>

            {/* 2. Discover */}
            <button
              onClick={() => navigateTo('explore')}
              className={`flex items-center gap-3.5 px-3 py-2 rounded-xl font-medium text-xs font-heading transition-all ${
                currentView === 'explore'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-bold shadow-[0_4px_16px_rgba(139,92,246,0.35)]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className={`w-4 h-4 ${currentView === 'explore' ? 'text-white stroke-[2.5]' : ''}`} />
              <span>Discover</span>
            </button>

            {/* 3. My Library */}
            <button
              onClick={() => navigateTo('library')}
              className={`flex items-center gap-3.5 px-3 py-2 rounded-xl font-medium text-xs font-heading transition-all ${
                currentView === 'library'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-bold shadow-[0_4px_16px_rgba(139,92,246,0.35)]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${currentView === 'library' ? 'text-white stroke-[2.5]' : ''}`} />
              <span>My Library</span>
            </button>

            {/* 4. Playlists */}
            <button
              onClick={handlePlaylistsClick}
              className="flex items-center gap-3.5 px-3 py-2 rounded-xl font-medium text-xs font-heading transition-all text-[#94A3B8] hover:text-white hover:bg-white/5"
            >
              <ListMusic className="w-4 h-4" />
              <span>Playlists</span>
            </button>

            {/* 5. Favorites */}
            <button
              onClick={() => navigateTo('liked')}
              className={`flex items-center gap-3.5 px-3 py-2 rounded-xl font-medium text-xs font-heading transition-all ${
                isLikedActive
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-bold shadow-[0_4px_16px_rgba(139,92,246,0.35)]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLikedActive ? 'text-white fill-white' : ''}`} />
              <span>Favorites ({likedTrackIds.length})</span>
            </button>

            {/* 6. Recently Played */}
            <button
              onClick={handleRecentlyPlayedClick}
              className="flex items-center gap-3.5 px-3 py-2 rounded-xl font-medium text-xs font-heading transition-all text-[#94A3B8] hover:text-white hover:bg-white/5"
            >
              <History className="w-4 h-4" />
              <span>Recently Played</span>
            </button>
          </nav>
        </div>

        {/* Library & Playlists Block */}
        <div className="bg-[#12141D]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-3 flex-1 flex flex-col overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-2 mb-1">
            <button
              onClick={() => navigateTo('library')}
              className={`flex items-center gap-2.5 font-bold text-xs font-heading transition-colors ${
                currentView === 'library' ? 'text-[#A78BFA]' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Your Library</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              title="Create playlist"
              className="w-7 h-7 rounded-lg text-[#94A3B8] hover:text-white bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Special Quick List: Liked Songs */}
          <div className="flex flex-col gap-1 pb-3 border-b border-white/5">
            <button
              onClick={() => navigateTo('liked')}
              className={`flex items-center gap-3 px-2 py-2 rounded-xl text-xs font-medium transition-all ${
                isLikedActive
                  ? 'bg-[#181B27] text-white font-semibold border border-purple-500/20'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center flex-shrink-0 shadow-md">
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <div className="flex flex-col text-left truncate">
                <span className="truncate">Liked Songs</span>
                <span className="text-[10px] text-[#94A3B8]">{likedTrackIds.length} tracks</span>
              </div>
            </button>
          </div>

          {/* Scrollable Playlists List */}
          <div className="flex-1 overflow-y-auto mt-2 space-y-1 pr-1">
            {/* User Custom Playlists */}
            {userPlaylists.map((pl) => {
              const isSelected = selectedPlaylist?.id === pl.id && currentView === 'playlist'
              return (
                <button
                  key={pl.id}
                  onClick={() => openPlaylist(pl)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-colors text-xs ${
                    isSelected
                      ? 'bg-[#181B27] text-[#A78BFA] font-semibold border border-purple-500/20'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#181B27] flex items-center justify-center text-[#94A3B8] flex-shrink-0">
                    <Music2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="truncate">{pl.name}</span>
                    <span className="text-[10px] text-[#94A3B8]">{pl.tracks.length} tracks</span>
                  </div>
                </button>
              )
            })}

            {/* Curated Global Playlists */}
            {SAMPLE_PLAYLISTS.map((pl) => {
              const isSelected = selectedPlaylist?.id === pl.id && currentView === 'playlist'
              return (
                <button
                  key={pl.id}
                  onClick={() => openPlaylist(pl)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-colors text-xs ${
                    isSelected
                      ? 'bg-[#181B27] text-[#A78BFA] font-semibold border border-purple-500/20'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <img
                    src={pl.coverUrl}
                    alt={pl.name}
                    className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col truncate">
                    <span className="truncate">{pl.name}</span>
                    <span className="text-[10px] text-[#94A3B8] truncate">{pl.owner}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Direct Mobile App Download */}
          <div className="pt-2 border-t border-white/5">
            <a
              href="/RAIWAVE.apk"
              download="RAIWAVE.apk"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all border border-white/5 group"
              title="Direct 1-tap download of RAIWAVE.apk for Android (no GitHub required)"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-[#A78BFA] group-hover:scale-110 transition-transform" />
                <span>Get Mobile App</span>
              </div>
              <span className="text-[10px] text-[#A78BFA] font-mono font-bold">APK (5MB)</span>
            </a>
          </div>

          {/* Bottom High-Res Audio Badge */}
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#94A3B8] px-2 font-mono">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#A78BFA]" />
              <span>LOSSLESS AUDIO</span>
            </span>
            <span className="text-[#A78BFA] font-bold">320kbps</span>
          </div>
        </div>
      </aside>

      <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
