import React from 'react'
import {
  ChevronDown,
  MoreHorizontal,
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
  } = usePlayer()

  if (!currentTrack || !isMobilePlayerOpen) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const liked = isLiked(currentTrack.id)

  // Calculate arc stroke offset for circular dial (circumference = 2 * PI * r)
  // radius = 130, circumference = ~816.8
  const radius = 130
  const circumference = 2 * Math.PI * radius
  // Half-circle arc: strokeDasharray = circumference, strokeDashoffset = circumference - (progressPercent / 100) * (circumference / 2)
  const arcDashOffset = circumference - (progressPercent / 100) * (circumference * 0.5)

  return (
    <div className="fixed inset-0 z-50 bg-[#090D13] flex flex-col justify-between p-6 select-none overflow-y-auto no-scrollbar transition-transform duration-300">
      {/* Dynamic Ambient Glow Background */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full opacity-35 blur-[120px] pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: currentTrack.color || '#B6F36B' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#090D13]/70 to-[#090D13] pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10 pt-2">
        <button
          data-testid="close-full-player"
          onClick={toggleMobilePlayer}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-all"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B6F36B] font-heading">
            Playing From Frequency
          </span>
          <span className="text-xs font-semibold text-white/90 truncate max-w-[200px]">
            {currentTrack.album || 'Universal Stream'}
          </span>
        </div>

        <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-all">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Centerpiece: Album Artwork + Arc Dial (Signature TuneHive/RAIWAVE Experience from Image 1) */}
      <div className="relative flex flex-col items-center justify-center my-auto py-4 z-10">
        {/* SVG Arc Progress Dial */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            {/* Background Arc */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              fill="none"
              stroke="#202A34"
              strokeWidth="4"
              strokeDasharray={circumference * 0.5}
              strokeLinecap="round"
              className="opacity-40"
            />
            {/* Active Wave Lime Progress Arc */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              fill="none"
              stroke="#B6F36B"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={arcDashOffset}
              strokeLinecap="round"
              className="transition-all duration-300 drop-shadow-[0_0_12px_#B6F36B]"
            />
          </svg>

          {/* Central Album Artwork */}
          <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full overflow-hidden p-2 border border-white/15 shadow-2xl relative group">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className={`w-full h-full rounded-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20 pointer-events-none" />
          </div>

          {/* Heart toggle on the upper dial */}
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className="absolute top-2 w-9 h-9 rounded-full bg-[#1B232E]/90 border border-white/10 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                liked ? 'text-[#B6F36B] fill-[#B6F36B]' : 'text-[#929DA8]'
              }`}
            />
          </button>
        </div>

        {/* Track Title & Artist Info */}
        <div className="text-center mt-5 px-4 w-full max-w-sm">
          <h2 className="text-2xl font-black text-white truncate font-heading tracking-tight">
            {currentTrack.title}
          </h2>
          <p className="text-sm font-medium text-[#929DA8] truncate mt-1">
            {currentTrack.artist}
          </p>
        </div>

        {/* Time Stamp from Arc */}
        <div className="flex items-center justify-center gap-2 mt-2 font-mono text-xs text-[#B6F36B]">
          <span>{formatTime(currentTime)}</span>
          <span className="text-white/30">/</span>
          <span className="text-white/60">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Signature Soundwave Ripple Playback Controls (From Reference Image 1) */}
      <div className="flex flex-col gap-6 z-10 pb-4">
        {/* Interactive Linear Scrubber Fallback */}
        <div className="w-full flex items-center gap-3 px-2">
          <span className="text-[11px] font-mono text-[#929DA8] w-9 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 h-3 flex items-center group slider-container">
            <div className="absolute inset-x-0 h-1 bg-[#202A34] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B6F36B] transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
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
          <span className="text-[11px] font-mono text-[#929DA8] w-9">
            {formatTime(duration)}
          </span>
        </div>

        {/* Action Controls with Concentric Ripple Rings */}
        <div className="flex items-center justify-between px-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${
              isShuffle ? 'text-[#B6F36B]' : 'text-[#929DA8] hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={prevTrack}
            className="p-2 text-white hover:text-[#B6F36B] active:scale-90 transition-all"
            title="Previous"
          >
            <SkipBack className="w-7 h-7 fill-white" />
          </button>

          {/* Central Play Button with Animated Wave Ripples */}
          <div className="relative flex items-center justify-center">
            {isPlaying && (
              <>
                <div className="absolute w-20 h-20 rounded-full border border-[#B6F36B]/40 animate-ripple-1 pointer-events-none" />
                <div className="absolute w-24 h-24 rounded-full border border-[#B6F36B]/30 animate-ripple-2 pointer-events-none" />
                <div className="absolute w-28 h-28 rounded-full border border-[#52D6C9]/20 animate-ripple-3 pointer-events-none" />
              </>
            )}

            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-[#B6F36B] text-[#090D13] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_30px_rgba(182,243,107,0.5)] z-10"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-[#090D13]" />
              ) : (
                <Play className="w-7 h-7 fill-[#090D13] ml-1" />
              )}
            </button>
          </div>

          <button
            onClick={nextTrack}
            className="p-2 text-white hover:text-[#B6F36B] active:scale-90 transition-all"
            title="Next"
          >
            <SkipForward className="w-7 h-7 fill-white" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 transition-colors ${
              repeatMode !== 'off' ? 'text-[#B6F36B]' : 'text-[#929DA8] hover:text-white'
            }`}
            title="Repeat"
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Footer shortcuts: Lyrics & Queue */}
        <div className="flex items-center justify-around pt-2 border-t border-white/5 text-[#929DA8]">
          <button
            onClick={() => {
              toggleMobilePlayer()
              navigateTo('lyrics')
            }}
            className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"
          >
            <Mic2 className="w-4 h-4 text-[#B6F36B]" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => {
              toggleMobilePlayer()
              navigateTo('queue')
            }}
            className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"
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
            className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  )
}
