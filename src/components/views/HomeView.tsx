import React from 'react'
import { Play, Pause, Heart, Flame, ArrowRight, Disc3, Mic, RefreshCw, Radio } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import {
  SAMPLE_PLAYLISTS,
  SAMPLE_TRACKS,
  MUSIC_CATEGORIES,
  TRENDING_HERO,
} from '../../data/musicData'
import { EqualizerBars } from '../EqualizerBars'

export const HomeView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playTrack,
    openPlaylist,
    navigateTo,
    activeCategory,
    setActiveCategory,
    isLiked,
    toggleLike,
    realtimeTopTracks,
    realtimeRecommended,
    isLoadingRealtime,
    refreshRealtimeMusic,
    toggleRecorder,
    recordings,
  } = usePlayer()

  // Use live real-time global top tracks if available, otherwise fallback to curated sample tracks
  const liveCharts = realtimeTopTracks.length > 0 ? realtimeTopTracks : SAMPLE_TRACKS
  const liveRecommendations = realtimeRecommended.length > 0 ? realtimeRecommended : filteredSampleTracks()

  function filteredSampleTracks() {
    if (activeCategory === 'All') return SAMPLE_TRACKS
    const cat = activeCategory.toLowerCase()
    return SAMPLE_TRACKS.filter((t) =>
      t.genre.toLowerCase().includes(cat) ||
      t.title.toLowerCase().includes(cat) ||
      t.artist.toLowerCase().includes(cat)
    )
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const isHeroPlaying = currentTrack?.id === TRENDING_HERO.track?.id && isPlaying

  return (
    <div className="p-4 sm:p-6 space-y-8 select-none pb-32 md:pb-24">
      {/* 1. Category Pills Bar with Real-Time Genre Switch */}
      <div className="flex items-center justify-between gap-3 overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
          {MUSIC_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-heading font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-[#B6F36B] text-[#090D13] shadow-[0_0_15px_rgba(182,243,107,0.35)] font-bold'
                    : 'bg-[#141A23] text-[#929DA8] hover:text-white hover:bg-[#202A34] border border-white/5'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => refreshRealtimeMusic()}
          className="p-2 rounded-full bg-[#141A23] hover:bg-[#202A34] text-[#929DA8] hover:text-[#B6F36B] transition-colors flex-shrink-0"
          title="Refresh Real-Time Charts"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRealtime ? 'animate-spin text-[#B6F36B]' : ''}`} />
        </button>
      </div>

      {/* 2. Hero Trending Spotlight Banner (from Image 5) */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#141A23] via-[#1B232E] to-[#202A34] border border-white/10 shadow-2xl">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#52D6C9]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#B6F36B]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-[#52D6C9] font-heading border border-white/10">
              <Flame className="w-3.5 h-3.5 text-[#52D6C9]" />
              <span>{TRENDING_HERO.subtitle}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-heading tracking-tight">
              {TRENDING_HERO.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#929DA8] max-w-lg">
              {TRENDING_HERO.description}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (isHeroPlaying) togglePlay()
                  else if (liveCharts.length > 0) playTrack(liveCharts[0], liveCharts)
                }}
                className="px-6 py-2.5 rounded-full bg-[#B6F36B] hover:bg-[#c4f885] text-[#090D13] font-bold text-xs font-heading flex items-center gap-2 shadow-[0_0_20px_rgba(182,243,107,0.4)] transition-all hover:scale-105 active:scale-95"
              >
                {isHeroPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Play now</span>
                  </>
                )}
              </button>

              <button
                onClick={() => openPlaylist(SAMPLE_PLAYLISTS[0])}
                className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs font-heading transition-all hover:scale-105 active:scale-95"
              >
                View playlist
              </button>
            </div>
          </div>

          {/* 3D Visual Collage Artwork */}
          <div className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 group">
            <img
              src={TRENDING_HERO.coverUrl}
              alt={TRENDING_HERO.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090D13]/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 backdrop-blur-md bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="font-semibold truncate">{TRENDING_HERO.artist}</span>
              <Disc3 className="w-4 h-4 text-[#B6F36B] animate-spin-slow" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Studio Audio Recording Quick Banner */}
      <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1B232E] to-[#141A23] border border-[#202A34] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 flex-shrink-0 shadow-inner">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white font-display">
              RAIWAVE Studio Voice & Music Recorder
            </h3>
            <p className="text-xs text-[#929DA8]">
              Record singing, beats, and voice memos directly synced to your Gmail library ({recordings.length} saved)
            </p>
          </div>
        </div>
        <button
          onClick={toggleRecorder}
          className="px-5 py-2.5 rounded-full bg-red-500 hover:bg-red-400 text-white font-bold text-xs font-display flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20 flex-shrink-0"
        >
          <Mic className="w-4 h-4" />
          <span>Launch Recorder</span>
        </button>
      </section>

      {/* 4. Real-Time Recommended Frequencies by Category */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#52D6C9]" />
            <h2 className="text-xl font-bold text-white font-heading tracking-tight">
              Real-Time Frequencies: {activeCategory}
            </h2>
          </div>
          <button
            onClick={() => navigateTo('explore')}
            className="text-xs font-semibold text-[#929DA8] hover:text-[#B6F36B] flex items-center gap-1 transition-colors"
          >
            <span>Explore all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {liveRecommendations.slice(0, 4).map((track) => (
            <div
              key={track.id}
              onClick={() => playTrack(track, liveRecommendations)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer border border-white/10 shadow-lg hover:border-[#B6F36B]/40 transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <h4 className="text-sm font-bold text-white font-heading truncate">
                    {track.title}
                  </h4>
                  <span className="text-[11px] text-[#929DA8] truncate block">{track.artist}</span>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#B6F36B] text-[#090D13] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex-shrink-0">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Live Real-Time Global Top Charts (Replacing static 2020 tracks) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#B6F36B]" />
            <h2 className="text-xl font-bold text-white font-heading tracking-tight">
              Live Real-Time Global Top 50 ({liveCharts.length})
            </h2>
          </div>
          <button
            onClick={() => navigateTo('search')}
            className="text-xs font-semibold text-[#929DA8] hover:text-[#B6F36B] flex items-center gap-1 transition-colors"
          >
            <span>Search global music</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-[#141A23]/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="divide-y divide-white/5">
            {liveCharts.slice(0, 15).map((track, idx) => {
              const isSelected = currentTrack?.id === track.id
              const isTrackPlaying = isSelected && isPlaying
              const liked = isLiked(track.id)

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (isTrackPlaying) togglePlay()
                    else playTrack(track, liveCharts)
                  }}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors group ${
                    isSelected ? 'bg-white/10' : ''
                  }`}
                >
                  {/* Left: Rank + Art + Title/Artist */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-6 text-center text-xs font-mono font-bold text-[#929DA8] group-hover:hidden">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isTrackPlaying) togglePlay()
                        else playTrack(track, liveCharts)
                      }}
                      className="w-6 h-6 hidden group-hover:flex items-center justify-center text-[#B6F36B]"
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
                          isSelected ? 'text-[#B6F36B] font-bold' : 'text-white group-hover:text-[#B6F36B]'
                        }`}
                      >
                        {track.title}
                      </span>
                      <span className="text-[11px] text-[#929DA8] truncate">{track.artist}</span>
                    </div>
                  </div>

                  {/* Center: Genre tag */}
                  <span className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-semibold text-[#52D6C9] truncate max-w-[140px]">
                    {track.genre}
                  </span>

                  {/* Right: Equalizer / Like / Duration */}
                  <div className="flex items-center gap-3 text-xs text-[#929DA8] flex-shrink-0">
                    {isTrackPlaying && <EqualizerBars size="sm" />}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(track.id)
                      }}
                      className="p-1 hover:text-white transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          liked ? 'text-[#B6F36B] fill-[#B6F36B]' : 'hover:text-white'
                        }`}
                      />
                    </button>

                    <span className="font-mono text-[11px]">{formatTime(track.duration)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. Curated Frequency Playlists */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white font-heading tracking-tight">
          Featured Playlists
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {SAMPLE_PLAYLISTS.map((pl) => (
            <div
              key={pl.id}
              onClick={() => openPlaylist(pl)}
              className="bg-[#141A23]/70 hover:bg-[#1B232E] p-3.5 rounded-2xl cursor-pointer transition-all duration-300 border border-white/5 hover:border-[#B6F36B]/30 group shadow-md"
            >
              <div className="relative mb-3 aspect-square w-full rounded-xl overflow-hidden shadow-lg">
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
                  className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[#B6F36B] text-[#090D13] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-white font-heading truncate">
                {pl.name}
              </h4>
              <p className="text-[11px] text-[#929DA8] line-clamp-1 mt-0.5">
                {pl.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
