import React from 'react'
import { Play, Pause } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { EqualizerBars } from '../EqualizerBars'

export const MobileMiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    toggleMobilePlayer,
    currentTime,
    duration,
    dynamicTheme,
  } = usePlayer()

  if (!currentTrack) return null

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      id="mobile-mini-player"
      data-testid="mobile-mini-player"
      onClick={toggleMobilePlayer}
      className="md:hidden fixed bottom-[84px] left-3.5 right-3.5 z-30 cursor-pointer select-none group transition-all"
    >
      <div
        className="bg-[#131520]/95 backdrop-blur-2xl border rounded-2xl p-2.5 flex items-center justify-between gap-3 relative overflow-hidden transition-all duration-200 active:scale-[0.99]"
        style={{
          borderColor: dynamicTheme.borderColor,
          boxShadow: `0 10px 30px rgba(0,0,0,0.85), 0 0 20px ${dynamicTheme.surfaceGlow}`,
          transition: 'border-color 800ms ease, box-shadow 800ms ease',
        }}
      >
        {/* Subtle Ambient Color Glow */}
        <div
          className="absolute -inset-1 opacity-20 blur-xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: dynamicTheme.primary }}
        />

        {/* Track Artwork + Details */}
        <div className="flex items-center gap-3 min-w-0 z-10">
          <div className="relative flex-shrink-0">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-11 h-11 rounded-xl object-cover shadow-md border border-white/10"
            />
            {isPlaying && (
              <span className="absolute bottom-1 right-1 p-0.5 rounded-full bg-black/60 backdrop-blur-sm">
                <EqualizerBars size="sm" />
              </span>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate font-heading group-hover:text-white/80 transition-colors">
              {currentTrack.title}
            </span>
            <span className="text-[11px] text-[#94A3B8] truncate">
              {currentTrack.artist}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 z-10 flex-shrink-0 pr-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            className="w-9 h-9 rounded-full text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            style={{
              background: `linear-gradient(135deg, ${dynamicTheme.primary} 0%, ${dynamicTheme.secondary} 100%)`,
              boxShadow: `0 4px 14px ${dynamicTheme.accentGlow}`,
              transition: 'all 600ms ease',
            }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Slim Bottom Progress Line */}
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${dynamicTheme.secondary} 0%, ${dynamicTheme.primary} 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
