import React, { useState } from 'react'
import { X, Mail, User, Code2, Music, Mic, CheckCircle2, Sparkles, ArrowRight, Download } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

export const ProfileModal: React.FC = () => {
  const { userProfile, isProfileOpen, toggleProfile, updateUserProfile, likedTrackIds, userPlaylists, recordings } = usePlayer()

  const [name, setName] = useState(userProfile.name)
  const [email, setEmail] = useState(userProfile.email)
  const [isSaved, setIsSaved] = useState(false)
  const [isGoogleLinking, setIsGoogleLinking] = useState(false)

  if (!isProfileOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateUserProfile({
      name: name.trim() || 'Kazi Raiyan',
      email: email.trim() || 'kaziraiyan0123@gmail.com',
    })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleSimulateGoogleLogin = () => {
    setIsGoogleLinking(true)
    setTimeout(() => {
      setName('Kazi Raiyan')
      setEmail('kaziraiyan0123@gmail.com')
      updateUserProfile({
        name: 'Kazi Raiyan',
        email: 'kaziraiyan0123@gmail.com',
      })
      setIsGoogleLinking(false)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2500)
    }, 800)
  }

  const handleExportLibrary = () => {
    const backup = {
      profile: userProfile,
      likedTracks: likedTrackIds,
      playlists: userPlaylists,
      recordings: recordings.map(r => ({ id: r.id, title: r.title, duration: r.duration, createdAt: r.createdAt })),
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `raiwave-library-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="bg-[#141A23] text-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#202A34] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#202A34] flex items-center justify-between bg-[#1B232E]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#52D6C9]/15 border border-[#52D6C9]/30 flex items-center justify-center text-[#52D6C9]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Gmail Account & Profile</h2>
              <p className="text-[11px] text-[#929DA8]">Manage your synchronized RAIWAVE music identity</p>
            </div>
          </div>
          <button
            onClick={toggleProfile}
            className="p-1.5 rounded-full text-[#929DA8] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          {/* Developer Credit Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#B6F36B]/10 via-[#52D6C9]/10 to-transparent border border-[#B6F36B]/30 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#B6F36B] text-[#090D13] flex items-center justify-center font-black font-display flex-shrink-0 shadow-lg shadow-[#B6F36B]/20">
              <Code2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#B6F36B] font-display">
                  Official Developer
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#52D6C9]/20 text-[#52D6C9] text-[9px] font-bold">
                  Verified Creator
                </span>
              </div>
              <h3 className="text-base font-black text-white font-display tracking-tight">
                Kazi Raiyan
              </h3>
              <p className="text-xs text-[#929DA8]">
                Lead Engineer & Architect of RAIWAVE ("Feel Every Frequency.")
              </p>
            </div>
          </div>

          {/* Quick Google Sign In / Sync Button */}
          <div className="p-4 rounded-2xl bg-[#1B232E] border border-[#202A34] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white">Google Workspace / Gmail</p>
                <p className="text-[11px] text-[#52D6C9] truncate">{userProfile.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateGoogleLogin}
              disabled={isGoogleLinking}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold font-display transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-white/10 flex-shrink-0"
            >
              {isGoogleLinking ? (
                <span>Syncing...</span>
              ) : (
                <>
                  <span>Sync Google Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* User Details Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#929DA8] uppercase tracking-wider block mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#929DA8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kazi Raiyan"
                  className="w-full bg-[#1B232E] border border-[#202A34] focus:border-[#B6F36B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#929DA8]/60 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#929DA8] uppercase tracking-wider block mb-1.5">
                Gmail Account
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#929DA8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kaziraiyan0123@gmail.com"
                  className="w-full bg-[#1B232E] border border-[#202A34] focus:border-[#B6F36B] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#929DA8]/60 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Profile Metrics */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-[#1B232E]/60 border border-[#202A34] text-center">
                <Music className="w-4 h-4 mx-auto text-[#B6F36B] mb-1" />
                <span className="text-lg font-black text-white font-display">{likedTrackIds.length}</span>
                <p className="text-[10px] text-[#929DA8]">Liked Tracks</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#1B232E]/60 border border-[#202A34] text-center">
                <Sparkles className="w-4 h-4 mx-auto text-[#52D6C9] mb-1" />
                <span className="text-lg font-black text-white font-display">{userPlaylists.length}</span>
                <p className="text-[10px] text-[#929DA8]">Playlists</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#1B232E]/60 border border-[#202A34] text-center">
                <Mic className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                <span className="text-lg font-black text-white font-display">{recordings.length}</span>
                <p className="text-[10px] text-[#929DA8]">Recordings</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-[#202A34]">
              <button
                type="button"
                onClick={handleExportLibrary}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#929DA8] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Download full library backup JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup JSON</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#B6F36B] hover:bg-[#a3e655] text-[#090D13] font-bold text-xs font-display transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#B6F36B]/20 flex items-center gap-1.5"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#090D13]" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
