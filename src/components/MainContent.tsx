import React, { useRef, useEffect } from 'react'
import { usePlayer } from '../context/PlayerContext'
import { HomeView } from './views/HomeView'
import { ExploreView } from './views/ExploreView'
import { SearchView } from './views/SearchView'
import { LibraryView } from './views/LibraryView'
import { PlaylistView } from './views/PlaylistView'
import { LikedSongsView } from './views/LikedSongsView'
import { LyricsView } from './views/LyricsView'
import { QueueView } from './views/QueueView'
import { AlbumView } from './views/AlbumView'
import { ArtistView } from './views/ArtistView'

export const MainContent: React.FC = () => {
  const { currentView, selectedArtist, selectedAlbum, selectedPlaylist } = usePlayer()
  const mainRef = useRef<HTMLElement | null>(null)

  // Automatically reset scroll position to top whenever navigating to a new view or target
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [currentView, selectedArtist?.id, selectedAlbum?.id, selectedPlaylist?.id])

  return (
    <main
      ref={mainRef}
      className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-[#090D13] relative custom-scrollbar flex flex-col touch-pan-y overscroll-contain"
    >
      {currentView === 'home' && <HomeView />}
      {currentView === 'explore' && <ExploreView />}
      {currentView === 'search' && <SearchView />}
      {currentView === 'library' && <LibraryView />}
      {currentView === 'playlist' && <PlaylistView />}
      {currentView === 'liked' && <LikedSongsView />}
      {currentView === 'lyrics' && <LyricsView />}
      {currentView === 'queue' && <QueueView />}
      {currentView === 'album' && <AlbumView />}
      {currentView === 'artist' && <ArtistView />}
      {currentView === 'visualizer' && <HomeView />}
    </main>
  )
}
