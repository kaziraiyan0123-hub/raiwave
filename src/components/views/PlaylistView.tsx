import React from 'react'
import {
  Play,
  Pause,
  Clock,
  Heart,
  Shuffle,
  MoreHorizontal,
  Music,
  ListPlus,
  ListStart,
  ChevronLeft,
} from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { EqualizerBars } from '../EqualizerBars'

export const PlaylistView: React.FC = () => {
  const {
    selectedPlaylist,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    isLiked,
    toggleLike,
    isShuffle,
    toggleShuffle,
    toggleMobilePlayer,
    playNext,
    addToQueue,
    addPlaylistToQueue,
    goBack,
  } = usePlayer()

  if (!selectedPlaylist) {
    return (
      <div className="p-8 text-center text-[#b3b3b3]">
        <p>No playlist selected.</p>
      </div>
    )
  }

  const tracks = selectedPlaylist.tracks
  const totalSeconds = tracks.reduce((acc, t) => acc + t.duration, 0)
  const totalMinutes = Math.floor(totalSeconds / 60)

  const isCurrentPlaylistPlaying =
    isPlaying && tracks.some((t) => t.id === currentTrack?.id)

  const handlePlayAll = () => {
    if (tracks.length === 0) return
    if (isCurrentPlaylistPlaying) {
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
    <div className="select-none pb-44 md:pb-28">
      {/* 1. Hero Header with Dynamic Tint */}
      <div
        className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-end gap-6 transition-colors duration-500 relative"
        style={{
          background: `linear-gradient(to bottom, ${selectedPlaylist.color || '#2563eb'} 0%, #121212 100%)`,
        }}
      >
        {/* Mobile In-Page Back Button */}
        <button
          onClick={goBack}
          className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold border border-white/15 active:scale-95 transition-all mb-2 cursor-pointer"
          title="Back"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <img
          src={selectedPlaylist.coverUrl}
          alt={selectedPlaylist.name}
          className="w-48 h-48 sm:w-56 sm:h-56 rounded-md object-cover shadow-2xl flex-shrink-0"
        />

        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-xs uppercase font-extrabold tracking-wider text-white">Playlist</span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight break-words">
            {selectedPlaylist.name}
          </h1>
          <p className="text-sm text-white/80 line-clamp-2 max-w-2xl">{selectedPlaylist.description}</p>
          <div className="flex items-center gap-2 text-xs font-semibold text-white/90 mt-1">
            <span className="text-white font-bold">{selectedPlaylist.owner}</span>
            <span>•</span>
            <span>{tracks.length} songs,</span>
            <span className="text-white/60">about {totalMinutes} min</span>
          </div>
        </div>
      </div>

      {/* 2. Action Controls Bar */}
      <div className="px-6 sm:px-8 py-5 flex items-center gap-4 sm:gap-6 bg-[#0B0D13]">
        <button
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
          className="w-14 h-14 rounded-full bg-[#8B5CF6] hover:bg-[#c4f885] disabled:bg-gray-700 text-[#0B0D13] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(182,243,107,0.35)] cursor-pointer"
        >
          {isCurrentPlaylistPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-1" />
          )}
        </button>

        <button
          onClick={toggleShuffle}
          className={`transition-colors cursor-pointer ${
            isShuffle ? 'text-[#8B5CF6]' : 'text-[#94A3B8] hover:text-white'
          }`}
          title="Shuffle Playlist"
        >
          <Shuffle className="w-6 h-6" />
        </button>

        {/* Add Entire Playlist to Queue */}
        <button
          onClick={() => addPlaylistToQueue(selectedPlaylist)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold tracking-wide transition-all active:scale-95 cursor-pointer"
          title="Add all songs from this playlist to queue"
        >
          <ListPlus className="w-4 h-4 text-purple-400" />
          <span>Add Playlist to Queue</span>
        </button>

        <button className="text-[#94A3B8] hover:text-white transition-colors cursor-pointer" title="More options">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* 3. Track List Table */}
      <div className="px-6 sm:px-8 bg-[#0B0D13]">
        {/* Table Header */}
        <div className="grid grid-cols-12 text-xs font-semibold uppercase text-[#94A3B8] border-b border-white/10 pb-2 px-4 mb-2 tracking-wider font-heading">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 md:col-span-5">Title</div>
          <div className="hidden md:block col-span-3">Album</div>
          <div className="hidden sm:block col-span-2">Date Added</div>
          <div className="col-span-5 sm:col-span-3 md:col-span-1 flex justify-end pr-2">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Track Rows */}
        {tracks.length === 0 ? (
          <div className="py-12 text-center text-[#777]">
            <Music className="w-12 h-12 mx-auto mb-2 text-[#444]" />
            <p className="font-semibold text-white">This playlist is empty.</p>
            <p className="text-xs text-[#888] mt-1">Search for tracks and add them to build your custom collection.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {tracks.map((track, idx) => {
              const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying
              const isThisTrackSelected = currentTrack?.id === track.id
              const liked = isLiked(track.id)

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (isThisTrackSelected) {
                      toggleMobilePlayer()
                    } else {
                      playTrack(track, tracks)
                    }
                  }}
                  className={`grid grid-cols-12 items-center px-4 py-2.5 rounded-md hover:bg-white/10 group cursor-pointer transition-colors ${
                    isThisTrackSelected ? 'bg-white/5' : ''
                  }`}
                >
                  {/* # or Play/Pause Icon or Equalizer */}
                  <div className="col-span-1 text-center text-sm font-medium flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isThisTrackPlaying) {
                          togglePlay()
                        } else {
                          playTrack(track, tracks)
                        }
                      }}
                      className="hidden group-hover:flex items-center justify-center text-[#8B5CF6]"
                    >
                      {isThisTrackPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                    <div className="group-hover:hidden flex items-center justify-center">
                      {isThisTrackPlaying ? (
                        <EqualizerBars size="sm" />
                      ) : (
                        <span
                          className={`font-mono text-xs ${
                            isThisTrackSelected ? 'text-[#8B5CF6] font-bold' : 'text-[#94A3B8]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Artist */}
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                    <div className="truncate">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isThisTrackSelected ? 'text-[#1db954]' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-xs text-[#b3b3b3] truncate hover:underline hover:text-white">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Album */}
                  <div className="hidden md:block col-span-3 text-sm text-[#b3b3b3] truncate pr-2 hover:underline hover:text-white">
                    {track.album}
                  </div>

                  {/* Date Added */}
                  <div className="hidden sm:block col-span-2 text-xs text-[#b3b3b3]">
                    {track.releaseYear}
                  </div>

                  {/* Add to Queue + Heart Like + Duration */}
                  <div className="col-span-5 sm:col-span-3 md:col-span-1 flex items-center justify-end gap-2.5 text-xs text-[#b3b3b3] pr-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        playNext(track)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:text-purple-300 hover:scale-110 active:scale-90 cursor-pointer"
                      title="Play track next"
                    >
                      <ListStart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addToQueue(track)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:text-purple-300 hover:scale-110 active:scale-90 cursor-pointer"
                      title="Add to queue"
                    >
                      <ListPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(track.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          liked ? 'text-[#1db954] fill-[#1db954] opacity-100' : 'hover:text-white'
                        }`}
                      />
                    </button>
                    <span className="font-mono">{formatDuration(track.duration)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
