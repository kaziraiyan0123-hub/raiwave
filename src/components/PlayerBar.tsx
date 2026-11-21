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
    isVideoOpen,
    toggleVideoOpen,
    saveOffline,
    isOffline,
  } = usePlayer()

  const [isHoveringBar, setIsHoveringBar] = useState(false)
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
    <footer className="hidden md:flex h-24 bg-[#090D13]/95 backdrop-blur-2xl border-t border-white/5 px-6 items-center justify-between select-none z-40 relative shadow-[0_-10px_35px_rgba(0,0,0,0.85)]">
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
                ? `0 4px 24px ${currentTrack.color || '#B6F36B'}44`
                : '0 4px 12px rgba(0,0,0,0.5)',
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
              className="text-sm font-bold text-white hover:text-[#B6F36B] truncate text-left font-heading transition-colors"
              title={currentTrack.title}
            >
              {currentTrack.title}
            </button>
            {isPlaying && <EqualizerBars size="sm" className="flex-shrink-0" />}
          </div>

          <div className="flex items-center gap-2 truncate mt-0.5">
            <span
              onClick={() => navigateTo('search')}
              className="text-xs text-[#929DA8] hover:text-white cursor-pointer truncate"
              title={currentTrack.artist}
            >
              {currentTrack.artist}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-[#B6F36B]/15 text-[#B6F36B] border border-[#B6F36B]/30 flex-shrink-0 font-heading">
              Lossless HQ
            </span>
          </div>
        </div>

        <button
          onClick={() => toggleLike(currentTrack.id)}
          title={liked ? 'Remove from your Liked Songs' : 'Save to your Liked Songs'}
          className="text-[#929DA8] hover:text-white transition-transform hover:scale-115 active:scale-95 ml-1 flex-shrink-0"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              liked ? 'text-[#B6F36B] fill-[#B6F36B]' : 'text-[#929DA8] hover:text-white'
            }`}
          />
        </button>

        <button
          onClick={() => saveOffline(currentTrack)}
          title={isOffline(currentTrack.id) ? 'Saved Offline' : 'Download song for offline mode'}
          className="text-[#929DA8] hover:text-[#B6F36B] transition-transform hover:scale-115 active:scale-95 ml-1 flex-shrink-0"
        >
          {isOffline(currentTrack.id) ? (
            <CheckCircle2 className="w-4 h-4 text-[#B6F36B]" />
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
            className={`transition-colors relative ${
              isShuffle ? 'text-[#B6F36B]' : 'text-[#929DA8] hover:text-white'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#B6F36B]" />
            )}
          </button>

          {/* Previous */}
          <button
            onClick={prevTrack}
            title="Previous"
            className="text-[#929DA8] hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            className="w-10 h-10 rounded-full bg-[#B6F36B] hover:scale-105 active:scale-95 text-[#090D13] flex items-center justify-center transition-all shadow-[0_0_20px_rgba(182,243,107,0.35)]"
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
            className="text-[#929DA8] hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            title={`Repeat: ${repeatMode}`}
            className={`transition-colors relative ${
              repeatMode !== 'off' ? 'text-[#B6F36B]' : 'text-[#929DA8] hover:text-white'
            }`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#B6F36B]" />
            )}
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div
          className="w-full flex items-center gap-2.5 text-xs text-[#929DA8] font-mono slider-container"
          onMouseEnter={() => setIsHoveringBar(true)}
          onMouseLeave={() => setIsHoveringBar(false)}
        >
          <span className="w-9 text-right select-none text-[11px]">{formatTime(currentTime)}</span>

          <div className="relative flex-1 flex items-center h-4 group">
            <div className="absolute inset-x-0 h-1 bg-[#202A34] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-colors ${
                  isHoveringBar ? 'bg-[#B6F36B]' : 'bg-white'
                }`}
                style={{ width: `${progressPercent}%` }}
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
            isVideoOpen ? 'text-red-400 bg-red-500/10' : 'text-[#929DA8] hover:text-white'
          }`}
        >
          <Tv className="w-4 h-4" />
        </button>

        {/* Lyrics Toggle */}
        <button
          onClick={() => navigateTo(currentView === 'lyrics' ? 'home' : 'lyrics')}
          title="Lyrics"
          className={`p-1.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${
            currentView === 'lyrics' ? 'text-[#B6F36B] bg-[#B6F36B]/10' : 'text-[#929DA8] hover:text-white'
          }`}
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Queue Toggle */}
        <button
          onClick={() => navigateTo(currentView === 'queue' ? 'home' : 'queue')}
          title="Queue"
          className={`p-1.5 rounded-xl transition-all hover:scale-105 active:scale-95 ${
            currentView === 'queue' ? 'text-[#B6F36B] bg-[#B6F36B]/10' : 'text-[#929DA8] hover:text-white'
          }`}
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2 group slider-container">
          <button
            onClick={toggleMute}
            className="text-[#929DA8] hover:text-white transition-colors"
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
            <div className="absolute inset-x-0 h-1 bg-[#202A34] rounded-full overflow-hidden">
              <div
                className="h-full bg-white group-hover:bg-[#B6F36B] rounded-full transition-colors"
                style={{ width: `${effectiveVolume * 100}%` }}
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
          className="text-[#929DA8] hover:text-white transition-colors p-1"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </footer>
  )
}
