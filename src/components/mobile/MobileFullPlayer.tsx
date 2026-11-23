import React, { useState, useEffect, useRef } from 'react'
import {
  ChevronDown,
  Heart,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Mic2,
  ListMusic,
  Share2,
  ArrowDownToLine,
  CheckCircle2,
  Sparkles,
  Activity,
} from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'

export const MobileFullPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seek,
    nextTrack,
    prevTrack,
    repeatMode,
    toggleRepeat,
    isShuffle,
    toggleShuffle,
    isLiked,
    toggleLike,
    isMobilePlayerOpen,
    toggleMobilePlayer,
    navigateTo,
    liveLyrics,
    isLoadingLyrics,
    saveOffline,
    isOffline,
    dynamicTheme,
    openDedicatedVisualizer,
  } = usePlayer()

  const [showInlineLyrics, setShowInlineLyrics] = useState(false)
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null)
  const activeLyricRef = useRef<HTMLParagraphElement | null>(null)

  // Compute active lyric line
  let activeLyricIndex = -1
  if (liveLyrics && liveLyrics.length > 0) {
    for (let i = 0; i < liveLyrics.length; i++) {
      if (currentTime >= liveLyrics[i].time) {
        if (i === liveLyrics.length - 1 || currentTime < liveLyrics[i + 1].time) {
          activeLyricIndex = i
          break
        }
      }
    }
  }

  // Auto-scroll active lyric into center
  useEffect(() => {
    if (showInlineLyrics && activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeLyricIndex, showInlineLyrics])

  if (!currentTrack || !isMobilePlayerOpen) return null

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const liked = isLiked(currentTrack.id)
  const downloaded = isOffline(currentTrack.id)

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0D13] select-none overflow-y-auto no-scrollbar transition-transform duration-300">
      <div className="w-full max-w-md mx-auto min-h-full flex flex-col justify-between p-6 relative">
        {/* Dynamic Ambient Glow Background */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full opacity-35 blur-[120px] pointer-events-none transition-all duration-1000"
          style={{ backgroundColor: dynamicTheme.primary }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0D13]/75 to-[#0B0D13] pointer-events-none" />

        {/* Top Header */}
        <div className="w-full flex items-center justify-between z-10 pt-2">
        <button
          data-testid="close-full-player"
          onClick={toggleMobilePlayer}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-all"
          title="Minimize Player"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest font-heading flex items-center gap-1" style={{ color: dynamicTheme.secondary }}>
            <Sparkles className="w-3 h-3" style={{ color: dynamicTheme.primary }} />
            <span>LOSSLESS FREQUENCY</span>
          </span>
          <span className="text-xs font-semibold text-white/90 truncate max-w-[200px]">
            {currentTrack.album || 'Universal Stream'}
          </span>
        </div>

        <button
          onClick={() => saveOffline(currentTrack)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-all"
          title={downloaded ? 'Saved Offline' : 'Download Song Offline'}
        >
          {downloaded ? (
            <CheckCircle2 className="w-5 h-5" style={{ color: dynamicTheme.primary }} />
          ) : (
            <ArrowDownToLine className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Centerpiece: Wave of Music Beats Visualizer OR Live Synced Lyrics */}
      <div className="relative flex flex-col items-center justify-center my-auto py-4 z-10 min-h-[340px]">
        {!showInlineLyrics ? (
          <>
            {/* Native Mobile High-Res Album Artwork Card */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-2">
              <div
                className="w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden border border-white/10 relative group transition-all duration-500"
                style={{
                  boxShadow: isPlaying
                    ? `0 20px 50px -10px rgba(0,0,0,0.85), 0 0 40px ${dynamicTheme.accentGlow}`
                    : '0 20px 50px -10px rgba(0,0,0,0.85)',
                }}
              >
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[28px] sm:rounded-[32px] pointer-events-none" />
              </div>
            </div>

            {/* Track Title, Artist & Like Heart Button */}
            <div className="flex items-center justify-between w-full max-w-sm mt-6 px-4">
              <div className="flex flex-col min-w-0 pr-3">
                <h2 className="text-xl sm:text-2xl font-black text-white truncate font-heading tracking-tight text-left">
                  {currentTrack.title}
                </h2>
                <p className="text-sm font-semibold text-white/60 truncate mt-0.5 text-left">
                  {currentTrack.artist}
                </p>
              </div>

              <button
                onClick={() => toggleLike(currentTrack.id)}
                className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center shadow-lg active:scale-90 transition-transform flex-shrink-0 cursor-pointer"
                title={liked ? 'Unlike' : 'Like song'}
              >
                <Heart
                  className="w-5 h-5 transition-colors"
                  style={liked ? { color: dynamicTheme.primary, fill: dynamicTheme.primary } : { color: '#94A3B8' }}
                />
              </button>
            </div>
          </>
        ) : (
          /* Live Synced Karaoke Lyrics Canvas */
          <div
            ref={lyricsContainerRef}
            className="w-full max-w-sm h-80 overflow-y-auto no-scrollbar space-y-4 text-center px-4 py-6 rounded-3xl bg-[#12141D]/80 backdrop-blur-xl border border-white/10"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="text-xs font-bold text-[#A78BFA] font-heading flex items-center gap-1.5">
                <Mic2 className="w-3.5 h-3.5" />
                <span>LIVE KARAOKE LYRICS</span>
              </span>
              <button
                onClick={() => setShowInlineLyrics(false)}
                className="text-[11px] text-[#94A3B8] hover:text-white"
              >
                Show Art
              </button>
            </div>

            {isLoadingLyrics ? (
              <div className="py-20 text-xs text-[#94A3B8] animate-pulse">
                Fetching synchronized lyrics from satellite database...
              </div>
            ) : liveLyrics.length === 0 ? (
              <div className="py-20 text-xs text-[#94A3B8]">
                No lyrics available for this frequency yet.
              </div>
            ) : (
              liveLyrics.map((line, idx) => {
                const isActive = idx === activeLyricIndex
                const isPast = idx < activeLyricIndex

                return (
                  <p
                    key={idx}
                    ref={isActive ? activeLyricRef : null}
                    onClick={() => seek(line.time)}
                    className={`text-lg sm:text-xl font-extrabold cursor-pointer transition-all duration-300 font-heading ${
                      isActive
                        ? 'text-[#A78BFA] scale-110 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)] font-black py-1'
                        : isPast
                        ? 'text-white/40 hover:text-white/70'
                        : 'text-white/20 hover:text-white/60'
                    }`}
                  >
                    {line.text}
                  </p>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Signature Linear Scrubber & Audio Controls */}
      <div className="flex flex-col gap-5 z-10 pb-2 w-full max-w-sm mx-auto">
        {/* Scrubber Bar */}
        <div className="w-full flex items-center gap-3 px-2">
          <span className="text-[11px] font-mono text-[#94A3B8] w-9 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 h-3 flex items-center group slider-container">
            <div className="absolute inset-x-0 h-1.5 bg-[#181B27] rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-150"
                style={{
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, ${dynamicTheme.secondary} 0%, ${dynamicTheme.primary} 100%)`,
                }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={1}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-[11px] font-mono text-[#94A3B8] w-9">
            {formatTime(duration)}
          </span>
        </div>

        {/* Action Controls: Shuffle, Prev, Play/Pause, Next, Repeat */}
        <div className="flex items-center justify-between px-4">
          <button
            onClick={toggleShuffle}
            className="p-2 transition-colors active:scale-90"
            style={isShuffle ? { color: dynamicTheme.primary } : { color: '#94A3B8' }}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={prevTrack}
            className="p-2 text-white hover:text-white/80 active:scale-90 transition-all"
            title="Previous track"
          >
            <SkipBack className="w-7 h-7 fill-white" />
          </button>

          {/* Central Play Button */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-10 border"
            style={{
              background: `linear-gradient(135deg, ${dynamicTheme.primary} 0%, ${dynamicTheme.secondary} 100%)`,
              boxShadow: `0 0 30px ${dynamicTheme.accentGlow}`,
              borderColor: dynamicTheme.borderColor,
            }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white ml-1" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-2 text-white hover:text-white/80 active:scale-90 transition-all"
            title="Next track"
          >
            <SkipForward className="w-7 h-7 fill-white" />
          </button>

          <button
            onClick={toggleRepeat}
            className="p-2 transition-colors active:scale-90"
            style={repeatMode !== 'off' ? { color: dynamicTheme.primary } : { color: '#94A3B8' }}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Footer shortcuts: Toggle Lyrics, Queue & Share */}
        <div className="flex items-center justify-around pt-2 border-t border-white/5 text-[#94A3B8]">
          <button
            onClick={() => setShowInlineLyrics((prev) => !prev)}
            className={`flex items-center gap-1.5 text-xs transition-colors py-1.5 px-3 rounded-full ${
              showInlineLyrics ? 'bg-purple-500/20 text-[#A78BFA] font-bold' : 'hover:text-white'
            }`}
          >
            <Mic2 className="w-4 h-4 text-[#8B5CF6]" />
            <span>{showInlineLyrics ? 'View Art' : 'Live Lyrics'}</span>
          </button>

          <button
            onClick={() => {
              toggleMobilePlayer()
              navigateTo('queue')
            }}
            className="flex items-center gap-1.5 text-xs hover:text-white transition-colors py-1.5 px-3 rounded-full"
          >
            <ListMusic className="w-4 h-4 text-[#52D6C9]" />
            <span>Queue</span>
          </button>

          <button
            onClick={() => {
              openDedicatedVisualizer()
            }}
            className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-white transition-colors py-1.5 px-3 rounded-full cursor-pointer bg-purple-500/20 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.3)] active:scale-95"
            title="Open Immersive Visualizer"
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="font-semibold">Visualizer</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: currentTrack.title,
                  text: `Listening to ${currentTrack.title} on RAIWAVE`,
                  url: window.location.href,
                }).catch(() => {})
              }
            }}
            className="flex items-center gap-1.5 text-xs hover:text-white transition-colors py-1.5 px-3 rounded-full"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  )
}
