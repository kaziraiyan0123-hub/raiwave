import { PlayerProvider } from './context/PlayerContext'
import { Sidebar } from './components/Sidebar'
import { TopNav } from './components/TopNav'
import { MainContent } from './components/MainContent'
import { RightCompanionPane } from './components/RightCompanionPane'
import { PlayerBar } from './components/PlayerBar'
import { MobileTopBar } from './components/mobile/MobileTopBar'
import { MobileBottomNav } from './components/mobile/MobileBottomNav'
import { MobileMiniPlayer } from './components/mobile/MobileMiniPlayer'
import { MobileFullPlayer } from './components/mobile/MobileFullPlayer'
import { YouTubeIframeContainer } from './components/YouTubeIframeContainer'
import { ToastNotification } from './components/ToastNotification'
import { ProfileModal } from './components/ProfileModal'

function App() {
  return (
    <PlayerProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090D13] text-[#F5F7FA] relative font-sans">
        {/* Floating Glass Feedback Toast */}
        <ToastNotification />

        {/* User Gmail Profile & Account Modal */}
        <ProfileModal />

        {/* Mobile Top Header (hidden on desktop) */}
        <MobileTopBar />

        {/* Main Application Body */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Desktop Left Sidebar (hidden on mobile) */}
          <Sidebar />

          {/* Central Workspace Container */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#090D13] md:bg-[#141A23]/60 md:rounded-2xl md:my-2 md:border md:border-white/5 relative">
            <TopNav />
            <MainContent />
          </div>

          {/* Desktop Right Companion Pane (Image 5 - Top Hits + My Library) */}
          <RightCompanionPane />
        </div>

        {/* Persistent Bottom Player Bar for Desktop */}
        <PlayerBar />

        {/* Mobile Mini Player Bar (floating above mobile nav) */}
        <MobileMiniPlayer />

        {/* Mobile Bottom Navigation Bar (Home, Explore, Search, Library) */}
        <MobileBottomNav />

        {/* Signature Fullscreen Mobile Player View (Arc Scrubber & Ripple Rings) */}
        <MobileFullPlayer />

        {/* Official YouTube Embed Stage / Video Canvas Dock */}
        <YouTubeIframeContainer />
      </div>
    </PlayerProvider>
  )
}

export default App
