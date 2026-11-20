import React from 'react'
import { Compass, Flame, Radio, Zap, Moon, Headphones, HeartHandshake, Dumbbell } from 'lucide-react'
import { usePlayer } from '../../context/PlayerContext'
import { GENRE_CATEGORIES, SAMPLE_TRACKS } from '../../data/musicData'

export const ExploreView: React.FC = () => {
  const { playTrack, setSearchQuery, navigateTo } = usePlayer()

  const MOOD_COLLECTIONS = [
    {
      title: 'Midnight Drive',
      subtitle: 'Atmospheric synths and nighttime basslines',
      icon: Moon,
      gradient: 'from-blue-600 to-indigo-900',
      tag: 'Synthpop',
    },
    {
      title: 'Energy Boost',
      subtitle: 'High-octane anthems to supercharge your day',
      icon: Zap,
      gradient: 'from-amber-500 to-rose-700',
      tag: 'Pop',
    },
    {
      title: 'Deep Focus & Lofi',
      subtitle: 'Mellow beats for studying and coding',
      icon: Headphones,
      gradient: 'from-emerald-600 to-teal-900',
      tag: 'Lo-Fi',
    },
    {
      title: 'Workout & Power',
      subtitle: 'Heavy beats and pulse-pounding rhythms',
      icon: Dumbbell,
      gradient: 'from-red-600 to-orange-800',
      tag: 'Hip-Hop',
    },
    {
      title: 'Melancholy & Blues',
      subtitle: 'Soulful chords and deep emotions',
      icon: HeartHandshake,
      gradient: 'from-purple-700 to-slate-900',
      tag: 'Blues',
    },
    {
      title: 'Live Frequencies',
      subtitle: 'Concerts and acoustic sessions',
      icon: Radio,
      gradient: 'from-teal-500 to-cyan-800',
      tag: 'Rock',
    },
  ]

  const handleMoodClick = (tag: string) => {
    setSearchQuery(tag)
    navigateTo('search')
  }

  return (
    <div className="p-4 sm:p-6 space-y-8 select-none pb-28 md:pb-20">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#B6F36B] font-heading">
          <Compass className="w-4 h-4" />
          <span>EXPLORE FREQUENCIES</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
          Browse All Music & Moods
        </h1>
        <p className="text-xs sm:text-sm text-[#929DA8]">
          Discover curated soundscapes, trending vibes, and global genres tailored to your sonic taste.
        </p>
      </div>

      {/* Moods & Vibes Grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#B6F36B]" />
          <h2 className="text-xl font-bold text-white font-heading tracking-tight">
            Curated Moods & Vibes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOOD_COLLECTIONS.map((mood) => {
            const Icon = mood.icon
            return (
              <div
                key={mood.title}
                onClick={() => handleMoodClick(mood.tag)}
                className={`p-5 rounded-2xl bg-gradient-to-br ${mood.gradient} cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group border border-white/10`}
              >
                <div className="relative z-10 flex flex-col justify-between h-28">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-black/30 backdrop-blur-md text-white">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-white/10 px-2.5 py-1 rounded-full">
                      {mood.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white font-heading truncate">
                      {mood.title}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-1">{mood.subtitle}</p>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
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
              onClick={() => handleMoodClick(genre.name)}
              className="p-5 rounded-2xl bg-[#141A23] hover:bg-[#1B232E] border border-white/5 hover:border-[#B6F36B]/30 cursor-pointer transition-all duration-200 group flex flex-col justify-between h-32 relative overflow-hidden shadow-md"
            >
              <div
                className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]"
                style={{ backgroundColor: genre.color, color: genre.color }}
              />

              <div className="relative z-10">
                <h4 className="text-base font-bold text-white font-heading group-hover:text-[#B6F36B] transition-colors">
                  {genre.name}
                </h4>
                <span className="text-[11px] text-[#929DA8]">Discover hits</span>
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
              className="flex items-center gap-3 p-3 rounded-xl bg-[#141A23]/60 hover:bg-[#1B232E] border border-white/5 cursor-pointer transition-all group"
            >
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-12 h-12 rounded-xl object-cover shadow"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-semibold text-white font-heading truncate group-hover:text-[#B6F36B] transition-colors">
                  {track.title}
                </span>
                <span className="text-[11px] text-[#929DA8] truncate">{track.artist}</span>
              </div>
              <span className="text-[10px] font-bold text-[#B6F36B] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#B6F36B]/10 border border-[#B6F36B]/20">
                {track.genre}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
