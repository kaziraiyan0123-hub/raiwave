import React, { useState, useEffect, useRef } from 'react'
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
  Mic2,
  ListMusic,
  Speaker,
  Headphones,
  Laptop,
  Cast,
  Check,
  ExternalLink,
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
    currentView,
    navigateTo,
    showToast,
    liveLyrics,
    queue,
    queueIndex,
    dynamicTheme,
  } = usePlayer()

  // Audio Output Selector state
  const [selectedOutput, setSelectedOutput] = useState<string>('This device')
  const [isOutputMenuOpen, setIsOutputMenuOpen] = useState<boolean>(false)
  const [showLyricsPeek, setShowLyricsPeek] = useState<boolean>(false)
  const [showQueuePeek, setShowQueuePeek] = useState<boolean>(false)
  const outputMenuRef = useRef<HTMLDivElement | null>(null)

  // Close output menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (outputMenuRef.current && !outputMenuRef.current.contains(e.target as Node)) {
        setIsOutputMenuOpen(false)
      }
    }
    if (isOutputMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOutputMenuOpen])

  if (!currentTrack || !isNotificationOpen) return null

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const liked = isLiked(currentTrack.id)
  const accentColor = dynamicTheme.primary

  // Find active synchronized lyric line if available
  const activeLyric = liveLyrics?.length
    ? [...liveLyrics].reverse().find((l) => currentTime >= l.time)?.text
    : null

  const audioOutputs = [
    { id: 'default', name: 'This device', icon: Laptop, desc: 'Built-in Speaker' },
    { id: 'bt_headset', name: 'Bluetooth Headphones', icon: Headphones, desc: 'Wireless Audio' },
    { id: 'studio_spk', name: 'Studio Speakers', icon: Speaker, desc: 'High-Fidelity Output' },
    { id: 'airplay_cast', name: 'AirPlay / Cast Device', icon: Cast, desc: 'Network Receiver' },
  ]

  const handleSelectOutput = (name: string) => {
    setSelectedOutput(name)
    setIsOutputMenuOpen(false)
    showToast(`🔊 Switched audio output to ${name}`)
  }

  return (
    <div
      id="android-media-notification-card"
      data-testid="android-media-notification-card"
      className={`fixed z-50 select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isNotificationExpanded
          ? 'top-4 right-4 sm:top-5 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] max-w-[460px]'
          : 'top-4 right-4 sm:top-5 sm:right-6 w-[calc(100vw-2rem)] sm:w-[410px] max-w-[430px]'
      }`}
    >
      {/* Outer Floating Glass Card with Dynamic Artwork Ambient Wash */}
      <div
        className={`relative overflow-hidden border border-white/12 backdrop-blur-3xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.85),0_0_45px_rgba(139,92,246,0.22)] hover:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.9),0_0_55px_rgba(139,92,246,0.3)] ${
          isNotificationExpanded ? 'rounded-[36px] p-6 sm:p-7' : 'rounded-[28px] p-3.5 sm:p-4'
        }`}
        style={{
          background: isNotificationExpanded
            ? `radial-gradient(ellipse at 50% 12%, ${dynamicTheme.accentGlow} 0%, rgba(15, 12, 24, 0.94) 80%, rgba(10, 8, 16, 0.98) 100%)`
            : `radial-gradient(ellipse at 25% 20%, ${dynamicTheme.surfaceGlow} 0%, rgba(18, 14, 30, 0.88) 100%)`,
          borderColor: dynamicTheme.borderColor,
          transition: 'background 800ms ease, border-color 800ms ease, box-shadow 800ms ease',
        }}
      >
        {/* Dynamic Ambient Background Glow */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-30 blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />

        {/* =========================================================================
            COMPACT NOTIFICATION VIEW
           ========================================================================= */}
        {!isNotificationExpanded ? (
          <div className="flex items-center justify-between gap-3.5 relative z-10 animate-in fade-in duration-300">
            {/* Left: Album Artwork (Rounded Square) */}
            <div
              onClick={toggleNotificationExpanded}
              className="relative w-14 h-14 sm:w-15 sm:h-15 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg border border-white/10 group cursor-pointer"
              title="Click to expand full player"
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                key={currentTrack.id}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Center: Device Indicator, Title & Artist */}
            <div
              onClick={toggleNotificationExpanded}
              className="flex-1 min-w-0 pr-1 cursor-pointer"
              title="Click to expand full player"
            >
              {/* Music / Device Indicator */}
              <div className="flex items-center gap-1.5 mb-1">
                <svg className="w-3.5 h-3.5 text-white/80 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                <span className="text-[12px] font-medium text-white/70 tracking-wide truncate">
                  {selectedOutput}
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
                title="Expand full player"
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
                title="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
              EXPANDED PREMIUM MUSIC PLAYER VIEW (Matching Diagram & Requirements)
             ========================================================================= */
          <div className="flex flex-col relative z-10 animate-in fade-in duration-300">
            {/* Top Header: Audio Output Selector + Controls */}
            <div className="flex items-center justify-between pb-3 relative">
              {/* Audio Output Selector Pill */}
              <div className="relative" ref={outputMenuRef}>
                <button
                  onClick={() => setIsOutputMenuOpen(!isOutputMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white/90 text-xs font-medium transition-all active:scale-95 cursor-pointer group"
                  title="Select Audio Output Device"
                >
                  <svg className="w-3.5 h-3.5 text-[#A78BFA]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  <span className="truncate max-w-[150px]">{selectedOutput}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-transform duration-200" />
                </button>

                {/* Audio Output Dropdown Menu */}
                {isOutputMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-[#161224]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1.5 text-[11px] font-semibold tracking-wider text-white/50 uppercase">
                      Select Audio Output
                    </div>
                    {audioOutputs.map((item) => {
                      const Icon = item.icon
                      const isSelected = selectedOutput === item.name
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectOutput(item.name)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600/25 text-white border border-purple-500/30'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-[#A78BFA]' : 'text-white/50'}`} />
                            <div className="text-left">
                              <div className="font-semibold">{item.name}</div>
                              <div className="text-[10px] text-white/50">{item.desc}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#A78BFA]" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Right Action Icons: Collapse Arrow & Close */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleNotificationExpanded}
                  className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
                  title="Collapse to compact notification"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleNotification}
                  className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
                  title="Dismiss player"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 1. Large Album Artwork (Centered, prominent, rounded-3xl with reactive glow) */}
            <div className="relative my-2 mx-auto w-full max-w-[280px] aspect-square rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/15 group">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                key={currentTrack.id}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Dynamic Overlay Glow */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                style={{
                  background: `radial-gradient(circle, ${accentColor} 0%, transparent 80%)`,
                }}
              />
            </div>

            {/* 2 & 3. Track Information: Song Title & Artist */}
            <div className="text-center mt-3 px-2">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading truncate leading-tight drop-shadow-md">
                {currentTrack.title}
              </h3>
              <p className="text-sm font-medium text-[#94A3B8] truncate mt-1">
                {currentTrack.artist}
              </p>

              {/* Synced Lyric Peek */}
              {activeLyric && (
                <div className="mt-2 text-xs italic font-medium text-[#C084FC] truncate animate-in fade-in duration-300">
                  ♪ {activeLyric}
                </div>
              )}
            </div>

            {/* 5, 6, 7. Playback Progress Scrubber & Timestamps */}
            <div className="space-y-1.5 px-1 pt-4">
              <div className="relative flex items-center group cursor-pointer h-4">
                {/* Background Track */}
                <div className="absolute inset-x-0 h-1.5 sm:h-2 rounded-full bg-white/15 overflow-hidden">
                  {/* Played Fill with Purple Gradient */}
                  <div
                    className="h-full rounded-full transition-all duration-75"
                    style={{
                      width: `${progressPercent}%`,
                      background: `linear-gradient(90deg, ${dynamicTheme.secondary} 0%, ${dynamicTheme.primary} 100%)`,
                    }}
                  />
                </div>

                {/* Native Range Input for Smooth Drag & Seek */}
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={1}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  title="Seek progress"
                />

                {/* Crisp White Circular Thumb Knob */}
                <div
                  className="absolute w-4 h-4 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.5)] border border-black/10 pointer-events-none -translate-x-1/2 transition-transform duration-75 group-hover:scale-125"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>

              {/* Time Indicators (1:24 on left, 3:42 on right) */}
              <div className="flex items-center justify-between text-xs font-mono font-medium text-white/60 px-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* 8, 9, 10, 11, 12. Primary Playback Controls Row */}
            <div className="flex items-center justify-between px-3 pt-3">
              {/* 11. Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`p-2.5 rounded-full transition-all active:scale-90 cursor-pointer ${
                  isShuffle
                    ? 'text-[#A78BFA] bg-purple-500/15 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                title={isShuffle ? 'Shuffle is ON' : 'Shuffle is OFF'}
              >
                <Shuffle className="w-5 h-5" />
              </button>

              {/* 8. Previous Track */}
              <button
                onClick={prevTrack}
                className="p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-all active:scale-90 cursor-pointer"
                title="Previous track"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              {/* 9. Center Play / Pause Translucent Glass Button with Purple Ambient Glow */}
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white/12 hover:bg-white/22 border border-white/25 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xl cursor-pointer"
                style={{
                  boxShadow: `0 0 35px ${accentColor}45`,
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current ml-1" />
                )}
              </button>

              {/* 10. Next Track */}
              <button
                onClick={nextTrack}
                className="p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-all active:scale-90 cursor-pointer"
                title="Next track"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>

              {/* 12. Repeat */}
              <button
                onClick={toggleRepeat}
                className={`p-2.5 rounded-full transition-all active:scale-90 cursor-pointer ${
                  repeatMode !== 'off'
                    ? 'text-[#A78BFA] bg-purple-500/15 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5 text-[#A78BFA]" />
                ) : (
                  <Repeat className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* 4, 13, 15, 16. Bottom Action Deck: Favorite + Shortcuts + Volume */}
            <div className="flex items-center justify-between px-1 pt-4 mt-3 border-t border-white/10">
              {/* Left Group: Favorite + Lyrics Shortcut + Queue Shortcut */}
              <div className="flex items-center gap-1.5">
                {/* 4. Favorite Button */}
                <button
                  onClick={() => toggleLike(currentTrack.id)}
                  className={`p-2 rounded-full transition-all active:scale-90 cursor-pointer ${
                    liked
                      ? 'text-[#EC4899] bg-pink-500/15 shadow-[0_0_12px_rgba(236,72,153,0.35)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title={liked ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-[#EC4899]' : ''}`} />
                </button>

                {/* 15. Lyrics Shortcut */}
                <button
                  onClick={() => {
                    setShowLyricsPeek(!showLyricsPeek)
                    setShowQueuePeek(false)
                  }}
                  className={`p-2 rounded-full transition-all active:scale-90 cursor-pointer ${
                    showLyricsPeek || currentView === 'lyrics'
                      ? 'text-[#A78BFA] bg-purple-500/15'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title="Lyrics Shortcut"
                >
                  <Mic2 className="w-5 h-5" />
                </button>

                {/* 16. Queue Shortcut */}
                <button
                  onClick={() => {
                    setShowQueuePeek(!showQueuePeek)
                    setShowLyricsPeek(false)
                  }}
                  className={`p-2 rounded-full transition-all active:scale-90 cursor-pointer ${
                    showQueuePeek || currentView === 'queue'
                      ? 'text-[#A78BFA] bg-purple-500/15'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  title="Queue Shortcut"
                >
                  <ListMusic className="w-5 h-5" />
                </button>
              </div>

              {/* 13. Volume Control (Speaker + Slider) */}
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
                <div className="relative flex items-center w-20 sm:w-24 group">
                  <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(isMuted ? 0 : volume) * 100}%`,
                        background: `linear-gradient(90deg, ${dynamicTheme.secondary} 0%, ${dynamicTheme.primary} 100%)`,
                      }}
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
                  {/* Volume Thumb Knob */}
                  <div
                    className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md border border-black/10 pointer-events-none -translate-x-1/2 transition-transform group-hover:scale-110"
                    style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Inline Lyrics Peek Drawer (When Lyrics shortcut clicked) */}
            {showLyricsPeek && (
              <div className="mt-3 p-3 bg-black/40 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A78BFA]">
                    <Mic2 className="w-3.5 h-3.5" />
                    <span>Live Synced Lyrics</span>
                  </div>
                  <button
                    onClick={() => {
                      navigateTo('lyrics')
                      setShowLyricsPeek(false)
                    }}
                    className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white cursor-pointer"
                  >
                    <span>Full View</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1.5 text-xs text-center pr-1 custom-scrollbar">
                  {liveLyrics?.length ? (
                    liveLyrics.map((line, idx) => {
                      const isCurrent =
                        currentTime >= line.time &&
                        (idx === liveLyrics.length - 1 || currentTime < liveLyrics[idx + 1].time)
                      return (
                        <div
                          key={idx}
                          className={`transition-all duration-200 ${
                            isCurrent
                              ? 'text-white font-bold text-sm scale-102 text-[#C084FC]'
                              : 'text-white/40'
                          }`}
                        >
                          {line.text}
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-white/40 italic py-2">
                      Lyrics are syncing with audio stream...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Inline Queue Peek Drawer (When Queue shortcut clicked) */}
            {showQueuePeek && (
              <div className="mt-3 p-3 bg-black/40 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#A78BFA]">
                    <ListMusic className="w-3.5 h-3.5" />
                    <span>Up Next in Queue</span>
                  </div>
                  <button
                    onClick={() => {
                      navigateTo('queue')
                      setShowQueuePeek(false)
                    }}
                    className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white cursor-pointer"
                  >
                    <span>Full Queue</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1.5 text-xs pr-1 custom-scrollbar">
                  {queue.slice(queueIndex + 1, queueIndex + 5).map((qTrack, idx) => (
                    <div
                      key={qTrack.id + idx}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={qTrack.coverUrl}
                          alt={qTrack.title}
                          className="w-7 h-7 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate">{qTrack.title}</div>
                          <div className="text-[10px] text-white/50 truncate">{qTrack.artist}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-white/40 ml-2">
                        {formatTime(qTrack.duration)}
                      </span>
                    </div>
                  ))}
                  {queue.length <= queueIndex + 1 && (
                    <div className="text-white/40 italic text-center py-2">
                      No more upcoming songs in queue.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
