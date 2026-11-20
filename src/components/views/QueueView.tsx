import React from 'react'
import { Play, Pause, Trash2, ListMusic, Music } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { EqualizerBars } from '../EqualizerBars'

export const QueueView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    queue,
    queueIndex,
    playTrack,
    removeFromQueue,
  } = usePlayer()

  const upcomingQueue = queue.slice(queueIndex + 1)

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="p-4 sm:p-8 select-none max-w-4xl mx-auto space-y-8 pb-32">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <ListMusic className="w-8 h-8 text-[#B6F36B]" />
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight font-display">Play Queue</h1>
          <p className="text-xs text-[#929DA8]">Up next on RAIWAVE lossless stream</p>
        </div>
      </div>

      {/* 1. Now Playing Section */}
      {currentTrack && (
        <section>
          <h2 className="text-xs uppercase tracking-wider font-bold text-[#929DA8] mb-3">Now Playing</h2>
          <div className="flex items-center justify-between p-4 bg-[#141A23] hover:bg-[#1B232E] rounded-xl group transition-colors border border-[#202A34]">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-white" />
                  ) : (
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  )}
                </button>
              </div>

              <div className="truncate">
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-[#B6F36B] truncate">{currentTrack.title}</p>
                  {isPlaying && <EqualizerBars size="sm" color="bg-[#B6F36B]" />}
                </div>
                <p className="text-sm text-[#929DA8] truncate">{currentTrack.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#929DA8] font-mono flex-shrink-0">
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#B6F36B]/15 text-[#B6F36B] font-bold uppercase tracking-wider border border-[#B6F36B]/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B6F36B] animate-pulse" />
                Lossless
              </span>
              <span>{formatDuration(currentTrack.duration)}</span>
            </div>
          </div>
        </section>
      )}

      {/* 2. Next Up Queue */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-[#929DA8]">Next Up</h2>
          <span className="text-xs text-[#929DA8] font-mono">{upcomingQueue.length} tracks</span>
        </div>

        {upcomingQueue.length === 0 ? (
          <div className="py-12 text-center text-[#929DA8] bg-[#141A23]/50 rounded-xl border border-dashed border-[#202A34]">
            <Music className="w-8 h-8 mx-auto mb-2 text-[#929DA8]/60" />
            <p className="text-sm font-semibold text-white">Queue is empty</p>
            <p className="text-xs text-[#929DA8] mt-1">Add tracks from Home, Explore, or Library.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {upcomingQueue.map((track, i) => {
              const actualQueueIdx = queueIndex + 1 + i
              return (
                <div
                  key={`${track.id}-${i}`}
                  onClick={() => playTrack(track, queue)}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#141A23]/60 hover:bg-[#1B232E] border border-transparent hover:border-[#202A34] cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-xs font-mono text-[#929DA8] w-4 text-center">{i + 1}</span>
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-[#B6F36B] transition-colors">
                        {track.title}
                      </p>
                      <p className="text-xs text-[#929DA8] truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#929DA8] flex-shrink-0">
                    <span className="font-mono">{formatDuration(track.duration)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromQueue(actualQueueIdx)
                      }}
                      title="Remove from queue"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-[#929DA8] hover:text-red-400 transition-all"
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
    </div>
  )
}
