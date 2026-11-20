import React, { useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Heart, Sparkles } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { EqualizerBars } from './EqualizerBars'

export const RightCompanionPane: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    currentTime,
    duration,
    seek,
    queue,
    likedTrackIds,
    isLiked,
    toggleLike,
    playTrack,
    navigateTo,
  } = usePlayer()

  const [activeTab, setActiveTab] = useState<'liked' | 'queue'>('liked')

  const activeTrack = currentTrack || (queue.length > 0 ? queue[0] : null)
  if (!activeTrack) return null

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const liked = isLiked(activeTrack.id)

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Filter queue or liked tracks
  const displayedTracks =
    activeTab === 'liked'
      ? queue.filter((t) => likedTrackIds.includes(t.id))
      : queue

  return (
    <aside className="hidden xl:flex flex-col w-72 bg-[#090D13] h-full p-3 gap-3 flex-shrink-0 select-none border-l border-white/5">
      {/* 1. Top Hits / Now Playing Card (from Image 5) */}
      <div className="bg-[#141A23]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col gap-3 relative overflow-hidden group">
        {/* Dynamic color glow */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-25 blur-2xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: activeTrack.color || '#B6F36B' }}
        />

        <div className="flex items-center justify-between text-xs z-10">
          <div className="flex items-center gap-1.5 font-bold font-heading text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#B6F36B]" />
            <span>{currentTrack ? 'Now Playing' : 'Ready to Stream'}</span>
          </div>
          {isPlaying && <EqualizerBars size="sm" />}
        </div>

        {/* Artwork */}
        <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-lg border border-white/10 z-10">
          <img
            src={activeTrack.coverUrl}
            alt={activeTrack.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D13]/80 via-transparent to-transparent pointer-events-none" />
          <button
            onClick={() => toggleLike(activeTrack.id)}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                liked ? 'text-[#B6F36B] fill-[#B6F36B]' : 'hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-col z-10">
          <h4 className="text-sm font-bold text-white truncate font-heading group-hover:text-[#B6F36B] transition-colors">
            {activeTrack.title}
          </h4>
          <p className="text-xs text-[#929DA8] truncate">{activeTrack.artist}</p>
        </div>

        {/* Waveform Scrubber Slider */}
        <div className="flex flex-col gap-1 z-10">
          <div className="relative h-2 flex items-center group slider-container">
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
          <div className="flex items-center justify-between text-[10px] font-mono text-[#929DA8]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 z-10 pt-1">
          <button
            onClick={prevTrack}
            className="p-1.5 text-[#929DA8] hover:text-white transition-colors active:scale-95"
            title="Previous"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={() => {
              if (currentTrack) {
                togglePlay()
              } else {
                playTrack(activeTrack, queue)
              }
            }}
            className="w-10 h-10 rounded-full bg-[#B6F36B] text-[#090D13] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#B6F36B]/30"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 text-[#929DA8] hover:text-white transition-colors active:scale-95"
            title="Next"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* 2. My Library / Quick List Section (from Image 5) */}
      <div className="bg-[#141A23]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-3 flex-1 flex flex-col overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs font-bold text-white font-heading">
            My Library <span className="text-[#929DA8] font-normal font-mono">({likedTrackIds.length})</span>
          </span>
          <button
            onClick={() => navigateTo('library')}
            className="text-[11px] text-[#B6F36B] hover:underline"
          >
            View all
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#090D13] rounded-xl border border-white/5 mb-2">
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              activeTab === 'liked'
                ? 'bg-[#B6F36B] text-[#090D13]'
                : 'text-[#929DA8] hover:text-white'
            }`}
          >
            Liked
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all ${
              activeTab === 'queue'
                ? 'bg-[#B6F36B] text-[#090D13]'
                : 'text-[#929DA8] hover:text-white'
            }`}
          >
            Queue
          </button>
        </div>

        {/* Song Rows */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {displayedTracks.map((track) => {
            const isRowPlaying = currentTrack?.id === track.id && isPlaying
            const isRowSelected = currentTrack?.id === track.id

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors group ${
                  isRowSelected ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col truncate">
                    <span
                      className={`text-xs font-medium truncate ${
                        isRowSelected ? 'text-[#B6F36B] font-bold' : 'text-white group-hover:text-[#B6F36B]'
                      }`}
                    >
                      {track.title}
                    </span>
                    <span className="text-[10px] text-[#929DA8] truncate">{track.artist}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px] font-mono text-[#929DA8]">
                  {isRowPlaying ? (
                    <EqualizerBars size="sm" />
                  ) : (
                    <span>{formatTime(track.duration)}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
