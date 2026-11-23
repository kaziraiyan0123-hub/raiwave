import React from 'react'
import { Home, Compass, Search, Bookmark, ListMusic } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import type { ViewMode } from '../../types'

export const MobileBottomNav: React.FC = () => {
  const { currentView, navigateTo, queue, queueIndex } = usePlayer()

  const upcomingCount = Math.max(0, queue.length - queueIndex - 1)

  const navItems: { view: ViewMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { view: 'home', label: 'Home', icon: Home },
    { view: 'explore', label: 'Explore', icon: Compass },
    { view: 'search', label: 'Search', icon: Search },
    { view: 'library', label: 'Library', icon: Bookmark },
    { view: 'queue', label: 'Up Next', icon: ListMusic },
  ]

  return (
    <nav className="md:hidden fixed bottom-2.5 left-3 right-3 z-40 select-none pb-[env(safe-area-inset-bottom,0px)] pointer-events-none">
      <div className="w-full max-w-sm mx-auto pointer-events-auto bg-[#100D1E]/95 backdrop-blur-3xl border border-white/10 rounded-full px-2 py-1.5 flex items-center justify-around shadow-[0_10px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(139,92,246,0.2)]">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.view
          const isQueueTab = item.view === 'queue'

          return (
            <button
              key={item.view}
              data-testid={`nav-${item.view}`}
              onClick={() => navigateTo(item.view)}
              className="flex flex-col items-center justify-center transition-all duration-200 relative group py-1 cursor-pointer flex-1 min-w-0"
            >
              {isActive ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_16px_rgba(147,51,234,0.5)] transition-transform scale-105 relative">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                  {isQueueTab && upcomingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-purple-900 text-[10px] font-bold flex items-center justify-center shadow">
                      {upcomingCount > 9 ? '9+' : upcomingCount}
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors relative">
                  <Icon className="w-5 h-5" />
                  {isQueueTab && upcomingCount > 0 && (
                    <span className="absolute -top-0.5 right-1.5 w-3.5 h-3.5 rounded-full bg-purple-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {upcomingCount > 9 ? '9+' : upcomingCount}
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
