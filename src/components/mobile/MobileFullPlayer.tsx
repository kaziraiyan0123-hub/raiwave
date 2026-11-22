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
  } = usePlayer()

  const [showInlineLyrics, setShowInlineLyrics] = useState(false)
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null)
  const activeLyricRef = useRef<HTMLParagraphElement | null>(null)

  // 40 Radial Wave Frequency Bars around the centerpiece artwork
  const totalBars = 40
  const barAngles = Array.from({ length: totalBars }, (_, i) => (i * 360) / totalBars)

  // Dynamic Beat-Synchronized Audio Rhythm & Soundwave Bars
  const [visualizerHeights, setVisualizerHeights] = useState<number[]>(() =>
    Array.from({ length: totalBars }, () => 8)
  )
  const [kickPulse, setKickPulse] = useState(0)

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

  useEffect(() => {
    if (!isPlaying || !isMobilePlayerOpen) {
      setVisualizerHeights(Array.from({ length: totalBars }, () => 6))
      setKickPulse(0)
      return
    }

    let animId: number
    let lastUpdate = 0
    const genre = (currentTrack?.genre || '').toLowerCase()
    const bpm =
      genre.includes('dance') || genre.includes('electronic') || genre.includes('edm')
        ? 128
        : genre.includes('hip') || genre.includes('rap')
        ? 94
        : genre.includes('rock')
        ? 132
        : genre.includes('chill') || genre.includes('lofi')
        ? 82
        : 116

    const beatIntervalSec = 60 / bpm

    const updateBeats = () => {
      const now = performance.now() / 1000
      if (now - lastUpdate >= 0.035) { // Smooth 28-30 FPS to avoid mobile WebView thread starvation
        lastUpdate = now
        const phase = (currentTime > 0 ? currentTime : now) % beatIntervalSec
        const beatFraction = phase / beatIntervalSec

        // Exponential decay kick pulse on each downbeat
        const kick = Math.max(0, 1 - beatFraction * 3.4)
        setKickPulse(kick)

        const snare =
          beatFraction > 0.45 && beatFraction < 0.65
            ? Math.max(0, 1 - (beatFraction - 0.45) * 6.5)
            : 0

        const heights = barAngles.map((_, i) => {
          const isBass = i <= 6 || i >= 34
          const isTreble = i >= 17 && i <= 23

          let energy = 0.25
          if (isBass) {
            energy = 0.28 + kick * 0.72 + Math.sin(now * 8 + i * 0.3) * 0.12
          } else if (isTreble) {
            energy = 0.22 + snare * 0.55 + Math.cos(now * 16 + i * 0.6) * 0.22
          } else {
            energy = 0.26 + kick * 0.35 + snare * 0.45 + Math.sin(now * 10 + i * 0.5) * 0.2
          }

          const clamped = Math.max(0.12, Math.min(1.0, energy))
          return Math.round(8 + clamped * 28) // 8px to 36px
        })

        setVisualizerHeights(heights)
      }
      animId = requestAnimationFrame(updateBeats)
    }

    animId = requestAnimationFrame(updateBeats)
    return () => cancelAnimationFrame(animId)
  }, [isPlaying, isMobilePlayerOpen, currentTime, currentTrack?.id, currentTrack?.genre])

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
    <div className="fixed inset-0 z-50 bg-[#0B0D13] flex flex-col justify-between p-6 select-none overflow-y-auto no-scrollbar transition-transform duration-300">
      {/* Dynamic Ambient Glow Background */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full opacity-35 blur-[120px] pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: dynamicTheme.primary }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0D13]/75 to-[#0B0D13] pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10 pt-2">
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
            {/* Dynamic Music Beat Waves & Radial Sound Spectrum */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Concentric Acoustic Shockwave Rings */}
              {isPlaying && (
                <>
                  <div
                    className="absolute inset-2 rounded-full border pointer-events-none transition-all duration-75"
                    style={{
                      transform: `scale(${1 + kickPulse * 0.12})`,
                      opacity: 0.3 + kickPulse * 0.7,
                      borderColor: dynamicTheme.borderColor,
                    }}
                  />
                  <div
                    className="absolute -inset-2 rounded-full border pointer-events-none transition-all duration-100"
                    style={{
                      transform: `scale(${1 + kickPulse * 0.08})`,
                      opacity: 0.2 + kickPulse * 0.5,
                      borderColor: dynamicTheme.borderColor,
                    }}
                  />
                  <div className="absolute -inset-6 rounded-full border border-white/5 pointer-events-none" />
                </>
              )}

              {/* 40 Animated Radial Soundwave Beat Bars radiating outward (Visualizer) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {barAngles.map((angle, idx) => {
                  const barHeight = visualizerHeights[idx] || 8

                  return (
                    <div
                      key={idx}
                      className="absolute origin-bottom transition-all duration-75"
                      style={{
                        transform: `rotate(${angle}deg) translateY(-126px)`,
                      }}
                    >
                      <div
                        className="w-1 rounded-full transition-all duration-75"
                        style={{
                          height: `${barHeight}px`,
                          backgroundColor: isPlaying
                            ? idx % 2 === 0
                              ? dynamicTheme.primary
                              : dynamicTheme.secondary
                            : 'rgba(255, 255, 255, 0.2)',
                          boxShadow: isPlaying ? `0 0 10px ${dynamicTheme.primary}80` : undefined,
                        }}
                      />
                    </div>
                  )
                })}
              </div>

              {/* Central Album Artwork with pulsing bass breathing */}
              <div
                className="w-52 h-52 sm:w-56 sm:h-56 rounded-full overflow-hidden p-2.5 border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative group transition-transform duration-75"
                style={{
                  transform: isPlaying ? `scale(${1 + kickPulse * 0.045})` : 'scale(1)',
                  boxShadow: isPlaying ? `0 0 ${35 + kickPulse * 30}px ${dynamicTheme.accentGlow}` : undefined,
                }}
              >
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full rounded-full object-cover transition-transform duration-700"
                />
                <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-white/15 pointer-events-none" />
              </div>
            </div>

            {/* Track Title, Artist & Like Heart Button */}
            <div className="relative flex flex-col items-center justify-center text-center w-full max-w-xs mt-6 px-10">
              <h2 className="text-xl sm:text-2xl font-black text-white truncate w-full font-heading tracking-tight text-center">
                {currentTrack.title}
              </h2>
              <p className="text-sm font-semibold text-[#94A3B8] truncate w-full mt-1 text-center">
                {currentTrack.artist}
              </p>

              <button
                onClick={() => toggleLike(currentTrack.id)}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg active:scale-90 transition-transform flex-shrink-0"
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
      <div className="flex flex-col gap-5 z-10 pb-2">
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
  )
}
