import React from 'react'
import {
  Compass,
  Flame,
  Radio,
  Zap,
  Moon,
  Headphones,
  HeartHandshake,
  Dumbbell,
  Play,
  Sparkles,
  Heart,
} from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { GENRE_CATEGORIES, SAMPLE_TRACKS } from '../../data/musicData'

export const ExploreView: React.FC = () => {
  const { playTrack, setSearchQuery, navigateTo, playMoodStation } = usePlayer()

  const MOOD_COLLECTIONS = [
    {
      title: 'Midnight Drive',
      subtitle: 'Atmospheric synths and nighttime basslines',
      icon: Moon,
      gradient: 'from-blue-600 via-indigo-900 to-[#0B0D13]',
      tag: 'Synthwave',
      vibeColor: '#6366F1',
    },
    {
      title: 'Energy Boost',
      subtitle: 'High-octane anthems to supercharge your day',
      icon: Zap,
      gradient: 'from-amber-500 via-rose-700 to-[#0B0D13]',
      tag: 'Pop',
      vibeColor: '#F59E0B',
    },
    {
      title: 'Deep Focus & Lofi',
      subtitle: 'Mellow beats for studying and coding',
      icon: Headphones,
      gradient: 'from-emerald-600 via-teal-900 to-[#0B0D13]',
      tag: 'Lo-Fi',
      vibeColor: '#10B981',
    },
    {
      title: 'Workout & Power',
      subtitle: 'Heavy beats and pulse-pounding rhythms',
      icon: Dumbbell,
      gradient: 'from-red-600 via-orange-800 to-[#0B0D13]',
      tag: 'Hip-Hop',
      vibeColor: '#EF4444',
    },
    {
      title: 'Melancholy & Blues',
      subtitle: 'Soulful chords and deep emotions',
      icon: HeartHandshake,
      gradient: 'from-purple-700 via-slate-900 to-[#0B0D13]',
      tag: 'Blues',
      vibeColor: '#8B5CF6',
    },
    {
      title: 'Live Frequencies',
      subtitle: 'Concerts, stadiums, and acoustic sessions',
      icon: Radio,
      gradient: 'from-teal-500 via-cyan-800 to-[#0B0D13]',
      tag: 'Rock',
      vibeColor: '#14B8A6',
    },
    {
      title: 'Romantic & Soul',
      subtitle: 'Intimate melodies and heartfelt serenades',
      icon: Heart,
      gradient: 'from-rose-600 via-pink-900 to-[#0B0D13]',
      tag: 'Soul',
      vibeColor: '#EC4899',
    },
    {
      title: 'Chill & Relax',
      subtitle: 'Calm soundscapes and acoustic warmth',
      icon: Sparkles,
      gradient: 'from-sky-600 via-blue-900 to-[#0B0D13]',
      tag: 'Acoustic',
      vibeColor: '#0EA5E9',
    },
  ]

  const handleLaunchMood = (mood: typeof MOOD_COLLECTIONS[0], e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    playMoodStation(mood.title, mood.tag)
  }

  const handleExploreTag = (tag: string) => {
    setSearchQuery(tag)
    navigateTo('search')
  }

  return (
    <div className="p-4 sm:p-6 space-y-8 select-none pb-40 md:pb-24">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#8B5CF6] font-heading">
          <Compass className="w-4 h-4" />
          <span>EXPLORE FREQUENCIES</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
          Browse All Music & Moods
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Discover curated soundscapes, live mood stations, and global genres tailored to your taste.
        </p>
      </div>

      {/* Moods & Vibes Section (Fixed with real Mood Radio launch) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#8B5CF6]" />
            <h2 className="text-xl font-bold text-white font-heading tracking-tight">
              Curated Mood Stations & Vibes
            </h2>
          </div>
          <span className="text-xs text-[#94A3B8]">Tap play to launch station</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOOD_COLLECTIONS.map((mood) => {
            const Icon = mood.icon
            return (
              <div
                key={mood.title}
                onClick={() => handleLaunchMood(mood)}
                className={`p-5 rounded-3xl bg-gradient-to-br ${mood.gradient} cursor-pointer shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group border border-white/10 flex flex-col justify-between h-40`}
              >
                {/* Top Badge & Play Trigger */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="p-2.5 rounded-2xl bg-black/40 backdrop-blur-md text-white border border-white/10 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </span>

                  <button
                    onClick={(e) => handleLaunchMood(mood, e)}
                    className="w-10 h-10 rounded-full bg-[#8B5CF6] text-[#0B0D13] flex items-center justify-center shadow-lg shadow-black/50 hover:scale-110 active:scale-95 transition-transform"
                    title={`Play ${mood.title} station`}
                  >
                    <Play className="w-4 h-4 fill-[#0B0D13] ml-0.5" />
                  </button>
                </div>

                {/* Bottom Details */}
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6] font-mono">
                    {mood.tag} Frequency
                  </span>
                  <h3 className="text-lg font-black text-white font-heading truncate">
                    {mood.title}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{mood.subtitle}</p>
                </div>

                {/* Ambient Glow */}
                <div
                  className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity"
                  style={{ backgroundColor: mood.vibeColor }}
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* All Genres Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white font-heading tracking-tight">
          Explore by Genre
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {GENRE_CATEGORIES.map((genre) => (
            <div
              key={genre.id}
              onClick={() => handleExploreTag(genre.name)}
              className="p-5 rounded-2xl bg-[#12141D] hover:bg-[#181B27] border border-white/5 hover:border-[#8B5CF6]/30 cursor-pointer transition-all duration-200 group flex flex-col justify-between h-32 relative overflow-hidden shadow-md"
            >
              <div
                className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
                style={{ backgroundColor: genre.color, color: genre.color }}
              />

              <div className="relative z-10">
                <h4 className="text-base font-bold text-white font-heading group-hover:text-[#8B5CF6] transition-colors">
                  {genre.name}
                </h4>
                <span className="text-[11px] text-[#94A3B8]">Discover hits</span>
              </div>

              <div
                className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-20 blur-lg pointer-events-none group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: genre.color }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Instant Trending Quick Play */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white font-heading tracking-tight">
          Trending Tracks Right Now
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_TRACKS.slice(0, 6).map((track) => (
            <div
              key={track.id}
              onClick={() => playTrack(track, SAMPLE_TRACKS)}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#12141D]/60 hover:bg-[#181B27] border border-white/5 cursor-pointer transition-all group"
            >
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-12 h-12 rounded-xl object-cover shadow"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-semibold text-white font-heading truncate group-hover:text-[#8B5CF6] transition-colors">
                  {track.title}
                </span>
                <span className="text-[11px] text-[#94A3B8] truncate">{track.artist}</span>
              </div>
              <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                {track.genre}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
