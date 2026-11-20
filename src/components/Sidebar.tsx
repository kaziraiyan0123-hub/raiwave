import React, { useState } from 'react'
import {
  Home,
  Compass,
  Search,
  Bookmark,
  Plus,
  Heart,
  Music2,
  Sparkles,
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

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-[#090D13] h-full select-none text-[#929DA8] p-3 gap-2 flex-shrink-0 border-r border-white/5">
        {/* Top Brand & Navigation Block */}
        <div className="bg-[#141A23]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
          {/* Official RAIWAVE Logo */}
          <div
            onClick={() => navigateTo('home')}
            className="cursor-pointer hover:opacity-95 transition-opacity py-1"
          >
            <RaiwaveLogo size="md" />
          </div>

          <nav className="flex flex-col gap-1 mt-2">
            <button
              onClick={() => navigateTo('home')}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-xs font-heading transition-all ${
                currentView === 'home'
                  ? 'bg-[#B6F36B] text-[#090D13] font-bold shadow-[0_0_15px_rgba(182,243,107,0.3)]'
                  : 'text-[#929DA8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className={`w-4 h-4 ${currentView === 'home' ? 'text-[#090D13] stroke-[2.5]' : ''}`} />
              <span>Home</span>
            </button>

            <button
              onClick={() => navigateTo('explore')}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-xs font-heading transition-all ${
                currentView === 'explore'
                  ? 'bg-[#B6F36B] text-[#090D13] font-bold shadow-[0_0_15px_rgba(182,243,107,0.3)]'
                  : 'text-[#929DA8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className={`w-4 h-4 ${currentView === 'explore' ? 'text-[#090D13] stroke-[2.5]' : ''}`} />
              <span>Explore</span>
            </button>

            <button
              onClick={() => navigateTo('search')}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-xs font-heading transition-all ${
                currentView === 'search'
                  ? 'bg-[#B6F36B] text-[#090D13] font-bold shadow-[0_0_15px_rgba(182,243,107,0.3)]'
                  : 'text-[#929DA8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className={`w-4 h-4 ${currentView === 'search' ? 'text-[#090D13] stroke-[2.5]' : ''}`} />
              <span>Search</span>
            </button>
          </nav>
        </div>

        {/* Library & Playlists Block */}
        <div className="bg-[#141A23]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-3 flex-1 flex flex-col overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-2 mb-1">
            <button
              onClick={() => navigateTo('library')}
              className={`flex items-center gap-2.5 font-bold text-xs font-heading transition-colors ${
                currentView === 'library' ? 'text-[#B6F36B]' : 'text-[#929DA8] hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Your Library</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              title="Create playlist"
              className="w-7 h-7 rounded-lg text-[#929DA8] hover:text-white bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Special Quick Lists: Liked Songs & Studio Recordings */}
          <div className="flex flex-col gap-1 pb-3 border-b border-white/5">
            <button
              onClick={() => navigateTo('liked')}
              className={`flex items-center gap-3 px-2 py-2 rounded-xl text-xs font-medium transition-all ${
                isLikedActive
                  ? 'bg-[#202A34] text-white font-semibold border border-white/10'
                  : 'text-[#929DA8] hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#52D6C9] to-[#8B5CF6] flex items-center justify-center flex-shrink-0 shadow-md">
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <div className="flex flex-col text-left truncate">
                <span className="truncate">Liked Songs</span>
                <span className="text-[10px] text-[#929DA8]">{likedTrackIds.length} tracks</span>
              </div>
            </button>

            <button
              onClick={() => navigateTo('library')}
              className="flex items-center gap-3 px-2 py-2 rounded-xl text-xs font-medium text-[#929DA8] hover:text-white hover:bg-white/5 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <Music2 className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex flex-col text-left truncate">
                <span className="truncate">Studio Recordings</span>
                <span className="text-[10px] text-[#B6F36B]">Live Audio Memos</span>
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
                      ? 'bg-[#202A34] text-[#B6F36B] font-semibold border border-white/10'
                      : 'text-[#929DA8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#202A34] flex items-center justify-center text-[#929DA8] flex-shrink-0">
                    <Music2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="truncate">{pl.name}</span>
                    <span className="text-[10px] text-[#929DA8]">{pl.tracks.length} tracks</span>
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
                      ? 'bg-[#202A34] text-[#B6F36B] font-semibold border border-white/10'
                      : 'text-[#929DA8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <img
                    src={pl.coverUrl}
                    alt={pl.name}
                    className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col truncate">
                    <span className="truncate">{pl.name}</span>
                    <span className="text-[10px] text-[#929DA8] truncate">{pl.owner}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Bottom High-Res Audio Badge */}
          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#929DA8] px-2 font-mono">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#B6F36B]" />
              <span>LOSSLESS AUDIO</span>
            </span>
            <span className="text-[#B6F36B] font-bold">320kbps</span>
          </div>
        </div>
      </aside>

      <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
