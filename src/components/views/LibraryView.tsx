import React, { useState } from 'react'
import { Plus, Heart, Bookmark, Mic, Play, Trash2, Clock } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { SAMPLE_PLAYLISTS, SAMPLE_ALBUMS, SAMPLE_ARTISTS } from '../../data/musicData'
import { CreatePlaylistModal } from '../CreatePlaylistModal'

export const LibraryView: React.FC = () => {
  const {
    userPlaylists,
    openPlaylist,
    openAlbum,
    openArtist,
    navigateTo,
    likedTrackIds,
    recordings,
    playRecording,
    deleteRecording,
    toggleRecorder,
    userProfile,
  } = usePlayer()

  const [activeFilter, setActiveFilter] = useState<'all' | 'recordings' | 'playlists' | 'albums' | 'artists'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const allPlaylists = [...userPlaylists, ...SAMPLE_PLAYLISTS]

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <>
      <div className="p-4 sm:p-6 select-none space-y-6 pb-32 md:pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B6F36B]/15 border border-[#B6F36B]/30 flex items-center justify-center text-[#B6F36B]">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">Your Library</h1>
              <p className="text-xs text-[#929DA8]">Maintained under {userProfile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleRecorder}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-full text-xs font-bold font-display transition-all hover:scale-105 active:scale-95 shadow-md shadow-red-500/20"
            >
              <Mic className="w-4 h-4" />
              <span>Record Studio Audio</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#B6F36B] hover:bg-[#a3e655] text-[#090D13] rounded-full text-xs font-bold font-display transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#B6F36B]/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Playlist</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {(['all', 'recordings', 'playlists', 'albums', 'artists'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-display capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-[#B6F36B] text-[#090D13] font-bold shadow-[0_0_15px_rgba(182,243,107,0.3)]'
                  : 'bg-[#141A23] hover:bg-[#1B232E] text-[#929DA8] hover:text-white border border-[#202A34] font-semibold'
              }`}
            >
              {filter === 'recordings' ? `🎙️ Studio Recordings (${recordings.length})` : filter}
            </button>
          ))}
        </div>

        {/* Studio Recordings Section (When 'recordings' or 'all' selected) */}
        {(activeFilter === 'all' || activeFilter === 'recordings') && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Mic className="w-4 h-4 text-red-400" />
                <span>My Studio Recordings ({recordings.length})</span>
              </h2>
            </div>

            {recordings.length === 0 ? (
              <div className="p-8 text-center bg-[#141A23]/50 rounded-2xl border border-dashed border-[#202A34] max-w-xl">
                <Mic className="w-8 h-8 mx-auto text-[#929DA8]/40 mb-2" />
                <p className="text-sm font-semibold text-white">No recordings yet</p>
                <p className="text-xs text-[#929DA8] mt-1 mb-4">
                  Tap "Record Studio Audio" to capture vocals, melodies, or voice memos directly into your library.
                </p>
                <button
                  onClick={toggleRecorder}
                  className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-400 text-white text-xs font-bold font-display"
                >
                  Start First Recording
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl bg-[#141A23] hover:bg-[#1B232E] border border-[#202A34] transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => playRecording(rec)}
                        className="w-10 h-10 rounded-xl bg-[#B6F36B] text-[#090D13] flex items-center justify-center flex-shrink-0 shadow transition-transform hover:scale-105 active:scale-95"
                        title="Play in RAIWAVE"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-white truncate font-display group-hover:text-[#B6F36B] transition-colors">
                          {rec.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-[#929DA8]">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {formatSecs(rec.duration)}
                          </span>
                          <span>•</span>
                          <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteRecording(rec.id)}
                      className="p-2 text-[#929DA8] hover:text-red-400 opacity-60 group-hover:opacity-100 transition-all rounded-lg hover:bg-white/5"
                      title="Delete recording"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Content Grid for Playlists, Albums, Artists */}
        {activeFilter !== 'recordings' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Liked Songs Tile */}
            {(activeFilter === 'all' || activeFilter === 'playlists') && (
              <div
                onClick={() => navigateTo('liked')}
                className="bg-gradient-to-br from-[#52D6C9] via-[#3B82F6] to-[#8B5CF6] p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.03] flex flex-col justify-end aspect-square shadow-xl group border border-white/10"
              >
                <Heart className="w-8 h-8 text-white fill-white mb-2" />
                <h3 className="font-black text-lg text-white font-display">Liked Songs</h3>
                <p className="text-xs text-white/90 font-medium font-mono">{likedTrackIds.length} tracks</p>
              </div>
            )}

            {/* Playlists */}
            {(activeFilter === 'all' || activeFilter === 'playlists') &&
              allPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => openPlaylist(pl)}
                  className="bg-[#141A23] hover:bg-[#1B232E] p-4 rounded-2xl cursor-pointer transition-all duration-300 group flex flex-col border border-[#202A34] hover:border-[#B6F36B]/30 shadow-md"
                >
                  <div className="relative mb-3 aspect-square w-full rounded-xl overflow-hidden shadow-lg">
                    <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="font-bold text-sm text-white font-display truncate mb-1">{pl.name}</h3>
                  <p className="text-xs text-[#929DA8] truncate">Playlist • {pl.owner}</p>
                </div>
              ))}

            {/* Albums */}
            {(activeFilter === 'all' || activeFilter === 'albums') &&
              SAMPLE_ALBUMS.map((album) => (
                <div
                  key={album.id}
                  onClick={() => openAlbum(album)}
                  className="bg-[#141A23] hover:bg-[#1B232E] p-4 rounded-2xl cursor-pointer transition-all duration-300 group flex flex-col border border-[#202A34] hover:border-[#B6F36B]/30 shadow-md"
                >
                  <div className="relative mb-3 aspect-square w-full rounded-xl overflow-hidden shadow-lg">
                    <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="font-bold text-sm text-white font-display truncate mb-1">{album.title}</h3>
                  <p className="text-xs text-[#929DA8] truncate">Album • {album.artist}</p>
                </div>
              ))}

            {/* Artists */}
            {(activeFilter === 'all' || activeFilter === 'artists') &&
              SAMPLE_ARTISTS.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => openArtist(artist)}
                  className="bg-[#141A23] hover:bg-[#1B232E] p-4 rounded-2xl cursor-pointer transition-all duration-300 group flex flex-col items-center border border-[#202A34] hover:border-[#B6F36B]/30 shadow-md"
                >
                  <div className="relative mb-3 aspect-square w-full rounded-full overflow-hidden shadow-lg">
                    <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h3 className="font-bold text-sm text-white font-display truncate mb-1 text-center">{artist.name}</h3>
                  <p className="text-xs text-[#929DA8] text-center">Artist</p>
                </div>
              ))}
          </div>
        )}
      </div>

      <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
