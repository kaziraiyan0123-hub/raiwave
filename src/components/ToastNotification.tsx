import React from 'react'
import { Sparkles, Music } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

export const ToastNotification: React.FC = () => {
  const { toastMessage } = usePlayer()

  if (!toastMessage) return null

  return (
    <div className="fixed top-[68px] md:top-5 inset-x-0 z-[100] pointer-events-none select-none flex justify-center px-3 safe-top">
      <div className="animate-toast max-w-[calc(100vw-24px)] sm:max-w-md w-fit mx-auto overflow-hidden flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl sm:rounded-full bg-[#12141D]/95 backdrop-blur-xl border border-white/15 text-white shadow-2xl shadow-black/80 text-xs font-semibold">
        <span className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
          <Music className="w-3.5 h-3.5 text-[#8B5CF6]" />
        </span>
        <span className="line-clamp-2 min-w-0 leading-snug text-left">{toastMessage}</span>
        <Sparkles className="w-3.5 h-3.5 text-[#A78BFA] ml-0.5 flex-shrink-0 animate-pulse" />
      </div>
    </div>
  )
}
