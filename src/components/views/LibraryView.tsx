import React, { useState } from 'react'
import { Plus, Heart, Bookmark } from 'lucide-react'
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
    userProfile,
  } = usePlayer()

  const [activeFilter, setActiveFilter] = useState<'all' | 'playlists' | 'albums' | 'artists'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const allPlaylists = [...userPlaylists, ...SAMPLE_PLAYLISTS]

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
          {(['all', 'playlists', 'albums', 'artists'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-display capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-[#B6F36B] text-[#090D13] font-bold shadow-[0_0_15px_rgba(182,243,107,0.3)]'
                  : 'bg-[#141A23] hover:bg-[#1B232E] text-[#929DA8] hover:text-white border border-[#202A34] font-semibold'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Quick Liked Songs Banner */}
        {(activeFilter === 'all' || activeFilter === 'playlists') && (
          <div
            onClick={() => navigateTo('liked')}
            className="p-5 rounded-3xl bg-gradient-to-r from-[#52D6C9]/20 via-[#1B232E] to-[#141A23] border border-[#52D6C9]/30 cursor-pointer group transition-all hover:border-[#52D6C9]/60 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#52D6C9] to-[#8B5CF6] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Heart className="w-7 h-7 text-white fill-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display group-hover:text-[#52D6C9] transition-colors">
                  Liked Songs
                </h3>
                <p className="text-xs text-[#929DA8]">{likedTrackIds.length} tracks favorited</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#52D6C9] font-display uppercase tracking-wider group-hover:translate-x-1 transition-transform">
              View Collection &rarr;
            </span>
          </div>
        )}

        {/* Playlists */}
        {(activeFilter === 'all' || activeFilter === 'playlists') && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-display">Playlists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {allPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => openPlaylist(pl)}
                  className="p-3.5 rounded-2xl bg-[#141A23] hover:bg-[#1B232E] border border-[#202A34] cursor-pointer group transition-all hover:-translate-y-1 shadow-lg"
                >
                  <img
                    src={pl.coverUrl}
                    alt={pl.name}
                    className="w-full aspect-square object-cover rounded-xl mb-3 shadow group-hover:scale-105 transition-transform duration-300"
                  />
                  <h4 className="text-sm font-bold text-white font-display truncate group-hover:text-[#B6F36B] transition-colors">
                    {pl.name}
                  </h4>
                  <p className="text-xs text-[#929DA8] truncate">{pl.tracks.length} tracks</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {(activeFilter === 'all' || activeFilter === 'albums') && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-display">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {SAMPLE_ALBUMS.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => openAlbum(alb)}
                  className="p-3.5 rounded-2xl bg-[#141A23] hover:bg-[#1B232E] border border-[#202A34] cursor-pointer group transition-all hover:-translate-y-1 shadow-lg"
                >
                  <img
                    src={alb.coverUrl}
                    alt={alb.title}
                    className="w-full aspect-square object-cover rounded-xl mb-3 shadow group-hover:scale-105 transition-transform duration-300"
                  />
                  <h4 className="text-sm font-bold text-white font-display truncate group-hover:text-[#B6F36B] transition-colors">
                    {alb.title}
                  </h4>
                  <p className="text-xs text-[#929DA8] truncate">{alb.artist}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Artists */}
        {(activeFilter === 'all' || activeFilter === 'artists') && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white font-display">Artists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {SAMPLE_ARTISTS.map((art) => (
                <div
                  key={art.id}
                  onClick={() => openArtist(art)}
                  className="p-3.5 rounded-2xl bg-[#141A23] hover:bg-[#1B232E] border border-[#202A34] cursor-pointer group transition-all hover:-translate-y-1 text-center shadow-lg"
                >
                  <img
                    src={art.avatarUrl}
                    alt={art.name}
                    className="w-24 h-24 mx-auto rounded-full object-cover mb-3 shadow-md group-hover:scale-105 transition-transform duration-300 border-2 border-[#202A34]"
                  />
                  <h4 className="text-sm font-bold text-white font-display truncate group-hover:text-[#B6F36B] transition-colors">
                    {art.name}
                  </h4>
                  <p className="text-[11px] text-[#929DA8]">Artist</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
