import React, { useState } from 'react'
import { Play, Pause, CheckCircle2, Heart, ChevronLeft } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { EqualizerBars } from '../EqualizerBars'

export const ArtistView: React.FC = () => {
  const {
    selectedArtist,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    isLiked,
    toggleLike,
    goBack,
  } = usePlayer()

  const [isFollowing, setIsFollowing] = useState(false)

  if (!selectedArtist) {
    return (
      <div className="p-8 text-center text-[#b3b3b3]">
        <p>No artist selected.</p>
      </div>
    )
  }

  const tracks = selectedArtist.topTracks
  const isArtistPlaying = isPlaying && tracks.some((t) => t.id === currentTrack?.id)

  const handlePlayAll = () => {
    if (tracks.length === 0) return
    if (isArtistPlaying) {
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
      {/* Hero Banner with Artist Image */}
      <div
        className="h-80 relative flex items-end p-6 sm:p-8 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(9,13,19,0.3), rgba(9,13,19,0.98)), url(${selectedArtist.headerImage})`,
        }}
      >
        {/* Mobile In-Page Back Button */}
        <button
          onClick={goBack}
          className="md:hidden absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/15 active:scale-95 transition-all cursor-pointer"
          title="Back"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#52D6C9]">
            <CheckCircle2 className="w-4 h-4 fill-[#52D6C9] text-black" />
            <span className="text-white">Verified Artist</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight font-display">
            {selectedArtist.name}
          </h1>
          <p className="text-sm font-semibold text-[#94A3B8]">
            {selectedArtist.monthlyListeners.toLocaleString()} monthly listeners
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="px-8 py-5 flex items-center gap-6 bg-[#0B0D13]">
        <button
          onClick={handlePlayAll}
          className="w-14 h-14 rounded-full bg-[#8B5CF6] hover:bg-[#a3e655] text-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-[#8B5CF6]/20"
        >
          {isArtistPlaying ? (
            <Pause className="w-6 h-6 fill-black text-black" />
          ) : (
            <Play className="w-6 h-6 fill-black text-black ml-1" />
          )}
        </button>

        <button
          onClick={() => setIsFollowing((prev) => !prev)}
          className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
            isFollowing
              ? 'border-[#8B5CF6] text-[#8B5CF6] bg-[#8B5CF6]/10 hover:border-white hover:text-white'
              : 'border-[#202A34] text-white hover:border-[#8B5CF6] hover:text-[#8B5CF6] hover:scale-105'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Popular Tracks & Bio */}
      <div className="px-8 bg-[#0B0D13] space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 font-display">Popular Tracks</h2>
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

                  <div className="col-span-7 md:col-span-8 flex items-center gap-3 min-w-0 pr-2">
                    <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="truncate">
                      <p className={`text-sm font-semibold truncate ${isSelectedThis ? 'text-[#8B5CF6]' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-[#94A3B8] truncate">{track.genre}</p>
                    </div>
                  </div>

                  <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-3 text-xs text-[#94A3B8] pr-2">
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
        </section>

        {/* About Artist Section */}
        <section className="pb-12 border-t border-[#202A34] pt-8">
          <h3 className="text-xl font-bold text-white mb-3 font-display">About</h3>
          <div className="bg-[#12141D] p-6 rounded-2xl border border-[#202A34] max-w-2xl space-y-3">
            <div className="flex items-center gap-3">
              <img src={selectedArtist.avatarUrl} alt={selectedArtist.name} className="w-16 h-16 rounded-full object-cover border border-[#202A34]" />
              <div>
                <p className="font-bold text-white text-lg font-display">{selectedArtist.name}</p>
                <p className="text-xs text-[#94A3B8]">Lossless Studio Artist • RAIWAVE Verified</p>
              </div>
            </div>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              {selectedArtist.bio || `${selectedArtist.name} is one of the premier artists streamed on RAIWAVE with lossless studio audio quality and over ${selectedArtist.monthlyListeners.toLocaleString()} monthly listeners worldwide.`}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
