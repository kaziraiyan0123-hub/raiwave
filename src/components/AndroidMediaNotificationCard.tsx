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
  ListMusic,
  Speaker,
  Headphones,
  Laptop,
  Cast,
  Check,
} from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { RaiwaveLogo } from './RaiwaveLogo'

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
    showToast,
    dynamicTheme,
    queue,
    queueIndex,
    isQueuePanelOpen,
    toggleQueuePanel,
  } = usePlayer()

  // Audio Output Selector state
  const [selectedOutput, setSelectedOutput] = useState<string>('RAIWAVE Studio Audio')
  const [isOutputMenuOpen, setIsOutputMenuOpen] = useState<boolean>(false)
  const [coverError, setCoverError] = useState<boolean>(false)
  const outputMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setCoverError(false)
  }, [currentTrack?.id])

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
  const accentColor = dynamicTheme.primary || '#A78BFA'
  const secondaryColor = dynamicTheme.secondary || '#8B5CF6'

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
      className={`hidden md:block fixed z-50 select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isNotificationExpanded
          ? 'top-4 right-4 sm:top-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[480px] max-w-[500px]'
          : 'top-4 right-4 sm:top-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[410px] max-w-[430px]'
      }`}
    >
      {/* Outer Floating Glass Card with Dynamic Artwork Ambient Wash */}
      <div
        className={`relative overflow-hidden border backdrop-blur-3xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.85),0_0_45px_rgba(139,92,246,0.22)] hover:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.9),0_0_55px_rgba(139,92,246,0.3)] ${
          isNotificationExpanded
            ? 'rounded-[32px] sm:rounded-[36px] p-5 sm:p-6'
            : 'rounded-[26px] sm:rounded-[28px] p-3.5 sm:p-4'
        }`}
        style={{
          background: isNotificationExpanded
            ? `radial-gradient(ellipse at 50% 15%, ${dynamicTheme.accentGlow} 0%, rgba(22, 17, 34, 0.92) 75%, rgba(13, 10, 20, 0.98) 100%)`
            : `radial-gradient(ellipse at 30% 20%, ${dynamicTheme.surfaceGlow} 0%, rgba(24, 18, 38, 0.88) 100%)`,
          borderColor: dynamicTheme.borderColor || 'rgba(255, 255, 255, 0.12)',
          transition: 'background 800ms ease, border-color 800ms ease, box-shadow 800ms ease',
        }}
      >
        {/* Soft Ambient Dynamic Glow Orbs */}
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-25 blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />

        {/* Audio Output Dropdown Menu (Available in both modes) */}
        {isOutputMenuOpen && (
          <div
            ref={outputMenuRef}
            className="absolute top-14 left-4 sm:left-6 w-64 bg-[#161224]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-2xl z-40 animate-in fade-in zoom-in-95 duration-150"
          >
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

        {/* =========================================================================
            1. COMPACT VIEW (Exact match to Reference Image "Compact View")
           ========================================================================= */}
        {!isNotificationExpanded ? (
          <div className="flex items-center justify-between gap-3.5 relative z-10 animate-in fade-in duration-300">
            {/* Left: Album Artwork (Rounded Square) */}
            <div
              onClick={toggleNotificationExpanded}
              className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-[18px] sm:rounded-[20px] overflow-hidden shadow-lg border border-white/10 group cursor-pointer bg-[#181B27] flex items-center justify-center"
              title="Click to expand player"
            >
              {!coverError && currentTrack.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  key={currentTrack.id}
                  onError={() => setCoverError(true)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <RaiwaveLogo size="sm" showText={false} />
              )}
            </div>

            {/* Center: Spotify Indicator + Song Title + Artist */}
            <div
              onClick={toggleNotificationExpanded}
              className="flex-1 min-w-0 pr-1 cursor-pointer"
              title="Click to expand player"
            >
              {/* Music / Device Indicator */}
              <div
                className="flex items-center gap-1.5 mb-1 text-white/70 hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOutputMenuOpen(!isOutputMenuOpen)
                }}
                title="Select output device"
              >
                <RaiwaveLogo size="sm" showText={false} />
                <span className="text-[12px] font-medium tracking-wide truncate">
                  {selectedOutput}
                </span>
              </div>

              {/* Song Title */}
              <h4 className="text-[15px] sm:text-[17px] font-bold tracking-tight truncate font-heading text-white leading-tight">
                {currentTrack.title}
              </h4>

              {/* Artist Name */}
              <p className="text-xs sm:text-[13px] font-medium text-white/60 truncate mt-0.5">
                {currentTrack.artist}
              </p>
            </div>

            {/* Right: Solid White Circular Play/Pause & Chevron Down */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Solid White Circular Play/Pause Button */}
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
                className="p-1 rounded-full text-white/70 hover:text-white transition-colors active:scale-95 cursor-pointer"
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
                className="p-1 rounded-full text-white/30 hover:text-white/70 transition-colors active:scale-95 cursor-pointer -ml-1"
                title="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
              2. EXPANDED VIEW (Exact match to Reference Image "Expanded View")
             ========================================================================= */
          <div className="flex flex-col relative z-10 animate-in fade-in duration-300">
            {/* Top Row: Album Artwork (Left) + Track Info & Timeline (Right) */}
            <div className="flex items-start gap-3.5 sm:gap-4">
              {/* Album Artwork: Rounded Square */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-[20px] sm:rounded-[22px] overflow-hidden shadow-2xl border border-white/10 group bg-[#181B27] flex items-center justify-center">
                {!coverError && currentTrack.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    key={currentTrack.id}
                    onError={() => setCoverError(true)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <RaiwaveLogo size="md" showText={false} />
                )}
              </div>

              {/* Right Column: Device header + Title + Artist + Timeline Slider */}
              <div className="flex-1 flex flex-col justify-between min-w-0 h-24 sm:h-28 pr-0.5">
                {/* Header: Device Indicator + Collapse Chevron */}
                <div className="flex items-center justify-between">
                  {/* Spotify indicator / device button */}
                  <button
                    onClick={() => setIsOutputMenuOpen(!isOutputMenuOpen)}
                    className="flex items-center gap-1.5 text-white/75 hover:text-white transition-colors group cursor-pointer"
                    title="Select audio output"
                  >
                    <RaiwaveLogo size="sm" showText={false} />
                    <span className="text-[12px] sm:text-[13px] font-medium tracking-wide truncate max-w-[140px]">
                      {selectedOutput}
                    </span>
                  </button>

                  {/* Collapse Chevron Up (^) & Close */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={toggleNotificationExpanded}
                      className="p-1 rounded-full text-white/70 hover:text-white transition-colors active:scale-95 cursor-pointer"
                      title="Collapse to compact view"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={toggleNotification}
                      className="p-1 rounded-full text-white/30 hover:text-white/70 transition-colors active:scale-95 cursor-pointer -mr-1"
                      title="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Song Title & Artist */}
                <div className="min-w-0 my-0.5">
                  <h3 className="text-lg sm:text-[21px] font-bold tracking-tight text-white font-heading truncate leading-tight drop-shadow-sm">
                    {currentTrack.title}
                  </h3>
                  <p className="text-xs sm:text-[13.5px] font-medium text-white/60 truncate mt-0.5">
                    {currentTrack.artist}
                  </p>
                </div>

                {/* Progress Bar & Timestamps (Directly underneath in right column) */}
                <div className="space-y-1">
                  <div className="relative flex items-center group cursor-pointer h-3.5">
                    {/* Background Track */}
                    <div className="absolute inset-x-0 h-1 sm:h-1.5 rounded-full bg-white/20 overflow-hidden">
                      {/* Played Fill with Purple Gradient */}
                      <div
                        className="h-full rounded-full transition-all duration-75"
                        style={{
                          width: `${progressPercent}%`,
                          background: `linear-gradient(90deg, ${secondaryColor} 0%, ${accentColor} 100%)`,
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
                      title="Seek playback"
                    />

                    {/* Crisp White Circular Thumb Knob */}
                    <div
                      className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.5)] border border-black/10 pointer-events-none -translate-x-1/2 transition-transform duration-75 group-hover:scale-125"
                      style={{ left: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Timestamps (1:24 on left, 3:42 on right) */}
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono font-medium text-white/60 px-0.5">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Playback Controls (Shuffle, Prev, Play/Pause, Next, Repeat) */}
            <div className="flex items-center justify-between pt-5 pb-3 px-1 sm:px-4">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-all active:scale-90 cursor-pointer ${
                  isShuffle
                    ? 'text-[#C084FC] bg-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'text-white/70 hover:text-white'
                }`}
                title={isShuffle ? 'Shuffle is ON' : 'Shuffle is OFF'}
              >
                <Shuffle className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </button>

              {/* Previous Track */}
              <button
                onClick={prevTrack}
                className="p-2 rounded-full text-white/90 hover:text-white transition-all active:scale-90 cursor-pointer"
                title="Previous track"
              >
                <SkipBack className="w-6 h-6 sm:w-6.5 sm:h-6.5 fill-current" />
              </button>

              {/* Center Large Circular Play/Pause (Frosted Translucent Ring with Subtle Border) */}
              <button
                onClick={togglePlay}
                className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-white/10 hover:bg-white/18 border border-white/20 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_8px_25px_rgba(0,0,0,0.4)] cursor-pointer"
                style={{
                  boxShadow: `0 0 25px ${accentColor}35`,
                }}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                ) : (
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
                )}
              </button>

              {/* Next Track */}
              <button
                onClick={nextTrack}
                className="p-2 rounded-full text-white/90 hover:text-white transition-all active:scale-90 cursor-pointer"
                title="Next track"
              >
                <SkipForward className="w-6 h-6 sm:w-6.5 sm:h-6.5 fill-current" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-all active:scale-90 cursor-pointer ${
                  repeatMode !== 'off'
                    ? 'text-[#C084FC] bg-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'text-white/70 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#C084FC]" />
                ) : (
                  <Repeat className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                )}
              </button>
            </div>

            {/* Bottom Row: Favorite Heart & Up Next Queue (Left) + Volume Slider (Right) */}
            <div className="flex items-center justify-between pt-2 px-1 sm:px-3 border-t border-white/10">
              {/* Left Group: Heart + UP NEXT queue button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLike(currentTrack.id)}
                  className={`p-1.5 rounded-full transition-all active:scale-90 cursor-pointer ${
                    liked
                      ? 'text-[#EC4899] drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]'
                      : 'text-white/70 hover:text-white'
                  }`}
                  title={liked ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    className={`w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[1.8] ${liked ? 'fill-[#EC4899]' : ''}`}
                  />
                </button>

                {/* UP NEXT Queue Button */}
                <button
                  onClick={toggleQueuePanel}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                    isQueuePanelOpen
                      ? 'bg-purple-600/30 text-[#C084FC] border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                  title="Open UP NEXT Queue panel"
                >
                  <ListMusic className="w-3.5 h-3.5 text-purple-300" />
                  <span className="hidden sm:inline">Up Next</span>
                  {queue.length > queueIndex + 1 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/15 text-white/90 font-mono">
                      {queue.length - queueIndex - 1}
                    </span>
                  )}
                </button>
              </div>

              {/* Right: Speaker Volume Icon + Volume Slider */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleMute}
                  className="p-1 rounded-full text-white/70 hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                {/* Horizontal Volume Track with Purple Fill & White Thumb */}
                <div className="relative flex items-center w-24 sm:w-28 group cursor-pointer h-3.5">
                  <div className="h-1 sm:h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(isMuted ? 0 : volume) * 100}%`,
                        background: `linear-gradient(90deg, ${secondaryColor} 0%, ${accentColor} 100%)`,
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
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Volume slider"
                  />
                  {/* Volume Thumb Knob */}
                  <div
                    className="absolute w-3 h-3 rounded-full bg-white shadow-md border border-black/10 pointer-events-none -translate-x-1/2 transition-transform group-hover:scale-125"
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
