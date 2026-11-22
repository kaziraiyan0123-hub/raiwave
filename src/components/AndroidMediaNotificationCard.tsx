import React from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ChevronDown,
  ChevronUp,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

export const AndroidMediaNotificationCard: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    nextTrack,
    prevTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    isLiked,
    toggleLike,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isNotificationOpen,
    toggleNotification,
    isNotificationExpanded,
    toggleNotificationExpanded,
  } = usePlayer()

  if (!currentTrack || !isNotificationOpen) return null

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const liked = isLiked(currentTrack.id)
  const accentColor = currentTrack.color || '#8B5CF6'

  return (
    <div
      id="android-media-notification-card"
      data-testid="android-media-notification-card"
      className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] max-w-[430px] select-none transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-4"
    >
      {/* Outer Floating Glass Card with Dynamic Artwork Ambient Wash */}
      <div
        className={`relative overflow-hidden border border-white/10 backdrop-blur-3xl transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_40px_rgba(139,92,246,0.18)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_50px_rgba(139,92,246,0.25)] hover:-translate-y-0.5 ${
          isNotificationExpanded ? 'rounded-[32px] p-5' : 'rounded-[28px] p-3.5 sm:p-4'
        }`}
        style={{
          background: `radial-gradient(ellipse at 25% 20%, ${accentColor}28 0%, rgba(18, 14, 30, 0.88) 100%)`,
        }}
      >
        {/* Dynamic Subtle Ambient Tint from Track Artwork */}
        <div
          className="absolute -top-14 -right-14 w-48 h-48 rounded-full opacity-25 blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute -bottom-14 -left-14 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />

        {/* =========================================================================
            COMPACT VIEW (Matches Reference Image Top)
           ========================================================================= */}
        {!isNotificationExpanded ? (
          <div className="flex items-center justify-between gap-3.5 relative z-10">
            {/* Left: Album Artwork (Rounded Square) */}
            <div className="relative w-14 h-14 sm:w-15 sm:h-15 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border border-white/10 group">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                key={currentTrack.id}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 animate-in fade-in duration-300"
              />
            </div>

            {/* Center: Indicator, Title & Artist */}
            <div className="flex-1 min-w-0 pr-1">
              {/* Music / Device Indicator */}
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-white/80 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                <span className="text-[12px] font-medium text-white/70 tracking-wide truncate">
                  This device
                </span>
              </div>

              {/* Song Title */}
              <h4 className="text-sm sm:text-base font-extrabold tracking-tight truncate font-heading text-white leading-tight">
                {currentTrack.title}
              </h4>

              {/* Artist Name */}
              <p className="text-xs font-medium text-[#94A3B8] truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>

            {/* Right: Solid Circular Play/Pause & Expand Arrow */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Solid White Circular Play / Pause Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePlay()
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-[#0B0D13] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.35)] flex-shrink-0 cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Expand Chevron Down (v) */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNotificationExpanded()
                }}
                className="p-1.5 rounded-full text-white/70 hover:text-white transition-colors active:scale-95 cursor-pointer"
                title="Expand notification"
              >
                <ChevronDown className="w-5 h-5" />
              </button>

              {/* Subtle Dismiss (X) */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNotification()
                }}
                className="p-1.5 rounded-full text-white/40 hover:text-white/80 transition-colors active:scale-95 cursor-pointer"
                title="Dismiss floating card"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
              EXPANDED VIEW (Matches Reference Image Bottom)
             ========================================================================= */
          <div className="flex flex-col gap-4 relative z-10 animate-in fade-in duration-200">
            {/* Top Row: Large Artwork + Info + Collapse Arrow */}
            <div className="flex items-start gap-4">
              {/* Left: Large Album Artwork (~96-104px) */}
              <div className="relative w-24 h-24 sm:w-26 sm:h-26 flex-shrink-0 rounded-2xl overflow-hidden shadow-xl border border-white/10 group">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  key={currentTrack.id}
                  className="w-full h-full object-cover transition-all duration-500 animate-in fade-in duration-300"
                />
              </div>

              {/* Right: Destination, Title, Artist & Header Collapse */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-24 sm:h-26">
                {/* Header: Device Indicator + Collapse Arrow (^) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-white/80 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                    <span className="text-xs font-medium text-white/70 tracking-wide truncate">
                      This device
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Collapse Chevron Up (^) */}
                    <button
                      onClick={toggleNotificationExpanded}
                      className="p-1.5 rounded-full text-white/70 hover:text-white transition-colors active:scale-95 cursor-pointer"
                      title="Collapse notification"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>

                    {/* Subtle Dismiss (X) */}
                    <button
                      onClick={toggleNotification}
                      className="p-1.5 rounded-full text-white/40 hover:text-white/80 transition-colors active:scale-95 cursor-pointer"
                      title="Dismiss floating card"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Song Title & Artist */}
                <div className="my-auto pr-1">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight truncate font-heading text-white leading-tight">
                    {currentTrack.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-[#94A3B8] truncate mt-0.5">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Row: Playback Progress Scrubber & Time Labels */}
            <div className="space-y-1.5 px-0.5 pt-1">
              <div className="relative flex items-center group cursor-pointer h-3">
                {/* Background Unplayed Track */}
                <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/15 overflow-hidden">
                  {/* Played Portion with Purple Gradient */}
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      width: `${progressPercent}%`,
                      background: `linear-gradient(90deg, #A78BFA 0%, ${accentColor} 100%)`,
                    }}
                  />
                </div>

                {/* Interactive Native Range Input for Smooth Drag/Seeking */}
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={1}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {/* Scrubber Circular White Thumb Indicator */}
                <div
                  className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md border border-black/10 pointer-events-none -translate-x-1/2 transition-transform duration-75 group-hover:scale-125"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>

              {/* Time Indicators: e.g. 1:24 on left, 3:42 on right */}
              <div className="flex items-center justify-between text-[11px] font-mono font-medium text-white/60">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Primary Controls Row: Shuffle, Prev, Center Play/Pause, Next, Repeat */}
            <div className="flex items-center justify-between px-2 pt-1">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-all active:scale-90 cursor-pointer ${
                  isShuffle ? 'text-[#8B5CF6] font-bold' : 'text-white/60 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              {/* Previous Track */}
              <button
                onClick={prevTrack}
                className="p-2 rounded-full text-white/80 hover:text-white transition-all active:scale-90 cursor-pointer"
                title="Previous track"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              {/* Center Play / Pause Translucent Circle Button */}
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
                style={{
                  boxShadow: `0 0 25px ${accentColor}35`,
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                )}
              </button>

              {/* Next Track */}
              <button
                onClick={nextTrack}
                className="p-2 rounded-full text-white/80 hover:text-white transition-all active:scale-90 cursor-pointer"
                title="Next track"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-all active:scale-90 cursor-pointer ${
                  repeatMode !== 'off' ? 'text-[#8B5CF6] font-bold' : 'text-white/60 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5 text-[#8B5CF6]" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Bottom Row: Hairline Divider + Favorite Heart + Volume Slider */}
            <div className="flex items-center justify-between px-2 pt-3 border-t border-white/10">
              {/* Favorite / Like Heart Button */}
              <button
                onClick={() => toggleLike(currentTrack.id)}
                className={`p-1.5 rounded-full transition-all active:scale-90 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  liked ? 'text-[#8B5CF6]' : 'text-white/60 hover:text-white'
                }`}
                title={liked ? 'Unlike track' : 'Add to favorites'}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-[#8B5CF6] text-[#8B5CF6]' : ''}`} />
              </button>

              {/* Volume Speaker Icon & Mini Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-1 rounded-full text-white/60 hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <div className="relative flex items-center w-24 sm:w-28 group">
                  <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-[#8B5CF6] rounded-full"
                      style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Volume slider"
                  />
                  {/* Volume Thumb */}
                  <div
                    className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md border border-black/10 pointer-events-none -translate-x-1/2 transition-transform group-hover:scale-110"
                    style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
