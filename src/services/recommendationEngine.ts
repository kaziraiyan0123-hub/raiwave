import type { Playlist, Track } from '../types'
import { SAMPLE_TRACKS } from '../data/musicData'
import { CURATED_ARTISTS } from './artistService'

export type DiscoveryPreference = 'familiar' | 'balanced' | 'discover'

export interface TasteProfile {
  genreWeights: Record<string, number>
  artistWeights: Record<string, number>
  skipCounts: Record<string, number>
  playCounts: Record<string, number>
  searchKeywords: string[]
  discoveryPreference: DiscoveryPreference
  lastUpdated: number
}

const TASTE_KEY = 'raiwave_taste_profile_v1'
export const TASTE_UPDATED_EVENT = 'raiwave-taste-updated'

function defaultTasteProfile(): TasteProfile {
  return {
    genreWeights: {},
    artistWeights: {},
    skipCounts: {},
    playCounts: {},
    searchKeywords: [],
    discoveryPreference: 'balanced',
    lastUpdated: Date.now(),
  }
}

export interface RecommendationSection {
  id: string
  title: string
  subtitle: string
  tracks: Track[]
}

function normalizeTrackIdentity(t: Track): string {
  return `${t.title.toLowerCase().trim()}|${t.artist.toLowerCase().trim()}`
}

function deduplicateTracks(tracks: Track[]): Track[] {
  const seen = new Set<string>()
  const out: Track[] = []
  for (const t of tracks) {
    const key = normalizeTrackIdentity(t)
    if (!seen.has(t.id) && !seen.has(key)) {
      seen.add(t.id)
      seen.add(key)
      out.push(t)
    }
  }
  return out
}

function getPreferredMixOrder(): string[] {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return ['Acoustic', 'Lofi', 'Indie', 'Pop']
  if (hour >= 12 && hour < 18) return ['Pop', 'Synthpop', 'Indie', 'Bengali']
  return ['Lofi', 'Romantic', 'Bengali', 'Acoustic']
}

class RecommendationEngine {
  private profile: TasteProfile

  constructor() {
    this.profile = this.loadProfile()
  }

  private loadProfile(): TasteProfile {
    try {
      const saved = localStorage.getItem(TASTE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<TasteProfile>
        return {
          ...defaultTasteProfile(),
          ...parsed,
          genreWeights: parsed.genreWeights || {},
          artistWeights: parsed.artistWeights || {},
          skipCounts: parsed.skipCounts || {},
          playCounts: parsed.playCounts || {},
          searchKeywords: parsed.searchKeywords || [],
        }
      }
    } catch {
      // Ignore parse failures
    }
    return defaultTasteProfile()
  }

  private saveProfile() {
    try {
      this.profile.lastUpdated = Date.now()
      localStorage.setItem(TASTE_KEY, JSON.stringify(this.profile))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(TASTE_UPDATED_EVENT))
      }
    } catch {
      // Ignore storage quota errors
    }
  }

  public getProfile(): TasteProfile {
    return this.profile
  }

  public setDiscoveryPreference(pref: DiscoveryPreference) {
    this.profile.discoveryPreference = pref
    this.saveProfile()
  }

  public recordPlay(track: Track) {
    if (!track) return
    const g = track.genre || 'Music'
    const a = track.artist || 'Artist'

    this.profile.genreWeights[g] = Math.min(25, (this.profile.genreWeights[g] || 0) + 1)
    this.profile.artistWeights[a] = Math.min(25, (this.profile.artistWeights[a] || 0) + 1.5)
    this.profile.playCounts[track.id] = (this.profile.playCounts[track.id] || 0) + 1

    if (this.profile.skipCounts[track.id]) {
      this.profile.skipCounts[track.id] = Math.max(0, this.profile.skipCounts[track.id] - 1)
    }
    this.saveProfile()
  }

  public recordLike(track: Track, isLiked: boolean) {
    if (!track) return
    const g = track.genre || 'Music'
    const a = track.artist || 'Artist'

    if (isLiked) {
      this.profile.genreWeights[g] = Math.min(25, (this.profile.genreWeights[g] || 0) + 3)
      this.profile.artistWeights[a] = Math.min(25, (this.profile.artistWeights[a] || 0) + 4)
      delete this.profile.skipCounts[track.id]
    } else {
      this.profile.genreWeights[g] = Math.max(0, (this.profile.genreWeights[g] || 0) - 2)
      this.profile.artistWeights[a] = Math.max(0, (this.profile.artistWeights[a] || 0) - 3)
    }
    this.saveProfile()
  }

  public recordSkip(track: Track) {
    if (!track) return
    const g = track.genre || 'Music'
    const a = track.artist || 'Artist'

    this.profile.skipCounts[track.id] = (this.profile.skipCounts[track.id] || 0) + 1
    this.profile.genreWeights[g] = Math.max(0, (this.profile.genreWeights[g] || 0) - 0.5)
    this.profile.artistWeights[a] = Math.max(0, (this.profile.artistWeights[a] || 0) - 0.8)
    this.saveProfile()
  }

  public recordSearch(query: string) {
    const clean = query.trim().toLowerCase()
    if (clean.length < 2) return
    const updated = [clean, ...this.profile.searchKeywords.filter((q) => q !== clean)].slice(0, 12)
    this.profile.searchKeywords = updated
    this.saveProfile()
  }

  private scoreTrack(
    track: Track,
    likedIds: Set<string>,
    playlistArtistHits: Set<string>,
    playlistGenreHits: Set<string>
  ): number {
    const g = track.genre || 'Music'
    const a = track.artist || 'Artist'
    const pref = this.profile.discoveryPreference

    const gWeight = this.profile.genreWeights[g] || 0
    const aWeight = this.profile.artistWeights[a] || 0
    const plays = this.profile.playCounts[track.id] || 0
    const skips = this.profile.skipCounts[track.id] || 0
    const isLiked = likedIds.has(track.id)

    let score = gWeight * 2.1 + aWeight * 2.8

    if (playlistArtistHits.has(a.toLowerCase())) score += 5
    if (playlistGenreHits.has(g.toLowerCase())) score += 3.5

    // Search history affinity boost
    const hay = `${track.title} ${track.artist} ${track.genre}`.toLowerCase()
    for (let i = 0; i < Math.min(5, this.profile.searchKeywords.length); i++) {
      if (hay.includes(this.profile.searchKeywords[i])) {
        score += 4 - i * 0.5
      }
    }

    // Time-of-day vibe alignment when taste profile is sparse
    const timeGenres = getPreferredMixOrder()
    if (timeGenres.some((tg) => g.toLowerCase().includes(tg.toLowerCase()))) {
      score += 2
    }

    if (isLiked) score += pref === 'discover' ? -3 : 6

    if (pref === 'familiar') {
      score += plays * 3.2
    } else if (pref === 'discover') {
      score -= plays * 4.5
      if (plays === 0 && !isLiked) score += 8
    } else {
      score += Math.min(plays, 4) * 1.4
    }

    score -= skips * 6
    return score
  }

  public generatePersonalizedSections(
    history: Track[],
    likedTracks: Track[],
    playlists: Playlist[] = [],
    realtimePool: Track[] = []
  ): RecommendationSection[] {
    const poolRaw: Track[] = [...SAMPLE_TRACKS, ...realtimePool]
    for (const ca of CURATED_ARTISTS) {
      poolRaw.push(...ca.topTracks)
    }
    for (const pl of playlists) {
      poolRaw.push(...(pl.tracks || []))
    }
    const allPool = deduplicateTracks(poolRaw)
    const likedIds = new Set(likedTracks.map((t) => t.id))

    // Harvest genre & artist signals from user's playlists
    const playlistArtistHits = new Set<string>()
    const playlistGenreHits = new Set<string>()
    for (const pl of playlists) {
      for (const pt of pl.tracks || []) {
        if (pt.artist) playlistArtistHits.add(pt.artist.toLowerCase())
        if (pt.genre) playlistGenreHits.add(pt.genre.toLowerCase())
      }
    }

    // Filter out heavily skipped tracks (>= 2 early skips) unless user explicitly liked them
    const eligiblePool = allPool.filter(
      (t) => likedIds.has(t.id) || (this.profile.skipCounts[t.id] || 0) < 2
    )

    const scoredPool = eligiblePool
      .map((t) => ({
        track: t,
        score: this.scoreTrack(t, likedIds, playlistArtistHits, playlistGenreHits),
      }))
      .sort((a, b) => b.score - a.score)

    const sections: RecommendationSection[] = []

    // 1. Primary Personalized Mix reacting live to Familiar / Balanced / Discover
    const pref = this.profile.discoveryPreference
    const hasPersonalData =
      history.length > 0 ||
      likedTracks.length > 0 ||
      playlists.some((p) => (p.tracks?.length || 0) > 0) ||
      this.profile.searchKeywords.length > 0

    const topRecommended = scoredPool.map((x) => x.track).slice(0, 10)
    const modeLabel =
      pref === 'familiar'
        ? 'Your Familiar Favorites'
        : pref === 'discover'
          ? 'Fresh Discovery Picks'
          : hasPersonalData
            ? 'Recommended For You'
            : 'Featured Handpicked Mix'

    const modeSubtitle =
      pref === 'familiar'
        ? 'Focused on artists, likes, and replay favorites you love'
        : pref === 'discover'
          ? 'Unheard tracks and adjacent genres tailored to your taste'
          : hasPersonalData
            ? 'Shaped by your plays, playlists, searches, and likes'
            : 'Start playing or liking songs to sharpen your personal mix'

    if (topRecommended.length > 0) {
      sections.push({
        id: 'recommended-for-you',
        title: modeLabel,
        subtitle: modeSubtitle,
        tracks: topRecommended,
      })
    }

    // 2. "Because You Listened To [Anchor]" (from recent play or liked track)
    const anchor = history[0] || likedTracks[0]
    if (anchor) {
      const targetGenre = (anchor.genre || '').toLowerCase()
      const anchorKey = normalizeTrackIdentity(anchor)
      const similarTracks = scoredPool
        .map((x) => x.track)
        .filter((t) => {
          if (normalizeTrackIdentity(t) === anchorKey) return false
          return (
            (targetGenre && (t.genre || '').toLowerCase().includes(targetGenre)) ||
            t.artist.toLowerCase() === anchor.artist.toLowerCase()
          )
        })
        .slice(0, 8)

      if (similarTracks.length >= 2) {
        sections.push({
          id: 'because-you-listened',
          title: `Because You Listened To ${anchor.artist}`,
          subtitle: `Vibes matching ${anchor.title}`,
          tracks: similarTracks,
        })
      }
    }

    // 3. Curated Bengali / Indie / English Mix & Discovery Mix
    const topRecIds = new Set(topRecommended.map((t) => t.id))
    const discoveryTracks = scoredPool
      .map((x) => x.track)
      .filter((t) => {
        if (pref === 'familiar') return !topRecIds.has(t.id)
        return (this.profile.playCounts[t.id] || 0) === 0 && !topRecIds.has(t.id)
      })
      .slice(0, 8)

    if (discoveryTracks.length >= 3) {
      sections.push({
        id: 'discover-mix',
        title: pref === 'familiar' ? 'More From Your Vault' : 'Discover Weekly Mix',
        subtitle:
          pref === 'familiar'
            ? 'Familiar tracks from artists across your library'
            : 'Fresh Bengali, Indie & Global tracks outside your recent queue',
        tracks: discoveryTracks,
      })
    }

    return sections
  }
}

export const recommendationEngine = new RecommendationEngine()
