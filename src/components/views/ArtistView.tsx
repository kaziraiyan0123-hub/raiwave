import React, { useState, useEffect, useMemo } from 'react'
import {
  Play,
  Pause,
  CheckCircle2,
  Heart,
  ChevronLeft,
  Shuffle,
  Radio,
  ListPlus,
  MoreVertical,
} from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { artistService } from '../../services/artistService'
import { EqualizerBars } from '../EqualizerBars'

export const ArtistView: React.FC = () => {
  const {
    selectedArtist,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    isLiked,
    toggleLike,
    goBack,
    openAlbum,
    openArtist,
    addToQueue,
    showToast,
  } = usePlayer()

  const [isFollowing, setIsFollowing] = useState(false)
  const [discographyFilter, setDiscographyFilter] = useState<'all' | 'albums' | 'singles'>('all')
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null)

  useEffect(() => {
    if (selectedArtist) {
      setIsFollowing(artistService.isFollowing(selectedArtist.id))
    }
  }, [selectedArtist?.id])

  if (!selectedArtist) {
    return (
      <div className="p-8 text-center text-[#94A3B8]">
        <p>No artist selected.</p>
      </div>
    )
  }

  const tracks = selectedArtist.topTracks || []
  const albums = selectedArtist.albums || []
  const singles = selectedArtist.singles || []
  const isArtistPlaying = isPlaying && tracks.some((t) => t.id === currentTrack?.id)

  const handlePlayAll = () => {
    if (tracks.length === 0) return
    if (isArtistPlaying) {
      togglePlay()
    } else {
      playTrack(tracks[0], tracks)
    }
  }

  const handleShufflePlay = () => {
    if (tracks.length === 0) return
    const shuffled = [...tracks].sort(() => Math.random() - 0.5)
    playTrack(shuffled[0], shuffled)
    showToast(`Shuffling tracks by ${selectedArtist.name}`)
  }

  const handleArtistRadio = () => {
    if (tracks.length === 0) return
    const radioTracks = [...tracks]
    if (selectedArtist.relatedArtists) {
      // Add a mix of related artists if available
    }
    playTrack(radioTracks[0], radioTracks)
    showToast(`Started ${selectedArtist.name} Radio`)
  }

  const handleToggleFollow = () => {
    const next = artistService.toggleFollow(selectedArtist.id)
    setIsFollowing(next)
    showToast(next ? `Following ${selectedArtist.name}` : `Unfollowed ${selectedArtist.name}`)
  }

  const formatDuration = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Filtered discography releases
  const displayedAlbums = useMemo(() => {
    if (discographyFilter === 'singles') return []
    return albums
  }, [albums, discographyFilter])

  const displayedSingles = useMemo(() => {
    if (discographyFilter === 'albums') return []
    return singles
  }, [singles, discographyFilter])

  return (
    <div className="select-none pb-44 md:pb-28 w-full overflow-hidden">
      {/* 1. Immersive Hero Banner with Gradient Fade */}
      <div
        className="relative min-h-[260px] sm:min-h-[320px] flex items-end p-4 sm:p-8 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(11,13,19,0.3) 0%, rgba(11,13,19,0.8) 65%, #0B0D13 100%), url(${
            selectedArtist.headerImage || selectedArtist.avatarUrl
          })`,
        }}
      >
        {/* Mobile In-Page Back Button */}
        <button
          onClick={goBack}
          className="md:hidden absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/15 active:scale-95 transition-all cursor-pointer"
          title="Back"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="relative z-10 space-y-2 max-w-3xl">
          {selectedArtist.isVerified && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
              <CheckCircle2 className="w-4 h-4 fill-purple-400 text-black" />
              <span className="text-white font-medium">Verified Artist</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight font-display drop-shadow-md">
            {selectedArtist.name}
          </h1>

          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#94A3B8]">
            <span>{selectedArtist.monthlyListeners.toLocaleString()} monthly listeners</span>
            {selectedArtist.genre && (
              <>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-[11px]">
                  {selectedArtist.genre}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Action Controls Bar */}
      <div className="px-4 sm:px-8 py-4 flex items-center gap-3 sm:gap-4 bg-[#0B0D13] flex-wrap">
        {/* Play Button */}
        <button
          onClick={handlePlayAll}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/30 cursor-pointer"
          title={isArtistPlaying ? 'Pause' : 'Play Artist'}
        >
          {isArtistPlaying ? (
            <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
          ) : (
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
          )}
        </button>

        {/* Shuffle Button */}
        <button
          onClick={handleShufflePlay}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Shuffle Play"
        >
          <Shuffle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
        </button>

        {/* Artist Radio Button */}
        <button
          onClick={handleArtistRadio}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Start Artist Radio"
        >
          <Radio className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Artist Radio</span>
        </button>

        {/* Follow Button */}
        <button
          onClick={handleToggleFollow}
          className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            isFollowing
              ? 'border-purple-500 text-purple-400 bg-purple-500/10 hover:border-white hover:text-white'
              : 'border-white/20 text-white hover:border-purple-400 hover:text-purple-400 hover:scale-105'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* 3. Content Body */}
      <div className="px-4 sm:px-8 space-y-8 bg-[#0B0D13]">
        {/* Popular Songs Section */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-white font-display">Popular Songs</h2>

          <div className="space-y-1.5">
            {tracks.slice(0, 10).map((track, idx) => {
              const isPlayingThis = currentTrack?.id === track.id && isPlaying
              const isSelectedThis = currentTrack?.id === track.id
              const liked = isLiked(track.id)
              const isMenuOpen = activeMenuTrackId === track.id

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (isPlayingThis) togglePlay()
                    else playTrack(track, tracks)
                  }}
                  className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl cursor-pointer transition-all border relative ${
                    isSelectedThis
                      ? 'bg-purple-950/40 border-purple-500/40'
                      : 'bg-[#12141D]/90 hover:bg-[#181B27] border-white/5'
                  }`}
                >
                  {/* Left: Ranking + Cover + Title + Album */}
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    {/* Rank Number or Live Equalizer */}
                    <div className="w-5 text-center flex-shrink-0 flex items-center justify-center">
                      {isPlayingThis ? (
                        <EqualizerBars size="sm" color="bg-purple-400" />
                      ) : (
                        <span className="text-xs font-mono font-medium text-[#94A3B8]">
                          {idx < 9 ? `0${idx + 1}` : idx + 1}
                        </span>
                      )}
                    </div>

                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      loading="lazy"
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover flex-shrink-0 shadow border border-white/5"
                    />

                    <div className="truncate flex-1 min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-semibold truncate font-heading ${
                          isSelectedThis ? 'text-purple-400' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                        {track.album || selectedArtist.name}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
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
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          liked ? 'text-pink-500 fill-pink-500' : 'hover:scale-110'
                        }`}
                      />
                    </button>

                    {/* Options Menu Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveMenuTrackId(isMenuOpen ? null : track.id)
                      }}
                      className="p-1.5 text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
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
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Discography Section (Albums, Singles & EPs) */}
        {(albums.length > 0 || singles.length > 0) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-white font-display">Discography</h2>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5">
                {(['all', 'albums', 'singles'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDiscographyFilter(tab)}
                    className={`px-3 py-1 rounded-full text-xs font-heading capitalize transition-all cursor-pointer ${
                      discographyFilter === tab
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-white/5 text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {tab === 'all' ? 'All Releases' : tab === 'albums' ? 'Albums' : 'Singles & EPs'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {displayedAlbums.map((album) => (
                <div
                  key={album.id}
                  onClick={() => openAlbum(album)}
                  className="p-3 rounded-2xl bg-[#12141D] hover:bg-[#181B27] border border-white/5 cursor-pointer group transition-all hover:-translate-y-1 shadow-lg"
                >
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    loading="lazy"
                    className="w-full aspect-square rounded-xl object-cover mb-2.5 shadow group-hover:scale-105 transition-transform"
                  />
                  <h4 className="text-xs sm:text-sm font-bold text-white font-display truncate group-hover:text-purple-400 transition-colors">
                    {album.title}
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                    Album • {album.year}
                  </p>
                </div>
              ))}

              {displayedSingles.map((single) => (
                <div
                  key={single.id}
                  onClick={() => playTrack(single, tracks)}
                  className="p-3 rounded-2xl bg-[#12141D] hover:bg-[#181B27] border border-white/5 cursor-pointer group transition-all hover:-translate-y-1 shadow-lg"
                >
                  <img
                    src={single.coverUrl}
                    alt={single.title}
                    loading="lazy"
                    className="w-full aspect-square rounded-xl object-cover mb-2.5 shadow group-hover:scale-105 transition-transform"
                  />
                  <h4 className="text-xs sm:text-sm font-bold text-white font-display truncate group-hover:text-purple-400 transition-colors">
                    {single.title}
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                    Single • {single.releaseYear || new Date().getFullYear()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar / Related Artists */}
        {selectedArtist.relatedArtists && selectedArtist.relatedArtists.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white font-display">
              Fans Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {selectedArtist.relatedArtists.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => openArtist(rel.name)}
                  className="p-3 rounded-2xl bg-[#12141D] hover:bg-[#181B27] border border-white/5 cursor-pointer group transition-all hover:-translate-y-1 text-center shadow-lg"
                >
                  <img
                    src={rel.avatarUrl}
                    alt={rel.name}
                    loading="lazy"
                    className="w-20 h-20 mx-auto rounded-full object-cover mb-2 shadow group-hover:scale-105 transition-transform border border-purple-500/20"
                  />
                  <h4 className="text-xs sm:text-sm font-bold text-white font-display truncate group-hover:text-purple-400 transition-colors">
                    {rel.name}
                  </h4>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">Artist</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* About Section */}
        <section className="pb-8 pt-4 border-t border-white/10 space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-white font-display">About</h3>
          <div className="bg-[#12141D] p-5 sm:p-6 rounded-2xl border border-white/5 max-w-2xl space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={selectedArtist.avatarUrl}
                alt={selectedArtist.name}
                className="w-14 h-14 rounded-full object-cover border border-purple-500/30"
              />
              <div>
                <p className="font-bold text-white text-base font-display">
                  {selectedArtist.name}
                </p>
                <p className="text-xs text-[#94A3B8]">
                  {selectedArtist.monthlyListeners.toLocaleString()} monthly listeners
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              {selectedArtist.bio ||
                `${selectedArtist.name} is streamed in lossless studio fidelity on RAIWAVE.`}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
