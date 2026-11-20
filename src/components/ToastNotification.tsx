import React from 'react'
import { Sparkles, Music } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

export const ToastNotification: React.FC = () => {
  let toastMessage: string | null = null
  try {
    const player = usePlayer()
    toastMessage = player.toastMessage
  } catch {
    return null
  }

  if (!toastMessage) return null

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none">
      <div className="animate-toast flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#141A23]/95 backdrop-blur-xl border border-[#202A34] text-white shadow-2xl shadow-black/80 text-xs font-semibold">
        <span className="w-6 h-6 rounded-full bg-[#B6F36B]/20 border border-[#B6F36B]/40 flex items-center justify-center flex-shrink-0">
          <Music className="w-3.5 h-3.5 text-[#B6F36B]" />
        </span>
        <span className="truncate max-w-sm sm:max-w-md">{toastMessage}</span>
        <Sparkles className="w-3.5 h-3.5 text-[#52D6C9] ml-1 flex-shrink-0 animate-pulse" />
      </div>
    </div>
  )
}
