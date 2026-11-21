import React, { useEffect, useRef } from 'react'
import { Music2 } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'

export const LyricsView: React.FC = () => {
  const { currentTrack, currentTime, seek, liveLyrics, isLoadingLyrics } = usePlayer()
  const activeLineRef = useRef<HTMLParagraphElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const lyrics = liveLyrics && liveLyrics.length > 0 ? liveLyrics : currentTrack?.lyrics || []

  // Find active lyric index
  let activeIndex = -1
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      if (i === lyrics.length - 1 || currentTime < lyrics[i + 1].time) {
        activeIndex = i
        break
      }
    }
  }

  // Smooth auto-scroll active lyric into center
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeIndex])

  if (!currentTrack) return null

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-8 py-16 select-none relative transition-colors duration-700"
      style={{
        background: `linear-gradient(180deg, ${currentTrack.color || '#141A23'} 0%, #090D13 90%)`,
      }}
    >
      <div className="max-w-2xl mx-auto space-y-6 pb-28 md:pb-20">
        {/* Track info banner */}
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/10">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-16 h-16 rounded-xl object-cover shadow-2xl border border-white/10"
          />
          <div>
            <h2 className="text-2xl font-black text-white font-heading">{currentTrack.title}</h2>
            <p className="text-sm font-semibold text-[#929DA8]">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Lyrics Lines */}
        {isLoadingLyrics ? (
          <div className="py-24 text-center text-[#929DA8] space-y-3">
            <Music2 className="w-12 h-12 mx-auto text-[#B6F36B] animate-bounce" />
            <p className="text-xl font-bold text-white font-heading">
              Tuning into live synchronized karaoke lyrics...
            </p>
            <p className="text-xs text-[#929DA8]">Connecting to real-time lyrical frequency</p>
          </div>
        ) : lyrics.length === 0 ? (
          <div className="py-24 text-center text-[#929DA8] space-y-3">
            <Music2 className="w-12 h-12 mx-auto text-[#202A34]" />
            <p className="text-xl font-bold text-white font-heading">Instrumental / No lyrics available</p>
            <p className="text-xs text-[#929DA8]">Enjoy the full studio lossless soundscape!</p>
          </div>
        ) : (
          lyrics.map((line, idx) => {
            const isActive = idx === activeIndex
            const isPast = idx < activeIndex

            return (
              <p
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.time)}
                className={`text-2xl sm:text-3xl font-extrabold cursor-pointer transition-all duration-300 transform font-heading ${
                  isActive
                    ? 'text-[#B6F36B] scale-105 drop-shadow-[0_0_20px_rgba(182,243,107,0.5)]'
                    : isPast
                    ? 'text-white/40 hover:text-white/70'
                    : 'text-white/20 hover:text-white/60'
                }`}
              >
                {line.text}
              </p>
            )
          })
        )}
      </div>
    </div>
  )
}
