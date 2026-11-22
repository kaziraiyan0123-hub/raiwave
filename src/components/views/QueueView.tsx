import React, { useState } from 'react'
import {
  Play,
  Pause,
  Trash2,
  ListMusic,
  Music,
  Sparkles,
  Plus,
  GripVertical,
} from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { EqualizerBars } from '../EqualizerBars'

export const QueueView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    queue,
    queueIndex,
    removeFromQueue,
    clearQueue,
    reorderUpcoming,
    playQueuedTrackImmediately,
    addToQueue,
    isSmartQueueEnabled,
    toggleSmartQueue,
    smartSuggestions,
    dynamicTheme,
  } = usePlayer()

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const upcomingQueue = queue.slice(queueIndex + 1)

  const formatDuration = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const totalUpcomingSecs = upcomingQueue.reduce((acc, t) => acc + (t.duration || 0), 0)
  const totalUpcomingMins = Math.ceil(totalUpcomingSecs / 60)

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIdx !== index) {
      setDragOverIdx(index)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIdx: number) => {
    e.preventDefault()
    if (draggedIdx !== null && draggedIdx !== targetIdx) {
      reorderUpcoming(draggedIdx, targetIdx)
    }
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  const accentColor = dynamicTheme.primary || '#A78BFA'

  return (
    <div className="p-4 sm:p-8 select-none max-w-4xl mx-auto space-y-8 pb-44 md:pb-32">
      {/* Queue Header with Smart Autoplay Switch & Clear Queue */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg"
            style={{
              background: `radial-gradient(circle, ${accentColor}25 0%, rgba(255,255,255,0.03) 100%)`,
            }}
          >
            <ListMusic className="w-6 h-6" style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight font-display">Play Queue</h1>
            <p className="text-xs text-white/50">
              {upcomingQueue.length > 0
                ? `${upcomingQueue.length} upcoming tracks • ~${totalUpcomingMins} mins on RAIWAVE lossless stream`
                : 'Up next on RAIWAVE lossless stream'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {upcomingQueue.length > 0 && (
            <button
              onClick={clearQueue}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-white/70 hover:text-red-300 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer active:scale-95"
              title="Clear upcoming songs from queue"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Queue</span>
            </button>
          )}

          {/* Smart Autoplay Toggle */}
          <button
            onClick={toggleSmartQueue}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold font-heading transition-all cursor-pointer ${
              isSmartQueueEnabled
                ? 'bg-purple-600/20 border-purple-500/40 text-[#C084FC] shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : 'bg-white/5 border-white/10 text-white/60'
            }`}
            title="Smart Queue automatically queues matching songs when queue ends"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Autoplay: {isSmartQueueEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* 1. Now Playing Section */}
      {currentTrack && (
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs uppercase tracking-wider font-bold text-white/50">Now Playing</h2>
            {isPlaying && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-[#C084FC] border border-purple-500/30 flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]" />
                LIVE STREAM
              </span>
            )}
          </div>

          <div
            className="flex items-center justify-between p-4 rounded-2xl group transition-all border shadow-xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${dynamicTheme.surfaceGlow} 0%, rgba(18, 14, 28, 0.95) 100%)`,
              borderColor: dynamicTheme.borderColor || 'rgba(255, 255, 255, 0.12)',
            }}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                onClick={togglePlay}
                className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md cursor-pointer group/art"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/art:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover/art:opacity-100 transition-opacity">
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-white" />
                  ) : (
                    <Play className="w-7 h-7 fill-white ml-0.5" />
                  )}
                </div>
              </div>

              <div className="truncate">
                <div className="flex items-center gap-2">
                  <p className="text-base sm:text-lg font-bold text-white truncate font-heading">
                    {currentTrack.title}
                  </p>
                  {isPlaying && <EqualizerBars size="sm" />}
                </div>
                <p className="text-sm text-white/60 truncate mt-0.5">{currentTrack.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-white/50 font-mono flex-shrink-0">
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 font-bold uppercase tracking-wider border border-purple-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                Lossless FLAC
              </span>
              <span className="font-semibold text-white/70">{formatDuration(currentTrack.duration)}</span>
            </div>
          </div>
        </section>
      )}

      {/* 2. UP NEXT (Upcoming Queue with Drag & Drop) */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs uppercase tracking-wider font-bold text-white/50">Next Up</h2>
            <span className="text-xs text-white/40 font-mono">({upcomingQueue.length} tracks)</span>
          </div>
          {upcomingQueue.length > 1 && (
            <span className="text-[11px] text-white/40 flex items-center gap-1">
              <GripVertical className="w-3.5 h-3.5 text-white/30" />
              Drag songs to rearrange
            </span>
          )}
        </div>

        {upcomingQueue.length === 0 ? (
          <div className="py-12 text-center text-white/50 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
            <Music className="w-8 h-8 mx-auto mb-2 text-white/30" />
            <p className="text-sm font-semibold text-white">Queue is empty</p>
            <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
              {isSmartQueueEnabled
                ? 'Smart Autoplay will automatically play related tracks when this song ends.'
                : 'Add tracks from Albums, Playlists, or Search.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingQueue.map((track, i) => {
              const actualQueueIdx = queueIndex + 1 + i
              const isBeingDragged = draggedIdx === i
              const isDropTarget = dragOverIdx === i

              return (
                <div
                  key={`${track.id}-${i}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={(e) => handleDrop(e, i)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 group cursor-pointer ${
                    isBeingDragged
                      ? 'opacity-40 scale-[0.98] border-purple-500/50 bg-purple-500/10'
                      : isDropTarget
                      ? 'border-purple-400 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-[1.01]'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/5 hover:border-white/15'
                  }`}
                >
                  <div
                    onClick={() => playQueuedTrackImmediately(actualQueueIdx)}
                    className="flex items-center gap-3.5 min-w-0 flex-1"
                  >
                    {/* Drag Handle */}
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 text-white/30 hover:text-white/80 transition-colors flex-shrink-0"
                      title="Drag to rearrange"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <span className="text-xs font-mono text-white/40 w-4 text-center flex-shrink-0">
                      {i + 1}
                    </span>

                    <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-md group/art">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/art:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>

                    <div className="truncate pr-2">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                        {track.title}
                      </p>
                      <p className="text-xs text-white/50 truncate mt-0.5">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-white/50 flex-shrink-0">
                    <span className="font-mono">{formatDuration(track.duration)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromQueue(actualQueueIdx)
                      }}
                      title="Remove from queue"
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-500/15 text-white/40 hover:text-red-400 transition-all cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 3. Smart Queue AI Recommendations */}
      {smartSuggestions.length > 0 && (
        <section className="space-y-3 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-xs uppercase tracking-wider font-bold text-white font-heading">
                Smart Queue Recommendations
              </h2>
            </div>
            <span className="text-[11px] text-white/40">Matched to your vibe</span>
          </div>

          <div className="space-y-2">
            {smartSuggestions.slice(0, 5).map((sugTrack) => (
              <div
                key={sugTrack.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-all group"
              >
                <div
                  onClick={() => addToQueue(sugTrack)}
                  className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                >
                  <img
                    src={sugTrack.coverUrl}
                    alt={sugTrack.title}
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                      {sugTrack.title}
                    </p>
                    <p className="text-xs text-white/50 truncate mt-0.5">{sugTrack.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-purple-300 bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    {sugTrack.genre}
                  </span>

                  <button
                    onClick={() => addToQueue(sugTrack)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-purple-600 hover:text-white text-white/80 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95"
                    title="Add to queue"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
