import React from 'react'
import { Play, Pause, Heart, Clock, Music, ChevronLeft } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { EqualizerBars } from '../EqualizerBars'

export const LikedSongsView: React.FC = () => {
  const {
    likedTracks,
    toggleLike,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    toggleMobilePlayer,
    goBack,
    openArtist,
  } = usePlayer()

  const totalSeconds = likedTracks.reduce((acc, t) => acc + (t.duration || 0), 0)
  const totalMinutes = Math.floor(totalSeconds / 60)

  const isCurrentPlaying = isPlaying && likedTracks.some((t) => t.id === currentTrack?.id)

  const handlePlayAll = () => {
    if (likedTracks.length === 0) return
    if (isCurrentPlaying) {
      togglePlay()
    } else {
      playTrack(likedTracks[0], likedTracks)
    }
  }

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="select-none pb-44 md:pb-28">
      {/* 1. Header */}
      <div className="p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-end gap-6 bg-gradient-to-b from-[#52D6C9]/30 via-[#12141D] to-[#0B0D13] border-b border-white/5 relative">
        {/* Mobile In-Page Back Button */}
        <button
          onClick={goBack}
          className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold border border-white/15 active:scale-95 transition-all mb-2 cursor-pointer"
          title="Back"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-gradient-to-br from-[#52D6C9] via-[#3B82F6] to-[#8B5CF6] shadow-2xl flex items-center justify-center flex-shrink-0 border border-white/10">
          <Heart className="w-20 h-20 text-white fill-white shadow-sm" />
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#8B5CF6] font-heading">Playlist</span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-heading">Liked Songs</h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8] mt-1">
            <span className="text-white font-bold">You</span>
            <span>•</span>
            <span className="font-mono text-white">{likedTracks.length} songs</span>
            <span>•</span>
            <span className="font-mono">about {totalMinutes} min</span>
          </div>
        </div>
      </div>

      {/* 2. Action Controls */}
      <div className="px-6 sm:px-8 py-5 flex items-center gap-6 bg-[#0B0D13]">
        <button
          onClick={handlePlayAll}
          disabled={likedTracks.length === 0}
          className="w-14 h-14 rounded-full bg-[#8B5CF6] hover:bg-[#c4f885] disabled:bg-gray-700 text-[#0B0D13] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(182,243,107,0.35)]"
        >
          {isCurrentPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-1" />
          )}
        </button>
      </div>

      {/* 3. Track List */}
      <div className="px-4 sm:px-8 bg-[#0B0D13]">
        {/* Table Header */}
        <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#94A3B8] border-b border-white/10 pb-2 px-3 sm:px-4 mb-2 tracking-wider font-heading">
          <div className="flex items-center gap-3 flex-1">
            <span className="w-6 text-center">#</span>
            <span>Title</span>
          </div>
          <div className="hidden md:block w-[180px] pr-2">Album</div>
          <div className="flex justify-end pr-2">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {likedTracks.length === 0 ? (
          <div className="py-16 text-center text-[#94A3B8]">
            <Music className="w-12 h-12 mx-auto mb-2 text-[#202A34]" />
            <p className="font-semibold text-white text-base font-heading">Songs you like will appear here</p>
            <p className="text-xs text-[#94A3B8] mt-1">Save songs by tapping the heart icon anywhere in the player.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {likedTracks.map((track, idx) => {
              const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying
              const isThisTrackSelected = currentTrack?.id === track.id

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (isThisTrackSelected) {
                      toggleMobilePlayer()
                    } else {
                      playTrack(track, likedTracks)
                    }
                  }}
                  className={`flex items-center justify-between gap-2.5 px-3 sm:px-4 py-2.5 rounded-xl hover:bg-white/5 group cursor-pointer transition-colors ${
                    isThisTrackSelected ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-6 text-center text-xs font-mono font-medium flex items-center justify-center text-[#94A3B8] flex-shrink-0">
                      <span className="md:group-hover:hidden">
                        {isThisTrackPlaying ? <EqualizerBars size="sm" /> : idx + 1}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isThisTrackPlaying) {
                            togglePlay()
                          } else {
                            playTrack(track, likedTracks)
                          }
                        }}
                        className="hidden md:group-hover:flex items-center justify-center text-[#8B5CF6]"
                      >
                        {isThisTrackPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow border border-white/5"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold truncate transition-colors font-heading ${
                          isThisTrackSelected ? 'text-[#8B5CF6]' : 'text-white group-hover:text-[#8B5CF6]'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p
                        onClick={(e) => {
                          e.stopPropagation()
                          openArtist(track.artist)
                        }}
                        className="text-xs text-[#94A3B8] truncate hover:text-white hover:underline cursor-pointer"
                      >
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="hidden md:block text-xs text-[#94A3B8] truncate max-w-[180px] pr-2">
                    {track.album}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 text-xs text-[#94A3B8] flex-shrink-0 pr-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(track.id, track)
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 hover:scale-110 transition-all cursor-pointer"
                      title="Remove from Liked Songs"
                    >
                      <Heart className="w-4 h-4 text-[#8B5CF6] fill-[#8B5CF6]" />
                    </button>
                    <span className="font-mono hidden sm:inline">{formatDuration(track.duration)}</span>
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
