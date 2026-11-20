import React from 'react'
import { Home, Compass, Search, Bookmark } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import type { ViewMode } from '../../types'

export const MobileBottomNav: React.FC = () => {
  const { currentView, navigateTo } = usePlayer()

  const navItems: { view: ViewMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { view: 'home', label: 'Home', icon: Home },
    { view: 'explore', label: 'Explore', icon: Compass },
    { view: 'search', label: 'Search', icon: Search },
    { view: 'library', label: 'Library', icon: Bookmark },
  ]

  return (
    <nav className="md:hidden fixed bottom-3 left-4 right-4 z-40 select-none">
      <div className="bg-[#141A23]/90 backdrop-blur-2xl border border-white/10 rounded-full px-4 py-2 flex items-center justify-around shadow-2xl shadow-black/90">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.view

          return (
            <button
              key={item.view}
              data-testid={`nav-${item.view}`}
              onClick={() => navigateTo(item.view)}
              className="flex flex-col items-center justify-center transition-all duration-200 relative group py-1"
            >
              {isActive ? (
                <div className="w-11 h-11 rounded-full bg-[#B6F36B] flex items-center justify-center text-[#090D13] shadow-[0_0_15px_rgba(182,243,107,0.4)] transition-transform scale-105">
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#929DA8] hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
