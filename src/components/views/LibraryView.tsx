import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Heart, Bookmark, ArrowDownToLine, CheckCircle2, Music, Trash2 } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { SAMPLE_PLAYLISTS, SAMPLE_ALBUMS, SAMPLE_ARTISTS } from '../../data/musicData'
import { CURATED_ARTISTS } from '../../services/artistService'
import { CreatePlaylistModal } from '../CreatePlaylistModal'
import { offlineService, formatBytes, type OfflineVaultItem } from '../../services/offlineService'
import { getOptimizedArtworkUrl } from '../../utils/networkImage'

export const LibraryView: React.FC = () => {
  const {
    userPlaylists,
    openPlaylist,
    openAlbum,
    openArtist,
    navigateTo,
    likedTracks,
    userProfile,
    playTrack,
    offlineTrackIds,
    removeOffline,
  } = usePlayer()

  const [activeFilter, setActiveFilter] = useState<'all' | 'offline' | 'playlists' | 'albums' | 'artists'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [vaultItems, setVaultItems] = useState<OfflineVaultItem[]>([])

  // Load verified offline vault items & storage sizes
  useEffect(() => {
    offlineService.getOfflineVaultItems().then((items) => {
      setVaultItems(items)
    })
  }, [offlineTrackIds.length])

  const savedOfflineTracks = useMemo(() => vaultItems.map((i) => i.track), [vaultItems])
  const totalVaultBytes = useMemo(
    () => vaultItems.reduce((sum, item) => sum + (item.sizeBytes || 0), 0),
    [vaultItems]
  )

  const allPlaylists = [...userPlaylists, ...SAMPLE_PLAYLISTS]

  // Combine curated and sample artists for full artist discovery
  const allArtists = [...CURATED_ARTISTS]
  for (const art of SAMPLE_ARTISTS) {
    if (!allArtists.some((a) => a.name.toLowerCase() === art.name.toLowerCase())) {
      allArtists.push(art)
    }
  }

  return (
    <>
      <div className="p-3 sm:p-6 select-none space-y-5 pb-44 md:pb-28 max-w-7xl mx-auto w-full touch-pan-y">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div className="min-w-0 truncate">
              <h1 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight truncate">
                Your Library
              </h1>
              <p className="text-[11px] sm:text-xs text-[#94A3B8] truncate">{userProfile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full text-xs font-bold font-heading transition-all hover:scale-105 active:scale-95 shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">New Playlist</span>
              <span className="xs:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 touch-pan-y">
          {(['all', 'offline', 'playlists', 'albums', 'artists'] as const).map((filter) => {
            const isActive = activeFilter === filter
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-heading capitalize transition-all cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-[0_0_12px_rgba(147,51,234,0.4)]'
                    : 'bg-[#12141D] hover:bg-[#181B27] text-[#94A3B8] hover:text-white border border-white/5 font-semibold'
                }`}
              >
                {filter === 'offline'
                  ? `Offline (${offlineTrackIds.length})`
                  : filter === 'playlists'
                  ? `Playlists (${allPlaylists.length + 1})`
                  : filter}
              </button>
            )
          })}
        </div>

        {/* Quick Liked Songs Banner */}
        {(activeFilter === 'all' || activeFilter === 'playlists') && (
          <div
            onClick={() => navigateTo('liked')}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-[#181B27] to-[#12141D] border border-purple-500/30 cursor-pointer group transition-all hover:border-purple-500/60 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white" />
              </div>
              <div className="min-w-0 truncate">
                <h3 className="text-sm sm:text-base font-bold text-white font-display group-hover:text-purple-400 transition-colors truncate">
                  Liked Songs
                </h3>
                <p className="text-xs text-[#94A3B8] font-mono">
                  {likedTracks.length} {likedTracks.length === 1 ? 'track' : 'tracks'} saved
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-400 font-display uppercase tracking-wider group-hover:translate-x-1 transition-transform flex-shrink-0">
              Open &rarr;
            </span>
          </div>
        )}

        {/* Offline Downloads Vault Section */}
        {(activeFilter === 'all' || activeFilter === 'offline') && (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <ArrowDownToLine className="w-4 h-4 text-[#52D6C9] flex-shrink-0" />
                <h2 className="text-sm sm:text-base font-bold text-white font-display truncate">
                  Offline Music Vault ({vaultItems.length})
                </h2>
              </div>
              <span className="text-[11px] text-[#52D6C9] font-mono flex-shrink-0">
                {vaultItems.length > 0 ? `${formatBytes(totalVaultBytes)} saved` : 'Verified Offline Files'}
              </span>
            </div>

            {vaultItems.length === 0 ? (
              <div className="p-5 rounded-2xl bg-[#12141D]/50 border border-dashed border-[#202A34] text-center space-y-1">
                <Music className="w-7 h-7 text-[#94A3B8] mx-auto mb-1.5 opacity-60" />
                <p className="text-xs sm:text-sm font-semibold text-white font-heading">
                  No verified offline tracks saved yet
                </p>
                <p className="text-[11px] text-[#94A3B8] max-w-md mx-auto">
                  Tracks with direct downloadable audio files can be saved here for internet-free playback.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {vaultItems.map(({ track, sizeBytes }) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, savedOfflineTracks)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#12141D] hover:bg-[#181B27] border border-white/5 cursor-pointer group transition-all"
                  >
                    <img
                      src={getOptimizedArtworkUrl(track.coverUrl, 'thumb')}
                      alt={track.title}
                      loading="lazy"
                      className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-purple-400 transition-colors">
                        {track.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] truncate">
                        <span className="truncate">{track.artist}</span>
                        <span>•</span>
                        <span className="font-mono text-emerald-400/90 flex-shrink-0">
                          {formatBytes(sizeBytes)}
                        </span>
                      </div>
                    </div>
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-400 flex-shrink-0"
                      aria-label="Verified offline audio"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeOffline(track.id)
                      }}
                      title="Remove download & free storage"
                      className="p-1.5 rounded-lg text-white/45 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Playlists */}
        {(activeFilter === 'all' || activeFilter === 'playlists') && (
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white font-display">Playlists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {allPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => openPlaylist(pl)}
                  className="p-3 rounded-2xl bg-[#12141D] hover:bg-[#181B27] border border-white/5 cursor-pointer group transition-all hover:-translate-y-1 shadow-lg"
                >
                  <img
                    src={pl.coverUrl}
                    alt={pl.name}
                    className="w-full aspect-square object-cover rounded-xl mb-2.5 shadow group-hover:scale-105 transition-transform duration-300"
                  />
                  <h4 className="text-xs sm:text-sm font-bold text-white font-display truncate group-hover:text-purple-400 transition-colors">
                    {pl.name}
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] truncate font-mono">
                    {pl.tracks.length} tracks
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {(activeFilter === 'all' || activeFilter === 'albums') && (
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white font-display">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {SAMPLE_ALBUMS.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => openAlbum(alb)}
                  className="p-3 rounded-2xl bg-[#12141D] hover:bg-[#181B27] border border-white/5 cursor-pointer group transition-all hover:-translate-y-1 shadow-lg"
                >
                  <img
                    src={alb.coverUrl}
                    alt={alb.title}
                    className="w-full aspect-square object-cover rounded-xl mb-2.5 shadow group-hover:scale-105 transition-transform duration-300"
                  />
                  <h4 className="text-xs sm:text-sm font-bold text-white font-display truncate group-hover:text-purple-400 transition-colors">
                    {alb.title}
                  </h4>
                  <p
                    onClick={(e) => {
                      e.stopPropagation()
                      openArtist(alb.artist)
                    }}
                    className="text-[11px] text-[#94A3B8] truncate hover:text-white hover:underline cursor-pointer"
                  >
                    {alb.artist}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Artists */}
        {(activeFilter === 'all' || activeFilter === 'artists') && (
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white font-display">Artists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {allArtists.map((art) => (
                <div
                  key={art.id}
                  onClick={() => openArtist(art)}
                  className="p-3.5 rounded-2xl bg-[#12141D] hover:bg-[#181B27] border border-white/5 cursor-pointer group transition-all hover:-translate-y-1 text-center shadow-lg"
                >
                  <img
                    src={art.avatarUrl}
                    alt={art.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full object-cover mb-2.5 shadow-md group-hover:scale-105 transition-transform duration-300 border-2 border-purple-500/20"
                  />
                  <h4 className="text-xs sm:text-sm font-bold text-white font-display truncate group-hover:text-purple-400 transition-colors">
                    {art.name}
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] truncate">
                    {art.isVerified ? '✓ Verified Artist' : 'Artist'}
                  </p>
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
