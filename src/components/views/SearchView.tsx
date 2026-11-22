import React, { useState, useEffect } from 'react'
import { Play, Pause, Heart, Loader2 } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { SAMPLE_TRACKS, SAMPLE_ARTISTS, SAMPLE_ALBUMS, GENRE_CATEGORIES } from '../../data/musicData'
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
  } = usePlayer()

  const [onlineResults, setOnlineResults] = useState<Track[]>([])
  const [isSearchingOnline, setIsSearchingOnline] = useState(false)

  const q = searchQuery.toLowerCase().trim()

  const localFilteredTracks = q
    ? SAMPLE_TRACKS.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q)
      )
    : []

  const filteredArtists = q
    ? SAMPLE_ARTISTS.filter((a) => a.name.toLowerCase().includes(q) || a.bio.toLowerCase().includes(q))
    : []

  const filteredAlbums = q
    ? SAMPLE_ALBUMS.filter((a) => a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q))
    : []

  // Live online music search
  useEffect(() => {
    if (!q) {
      setOnlineResults([])
      setIsSearchingOnline(false)
      return
    }

    let isMounted = true
    setIsSearchingOnline(true)

    const timer = setTimeout(() => {
      searchGlobalMusic(q)
        .then((tracks) => {
          if (isMounted) {
            setOnlineResults(tracks)
            setIsSearchingOnline(false)
          }
        })
        .catch(() => {
          if (isMounted) setIsSearchingOnline(false)
        })
    }, 250)

    return () => {
      isMounted = false
      clearTimeout(timer)
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

  const topResult: Track | null = combinedTracks.length > 0 ? combinedTracks[0] : null

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="p-4 sm:p-6 select-none space-y-6 pb-28 md:pb-20">
      {/* Search Header */}
      {searchQuery && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white font-heading">
              Results for <span className="text-[#B6F36B]">"{searchQuery}"</span>
            </h2>
            {isSearchingOnline && (
              <span className="flex items-center gap-1.5 text-xs text-[#929DA8]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B6F36B]" />
                <span>Searching global catalog...</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-[#929DA8] hover:text-white underline"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* If Search Query is Present */}
      {searchQuery ? (
        <div className="space-y-8">
          {combinedTracks.length === 0 && !isSearchingOnline && (
            <div className="p-8 bg-[#141A23] rounded-2xl border border-white/10 text-center max-w-xl mx-auto space-y-2">
              <p className="text-base font-bold text-white font-heading">No results found for "{searchQuery}"</p>
              <p className="text-xs text-[#929DA8]">
                Check spelling or try searching for another artist, track, or album.
              </p>
            </div>
          )}

          {/* Top Result + Matching Songs Split Grid */}
          {topResult && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Top Result Card */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white font-heading">Top result</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#B6F36B]/20 border border-[#B6F36B]/40 text-[#B6F36B] text-[10px] font-black uppercase tracking-wider font-heading">
                    First Priority Match
                  </span>
                </div>
                {(() => {
                  const isTopPlaying = currentTrack?.id === topResult.id && isPlaying
                  return (
                    <div
                      onClick={() => {
                        if (currentTrack?.id === topResult.id) toggleMobilePlayer()
                        else playTrack(topResult, combinedTracks)
                      }}
                      className="bg-[#141A23] hover:bg-[#1B232E] p-6 rounded-2xl cursor-pointer transition-all duration-300 group relative flex flex-col justify-between min-h-[240px] shadow-2xl border border-white/5 hover:border-[#B6F36B]/40 relative overflow-hidden"
                    >
                      {/* Subtle Ambient Glow */}
                      <div
                        className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-25 blur-2xl pointer-events-none"
                        style={{ backgroundColor: topResult.color || '#B6F36B' }}
                      />

                      <div className="flex items-start justify-between z-10">
                        <img
                          src={topResult.coverUrl}
                          alt={topResult.title}
                          className="w-24 h-24 rounded-2xl object-cover shadow-lg border border-white/10 group-hover:scale-105 transition-transform"
                        />
                        {isTopPlaying && <EqualizerBars size="md" />}
                      </div>
                      <div className="z-10 mt-4 pr-14">
                        <h4 className="text-xl sm:text-2xl font-black text-white font-heading truncate mb-1">
                          {topResult.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#929DA8] font-medium truncate">
                          Official Song &bull; <span className="text-white hover:underline">{topResult.artist}</span>
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isTopPlaying) togglePlay()
                          else playTrack(topResult, combinedTracks)
                        }}
                        className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-[#B6F36B] text-[#090D13] flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 z-20"
                        title={isTopPlaying ? 'Pause' : 'Play Top Match'}
                      >
                        {isTopPlaying ? (
                          <Pause className="w-6 h-6 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  )
                })()}
              </div>

              {/* Matching Songs List */}
              <div className="lg:col-span-3">
                <h3 className="text-xl font-bold text-white font-heading mb-3">Songs</h3>
                <div className="space-y-1">
                  {combinedTracks.slice(0, 6).map((track) => {
                    const isTrackPlaying = currentTrack?.id === track.id && isPlaying
                    const isTrackSelected = currentTrack?.id === track.id
                    const liked = isLiked(track.id)
                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          if (isTrackSelected) toggleMobilePlayer()
                          else playTrack(track, combinedTracks)
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors ${
                          isTrackSelected ? 'bg-white/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow border border-white/5"
                          />
                          <div className="truncate">
                            <p
                              className={`text-sm font-semibold truncate transition-colors font-heading ${
                                isTrackSelected ? 'text-[#B6F36B]' : 'text-white group-hover:text-[#B6F36B]'
                              }`}
                            >
                              {track.title}
                            </p>
                            <p className="text-xs text-[#929DA8] truncate">{track.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-[#929DA8]">
                          {isTrackPlaying && <EqualizerBars size="sm" />}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleLike(track.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                liked ? 'text-[#B6F36B] fill-[#B6F36B] opacity-100' : 'hover:text-white'
                              }`}
                            />
                          </button>
                          <span className="text-xs font-mono">{formatDuration(track.duration)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* All Matching Tracks List */}
          {combinedTracks.length > 6 && (
            <section>
              <h3 className="text-xl font-bold text-white font-heading mb-3">More Songs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {combinedTracks.slice(6, 24).map((track) => {
                  const liked = isLiked(track.id)
                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, combinedTracks)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#141A23] hover:bg-[#1B232E] border border-white/5 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow"
                        />
                        <div className="truncate">
                          <p className="text-sm font-semibold text-white font-heading truncate group-hover:text-[#B6F36B] transition-colors">
                            {track.title}
                          </p>
                          <p className="text-xs text-[#929DA8] truncate">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[#929DA8]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLike(track.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              liked ? 'text-[#B6F36B] fill-[#B6F36B] opacity-100' : 'hover:text-white'
                            }`}
                          />
                        </button>
                        <span className="text-xs font-mono">{formatDuration(track.duration)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Matching Artists */}
          {filteredArtists.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-white font-heading mb-3">Artists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredArtists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => openArtist(artist)}
                    className="bg-[#141A23] hover:bg-[#1B232E] p-4 rounded-2xl cursor-pointer transition-all duration-300 group flex flex-col items-center border border-white/5"
                  >
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-24 h-24 rounded-full object-cover mb-3 shadow border border-white/10 group-hover:scale-105 transition-transform"
                    />
                    <h4 className="font-bold text-sm text-white font-heading truncate text-center">
                      {artist.name}
                    </h4>
                    <p className="text-xs text-[#929DA8] text-center">Artist</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Matching Albums */}
          {filteredAlbums.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-white font-heading mb-3">Albums</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredAlbums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => openAlbum(album)}
                    className="bg-[#141A23] hover:bg-[#1B232E] p-4 rounded-2xl cursor-pointer transition-all duration-300 group flex flex-col border border-white/5"
                  >
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="w-full aspect-square rounded-xl object-cover mb-3 shadow group-hover:scale-105 transition-transform"
                    />
                    <h4 className="font-bold text-sm text-white font-heading truncate mb-1">
                      {album.title}
                    </h4>
                    <p className="text-xs text-[#929DA8] truncate">{album.artist}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* If No Query: Colorful genre cards */
        <section>
          <h2 className="text-xl font-bold text-white font-heading mb-4">Browse all genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {GENRE_CATEGORIES.map((genre) => (
              <div
                key={genre.id}
                onClick={() => setSearchQuery(genre.name.split(' ')[0])}
                style={{ backgroundColor: genre.color }}
                className="h-36 p-4 rounded-2xl cursor-pointer overflow-hidden relative transition-transform duration-200 hover:scale-[1.02] shadow-lg flex flex-col justify-between select-none"
              >
                <span className="font-bold text-lg text-white font-heading tracking-tight break-words max-w-[75%]">
                  {genre.name}
                </span>

                <div className="absolute -bottom-2 -right-3 w-20 h-20 rotate-[20deg] shadow-2xl rounded-xl overflow-hidden pointer-events-none border border-white/20">
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
