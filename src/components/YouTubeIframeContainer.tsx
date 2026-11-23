import React, { useEffect, useRef, useState } from 'react'
import { youtubeService } from '../services/youtubePlayer'
import { usePlayer } from '../context/PlayerContext'
import { Tv, ChevronDown, ChevronUp, X } from 'lucide-react'

// Stable host component: renders the div once and passes element ref to youtubeService
// React.memo prevents any re-rendering or reconciliation from detaching the iframe!
const PlayerHost: React.FC = React.memo(() => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (containerRef.current) {
      youtubeService.bindToElement(containerRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      id="raiwave-youtube-player"
      className="w-full h-full bg-black"
    />
  )
})

export const YouTubeIframeContainer: React.FC = () => {
  const { currentTrack, isVideoOpen, toggleVideoOpen } = usePlayer()
  const [isMinimized, setIsMinimized] = useState(false)
  const isYouTubeTrack = currentTrack?.source === 'youtube' || Boolean(currentTrack?.youtubeId)

  const isVisible = isVideoOpen && isYouTubeTrack

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${
        isVisible
          ? `fixed z-40 bg-[#141A23]/95 backdrop-blur-xl border border-[#202A34] rounded-2xl shadow-2xl ${
              isMinimized
                ? 'bottom-24 right-4 sm:right-6 sm:bottom-28 w-56 h-10'
                : 'bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-28 w-auto sm:w-80 h-48 sm:h-52'
            }`
          : 'fixed -bottom-24 -right-24 w-1 h-1 opacity-[0.005] pointer-events-none z-[-10]'
      }`}
    >
      {/* Mini-dock header (only shown when visible) */}
      {isVisible && (
        <div className="bg-[#1B232E] px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-white/90 border-b border-[#202A34] select-none">
          <div className="flex items-center gap-2 truncate">
            <Tv className="w-3.5 h-3.5 text-[#B6F36B]" />
            <span className="truncate font-display text-white">RAIWAVE Visualizer</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              className="p-1 hover:text-white text-white/60 transition-colors rounded hover:bg-white/10"
              title={isMinimized ? 'Expand Video' : 'Minimize Video'}
            >
              {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleVideoOpen}
              className="p-1 hover:text-white text-white/60 transition-colors rounded hover:bg-white/10"
              title="Close Video Dock"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* The Actual YouTube Iframe container */}
      <div
        className={`w-full bg-black transition-all duration-200 ${
          isVisible && isMinimized ? 'h-0 opacity-0 pointer-events-none' : isVisible ? 'h-[calc(100%-28px)] opacity-100' : 'w-full h-full'
        }`}
      >
        <PlayerHost />
      </div>
    </div>
  )
}
