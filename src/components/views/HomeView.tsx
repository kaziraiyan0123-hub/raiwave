import React, { useMemo } from 'react'
import {
  Play,
  Pause,
  Heart,
  Flame,
  ArrowRight,
  Disc3,
  History,
  ArrowDownToLine,
  CheckCircle2,
  Music2,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Radio,
} from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import {
  SAMPLE_PLAYLISTS,
  SAMPLE_TRACKS,
  SAMPLE_ALBUMS,
  MUSIC_CATEGORIES,
} from '../../data/musicData'
import { EqualizerBars } from '../EqualizerBars'
import { useCarouselSwipe } from '../../hooks/useCarouselSwipe'

export const HomeView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playTrack,
    openPlaylist,
    openAlbum,
    navigateTo,
    activeCategory,
    setActiveCategory,
    isLiked,
    toggleLike,
    realtimeTopTracks,
    history,
    clearHistory,
    saveOffline,
    isOffline,
    toggleMobilePlayer,
    userProfile,
  } = usePlayer()

  // Real-time top tracks or fallback sample tracks
  const liveCharts = useMemo(
    () => (realtimeTopTracks.length > 0 ? realtimeTopTracks : SAMPLE_TRACKS),
    [realtimeTopTracks]
  )

  // Filtered tracks based on active category
  const categoryFilteredTracks = useMemo(() => {
    if (activeCategory === 'All') return liveCharts
    return liveCharts.filter(
      (t) =>
        t.genre.toLowerCase().includes(activeCategory.toLowerCase()) ||
        t.title.toLowerCase().includes(activeCategory.toLowerCase())
    )
  }, [liveCharts, activeCategory])

  // New Music Releases (curated by release year)
  const newMusicTracks = useMemo(() => {
    return [...SAMPLE_TRACKS]
      .sort((a, b) => b.releaseYear - a.releaseYear)
      .slice(0, 6)
  }, [])

  // Time-based dynamic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }, [])

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Combined Recently Played + Recommended tracks
  const recentlyPlayedList = useMemo(() => {
    const list = [...history]
    for (const track of categoryFilteredTracks) {
      if (!list.some((t) => t.id === track.id)) {
        list.push(track)
      }
      if (list.length >= 12) break
    }
    return list
  }, [history, categoryFilteredTracks])

  // Carousel touch/pointer drag handlers for mobile swiping
  const categorySwipe = useCarouselSwipe()
  const recentSwipe = useCarouselSwipe()
  const albumSwipe = useCarouselSwipe()
  const playlistSwipe = useCarouselSwipe()
  const releaseSwipe = useCarouselSwipe()

  // Calculate current playback progress percentage
  const currentProgressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="px-4 py-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 select-none pb-40 md:pb-24 max-w-7xl mx-auto w-full">
      {/* =========================================================================
          1. GREETING & CATEGORY PILLS BAR
         ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-white font-heading tracking-tight">
              {greeting}
              {userProfile?.name ? (
                <span className="text-[#A78BFA] font-medium ml-2 text-lg sm:text-2xl">
                  {userProfile.name.split(' ')[0]}
                </span>
              ) : null}
            </h1>
            <p className="text-[11px] sm:text-xs text-[#94A3B8] font-medium mt-0.5">
              Listen to your favorite artists, albums, and global frequencies
            </p>
          </div>

          {/* Category Filter Chips */}
          <div
            {...categorySwipe.carouselProps}
            className="carousel-swipe flex items-center gap-1.5 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {MUSIC_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={categorySwipe.handleCardClick(() => setActiveCategory(cat))}
                  className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer flex-shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-[0_2px_12px_rgba(139,92,246,0.45)] font-bold'
                      : 'bg-[#12141D] text-[#94A3B8] hover:text-white hover:bg-[#181B27] border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. JUMP BACK IN / NOW PLAYING BANNER (COMPACT & SLEEK)
         ========================================================================= */}
      {currentTrack && (
        <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#17142A]/90 via-[#131520]/95 to-[#12141D] border border-purple-500/20 p-3 sm:p-4 shadow-xl group">
          {/* Subtle color wash */}
          <div
            className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20 blur-2xl pointer-events-none transition-all duration-700"
            style={{ backgroundColor: currentTrack.color || '#8B5CF6' }}
          />

          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* Left: Album Artwork + Track Details */}
            <div
              onClick={toggleMobilePlayer}
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
            >
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md border border-white/10">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <EqualizerBars size="sm" />
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA] font-heading flex items-center gap-1">
                  <Radio className="w-3 h-3 text-[#8B5CF6]" />
                  <span>Continue Listening</span>
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white font-heading truncate mt-0.5">
                  {currentTrack.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#94A3B8] truncate">
                  {currentTrack.artist} &bull; <span className="text-white/70">{currentTrack.album}</span>
                </p>
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggleLike(currentTrack.id)}
                className={`p-2 rounded-xl bg-[#181B27] border border-white/5 transition-all active:scale-95 cursor-pointer ${
                  isLiked(currentTrack.id)
                    ? 'text-[#8B5CF6]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
                title="Toggle favorite"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isLiked(currentTrack.id) ? 'fill-[#8B5CF6] text-[#8B5CF6]' : ''
                  }`}
                />
              </button>

              <button
                onClick={togglePlay}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9D6DF8] hover:to-[#8B5CF6] text-white font-bold text-xs font-heading flex items-center gap-1.5 shadow-[0_2px_14px_rgba(139,92,246,0.4)] transition-all active:scale-95 border border-purple-400/25 cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    <span>Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mini progress bar along bottom edge */}
          <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] transition-all duration-300"
              style={{ width: `${currentProgressPercent}%` }}
            />
          </div>
        </section>
      )}

      {/* =========================================================================
          3. RECENTLY PLAYED SECTION
         ========================================================================= */}
      <section id="recently-played-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#8B5CF6]" />
            <h2 className="text-base sm:text-xl font-bold text-white font-heading tracking-tight">
              Recently Played
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => recentSwipe.scrollByAmount(-260)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 flex items-center justify-center text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => recentSwipe.scrollByAmount(260)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 flex items-center justify-center text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-[11px] font-medium text-[#94A3B8] hover:text-[#A78BFA] transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Carousel on Mobile / Clean Responsive Grid on Desktop */}
        <div
          id="carousel-recently-played"
          {...recentSwipe.carouselProps}
          className="carousel-swipe desktop-grid gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {recentlyPlayedList.slice(0, 12).map((track) => {
            const isSelected = currentTrack?.id === track.id
            const isTrackPlaying = isSelected && isPlaying

            return (
              <div
                key={track.id}
                onClick={recentSwipe.handleCardClick(() => {
                  if (isSelected) toggleMobilePlayer()
                  else playTrack(track, recentlyPlayedList)
                })}
                className={`w-[130px] sm:w-[145px] md:w-auto flex-shrink-0 p-2.5 sm:p-3 rounded-2xl bg-[#12141D]/90 hover:bg-[#181B27] border border-white/5 hover:border-purple-500/30 cursor-pointer group transition-all duration-200 relative overflow-hidden shadow-md md:hover:-translate-y-1 ${
                  isSelected ? 'ring-1 ring-[#8B5CF6] shadow-[0_0_16px_rgba(139,92,246,0.3)]' : ''
                }`}
              >
                {/* Artwork */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-sm border border-white/5">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
                      isTrackPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isTrackPlaying) togglePlay()
                        else playTrack(track, recentlyPlayedList)
                      }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white flex items-center justify-center shadow-lg transform group-hover:scale-105 active:scale-95 transition-transform border border-purple-400/30 cursor-pointer"
                      title={isTrackPlaying ? 'Pause' : 'Play'}
                    >
                      {isTrackPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Details */}
                <h4 className="text-xs sm:text-sm font-bold text-white truncate font-heading group-hover:text-[#A78BFA] transition-colors leading-tight">
                  {track.title}
                </h4>
                <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">{track.artist}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* =========================================================================
          4. POPULAR SONGS TODAY (TOP HITS)
         ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#8B5CF6]" />
            <h2 className="text-base sm:text-xl font-bold text-white font-heading tracking-tight">
              Popular Songs Today
            </h2>
          </div>
          <button
            onClick={() => navigateTo('search')}
            className="text-xs font-semibold text-[#94A3B8] hover:text-[#A78BFA] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Search all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2-Column Responsive Track List */}
        <div className="bg-[#12141D]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-2 sm:p-3 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 sm:gap-2">
            {categoryFilteredTracks.slice(0, 8).map((track, idx) => {
              const isSelected = currentTrack?.id === track.id
              const isTrackPlaying = isSelected && isPlaying
              const liked = isLiked(track.id)

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (isSelected) toggleMobilePlayer()
                    else playTrack(track, categoryFilteredTracks)
                  }}
                  className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group ${
                    isSelected ? 'bg-white/10' : ''
                  }`}
                >
                  {/* Left: Rank + Art + Title/Artist */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <span className="w-5 text-center text-[11px] font-mono font-bold text-[#94A3B8] group-hover:hidden">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isTrackPlaying) togglePlay()
                        else playTrack(track, categoryFilteredTracks)
                      }}
                      className="w-5 h-5 hidden group-hover:flex items-center justify-center text-[#8B5CF6]"
                    >
                      {isTrackPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover flex-shrink-0 shadow border border-white/5"
                    />

                    <div className="flex flex-col min-w-0">
                      <span
                        className={`text-xs sm:text-sm font-semibold truncate font-heading ${
                          isSelected ? 'text-[#A78BFA] font-bold' : 'text-white group-hover:text-[#A78BFA]'
                        }`}
                      >
                        {track.title}
                      </span>
                      <span className="text-[11px] text-[#94A3B8] truncate">{track.artist}</span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5 text-xs text-[#94A3B8] flex-shrink-0">
                    {isTrackPlaying && <EqualizerBars size="sm" />}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(track.id)
                      }}
                      className="p-1 hover:text-white transition-colors cursor-pointer"
                      title={liked ? 'Unlike' : 'Like'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          liked ? 'text-[#8B5CF6] fill-[#8B5CF6]' : 'hover:text-white'
                        }`}
                      />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        saveOffline(track)
                      }}
                      className="p-1 hover:text-[#A78BFA] transition-colors cursor-pointer"
                      title={isOffline(track.id) ? 'Downloaded Offline' : 'Download song for offline mode'}
                    >
                      {isOffline(track.id) ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8B5CF6]" />
                      ) : (
                        <ArrowDownToLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 hover:text-[#A78BFA]" />
                      )}
                    </button>

                    <span className="font-mono text-[11px] hidden sm:inline">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FEATURED ALBUMS SECTION
         ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc3 className="w-4 h-4 text-[#8B5CF6]" />
            <h2 className="text-base sm:text-xl font-bold text-white font-heading tracking-tight">
              Featured Albums
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => albumSwipe.scrollByAmount(-260)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 flex items-center justify-center text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => albumSwipe.scrollByAmount(260)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 flex items-center justify-center text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => navigateTo('library')}
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#A78BFA] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Albums Carousel on Mobile / Grid on Desktop */}
        <div
          id="carousel-featured-albums"
          {...albumSwipe.carouselProps}
          className="carousel-swipe desktop-grid gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {SAMPLE_ALBUMS.map((album) => {
            const isAlbumActive = currentTrack?.album === album.title
            return (
              <div
                key={album.id}
                onClick={albumSwipe.handleCardClick(() => openAlbum(album))}
                className="w-[145px] sm:w-[160px] md:w-auto flex-shrink-0 bg-[#12141D]/90 hover:bg-[#181B27] p-2.5 sm:p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border border-white/5 hover:border-purple-500/30 group shadow-md md:hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="relative mb-2 aspect-square w-full rounded-xl overflow-hidden shadow border border-white/5">
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (album.tracks.length > 0) {
                        playTrack(album.tracks[0], album.tracks)
                      }
                    }}
                    className="absolute bottom-2 right-2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 border border-purple-400/30 cursor-pointer"
                    title={`Play ${album.title}`}
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] mb-0.5">
                  <span>ALBUM &bull; {album.year}</span>
                  {isAlbumActive && (
                    <span className="text-[#8B5CF6] font-bold flex items-center gap-1">
                      <EqualizerBars size="sm" />
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white font-heading truncate group-hover:text-[#A78BFA] transition-colors leading-tight">
                  {album.title}
                </h4>
                <p className="text-[11px] text-[#94A3B8] truncate mt-0.5 font-medium">
                  {album.artist}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* =========================================================================
          6. MADE FOR YOU (RECOMMENDED PLAYLISTS)
         ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-[#8B5CF6]" />
            <h2 className="text-base sm:text-xl font-bold text-white font-heading tracking-tight">
              Made For You &bull; Curated Playlists
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => playlistSwipe.scrollByAmount(-260)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 flex items-center justify-center text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => playlistSwipe.scrollByAmount(260)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 flex items-center justify-center text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => navigateTo('explore')}
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#A78BFA] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Playlists Carousel on Mobile / Grid on Desktop */}
        <div
          id="carousel-recommended-playlists"
          {...playlistSwipe.carouselProps}
          className="carousel-swipe desktop-grid gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {SAMPLE_PLAYLISTS.map((pl) => (
            <div
              key={pl.id}
              onClick={playlistSwipe.handleCardClick(() => openPlaylist(pl))}
              className="w-[140px] sm:w-[155px] md:w-auto flex-shrink-0 bg-[#12141D]/90 hover:bg-[#181B27] p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all duration-200 border border-white/5 hover:border-purple-500/30 group shadow-md md:hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="relative mb-2 aspect-square w-full rounded-xl overflow-hidden shadow border border-white/5">
                <img
                  src={pl.coverUrl}
                  alt={pl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (pl.tracks.length > 0) playTrack(pl.tracks[0], pl.tracks)
                  }}
                  className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 border border-purple-400/25 cursor-pointer"
                  title={`Play ${pl.name}`}
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-white font-heading truncate group-hover:text-[#A78BFA] transition-colors">
                {pl.name}
              </h4>
              <p className="text-[11px] text-[#94A3B8] line-clamp-1 mt-0.5">
                {pl.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          7. NEW RELEASES & FRESH FREQUENCIES
         ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-[#8B5CF6]" />
            <h2 className="text-base sm:text-xl font-bold text-white font-heading tracking-tight">
              New Releases & Fresh Frequencies
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => releaseSwipe.scrollByAmount(-260)}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 flex items-center justify-center text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => releaseSwipe.scrollByAmount(260)}
              className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 flex items-center justify-center text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Releases Carousel / Grid */}
        <div
          id="carousel-new-releases"
          {...releaseSwipe.carouselProps}
          className="carousel-swipe desktop-grid gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {newMusicTracks.map((track) => {
            const isPlayingThis = currentTrack?.id === track.id && isPlaying
            return (
              <div
                key={track.id}
                onClick={releaseSwipe.handleCardClick(() => playTrack(track, newMusicTracks))}
                className="w-[130px] sm:w-[145px] md:w-auto flex-shrink-0 bg-[#12141D]/90 hover:bg-[#181B27] p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all duration-200 border border-white/5 hover:border-purple-500/30 group shadow-md md:hover:-translate-y-1 relative"
              >
                <div className="relative mb-2 aspect-square w-full rounded-xl overflow-hidden shadow border border-white/5">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-purple-600/90 text-white text-[9px] font-black uppercase tracking-wider backdrop-blur-md">
                    NEW
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isPlayingThis) togglePlay()
                      else playTrack(track, newMusicTracks)
                    }}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 border border-purple-400/25 cursor-pointer"
                    title={`Play ${track.title}`}
                  >
                    {isPlayingThis ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                <h4 className="text-xs font-bold text-white font-heading truncate group-hover:text-[#A78BFA] transition-colors leading-tight">
                  {track.title}
                </h4>
                <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                  {track.artist}
                </p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
