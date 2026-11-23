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
  Search,
  X,
  Radio,
  Music2,
  Headphones,
} from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import {
  SAMPLE_PLAYLISTS,
  SAMPLE_TRACKS,
  SAMPLE_ALBUMS,
  MUSIC_CATEGORIES,
  TRENDING_HERO,
} from '../../data/musicData'
import { EqualizerBars } from '../EqualizerBars'

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
    searchQuery,
    setSearchQuery,
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

  // Calculate current playback progress percentage
  const currentProgressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 select-none pb-44 md:pb-28 max-w-7xl mx-auto">
      {/* =========================================================================
          TOP SECTION: IN-PAGE SEARCH & GREETING HEADER
         ========================================================================= */}
      <div className="space-y-4">
        {/* Quick Search Bar (Prominent in Desktop Home View; Mobile uses MobileTopBar) */}
        <div className="hidden md:block relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#94A3B8]">
            <Search className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <input
            type="text"
            placeholder="Search artists, songs, albums or playlists..."
            value={searchQuery}
            onFocus={() => {
              if (searchQuery) navigateTo('search')
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (e.target.value.trim().length > 0) navigateTo('search')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigateTo('search')
              }
            }}
            className="w-full pl-11 pr-10 py-3 bg-[#12141D]/90 hover:bg-[#181B27] focus:bg-[#181B27] text-white text-sm font-medium rounded-2xl border border-white/10 focus:border-[#8B5CF6] focus:outline-none transition-all placeholder-[#94A3B8] shadow-lg shadow-black/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 1. Greeting Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-heading tracking-tight uppercase">
              {greeting}
              {userProfile?.name ? (
                <span className="text-[#A78BFA] font-normal normal-case ml-2.5">
                  {userProfile.name.split(' ')[0]}
                </span>
              ) : null}
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 font-medium">
              Stream lossless music worldwide
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {MUSIC_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white shadow-[0_2px_14px_rgba(139,92,246,0.45)] font-bold'
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
          7. CONTINUE LISTENING SECTION (OR TRENDING SPOTLIGHT IF IDLE)
         ========================================================================= */}
      {currentTrack ? (
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#17142A]/90 via-[#131520]/95 to-[#12141D] border border-purple-500/25 p-5 sm:p-6 shadow-2xl relative group">
          {/* Subtle Ambient Glow */}
          <div
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-25 blur-3xl pointer-events-none transition-all duration-700"
            style={{ backgroundColor: currentTrack.color || '#8B5CF6' }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Left Info with Album Cover */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div
                onClick={toggleMobilePlayer}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl border border-white/10 cursor-pointer group/art"
              >
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/art:scale-105"
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <EqualizerBars size="sm" />
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA] font-heading flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Continue Listening</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white font-heading truncate mt-0.5">
                  {currentTrack.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#94A3B8] truncate mt-0.5">
                  {currentTrack.artist} &bull; <span className="text-white/80">{currentTrack.album}</span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-[#C4B5FD] border border-purple-500/30">
                    Lossless HQ
                  </span>
                  <span className="text-[11px] font-mono text-[#94A3B8]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Controls & Instant Play/Pause Button */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() => toggleLike(currentTrack.id)}
                className={`p-3 rounded-2xl bg-[#181B27] border border-white/5 transition-all hover:scale-105 active:scale-95 ${
                  isLiked(currentTrack.id)
                    ? 'text-[#8B5CF6]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
                title="Toggle favorite"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isLiked(currentTrack.id) ? 'fill-[#8B5CF6] text-[#8B5CF6]' : ''
                  }`}
                />
              </button>

              <button
                onClick={togglePlay}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9D6DF8] hover:to-[#8B5CF6] text-white font-bold text-xs font-heading flex items-center gap-2 shadow-[0_4px_22px_rgba(139,92,246,0.45)] transition-all hover:scale-105 active:scale-95 border border-purple-400/25"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress bar line along bottom */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] transition-all duration-300"
              style={{ width: `${currentProgressPercent}%` }}
            />
          </div>
        </section>
      ) : (
        /* Spotlight Banner when idle */
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#141724] via-[#1B172B] to-[#12141D] border border-white/10 shadow-2xl p-6 sm:p-8">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 text-[11px] font-bold text-[#C4B5FD] font-heading border border-purple-500/30">
                <Flame className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>{TRENDING_HERO.subtitle}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-heading tracking-tight">
                {TRENDING_HERO.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-lg">
                {TRENDING_HERO.description}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (liveCharts.length > 0) playTrack(liveCharts[0], liveCharts)
                  }}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9D6DF8] hover:to-[#8B5CF6] text-white font-bold text-xs font-heading flex items-center gap-2 shadow-[0_4px_20px_rgba(139,92,246,0.40)] transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Start Listening</span>
                </button>
              </div>
            </div>

            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 group">
              <img
                src={TRENDING_HERO.coverUrl}
                alt={TRENDING_HERO.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D13]/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 backdrop-blur-md bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="font-semibold truncate">{TRENDING_HERO.artist}</span>
                <Disc3 className="w-4 h-4 text-[#A78BFA] animate-spin-slow" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          2. RECENTLY PLAYED SECTION
         ========================================================================= */}
      <section id="recently-played-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              Recently Played
            </h2>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs font-medium text-[#94A3B8] hover:text-[#A78BFA] transition-colors"
            >
              Clear History
            </button>
          )}
        </div>

        {/* Responsive Carousel on Mobile / Grid on Desktop */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4">
          {(history.length > 0 ? history.slice(0, 10) : SAMPLE_TRACKS.slice(0, 10)).map((track) => {
            const isSelected = currentTrack?.id === track.id
            const isTrackPlaying = isSelected && isPlaying

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (isSelected) toggleMobilePlayer()
                  else playTrack(track, history.length > 0 ? history : SAMPLE_TRACKS)
                }}
                className={`w-[138px] sm:w-auto flex-shrink-0 p-3 sm:p-3.5 rounded-2xl bg-[#12141D]/90 hover:bg-[#181B27] border border-white/5 hover:border-purple-500/30 cursor-pointer group transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] sm:hover:-translate-y-1 ${
                  isSelected ? 'ring-1 ring-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.3)]' : ''
                }`}
              >
                {/* Artwork with Smooth Hover Zoom & Floating Play Button */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 shadow-md border border-white/5">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
                      isTrackPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isTrackPlaying) togglePlay()
                        else playTrack(track, history.length > 0 ? history : SAMPLE_TRACKS)
                      }}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white flex items-center justify-center shadow-xl transform group-hover:scale-105 active:scale-95 transition-transform border border-purple-400/30"
                      title={isTrackPlaying ? 'Pause' : 'Play track'}
                    >
                      {isTrackPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Title & Artist */}
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
          3. FEATURED ALBUMS SECTION
         ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Disc3 className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              Featured Albums
            </h2>
          </div>
          <button
            onClick={() => navigateTo('library')}
            className="text-xs font-semibold text-[#94A3B8] hover:text-[#A78BFA] flex items-center gap-1 transition-colors"
          >
            <span>View all in Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Albums Carousel on Mobile / Grid on Desktop */}
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:gap-5">
          {SAMPLE_ALBUMS.map((album) => {
            const isAlbumActive = currentTrack?.album === album.title
            return (
              <div
                key={album.id}
                onClick={() => openAlbum(album)}
                className="w-[155px] sm:w-auto flex-shrink-0 bg-[#12141D]/90 hover:bg-[#181B27] p-3.5 sm:p-4 rounded-3xl cursor-pointer transition-all duration-300 border border-white/5 hover:border-purple-500/30 group shadow-lg hover:shadow-[0_12px_36px_rgba(0,0,0,0.65)] sm:hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Album Artwork with smooth zoom */}
                <div className="relative mb-3 aspect-square w-full rounded-2xl overflow-hidden shadow-lg border border-white/5">
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Floating Play Button on Hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (album.tracks.length > 0) {
                        playTrack(album.tracks[0], album.tracks)
                      }
                    }}
                    className="absolute bottom-2.5 right-2.5 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 z-20 border border-purple-400/30"
                    title={`Play ${album.title}`}
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                  </button>
                </div>

                {/* Album Metadata */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8] mb-1">
                  <span>ALBUM &bull; {album.year}</span>
                  {isAlbumActive && (
                    <span className="text-[#8B5CF6] font-bold flex items-center gap-1">
                      <EqualizerBars size="sm" />
                      <span>Playing</span>
                    </span>
                  )}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white font-heading truncate group-hover:text-[#A78BFA] transition-colors leading-tight">
                  {album.title}
                </h4>
                <p className="text-xs text-[#94A3B8] truncate mt-0.5 font-medium">
                  {album.artist}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* =========================================================================
          4. RECOMMENDED PLAYLISTS ("MADE FOR YOU")
         ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Headphones className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              Recommended Playlists &bull; Made For You
            </h2>
          </div>
          <button
            onClick={() => navigateTo('explore')}
            className="text-xs font-semibold text-[#94A3B8] hover:text-[#A78BFA] flex items-center gap-1 transition-colors"
          >
            <span>Explore more</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Playlists Carousel on Mobile / Grid on Desktop */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
          {SAMPLE_PLAYLISTS.map((pl) => (
            <div
              key={pl.id}
              onClick={() => openPlaylist(pl)}
              className="w-[145px] sm:w-auto flex-shrink-0 bg-[#12141D]/80 hover:bg-[#181B27] p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all duration-300 border border-white/5 hover:border-purple-500/30 group shadow-md hover:shadow-xl sm:hover:-translate-y-1"
            >
              <div className="relative mb-2.5 aspect-square w-full rounded-xl overflow-hidden shadow-lg border border-white/5">
                <img
                  src={pl.coverUrl}
                  alt={pl.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (pl.tracks.length > 0) playTrack(pl.tracks[0], pl.tracks)
                  }}
                  className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 border border-purple-400/25"
                  title={`Play playlist ${pl.name}`}
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
          5. POPULAR SONGS SECTION (GLOBAL HIT TRACKS)
         ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              Popular Songs Today
            </h2>
          </div>
          <button
            onClick={() => navigateTo('search')}
            className="text-xs font-semibold text-[#94A3B8] hover:text-[#A78BFA] flex items-center gap-1 transition-colors"
          >
            <span>Search global music</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2-Column Responsive Track List */}
        <div className="bg-[#12141D]/90 backdrop-blur-xl border border-white/5 rounded-3xl p-3 sm:p-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {categoryFilteredTracks.slice(0, 10).map((track, idx) => {
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
                  className={`flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors group ${
                    isSelected ? 'bg-white/10' : ''
                  }`}
                >
                  {/* Left: Rank + Art + Title/Artist */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center text-xs font-mono font-bold text-[#94A3B8] group-hover:hidden">
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
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow border border-white/5"
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
                  <div className="flex items-center gap-3 text-xs text-[#94A3B8] flex-shrink-0">
                    {isTrackPlaying && <EqualizerBars size="sm" />}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(track.id)
                      }}
                      className="p-1 hover:text-white transition-colors"
                      title={liked ? 'Unlike' : 'Like'}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          liked ? 'text-[#8B5CF6] fill-[#8B5CF6]' : 'hover:text-white'
                        }`}
                      />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        saveOffline(track)
                      }}
                      className="p-1 hover:text-[#A78BFA] transition-colors"
                      title={isOffline(track.id) ? 'Downloaded Offline' : 'Download song for offline mode'}
                    >
                      {isOffline(track.id) ? (
                        <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
                      ) : (
                        <ArrowDownToLine className="w-4 h-4 hover:text-[#A78BFA]" />
                      )}
                    </button>

                    <span className="font-mono text-[11px]">{formatTime(track.duration)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. NEW MUSIC SECTION (FRESH RELEASES)
         ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Music2 className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
              New Releases & Fresh Frequencies
            </h2>
          </div>
        </div>

        {/* New Releases Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {newMusicTracks.map((track) => {
            const isPlayingThis = currentTrack?.id === track.id && isPlaying
            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, newMusicTracks)}
                className="bg-[#12141D]/90 hover:bg-[#181B27] p-3 rounded-2xl cursor-pointer transition-all duration-300 border border-white/5 hover:border-purple-500/30 group shadow-md hover:shadow-xl hover:-translate-y-1 relative"
              >
                <div className="relative mb-2.5 aspect-square w-full rounded-xl overflow-hidden shadow border border-white/5">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-purple-600/90 text-white text-[9px] font-black uppercase tracking-wider backdrop-blur-md">
                    NEW
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isPlayingThis) togglePlay()
                      else playTrack(track, newMusicTracks)
                    }}
                    className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95 border border-purple-400/25"
                    title={`Play ${track.title}`}
                  >
                    {isPlayingThis ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                <h4 className="text-xs font-bold text-white font-heading truncate group-hover:text-[#A78BFA] transition-colors">
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
