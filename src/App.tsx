import { PlayerProvider, usePlayer } from './context/PlayerContext'
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
import { AndroidMediaNotificationCard } from './components/AndroidMediaNotificationCard'

function MainAppShell() {
  const { dynamicTheme } = usePlayer()

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B0D13] text-[#F8FAFC] relative font-sans transition-colors duration-1000">
      {/* Subtle Futuristic Ambient Lighting Wash (Dynamically reacts to album artwork) */}
      <div
        className="absolute top-0 left-1/4 w-[650px] h-[380px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle, ${dynamicTheme.accentGlow} 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-10 right-1/4 w-[550px] h-[320px] rounded-full blur-[130px] pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle, ${dynamicTheme.surfaceGlow} 0%, transparent 70%)`,
        }}
      />

      {/* Floating Glass Feedback Toast */}
      <ToastNotification />

      {/* User Gmail Profile & Account Modal */}
      <ProfileModal />

      {/* Premium Android-Style Music Notification Card (Compact & Expanded) */}
      <AndroidMediaNotificationCard />

      {/* Mobile Top Header (hidden on desktop) */}
      <MobileTopBar />

      {/* Main Application Body */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Desktop Left Sidebar (hidden on mobile) */}
        <Sidebar />

        {/* Central Workspace Container */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0B0D13] md:bg-[#12141D]/90 backdrop-blur-2xl md:rounded-3xl md:my-2 md:border md:border-white/5 relative shadow-2xl">
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
  )
}

function App() {
  return (
    <PlayerProvider>
      <MainAppShell />
    </PlayerProvider>
  )
}

export default App
