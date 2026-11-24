import React, { useState } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  Mic2,
  ListMusic,
  Maximize2,
  Minimize2,
  Tv,
  ArrowDownToLine,
  CheckCircle2,
  Activity,
} from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { EqualizerBars } from './EqualizerBars'

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    isLiked,
    currentView,
    navigateTo,
    openArtist,
    isVideoOpen,
    toggleVideoOpen,
    saveOffline,
    isOffline,
    dynamicTheme,
    isQueuePanelOpen,
    toggleQueuePanel,
    isDedicatedVisualizerOpen,
    openDedicatedVisualizer,
    closeDedicatedVisualizer,
  } = usePlayer()

  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!currentTrack) return null

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const liked = isLiked(currentTrack.id)

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    seek(val)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
      setIsFullscreen(false)
    }
  }

  const effectiveVolume = isMuted ? 0 : volume

  return (
    <footer
      className="hidden md:flex h-24 backdrop-blur-2xl px-6 items-center justify-between select-none z-40 relative border-t"
      style={{
        background: `linear-gradient(180deg, ${dynamicTheme.surfaceSubtle} 0%, rgba(14, 16, 23, 0.96) 100%)`,
        borderTopColor: dynamicTheme.borderColor,
        boxShadow: `0 -12px 40px rgba(0,0,0,0.85), 0 -2px 25px ${dynamicTheme.surfaceGlow}`,
        transition: 'background 800ms ease, border-color 800ms ease, box-shadow 800ms ease',
      }}
    >
      {/* 1. Left Section: Track Info, Equalizer & Like */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
        <div
          onClick={() => navigateTo('lyrics')}
          className="relative group cursor-pointer flex-shrink-0"
        >
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-14 h-14 rounded-xl object-cover transition-all duration-500 group-hover:scale-105 border border-white/10"
            style={{
              boxShadow: isPlaying
                ? `0 4px 24px ${dynamicTheme.accentGlow}`
                : '0 4px 12px rgba(0,0,0,0.5)',
              transition: 'box-shadow 800ms ease',
            }}
          />
          <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Mic2 className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex flex-col min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('lyrics')}
              className="text-sm font-bold text-white hover:text-white/80 truncate text-left font-heading transition-colors"
              title={currentTrack.title}
            >
              {currentTrack.title}
            </button>
            {isPlaying && <EqualizerBars size="sm" className="flex-shrink-0" />}
          </div>

          <div className="flex items-center gap-2 truncate mt-0.5">
            <span
              onClick={() => openArtist(currentTrack.artist)}
              className="text-xs text-[#94A3B8] hover:text-white hover:underline cursor-pointer truncate"
              title={currentTrack.artist}
            >
              {currentTrack.artist}
            </span>
            <span
              className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border flex-shrink-0 font-heading transition-colors"
              style={{
                backgroundColor: dynamicTheme.surfaceGlow,
                borderColor: dynamicTheme.borderColor,
                color: dynamicTheme.secondary,
              }}
            >
              Lossless HQ
            </span>
          </div>
        </div>

        <button
          onClick={() => toggleLike(currentTrack.id)}
          title={liked ? 'Remove from your Liked Songs' : 'Save to your Liked Songs'}
          className="text-[#94A3B8] hover:text-white transition-transform hover:scale-115 active:scale-95 ml-1 flex-shrink-0"
        >
          <Heart
            className="w-4 h-4 transition-colors"
            style={liked ? { color: dynamicTheme.primary, fill: dynamicTheme.primary } : undefined}
          />
        </button>

        <button
          onClick={() => saveOffline(currentTrack)}
          title={isOffline(currentTrack.id) ? 'Saved Offline' : 'Download song for offline mode'}
          className="text-[#94A3B8] hover:text-white transition-transform hover:scale-115 active:scale-95 ml-1 flex-shrink-0"
        >
          {isOffline(currentTrack.id) ? (
            <CheckCircle2 className="w-4 h-4" style={{ color: dynamicTheme.primary }} />
          ) : (
            <ArrowDownToLine className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 2. Center Section: Player Controls & Scrubber */}
      <div className="flex flex-col items-center max-w-xl w-2/4 px-4">
        {/* Buttons */}
        <div className="flex items-center gap-5 mb-1.5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            title={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
            className="transition-colors relative"
            style={isShuffle ? { color: dynamicTheme.primary } : { color: '#94A3B8' }}
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && (
              <span
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ backgroundColor: dynamicTheme.primary }}
              />
            )}
          </button>

          {/* Previous */}
          <button
            onClick={prevTrack}
            title="Previous"
            className="text-[#94A3B8] hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-10 h-10 rounded-full hover:scale-105 active:scale-95 text-white flex items-center justify-center transition-all border"
            style={{
              background: `linear-gradient(135deg, ${dynamicTheme.primary} 0%, ${dynamicTheme.secondary} 100%)`,
              boxShadow: isPlaying ? `0 4px 22px ${dynamicTheme.accentGlow}` : undefined,
              borderColor: dynamicTheme.borderColor,
              transition: 'all 600ms ease',
            }}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={nextTrack}
            title="Next"
            className="text-[#94A3B8] hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            title={`Repeat: ${repeatMode}`}
            className="transition-colors relative"
            style={repeatMode !== 'off' ? { color: dynamicTheme.primary } : { color: '#94A3B8' }}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                style={{ backgroundColor: dynamicTheme.primary }}
              />
            )}
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="w-full flex items-center gap-2.5 text-xs text-[#94A3B8] font-mono slider-container">
          <span className="w-9 text-right select-none text-[11px]">{formatTime(currentTime)}</span>

          <div className="relative flex-1 flex items-center h-4 group">
            <div className="absolute inset-x-0 h-1 bg-[#181B27] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-75"
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
              step={0.1}
              value={currentTime}
              onChange={handleSeekChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="w-9 text-left select-none text-[11px]">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Right Section: Features, Canvas Dock & Volume */}
      <div className="flex items-center justify-end gap-3.5 w-1/4 min-w-[200px]">
        {/* Video Canvas Dock Toggle */}
        <button
          onClick={toggleVideoOpen}
          title={isVideoOpen ? 'Hide Video Canvas' : 'Show Video Canvas'}
          className={`p-1.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${
            isVideoOpen ? 'text-red-400 bg-red-500/10' : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Tv className="w-4 h-4" />
        </button>

        {/* Lyrics Toggle */}
        <button
          onClick={() => navigateTo(currentView === 'lyrics' ? 'home' : 'lyrics')}
          title="Lyrics"
          className={`p-1.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${
            currentView === 'lyrics' ? 'text-[#A78BFA] bg-purple-500/10' : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* UP NEXT Queue Toggle */}
        <button
          onClick={toggleQueuePanel}
          title="UP NEXT Queue"
          className={`p-1.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${
            isQueuePanelOpen || currentView === 'queue'
              ? 'text-white bg-purple-500/25 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Visualizer Toggle */}
        <button
          onClick={() => (isDedicatedVisualizerOpen ? closeDedicatedVisualizer() : openDedicatedVisualizer())}
          title="Open Immersive Visualizer (6 Modes)"
          className={`p-1.5 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isDedicatedVisualizerOpen
              ? 'text-white bg-purple-500/25 border border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.4)]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 text-purple-400" />
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2 group slider-container">
          <button
            onClick={toggleMute}
            className="text-[#94A3B8] hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {effectiveVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : effectiveVolume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <div className="relative w-24 h-4 flex items-center">
            <div className="absolute inset-x-0 h-1 bg-[#181B27] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-colors"
                style={{
                  width: `${effectiveVolume * 100}%`,
                  background: `linear-gradient(90deg, ${dynamicTheme.secondary} 0%, ${dynamicTheme.primary} 100%)`,
                }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={effectiveVolume}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="text-[#94A3B8] hover:text-white transition-colors p-1"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </footer>
  )
}
