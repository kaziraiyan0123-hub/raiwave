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
  Sun,
  Moon,
  Radio,
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
    notificationTheme,
    toggleNotificationTheme,
  } = usePlayer()

  if (!currentTrack || !isNotificationOpen) return null

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const liked = isLiked(currentTrack.id)
  const isDark = notificationTheme === 'dark'
  const accentColor = currentTrack.color || '#B6F36B'

  return (
    <div
      id="android-media-notification-card"
      data-testid="android-media-notification-card"
      className="fixed top-16 right-3 sm:top-20 sm:right-6 z-40 w-[calc(100vw-1.5rem)] sm:w-[410px] max-w-[430px] select-none transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-4"
    >
      {/* Outer Card with Dynamic Theme & Frosted Blur */}
      <div
        className={`relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-2xl ${
          isDark
            ? 'bg-[#121620]/85 backdrop-blur-2xl border-white/10 text-white shadow-[0_25px_60px_rgba(0,0,0,0.7)]'
            : 'bg-[#FFFFFF]/90 backdrop-blur-2xl border-black/10 text-[#0F172A] shadow-[0_20px_45px_rgba(0,0,0,0.18)]'
        } ${isNotificationExpanded ? 'p-5' : 'p-3.5'}`}
      >
        {/* Dynamic Subtle Ambient Tint from Track Artwork */}
        <div
          className="absolute -top-14 -right-14 w-44 h-44 rounded-full opacity-25 blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute -bottom-14 -left-14 w-44 h-44 rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />

        {/* ---------------- COMPACT VIEW (Exact Match to Reference Image Top) ---------------- */}
        {!isNotificationExpanded ? (
          <div className="flex items-center justify-between gap-3 relative z-10">
            {/* Left: Album Artwork (~58x58px) with smooth artwork transition */}
            <div className="relative w-14 h-14 flex-shrink-0 rounded-2xl overflow-hidden shadow-md border border-black/10 dark:border-white/10 group">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                key={currentTrack.id}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 animate-in fade-in duration-300"
              />
            </div>

            {/* Center: Destination & Song Info */}
            <div className="flex-1 min-w-0 pr-1">
              {/* Audio Destination / Device */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-[#B6F36B] animate-pulse" />
                <Radio className="w-3 h-3 text-[#52D6C9]" />
                <span
                  className={`text-[11px] font-semibold tracking-wide truncate ${
                    isDark ? 'text-white/70' : 'text-neutral-500'
                  }`}
                >
                  This device
                </span>
              </div>

              {/* Prominent Song Title */}
              <h4 className="text-sm font-extrabold tracking-tight truncate font-heading leading-tight">
                {currentTrack.title}
              </h4>

              {/* Artist Name */}
              <p
                className={`text-xs font-medium truncate mt-0.5 ${
                  isDark ? 'text-white/60' : 'text-neutral-500'
                }`}
              >
                {currentTrack.artist}
              </p>
            </div>

            {/* Right: Solid Circular Play/Pause & Expand Arrow */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Play / Pause Circular Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePlay()
                }}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md ${
                  isDark
                    ? 'bg-white text-[#090D13] hover:bg-neutral-100 shadow-white/10'
                    : 'bg-[#090D13] text-white hover:bg-neutral-800 shadow-black/20'
                }`}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Expand Chevron Arrow (v) */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNotificationExpanded()
                }}
                className={`p-1.5 rounded-full transition-colors active:scale-95 ${
                  isDark
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5'
                }`}
                title="Expand notification"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* ---------------- EXPANDED VIEW (Exact Match to Reference Image Bottom) ---------------- */
          <div className="flex flex-col gap-4 relative z-10 animate-in fade-in duration-200">
            {/* Top Row: Large Artwork + Info + Expand/Collapse & Theme Header */}
            <div className="flex items-start gap-4">
              {/* Left: Large Artwork (~100-112px) */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border border-black/10 dark:border-white/10">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  key={currentTrack.id}
                  className="w-full h-full object-cover transition-all duration-500 animate-in fade-in duration-300"
                />
              </div>

              {/* Right: Destination, Title, Artist & Header Controls */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-24 sm:h-28">
                {/* Header Row: Device Label + Theme Toggle + Collapse Chevron (^) + Close (x) */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B6F36B] animate-pulse" />
                    <Radio className="w-3.5 h-3.5 text-[#52D6C9]" />
                    <span
                      className={`text-xs font-semibold tracking-wide truncate ${
                        isDark ? 'text-white/70' : 'text-neutral-500'
                      }`}
                    >
                      This device
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Theme Toggle (Light / Dark) */}
                    <button
                      onClick={toggleNotificationTheme}
                      className={`p-1.5 rounded-full transition-colors ${
                        isDark
                          ? 'text-white/60 hover:text-white hover:bg-white/10'
                          : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5'
                      }`}
                      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                      {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                    </button>

                    {/* Collapse Chevron Arrow (^) */}
                    <button
                      onClick={toggleNotificationExpanded}
                      className={`p-1.5 rounded-full transition-colors active:scale-95 ${
                        isDark
                          ? 'text-white/70 hover:text-white hover:bg-white/10'
                          : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5'
                      }`}
                      title="Collapse notification"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>

                    {/* Close (X) button */}
                    <button
                      onClick={toggleNotification}
                      className={`p-1.5 rounded-full transition-colors active:scale-95 ${
                        isDark
                          ? 'text-white/60 hover:text-white hover:bg-white/10'
                          : 'text-neutral-400 hover:text-neutral-900 hover:bg-black/5'
                      }`}
                      title="Dismiss notification"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Song Title & Artist */}
                <div className="my-auto pr-1">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight truncate font-heading leading-tight">
                    {currentTrack.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm font-medium truncate mt-0.5 ${
                      isDark ? 'text-white/70' : 'text-neutral-600'
                    }`}
                  >
                    {currentTrack.artist}
                  </p>
                </div>
              </div>
            </div>

            {/* Playback Progress Slider & Time Labels */}
            <div className="space-y-1.5 px-1 pt-1">
              <div className="relative flex items-center group cursor-pointer h-3">
                {/* Background Track */}
                <div
                  className={`absolute inset-x-0 h-1.5 rounded-full overflow-hidden transition-colors ${
                    isDark ? 'bg-white/15' : 'bg-black/10'
                  }`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      width: `${progressPercent}%`,
                      background: `linear-gradient(90deg, #52D6C9, ${accentColor})`,
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

                {/* Scrub Thumb Indicator */}
                <div
                  className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md border border-black/10 pointer-events-none -translate-x-1/2 transition-transform duration-75 group-hover:scale-125"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>

              {/* Time Indicators: 1:24 on left, 3:42 on right */}
              <div
                className={`flex items-center justify-between text-[11px] font-mono font-medium ${
                  isDark ? 'text-white/50' : 'text-neutral-500'
                }`}
              >
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Primary Controls Row: Shuffle, Prev, Play/Pause, Next, Repeat */}
            <div className="flex items-center justify-between px-3 pt-1">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-all active:scale-90 ${
                  isShuffle
                    ? 'text-[#B6F36B] font-bold'
                    : isDark
                    ? 'text-white/60 hover:text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              {/* Previous Track */}
              <button
                onClick={prevTrack}
                className={`p-2 rounded-full transition-all active:scale-90 ${
                  isDark ? 'text-white hover:text-[#B6F36B]' : 'text-neutral-800 hover:text-black'
                }`}
                title="Previous track"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              {/* Play / Pause Circular Center Button */}
              <button
                onClick={togglePlay}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20 border border-white/25 text-white'
                    : 'bg-black/10 hover:bg-black/15 border border-black/15 text-neutral-900'
                }`}
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
                className={`p-2 rounded-full transition-all active:scale-90 ${
                  isDark ? 'text-white hover:text-[#B6F36B]' : 'text-neutral-800 hover:text-black'
                }`}
                title="Next track"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-all active:scale-90 ${
                  repeatMode !== 'off'
                    ? 'text-[#B6F36B] font-bold'
                    : isDark
                    ? 'text-white/60 hover:text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5 text-[#B6F36B]" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Bottom Row: Favorite Heart & Volume Slider */}
            <div
              className={`flex items-center justify-between px-2 pt-2.5 border-t transition-colors ${
                isDark ? 'border-white/10' : 'border-black/10'
              }`}
            >
              {/* Favorite / Like Heart Button */}
              <button
                onClick={() => toggleLike(currentTrack.id)}
                className={`p-1.5 rounded-full transition-all active:scale-90 flex items-center gap-1.5 text-xs font-semibold ${
                  liked
                    ? 'text-[#B6F36B]'
                    : isDark
                    ? 'text-white/60 hover:text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title={liked ? 'Unlike track' : 'Add to favorites'}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-[#B6F36B] text-[#B6F36B]' : ''}`} />
              </button>

              {/* Volume Speaker Icon & Mini Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className={`p-1 rounded-full transition-colors ${
                    isDark ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <div className="relative flex items-center w-24 sm:w-28 group">
                  <div
                    className={`h-1.5 w-full rounded-full overflow-hidden ${
                      isDark ? 'bg-white/15' : 'bg-black/10'
                    }`}
                  >
                    <div
                      className="h-full bg-[#B6F36B] rounded-full"
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
