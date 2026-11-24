import React, { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  Heart,
  Loader2,
  ListPlus,
  MoreVertical,
  Music,
} from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { SAMPLE_TRACKS, SAMPLE_ARTISTS, SAMPLE_ALBUMS, GENRE_CATEGORIES } from '../../data/musicData'
import { CURATED_ARTISTS } from '../../services/artistService'
import { searchGlobalMusic } from '../../services/musicSearch'
import type { Track } from '../../types'
import { EqualizerBars } from '../EqualizerBars'

export const SearchView: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    openAlbum,
    openArtist,
    isLiked,
    toggleLike,
    toggleMobilePlayer,
    addToQueue,
  } = usePlayer()

  const [onlineResults, setOnlineResults] = useState<Track[]>([])
  const [isSearchingOnline, setIsSearchingOnline] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'artists' | 'albums'>('all')
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  const q = searchQuery.toLowerCase().trim()

  // Local tracks search
  const localFilteredTracks = q
    ? SAMPLE_TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q)
      )
    : []

  // Combine curated and sample artists for comprehensive search
  const combinedArtistsPool = [...CURATED_ARTISTS]
  for (const art of SAMPLE_ARTISTS) {
    if (!combinedArtistsPool.some((a) => a.name.toLowerCase() === art.name.toLowerCase())) {
      combinedArtistsPool.push(art)
    }
  }

  const filteredArtists = q
    ? combinedArtistsPool.filter(
        (a) => a.name.toLowerCase().includes(q) || a.bio.toLowerCase().includes(q)
      )
    : []

  const filteredAlbums = q
    ? SAMPLE_ALBUMS.filter(
        (a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
      )
    : []

  // Debounced online search with AbortController
  useEffect(() => {
    if (!q) {
      setOnlineResults([])
      setIsSearchingOnline(false)
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsSearchingOnline(true)

    const timer = setTimeout(() => {
      searchGlobalMusic(q)
        .then((tracks) => {
          if (!controller.signal.aborted) {
            setOnlineResults(tracks)
            setIsSearchingOnline(false)
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setIsSearchingOnline(false)
          }
        })
    }, 280)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [q])

  // Combine local & global online tracks (deduplicated)
  const combinedTracks = [...localFilteredTracks]
  for (const track of onlineResults) {
    if (
      !combinedTracks.some(
        (t) =>
          t.title.toLowerCase() === track.title.toLowerCase() &&
          t.artist.toLowerCase() === track.artist.toLowerCase()
      )
    ) {
      combinedTracks.push(track)
    }
  }

  const formatDuration = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="p-3 sm:p-6 select-none space-y-5 pb-44 md:pb-28 max-w-7xl mx-auto w-full touch-pan-y">
      {/* Search Header */}
      {searchQuery && (
        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white font-heading truncate">
              Results for <span className="text-[#A78BFA]">"{searchQuery}"</span>
            </h2>
            {isSearchingOnline && (
              <span className="flex items-center gap-1 text-[11px] text-[#94A3B8] flex-shrink-0">
                <Loader2 className="w-3 h-3 animate-spin text-[#8B5CF6]" />
                <span className="hidden sm:inline">Searching...</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="text-[11px] sm:text-xs text-[#94A3B8] hover:text-white underline flex-shrink-0 cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Filter Tabs when query is present */}
      {searchQuery && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 touch-pan-y">
          {(['all', 'songs', 'artists', 'albums'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-heading capitalize transition-all cursor-pointer flex-shrink-0 ${
                activeTab === tab
                  ? 'bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(147,51,234,0.4)]'
                  : 'bg-[#12141D] hover:bg-[#181B27] text-[#94A3B8] hover:text-white border border-white/5'
              }`}
            >
              {tab === 'all'
                ? `All (${combinedTracks.length})`
                : tab === 'songs'
                ? `Songs (${combinedTracks.length})`
                : tab === 'artists'
                ? `Artists (${filteredArtists.length})`
                : `Albums (${filteredAlbums.length})`}
            </button>
          ))}
        </div>
      )}

      {/* Query Present */}
      {searchQuery ? (
        <div className="space-y-6">
          {combinedTracks.length === 0 && !isSearchingOnline && (
            <div className="p-8 bg-[#12141D] rounded-2xl border border-white/5 text-center max-w-md mx-auto space-y-2">
              <Music className="w-8 h-8 text-[#94A3B8] mx-auto opacity-40" />
              <p className="text-sm font-bold text-white font-heading">
                No songs found for "{searchQuery}"
              </p>
              <p className="text-xs text-[#94A3B8]">
                Check spelling or try searching for another artist or song.
              </p>
            </div>
          )}

          {/* Songs List (Both Mobile & Desktop Optimized) */}
          {(activeTab === 'all' || activeTab === 'songs') && combinedTracks.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider font-heading">
                  Songs ({combinedTracks.length})
                </h3>
              </div>

              <div className="space-y-1.5">
                {combinedTracks.map((track) => {
                  const isTrackPlaying = currentTrack?.id === track.id && isPlaying
                  const isTrackSelected = currentTrack?.id === track.id
                  const liked = isLiked(track.id)
                  const isMenuOpen = activeMenuTrackId === track.id

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        if (isTrackSelected) toggleMobilePlayer()
                        else playTrack(track, combinedTracks)
                      }}
                      className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl cursor-pointer active:scale-[0.99] transition-all border relative ${
                        isTrackSelected
                          ? 'bg-purple-950/40 border-purple-500/50 shadow-md'
                          : 'bg-[#12141D]/90 hover:bg-[#181B27] border-white/5'
                      }`}
                    >
                      {/* Left: Thumbnail & Song / Artist Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                        <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg overflow-hidden shadow border border-white/10">
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          {isTrackPlaying && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                              <EqualizerBars size="sm" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <p
                            className={`text-xs sm:text-sm font-bold truncate leading-tight font-heading ${
                              isTrackSelected ? 'text-purple-400' : 'text-white'
                            }`}
                          >
                            {track.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 truncate">
                            <span
                              onClick={(e) => {
                                e.stopPropagation()
                                openArtist(track.artist)
                              }}
                              className="text-[11px] sm:text-xs text-[#94A3B8] truncate hover:text-white hover:underline cursor-pointer"
                            >
                              {track.artist}
                            </span>
                            {track.album && (
                              <>
                                <span className="text-[#94A3B8]/40 text-[10px]">•</span>
                                <span className="text-[10px] text-[#94A3B8]/60 truncate hidden sm:inline">
                                  {track.album}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {/* Duration */}
                        <span className="text-[11px] font-mono text-[#94A3B8] hidden sm:inline pr-1">
                          {formatDuration(track.duration)}
                        </span>

                        {/* Like Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLike(track.id, track)
                          }}
                          className="p-1.5 text-white/40 hover:text-white transition-colors cursor-pointer"
                          title={liked ? 'Unlike' : 'Like'}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              liked ? 'text-pink-500 fill-pink-500' : 'hover:scale-110'
                            }`}
                          />
                        </button>

                        {/* More Options / Add to Queue */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveMenuTrackId(isMenuOpen ? null : track.id)
                          }}
                          className="p-1.5 text-white/40 hover:text-white transition-colors cursor-pointer"
                          title="More options"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Play / Pause Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isTrackPlaying) togglePlay()
                            else playTrack(track, combinedTracks)
                          }}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            isTrackPlaying
                              ? 'bg-white text-black shadow-md'
                              : 'bg-purple-600/30 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white'
                          }`}
                          title={isTrackPlaying ? 'Pause' : 'Play'}
                        >
                          {isTrackPlaying ? (
                            <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
                          )}
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-2 top-12 z-30 w-44 bg-[#12141D] border border-white/10 rounded-xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-150"
                          >
                            <button
                              onClick={() => {
                                addToQueue(track)
                                setActiveMenuTrackId(null)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/5 rounded-lg text-left"
                            >
                              <ListPlus className="w-3.5 h-3.5 text-purple-400" />
                              <span>Add to Queue</span>
                            </button>
                            <button
                              onClick={() => {
                                openArtist(track.artist)
                                setActiveMenuTrackId(null)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/5 rounded-lg text-left"
                            >
                              <Music className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Go to Artist</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Matching Artists */}
          {(activeTab === 'all' || activeTab === 'artists') && filteredArtists.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider font-heading px-1">
                Artists ({filteredArtists.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredArtists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => openArtist(artist)}
                    className="bg-[#12141D] hover:bg-[#181B27] p-3.5 rounded-2xl cursor-pointer transition-all duration-200 group flex flex-col items-center border border-white/5 text-center shadow-lg hover:-translate-y-1"
                  >
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      loading="lazy"
                      className="w-20 h-20 rounded-full object-cover mb-2.5 shadow border border-purple-500/20 group-hover:scale-105 transition-transform"
                    />
                    <h4 className="font-bold text-xs sm:text-sm text-white font-heading truncate max-w-full group-hover:text-purple-400 transition-colors">
                      {artist.name}
                    </h4>
                    <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                      {artist.isVerified ? '✓ Verified Artist' : 'Artist'}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Matching Albums */}
          {(activeTab === 'all' || activeTab === 'albums') && filteredAlbums.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider font-heading px-1">
                Albums ({filteredAlbums.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredAlbums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => openAlbum(album)}
                    className="bg-[#12141D] hover:bg-[#181B27] p-3 rounded-2xl cursor-pointer transition-all duration-200 group flex flex-col border border-white/5 shadow-lg hover:-translate-y-1"
                  >
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      loading="lazy"
                      className="w-full aspect-square rounded-xl object-cover mb-2 shadow group-hover:scale-105 transition-transform"
                    />
                    <h4 className="font-bold text-xs sm:text-sm text-white font-heading truncate group-hover:text-purple-400 transition-colors">
                      {album.title}
                    </h4>
                    <p
                      onClick={(e) => {
                        e.stopPropagation()
                        openArtist(album.artist)
                      }}
                      className="text-[11px] text-[#94A3B8] truncate hover:text-white hover:underline cursor-pointer"
                    >
                      {album.artist}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Empty Query: Browse Genres */
        <section className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-white font-heading">
            Browse All Genres & Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {GENRE_CATEGORIES.map((genre) => (
              <div
                key={genre.id}
                onClick={() => setSearchQuery(genre.name.split(' ')[0])}
                style={{ backgroundColor: genre.color }}
                className="h-28 sm:h-32 p-3.5 rounded-2xl cursor-pointer overflow-hidden relative transition-transform duration-200 hover:scale-[1.02] shadow-lg flex flex-col justify-between select-none"
              >
                <span className="font-bold text-sm sm:text-base text-white font-heading tracking-tight break-words max-w-[70%]">
                  {genre.name}
                </span>

                <div className="absolute -bottom-2 -right-3 w-16 h-16 rotate-[20deg] shadow-2xl rounded-xl overflow-hidden pointer-events-none border border-white/20">
                  <img
                    src={SAMPLE_TRACKS[0].coverUrl}
                    alt={genre.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
