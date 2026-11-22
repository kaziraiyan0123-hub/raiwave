import React from 'react'
import { Sparkles, Music } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

export const ToastNotification: React.FC = () => {
  const { toastMessage } = usePlayer()

  if (!toastMessage) return null

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none">
      <div className="animate-toast flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#12141D]/95 backdrop-blur-xl border border-white/10 text-white shadow-2xl shadow-black/80 text-xs font-semibold">
        <span className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
          <Music className="w-3.5 h-3.5 text-[#8B5CF6]" />
        </span>
        <span className="truncate max-w-sm sm:max-w-md">{toastMessage}</span>
        <Sparkles className="w-3.5 h-3.5 text-[#A78BFA] ml-1 flex-shrink-0 animate-pulse" />
      </div>
    </div>
  )
}
