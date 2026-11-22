import React, { useState } from 'react'
import { X, Music } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext'

interface CreatePlaylistModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
  const { createPlaylist, openPlaylist } = usePlayer()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newPlaylist = createPlaylist(name.trim(), description.trim())
    setName('')
    setDescription('')
    onClose()
    openPlaylist(newPlaylist)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#12141D] text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#202A34]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202A34]">
          <h2 className="text-xl font-bold font-display text-white">Create New Playlist</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 rounded-xl bg-[#181B27] border border-[#202A34] flex flex-col items-center justify-center text-[#94A3B8] shadow-inner flex-shrink-0">
              <Music className="w-10 h-10 text-[#52D6C9]" />
              <span className="text-[10px] mt-1 text-[#94A3B8]">RAIWAVE Sound</span>
            </div>

            <div className="flex-1 flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="My Sonic Mix"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#181B27] border border-[#202A34] focus:border-[#8B5CF6] focus:outline-none rounded-xl px-3 py-2 text-sm text-white placeholder-[#94A3B8]/60 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Add an optional vibe description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#181B27] border border-[#202A34] focus:border-[#8B5CF6] focus:outline-none rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#94A3B8]/60 resize-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#202A34]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-[#94A3B8] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2 rounded-full bg-[#8B5CF6] hover:bg-[#a3e655] disabled:bg-gray-700 disabled:opacity-50 text-black font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#8B5CF6]/20 font-display"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
