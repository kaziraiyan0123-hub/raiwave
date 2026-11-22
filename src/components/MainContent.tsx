import React from 'react'
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
import { VisualizerView } from './views/VisualizerView'

export const MainContent: React.FC = () => {
  const { currentView } = usePlayer()

  return (
    <main className="flex-1 overflow-y-auto bg-[#090D13] relative custom-scrollbar flex flex-col">
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
      {currentView === 'visualizer' && <VisualizerView />}
    </main>
  )
}
