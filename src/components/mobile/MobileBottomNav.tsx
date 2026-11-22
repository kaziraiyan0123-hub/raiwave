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
      <div className="bg-[#12141D]/90 backdrop-blur-2xl border border-white/10 rounded-full px-4 py-2 flex items-center justify-around shadow-2xl shadow-black/90">
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
                <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-white shadow-[0_0_18px_rgba(139,92,246,0.45)] transition-transform scale-105">
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors">
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
