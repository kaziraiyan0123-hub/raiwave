import React, { useState, useEffect } from 'react'
import { Plus, Heart, Bookmark, ArrowDownToLine, CheckCircle2, Music } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { SAMPLE_PLAYLISTS, SAMPLE_ALBUMS, SAMPLE_ARTISTS } from '../../data/musicData'
import { CreatePlaylistModal } from '../CreatePlaylistModal'
import { offlineService } from '../../services/offlineService'
import type { Track } from '../../types'

export const LibraryView: React.FC = () => {
  const {
    userPlaylists,
    openPlaylist,
    openAlbum,
    openArtist,
    navigateTo,
    likedTrackIds,
    userProfile,
    playTrack,
    offlineTrackIds,
  } = usePlayer()

  const [activeFilter, setActiveFilter] = useState<'all' | 'offline' | 'playlists' | 'albums' | 'artists'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [savedOfflineTracks, setSavedOfflineTracks] = useState<Track[]>([])

  // Load saved offline tracks
  useEffect(() => {
    offlineService.getOfflineTracks().then((tracks) => {
      setSavedOfflineTracks(tracks)
    })
  }, [offlineTrackIds.length])

  const allPlaylists = [...userPlaylists, ...SAMPLE_PLAYLISTS]

  return (
    <>
      <div className="p-4 sm:p-6 select-none space-y-6 pb-40 md:pb-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">Your Library</h1>
              <p className="text-xs text-[#94A3B8]">Maintained under {userProfile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full text-xs font-bold font-heading transition-all hover:scale-105 active:scale-95 shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Playlist</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {(['all', 'offline', 'playlists', 'albums', 'artists'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-heading capitalize transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                  : 'bg-[#12141D] hover:bg-[#181B27] text-[#94A3B8] hover:text-white border border-white/5 font-semibold'
              }`}
            >
              {filter === 'offline' ? `Offline (${offlineTrackIds.length})` : filter}
            </button>
          ))}
        </div>

        {/* Offline Downloads Vault Banner / Section */}
        {(activeFilter === 'all' || activeFilter === 'offline') && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="w-4 h-4 text-[#52D6C9]" />
                <h2 className="text-lg font-bold text-white font-display">
                  Offline Music Vault ({savedOfflineTracks.length})
                </h2>
              </div>
              <span className="text-xs text-[#52D6C9] font-mono">No Wi-Fi Needed</span>
            </div>

            {savedOfflineTracks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#12141D]/50 border border-dashed border-[#202A34] text-center space-y-1">
                <Music className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-sm font-semibold text-white font-heading">No offline tracks saved yet</p>
                <p className="text-xs text-[#94A3B8]">
                  Tap the download icon on any song to save and listen without internet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {savedOfflineTracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, savedOfflineTracks)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#12141D] hover:bg-[#181B27] border border-white/5 cursor-pointer group transition-all"
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="truncate flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#8B5CF6] transition-colors">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] truncate">{track.artist}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Quick Liked Songs Banner */}
        {(activeFilter === 'all' || activeFilter === 'playlists') && (
          <div
            onClick={() => navigateTo('liked')}
            className="p-5 rounded-3xl bg-gradient-to-r from-[#52D6C9]/20 via-[#181B27] to-[#12141D] border border-[#52D6C9]/30 cursor-pointer group transition-all hover:border-[#52D6C9]/60 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#52D6C9] to-[#8B5CF6] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Heart className="w-7 h-7 text-white fill-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display group-hover:text-[#52D6C9] transition-colors">
                  Liked Songs
                </h3>
                <p className="text-xs text-[#94A3B8]">{likedTrackIds.length} tracks favorited</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#52D6C9] font-display uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              View Collection &rarr;
            </span>
          </div>
        )}

        {/* Playlists */}
        {(activeFilter === 'all' || activeFilter === 'playlists') && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-display">Playlists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {allPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => openPlaylist(pl)}
                  className="p-3.5 rounded-2xl bg-[#12141D] hover:bg-[#181B27] border border-[#202A34] cursor-pointer group transition-all hover:-translate-y-1 shadow-lg"
                >
                  <img
                    src={pl.coverUrl}
                    alt={pl.name}
                    className="w-full aspect-square object-cover rounded-xl mb-3 shadow group-hover:scale-105 transition-transform duration-300"
                  />
                  <h4 className="text-sm font-bold text-white font-display truncate group-hover:text-[#8B5CF6] transition-colors">
                    {pl.name}
                  </h4>
                  <p className="text-xs text-[#94A3B8] truncate">{pl.tracks.length} tracks</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {(activeFilter === 'all' || activeFilter === 'albums') && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-display">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {SAMPLE_ALBUMS.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => openAlbum(alb)}
                  className="p-3.5 rounded-2xl bg-[#12141D] hover:bg-[#181B27] border border-[#202A34] cursor-pointer group transition-all hover:-translate-y-1 shadow-lg"
                >
                  <img
                    src={alb.coverUrl}
                    alt={alb.title}
                    className="w-full aspect-square object-cover rounded-xl mb-3 shadow group-hover:scale-105 transition-transform duration-300"
                  />
                  <h4 className="text-sm font-bold text-white font-display truncate group-hover:text-[#8B5CF6] transition-colors">
                    {alb.title}
                  </h4>
                  <p className="text-xs text-[#94A3B8] truncate">{alb.artist}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Artists */}
        {(activeFilter === 'all' || activeFilter === 'artists') && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-display">Artists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {SAMPLE_ARTISTS.map((art) => (
                <div
                  key={art.id}
                  onClick={() => openArtist(art)}
                  className="p-3.5 rounded-2xl bg-[#12141D] hover:bg-[#181B27] border border-[#202A34] cursor-pointer group transition-all hover:-translate-y-1 text-center shadow-lg"
                >
                  <img
                    src={art.avatarUrl}
                    alt={art.name}
                    className="w-24 h-24 mx-auto rounded-full object-cover mb-3 shadow-md group-hover:scale-105 transition-transform duration-300 border-2 border-[#202A34]"
                  />
                  <h4 className="text-sm font-bold text-white font-display truncate group-hover:text-[#8B5CF6] transition-colors">
                    {art.name}
                  </h4>
                  <p className="text-[11px] text-[#94A3B8]">Artist</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
