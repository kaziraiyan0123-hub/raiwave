import React, { useState } from 'react'
import {
  X,
  Play,
  Pause,
  Trash2,
  ListMusic,
  GripVertical,
  Plus,
  Sparkles,
  Music2,
  Clock,
  Layers,
} from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'
import { EqualizerBars } from './EqualizerBars'

export const UpNextPanel: React.FC = () => {
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
    isQueuePanelOpen,
    toggleQueuePanel,
    dynamicTheme,
    smartSuggestions,
  } = usePlayer()

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  if (!isQueuePanelOpen) return null

  // Slice upcoming songs after the currently playing song
  const upcomingQueue = queue.slice(queueIndex + 1)

  const formatDuration = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Calculate total upcoming queue duration in seconds
  const totalUpcomingSecs = upcomingQueue.reduce((acc, t) => acc + (t.duration || 0), 0)
  const totalUpcomingMins = Math.ceil(totalUpcomingSecs / 60)

  // Drag and Drop Handlers
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

  const handleDragLeave = () => {
    // Only clear if leaving the list
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
    <div
      className="fixed inset-0 z-50 flex justify-end select-none animate-in fade-in duration-300"
      id="up-next-panel-overlay"
      data-testid="up-next-panel"
    >
      {/* Dark backdrop scrim */}
      <div
        onClick={toggleQueuePanel}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Dark Glass Panel */}
      <div
        className="relative w-full max-w-[460px] h-full flex flex-col bg-[#0F0B1C]/95 backdrop-blur-3xl border-l border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9),-15px_0_40px_rgba(139,92,246,0.18)] z-10 overflow-hidden animate-in slide-in-from-right duration-300"
        style={{
          borderLeftColor: dynamicTheme.borderColor || 'rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Dynamic Accent Background Ambient Glow */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: accentColor }}
        />

        {/* =========================================================================
            HEADER: "UP NEXT" Title + Stats + Clear Queue + Close
           ========================================================================= */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 relative z-10 flex-shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/15 shadow-md"
              style={{
                background: `radial-gradient(circle, ${accentColor}30 0%, rgba(255,255,255,0.05) 100%)`,
              }}
            >
              <ListMusic className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wider text-white uppercase font-display">
                  UP NEXT
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-mono font-medium">
                  {upcomingQueue.length}
                </span>
              </div>
              <p className="text-xs text-white/50">
                {upcomingQueue.length > 0
                  ? `${upcomingQueue.length} upcoming songs • ~${totalUpcomingMins} min`
                  : 'Lossless queue stream'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {upcomingQueue.length > 0 && (
              <button
                onClick={clearQueue}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/70 hover:text-red-300 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer active:scale-95"
                title="Clear all upcoming songs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            <button
              onClick={toggleQueuePanel}
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors active:scale-90 cursor-pointer"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            PANEL BODY (Scrollable)
           ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar relative z-10">
          {/* 1. NOW PLAYING CARD */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                <Music2 className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span>Now Playing</span>
              </span>
              {isPlaying && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-[#C084FC] border border-purple-500/30 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C084FC]" />
                  LIVE
                </span>
              )}
            </div>

            {currentTrack ? (
              <div
                className="relative overflow-hidden rounded-2xl p-3.5 border transition-all duration-300 group shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${dynamicTheme.surfaceGlow} 0%, rgba(20, 16, 32, 0.9) 100%)`,
                  borderColor: dynamicTheme.borderColor || 'rgba(255, 255, 255, 0.15)',
                }}
              >
                <div className="flex items-center gap-3.5 relative z-10">
                  {/* Artwork with Play/Pause button */}
                  <div
                    onClick={togglePlay}
                    className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md flex-shrink-0 cursor-pointer group/art"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    <img
                      src={currentTrack.coverUrl}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/art:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/art:opacity-100 transition-opacity">
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white fill-current" />
                      ) : (
                        <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Song Title & Artist + Animated Waveform Equalizer */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white truncate font-heading">
                        {currentTrack.title}
                      </h3>
                      {isPlaying && (
                        <div className="flex-shrink-0">
                          <EqualizerBars size="sm" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-white/60 truncate mt-0.5">
                      {currentTrack.artist}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-white/40 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(currentTrack.duration)}
                      </span>
                      <span>•</span>
                      <span className="uppercase text-[10px] tracking-wider text-purple-300 font-semibold">
                        Lossless FLAC
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center text-white/50 text-xs">
                No track currently active. Select a track to play.
              </div>
            )}
          </div>

          {/* 2. UP NEXT (Upcoming Queue List) */}
          <div>
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                  Upcoming in Queue
                </span>
                <span className="text-[11px] font-mono text-white/40">
                  ({upcomingQueue.length})
                </span>
              </div>
              {upcomingQueue.length > 1 && (
                <span className="text-[10px] text-white/40 flex items-center gap-1">
                  <GripVertical className="w-3 h-3 text-white/30" />
                  Drag to reorder
                </span>
              )}
            </div>

            {upcomingQueue.length === 0 ? (
              /* Empty Queue State */
              <div className="py-10 px-4 rounded-2xl bg-white/[0.03] border border-dashed border-white/10 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-white/40">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Queue is Empty</h4>
                <p className="text-xs text-white/50 max-w-xs mx-auto mt-1 leading-relaxed">
                  Add tracks from Albums, Playlists, or Search to build your upcoming listening session.
                </p>
              </div>
            ) : (
              /* Drag-and-drop Queue List */
              <div className="space-y-2">
                {upcomingQueue.map((track, uIdx) => {
                  const actualQueueIndex = queueIndex + 1 + uIdx
                  const isBeingDragged = draggedIdx === uIdx
                  const isDropTarget = dragOverIdx === uIdx

                  return (
                    <div
                      key={`${track.id}-${uIdx}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, uIdx)}
                      onDragOver={(e) => handleDragOver(e, uIdx)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, uIdx)}
                      onDragEnd={handleDragEnd}
                      className={`relative flex items-center justify-between p-2.5 rounded-2xl border transition-all duration-200 group select-none ${
                        isBeingDragged
                          ? 'opacity-40 scale-[0.98] border-purple-500/50 bg-purple-500/10'
                          : isDropTarget
                          ? 'border-purple-400 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-[1.01]'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/5 hover:border-white/15'
                      }`}
                    >
                      {/* Left: Drag Handle + Number + Artwork + Info */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Drag Handle */}
                        <div
                          className="cursor-grab active:cursor-grabbing p-1 text-white/30 hover:text-white/80 transition-colors flex-shrink-0"
                          title="Drag to rearrange"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Order Index */}
                        <span className="text-xs font-mono font-medium text-white/40 w-3.5 text-center flex-shrink-0">
                          {uIdx + 1}
                        </span>

                        {/* Artwork with Quick Play Button Overlay */}
                        <div
                          onClick={() => playQueuedTrackImmediately(actualQueueIndex)}
                          className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-white/10 cursor-pointer group/art"
                          title="Play immediately"
                        >
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/art:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/art:opacity-100 flex items-center justify-center transition-opacity">
                            <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                          </div>
                        </div>

                        {/* Title & Artist */}
                        <div
                          onClick={() => playQueuedTrackImmediately(actualQueueIndex)}
                          className="min-w-0 pr-1 flex-1 cursor-pointer"
                          title="Play immediately"
                        >
                          <h4 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                            {track.title}
                          </h4>
                          <p className="text-xs text-white/50 truncate mt-0.5">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      {/* Right: Duration + Play Now + Remove Buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-mono text-white/40 hidden sm:inline">
                          {formatDuration(track.duration)}
                        </span>

                        {/* Play Now Button (visible on hover) */}
                        <button
                          onClick={() => playQueuedTrackImmediately(actualQueueIndex)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all active:scale-95 cursor-pointer"
                          title="Play immediately"
                        >
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </button>

                        {/* Remove from queue */}
                        <button
                          onClick={() => removeFromQueue(actualQueueIndex)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors active:scale-95 cursor-pointer"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 3. QUICK RECOMMENDATIONS: One-Click Add to Queue */}
          {smartSuggestions && smartSuggestions.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Suggested for You</span>
                </span>
                <span className="text-[10px] text-white/40">1-click add</span>
              </div>

              <div className="space-y-1.5">
                {smartSuggestions.slice(0, 4).map((sug) => (
                  <div
                    key={sug.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={sug.coverUrl}
                        alt={sug.title}
                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 truncate">
                        <div className="text-xs font-semibold text-white truncate">
                          {sug.title}
                        </div>
                        <div className="text-[11px] text-white/50 truncate">
                          {sug.artist}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => addToQueue(sug)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-purple-600 hover:text-white text-white/80 text-xs font-medium transition-all active:scale-95 cursor-pointer"
                      title="Add to queue"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
