import React from 'react'
import { Play, Pause, Trash2, ListMusic, Music, Sparkles, Plus } from 'lucide-react'
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
    addToQueue,
    isSmartQueueEnabled,
    toggleSmartQueue,
    smartSuggestions,
  } = usePlayer()

  const upcomingQueue = queue.slice(queueIndex + 1)

  const formatDuration = (secs: number) => {
    if (isNaN(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="p-4 sm:p-8 select-none max-w-4xl mx-auto space-y-8 pb-44 md:pb-32">
      {/* Queue Header with Smart Autoplay Switch */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <ListMusic className="w-8 h-8 text-[#B6F36B]" />
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight font-display">Play Queue</h1>
            <p className="text-xs text-[#929DA8]">Up next on RAIWAVE lossless stream</p>
          </div>
        </div>

        {/* Smart Autoplay Toggle */}
        <button
          onClick={toggleSmartQueue}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold font-heading transition-all ${
            isSmartQueueEnabled
              ? 'bg-[#B6F36B]/15 border-[#B6F36B]/40 text-[#B6F36B] shadow-[0_0_15px_rgba(182,243,107,0.25)]'
              : 'bg-white/5 border-white/10 text-[#929DA8]'
          }`}
          title="Smart Queue automatically queues matching songs when queue ends"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Autoplay: {isSmartQueueEnabled ? 'ON' : 'OFF'}</span>
        </button>
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
            <p className="text-xs text-[#929DA8] mt-1">
              {isSmartQueueEnabled
                ? 'Smart Autoplay will automatically play related tracks next.'
                : 'Add tracks from Home, Explore, or Library.'}
            </p>
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

      {/* 3. ✨ Smart Queue AI Recommendations */}
      {smartSuggestions.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#52D6C9]" />
              <h2 className="text-xs uppercase tracking-wider font-bold text-white font-heading">
                Smart Queue Recommendations
              </h2>
            </div>
            <span className="text-[11px] text-[#929DA8]">Matched to your vibe</span>
          </div>

          <div className="space-y-2">
            {smartSuggestions.slice(0, 5).map((sugTrack) => (
              <div
                key={sugTrack.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#141A23]/40 hover:bg-[#1B232E] border border-white/5 transition-all group"
              >
                <div
                  onClick={() => playTrack(sugTrack, [...queue, sugTrack])}
                  className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                >
                  <img
                    src={sugTrack.coverUrl}
                    alt={sugTrack.title}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-[#B6F36B] transition-colors">
                      {sugTrack.title}
                    </p>
                    <p className="text-xs text-[#929DA8] truncate">{sugTrack.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-[#52D6C9] bg-[#52D6C9]/10 px-2 py-0.5 rounded-full border border-[#52D6C9]/20">
                    {sugTrack.genre}
                  </span>

                  <button
                    onClick={() => addToQueue(sugTrack)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-[#B6F36B] hover:text-[#090D13] text-[#929DA8] transition-all flex items-center gap-1 text-xs font-semibold"
                    title="Add to queue"
                  >
                    <Plus className="w-4 h-4" />
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
