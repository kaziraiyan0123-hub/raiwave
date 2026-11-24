import React from 'react'
import { Play, Pause, SkipForward, Heart } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { useMobileKeyboardOpen } from '../../hooks/useMobileKeyboardOpen'
import { EqualizerBars } from '../EqualizerBars'

export const MobileMiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    isLiked,
    toggleLike,
    toggleMobilePlayer,
    currentTime,
    duration,
    dynamicTheme,
    openArtist,
  } = usePlayer()
  const isKeyboardOpen = useMobileKeyboardOpen()

  if (!currentTrack || isKeyboardOpen) return null

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const liked = isLiked(currentTrack.id)
  const accentColor = dynamicTheme.primary || '#A78BFA'
  const secondaryColor = dynamicTheme.secondary || '#8B5CF6'

  return (
    <div
      id="mobile-mini-player"
      data-testid="mobile-mini-player"
      onClick={toggleMobilePlayer}
      className="md:hidden fixed bottom-[78px] left-3 right-3 z-30 cursor-pointer select-none group transition-all pointer-events-none"
    >
      <div
        className="w-full mx-auto max-w-sm pointer-events-auto bg-[#120E22]/95 backdrop-blur-3xl border rounded-2xl p-2.5 flex items-center justify-between gap-3 relative overflow-hidden shadow-2xl transition-all duration-300 active:scale-[0.99]"
        style={{
          borderColor: dynamicTheme.borderColor || 'rgba(255, 255, 255, 0.12)',
          boxShadow: `0 12px 35px rgba(0,0,0,0.85), 0 0 25px ${dynamicTheme.surfaceGlow}`,
        }}
      >
        {/* Subtle Ambient Color Glow */}
        <div
          className="absolute -inset-1 opacity-25 blur-xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />

        {/* Left: Track Artwork + Live Equalizer + Details */}
        <div className="flex items-center gap-3 min-w-0 z-10 flex-1">
          <div className="relative flex-shrink-0">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-xl object-cover shadow-md border border-white/10"
            />
            {isPlaying && (
              <span className="absolute bottom-1 right-1 p-0.5 rounded-full bg-black/70 backdrop-blur-sm">
                <EqualizerBars size="sm" />
              </span>
            )}
          </div>

          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-xs sm:text-sm font-bold text-white truncate font-heading leading-tight">
              {currentTrack.title}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation()
                openArtist(currentTrack.artist)
              }}
              className="text-[11px] text-white/60 hover:text-[#A78BFA] hover:underline cursor-pointer truncate mt-0.5"
            >
              {currentTrack.artist}
            </span>
          </div>
        </div>

        {/* Right Controls: Favorite Heart + Play/Pause + Skip Next */}
        <div className="flex items-center gap-1.5 z-10 flex-shrink-0 pr-0.5">
          {/* Like Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleLike(currentTrack.id, currentTrack)
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white active:scale-90 transition-all cursor-pointer"
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={`w-4 h-4 stroke-[2] ${
                liked ? 'text-pink-500 fill-pink-500' : 'text-white/60'
              }`}
            />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            className="w-10 h-10 rounded-full text-[#0B0D13] bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          {/* Skip Next Track */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              nextTrack()
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-all cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Slim Bottom Progress Line */}
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${secondaryColor} 0%, ${accentColor} 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
