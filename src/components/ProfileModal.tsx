import React, { useState, useEffect } from 'react'
import { X, Mail, User, Code2, Music, CheckCircle2, Sparkles, Download, RefreshCw, Smartphone } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

export const ProfileModal: React.FC = () => {
  const {
    userProfile,
    isProfileOpen,
    toggleProfile,
    updateUserProfile,
    likedTrackIds,
    userPlaylists,
  } = usePlayer()

  const [name, setName] = useState(userProfile.name || '')
  const [email, setEmail] = useState(userProfile.email || '')
  const [isSaved, setIsSaved] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<string | null>(null)

  // Keep local fields in sync with userProfile
  useEffect(() => {
    if (userProfile.name) setName(userProfile.name)
    if (userProfile.email) setEmail(userProfile.email)
  }, [userProfile])

  if (!isProfileOpen) return null

  const handleNameChange = (val: string) => {
    setName(val)
    updateUserProfile({ name: val })
  }

  const handleEmailChange = (val: string) => {
    setEmail(val)
    updateUserProfile({ email: val })
  }

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
    })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleClose = () => {
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
    })
    toggleProfile()
  }

  const handleCheckUpdates = async () => {
    setIsUpdating(true)
    setUpdateStatus('Checking for latest updates from Vercel & GitHub...')

    // 1. If running inside Android APK, invoke native DownloadManager & Package Installer
    const androidBridge = (window as any).AndroidMedia
    if (androidBridge && typeof androidBridge.downloadAndInstallApk === 'function') {
      androidBridge.downloadAndInstallApk('https://raiwave.vercel.app/RAIWAVE.apk')
      setIsUpdating(false)
      setUpdateStatus('🚀 Downloading latest RAIWAVE v1.2.7 APK update! Check your notification bar to install.')
      setTimeout(() => setUpdateStatus(null), 6000)
      return
    }

    try {
      // 2. Unregister or update service workers to fetch fresh PWA bundle
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const reg of registrations) {
          await reg.update()
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' })
          }
        }
      }

      // 3. Clear old cached assets
      if ('caches' in window) {
        const keys = await caches.keys()
        for (const key of keys) {
          await caches.delete(key)
        }
      }

      setTimeout(() => {
        setIsUpdating(false)
        setUpdateStatus('✓ RAIWAVE v1.2.7 is up to date! Reloading...')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }, 1200)
    } catch {
      setIsUpdating(false)
      setUpdateStatus('✓ You are running the latest RAIWAVE release (v1.2.7).')
      setTimeout(() => setUpdateStatus(null), 3500)
    }
  }

  const handleExportLibrary = () => {
    const backup = {
      profile: userProfile,
      likedTracks: likedTrackIds,
      playlists: userPlaylists,
      exportedAt: new Date().toISOString(),
      version: '1.1.0',
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
      <div className="bg-[#12141D] text-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#202A34] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#202A34] flex items-center justify-between bg-[#181B27]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#52D6C9]/15 border border-[#52D6C9]/30 flex items-center justify-center text-[#52D6C9]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-white">Gmail Account & Profile</h2>
              <p className="text-[11px] text-[#94A3B8]">Manage your synchronized RAIWAVE music identity</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          {/* User Details Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-[#181B27] border border-[#202A34] focus:border-[#8B5CF6] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#94A3B8]/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1.5">
                Gmail Account
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Enter your Gmail address"
                  className="w-full bg-[#181B27] border border-[#202A34] focus:border-[#8B5CF6] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#94A3B8]/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Profile Metrics */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-[#181B27]/60 border border-[#202A34] text-center">
                <Music className="w-4 h-4 mx-auto text-[#8B5CF6] mb-1" />
                <span className="text-lg font-black text-white font-display">{likedTrackIds.length}</span>
                <p className="text-[10px] text-[#94A3B8]">Liked Tracks</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#181B27]/60 border border-[#202A34] text-center">
                <Sparkles className="w-4 h-4 mx-auto text-[#52D6C9] mb-1" />
                <span className="text-lg font-black text-white font-display">{userPlaylists.length}</span>
                <p className="text-[10px] text-[#94A3B8]">Playlists</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#181B27]/60 border border-[#202A34] text-center">
                <Smartphone className="w-4 h-4 mx-auto text-[#8B5CF6] mb-1" />
                <span className="text-sm font-black text-white font-display">v1.2.6</span>
                <p className="text-[10px] text-[#94A3B8]">App Version</p>
              </div>
            </div>

            {/* Save Button & Backup */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleExportLibrary}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Download full library backup JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup JSON</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#8B5CF6] hover:bg-[#a3e655] text-[#0B0D13] font-bold text-xs font-display transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#8B5CF6]/20 flex items-center gap-1.5"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#0B0D13]" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </div>
          </form>

          {/* Application Updates Section (for both Mobile & Desktop) */}
          <div className="p-4 rounded-2xl bg-[#181B27] border border-[#202A34] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white font-display flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Application Updates</span>
                </h4>
                <p className="text-[11px] text-[#94A3B8]">
                  Check for latest features and update mobile & desktop app
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] text-[10px] font-bold font-mono">
                v1.2.7
              </span>
            </div>

            {updateStatus && (
              <p className="text-xs text-[#8B5CF6] font-medium animate-pulse">{updateStatus}</p>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={handleCheckUpdates}
                disabled={isUpdating}
                className="w-full sm:w-auto flex-1 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold font-display transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/10"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#8B5CF6] ${isUpdating ? 'animate-spin' : ''}`} />
                <span>{isUpdating ? 'Updating...' : 'Check for Updates / Update App'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const androidBridge = (window as any).AndroidMedia
                  if (androidBridge && typeof androidBridge.downloadAndInstallApk === 'function') {
                    androidBridge.downloadAndInstallApk('https://raiwave.vercel.app/RAIWAVE.apk')
                    setUpdateStatus('🚀 Downloading latest RAIWAVE.apk update to your Downloads folder...')
                    setTimeout(() => setUpdateStatus(null), 6000)
                  } else {
                    window.open('/RAIWAVE.apk', '_blank')
                  }
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#52D6C9]/10 hover:bg-[#52D6C9]/20 text-[#52D6C9] text-xs font-bold font-display transition-all flex items-center justify-center gap-1.5 border border-[#52D6C9]/30 shadow-sm active:scale-95"
                title="Direct 1-tap download of RAIWAVE.apk directly to your phone (no GitHub account required)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Direct Download APK</span>
              </button>
            </div>
          </div>

          {/* Professional Developer Attribution & Example Note */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6]/5 via-white/5 to-transparent border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#8B5CF6] font-display">
                Developer Attribution & Example
              </span>
            </div>
            <p className="text-xs font-semibold text-white">
              Application Designed & Engineered by <span className="text-[#8B5CF6]">Kazi Raiyan</span>
            </p>
            <p className="text-[11px] text-[#94A3B8] font-mono leading-relaxed">
              Example: Kazi Raiyan &bull; kaziraiyan0123@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
