import React from 'react'
import { Play, Pause } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { EqualizerBars } from '../EqualizerBars'

export const MobileMiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, togglePlay, toggleMobilePlayer, currentTime, duration } = usePlayer()

  if (!currentTrack) return null

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      id="mobile-mini-player"
      data-testid="mobile-mini-player"
      onClick={toggleMobilePlayer}
      className="md:hidden fixed bottom-[84px] left-3.5 right-3.5 z-30 cursor-pointer select-none group transition-all"
    >
      <div className="bg-[#131520]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2.5 shadow-2xl shadow-black/90 flex items-center justify-between gap-3 relative overflow-hidden transition-all duration-200 active:scale-[0.99]">
        {/* Subtle Ambient Color Glow */}
        <div
          className="absolute -inset-1 opacity-20 blur-xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: currentTrack.color || '#8B5CF6' }}
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
            <span className="text-xs font-bold text-white truncate font-heading group-hover:text-[#A78BFA] transition-colors">
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
            className="w-9 h-9 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-purple-500/30"
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
            className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
