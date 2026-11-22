import React from 'react'
import { Play, Pause, Clock, Heart, ListPlus } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { EqualizerBars } from '../EqualizerBars'

export const AlbumView: React.FC = () => {
  const {
    selectedAlbum,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    isLiked,
    toggleLike,
    addToQueue,
    addAlbumToQueue,
  } = usePlayer()

  if (!selectedAlbum) {
    return (
      <div className="p-8 text-center text-[#b3b3b3]">
        <p>No album selected.</p>
      </div>
    )
  }

  const tracks = selectedAlbum.tracks
  const isAlbumPlaying = isPlaying && tracks.some((t) => t.id === currentTrack?.id)

  const handlePlayAll = () => {
    if (tracks.length === 0) return
    if (isAlbumPlaying) {
      togglePlay()
    } else {
      playTrack(tracks[0], tracks)
    }
  }

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="select-none pb-32">
      {/* Header */}
      <div
        className="p-8 flex flex-col md:flex-row items-start md:items-end gap-6 relative"
        style={{
          background: `linear-gradient(to bottom, ${selectedAlbum.color || '#52D6C9'} 0%, #0B0D13 100%)`,
        }}
      >
        <img
          src={selectedAlbum.coverUrl}
          alt={selectedAlbum.title}
          className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl object-cover shadow-2xl flex-shrink-0 border border-white/10"
        />

        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#8B5CF6]">Album</span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight break-words font-display">
            {selectedAlbum.title}
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8] mt-2">
            <span className="text-white font-bold">{selectedAlbum.artist}</span>
            <span>•</span>
            <span>{selectedAlbum.year}</span>
            <span>•</span>
            <span>{tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 py-5 flex items-center gap-4 bg-[#0B0D13]">
        <button
          onClick={handlePlayAll}
          className="w-14 h-14 rounded-full bg-[#8B5CF6] hover:bg-[#a3e655] text-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-[#8B5CF6]/20 cursor-pointer"
          title={isAlbumPlaying ? 'Pause album' : 'Play album'}
        >
          {isAlbumPlaying ? (
            <Pause className="w-6 h-6 fill-black text-black" />
          ) : (
            <Play className="w-6 h-6 fill-black text-black ml-1" />
          )}
        </button>

        {/* Add Entire Album to Queue */}
        <button
          onClick={() => addAlbumToQueue(selectedAlbum)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer"
          title="Add all songs from this album to queue"
        >
          <ListPlus className="w-4 h-4 text-purple-400" />
          <span>Add Album to Queue</span>
        </button>
      </div>

      {/* Track List */}
      <div className="px-8 bg-[#0B0D13]">
        <div className="grid grid-cols-12 text-xs font-semibold uppercase text-[#94A3B8] border-b border-white/10 pb-2 px-4 mb-2 tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-8 md:col-span-10">Title</div>
          <div className="col-span-3 md:col-span-1 flex justify-end pr-2">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          {tracks.map((track, idx) => {
            const isPlayingThis = currentTrack?.id === track.id && isPlaying
            const isSelectedThis = currentTrack?.id === track.id
            const liked = isLiked(track.id)

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (isPlayingThis) togglePlay()
                  else playTrack(track, tracks)
                }}
                className={`grid grid-cols-12 items-center px-4 py-2.5 rounded-xl hover:bg-[#12141D] group cursor-pointer transition-colors ${
                  isSelectedThis ? 'bg-[#12141D]/80 border border-[#202A34]' : 'border border-transparent'
                }`}
              >
                <div className="col-span-1 text-center text-sm font-medium flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isPlayingThis) togglePlay()
                      else playTrack(track, tracks)
                    }}
                    className="hidden group-hover:flex items-center justify-center text-white"
                  >
                    {isPlayingThis ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>
                  <div className="group-hover:hidden flex items-center justify-center">
                    {isPlayingThis ? (
                      <EqualizerBars size="sm" color="bg-[#8B5CF6]" />
                    ) : (
                      <span className={`${isSelectedThis ? 'text-[#8B5CF6] font-bold' : 'text-[#94A3B8]'}`}>
                        {idx + 1}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-8 md:col-span-10 truncate pr-2">
                  <p className={`text-sm font-semibold truncate ${isSelectedThis ? 'text-[#8B5CF6]' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-[#94A3B8] truncate">{track.artist}</p>
                </div>

                <div className="col-span-3 md:col-span-1 flex items-center justify-end gap-2.5 text-xs text-[#94A3B8] pr-2">
                  {/* Add Track to Queue */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addToQueue(track)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:text-purple-300 hover:scale-110 active:scale-90 cursor-pointer"
                    title="Add track to queue"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLike(track.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'text-[#8B5CF6] fill-[#8B5CF6] opacity-100' : 'hover:text-white'}`} />
                  </button>
                  <span className="font-mono">{formatDuration(track.duration)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
