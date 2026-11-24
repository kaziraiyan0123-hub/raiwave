import type { Track, Artist } from '../types'
import { SAMPLE_TRACKS } from '../data/musicData'
import { CURATED_ARTISTS } from './artistService'

export type DiscoveryPreference = 'familiar' | 'balanced' | 'discover'

export interface TasteProfile {
  artistWeights: Record<string, number>
  genreWeights: Record<string, number>
  playCounts: Record<string, number>
  skipCounts: Record<string, number>
  likedTrackIds: string[]
  discoveryPreference: DiscoveryPreference
  lastUpdated: number
}

const TASTE_PROFILE_KEY = 'raiwave_taste_profile'

// Default Taste Profile
const defaultProfile: TasteProfile = {
  artistWeights: {},
  genreWeights: {},
  playCounts: {},
  skipCounts: {},
  likedTrackIds: [],
  discoveryPreference: 'balanced',
  lastUpdated: Date.now(),
}

export interface RecommendationSection {
  id: string
  title: string
  subtitle: string
  type: 'tracks' | 'artists' | 'mix'
  tracks?: Track[]
  artists?: Artist[]
  reason?: string
}

class RecommendationEngine {
  private profile: TasteProfile = this.loadProfile()

  private loadProfile(): TasteProfile {
    try {
      const saved = localStorage.getItem(TASTE_PROFILE_KEY)
      if (saved) {
        return { ...defaultProfile, ...JSON.parse(saved) }
      }
    } catch {}
    return { ...defaultProfile }
  }

  private saveProfile() {
    try {
      this.profile.lastUpdated = Date.now()
      localStorage.setItem(TASTE_PROFILE_KEY, JSON.stringify(this.profile))
    } catch {}
  }

  public getProfile(): TasteProfile {
    return this.profile
  }

  public setDiscoveryPreference(pref: DiscoveryPreference) {
    this.profile.discoveryPreference = pref
    this.saveProfile()
  }

  /**
   * Record when user plays a track
   */
  public recordPlay(track: Track) {
    if (!track) return
    const artist = track.artist
    const genre = track.genre || 'Pop'

    // Increment artist weight
    this.profile.artistWeights[artist] = (this.profile.artistWeights[artist] || 0) + 3
    // Increment genre weight
    this.profile.genreWeights[genre] = (this.profile.genreWeights[genre] || 0) + 2
    // Increment play count
    this.profile.playCounts[track.id] = (this.profile.playCounts[track.id] || 0) + 1

    this.saveProfile()
  }

  /**
   * Record when user likes a track
   */
  public recordLike(track: Track, isLiked: boolean) {
    if (!track) return
    const artist = track.artist
    const genre = track.genre || 'Pop'
    const delta = isLiked ? 5 : -4

    this.profile.artistWeights[artist] = Math.max(0, (this.profile.artistWeights[artist] || 0) + delta)
    this.profile.genreWeights[genre] = Math.max(0, (this.profile.genreWeights[genre] || 0) + Math.round(delta * 0.7))

    this.saveProfile()
  }

  /**
   * Record when user skips a track early (< 30s)
   */
  public recordSkip(track: Track) {
    if (!track) return
    this.profile.skipCounts[track.id] = (this.profile.skipCounts[track.id] || 0) + 1
    const artist = track.artist
    // Slight penalty to prevent over-recommending skipped track
    this.profile.artistWeights[artist] = Math.max(0, (this.profile.artistWeights[artist] || 0) - 1)
    this.saveProfile()
  }

  /**
   * Get Top Favored Artists
   */
  public getTopArtists(limit = 3): string[] {
    return Object.entries(this.profile.artistWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([artist]) => artist)
  }

  /**
   * Get Top Favored Genres
   */
  public getTopGenres(limit = 3): string[] {
    return Object.entries(this.profile.genreWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([genre]) => genre)
  }

  /**
   * Generate All Personalized Sections
   */
  public generatePersonalizedSections(
    history: Track[] = [],
    likedTracks: Track[] = []
  ): RecommendationSection[] {
    const sections: RecommendationSection[] = []

    // Pool of available candidate tracks
    const allPool: Track[] = [...SAMPLE_TRACKS]
    // Add curated artist tracks to pool
    for (const ca of CURATED_ARTISTS) {
      for (const t of ca.topTracks) {
        if (!allPool.some((p) => p.id === t.id)) {
          allPool.push(t)
        }
      }
    }
    // Add liked tracks to pool
    for (const lt of likedTracks) {
      if (!allPool.some((p) => p.id === lt.id)) {
        allPool.push(lt)
      }
    }

    const topArtists = this.getTopArtists(2)
    const recentTrack = history[0] || likedTracks[0] || SAMPLE_TRACKS[0]

    // 1. Made For You / Your Daily Mix
    const dailyMixTracks = this.buildDailyMix(allPool, history, likedTracks)
    if (dailyMixTracks.length >= 3) {
      sections.push({
        id: 'rec-daily-mix',
        title: 'Your Daily Mix',
        subtitle: 'A blend of your favorites and discoveries tailored to your ears',
        type: 'tracks',
        tracks: dailyMixTracks,
        reason: 'Curated daily from your listening affinity',
      })
    }

    // 2. Because You Like [Top Artist]
    const primaryArtist = topArtists[0] || (recentTrack ? recentTrack.artist : null)
    if (primaryArtist) {
      const artistTracks = allPool.filter(
        (t) => t.artist.toLowerCase().includes(primaryArtist.toLowerCase())
      )
      const relatedTracks = allPool.filter(
        (t) =>
          !t.artist.toLowerCase().includes(primaryArtist.toLowerCase()) &&
          t.genre.toLowerCase() === (artistTracks[0]?.genre?.toLowerCase() || 'pop')
      )
      const combined = [...artistTracks, ...relatedTracks].slice(0, 8)
      if (combined.length >= 2) {
        sections.push({
          id: 'rec-because-artist',
          title: `Because You Like ${primaryArtist}`,
          subtitle: `Songs by ${primaryArtist} and artists in similar sonic wavelengths`,
          type: 'tracks',
          tracks: combined,
          reason: `Based on your plays of ${primaryArtist}`,
        })
      }
    }

    // 3. Discover Your Next Favorite
    const unplayedTracks = allPool.filter(
      (t) =>
        !history.some((h) => h.id === t.id) &&
        !likedTracks.some((l) => l.id === t.id)
    )
    if (unplayedTracks.length >= 3) {
      sections.push({
        id: 'rec-discover-next',
        title: 'Discover Your Next Favorite',
        subtitle: 'Fresh tunes outside your daily rotation waiting to be found',
        type: 'tracks',
        tracks: unplayedTracks.slice(0, 8),
        reason: 'Matched against your genre profile',
      })
    }

    // 4. Bengali Music For You
    const bengaliTracks = allPool.filter(
      (t) =>
        t.artist.toLowerCase().includes('anupam') ||
        t.genre.toLowerCase().includes('bengali') ||
        t.title.toLowerCase().includes('amake') ||
        t.artist.toLowerCase().includes('arijit')
    )
    if (bengaliTracks.length >= 2) {
      sections.push({
        id: 'rec-bengali-mix',
        title: 'Bengali Acoustic & Rock For You',
        subtitle: 'Poetic melodies, soulful acoustic ballads, and timeless lyrics',
        type: 'tracks',
        tracks: bengaliTracks,
        reason: 'Popular regional spotlights on RAIWAVE',
      })
    }

    // 5. English & Global Hits For You
    const globalHits = allPool.filter(
      (t) =>
        t.genre.toLowerCase().includes('synthpop') ||
        t.genre.toLowerCase().includes('pop') ||
        t.genre.toLowerCase().includes('disco') ||
        t.genre.toLowerCase().includes('rock')
    ).slice(0, 8)
    if (globalHits.length >= 3) {
      sections.push({
        id: 'rec-global-hits',
        title: 'Global Pop & Synth Anthems',
        subtitle: 'Lossless studio hits streamed worldwide',
        type: 'tracks',
        tracks: globalHits,
        reason: 'Trending globally on RAIWAVE',
      })
    }

    // 6. Mood-Based Mix: Late Night Chill
    const chillTracks = allPool.filter(
      (t) =>
        t.genre.toLowerCase().includes('chill') ||
        t.genre.toLowerCase().includes('acoustic') ||
        t.genre.toLowerCase().includes('lofi') ||
        t.genre.toLowerCase().includes('r&b')
    ).slice(0, 8)
    if (chillTracks.length >= 3) {
      sections.push({
        id: 'rec-mood-chill',
        title: 'Midnight Atmospheric Waves',
        subtitle: 'Mellow basslines, ambient echoes, and calming vocal tracks',
        type: 'tracks',
        tracks: chillTracks,
        reason: 'Calibrated for relaxation',
      })
    }

    return sections
  }

  /**
   * Daily Mix Builder applying user's discovery preference
   */
  private buildDailyMix(pool: Track[], history: Track[], likedTracks: Track[]): Track[] {
    const pref = this.profile.discoveryPreference
    let familiarRatio = 0.5 // balanced
    if (pref === 'familiar') familiarRatio = 0.8
    if (pref === 'discover') familiarRatio = 0.2

    const familiarCandidates = [...likedTracks, ...history]
    const familiarCount = Math.round(8 * familiarRatio)
    const discoveryCount = 8 - familiarCount

    const familiar = familiarCandidates.slice(0, familiarCount)
    const discovery = pool
      .filter((t) => !familiarCandidates.some((f) => f.id === t.id))
      .slice(0, discoveryCount)

    const mixed = [...familiar, ...discovery]
    // Fill if still low
    if (mixed.length < 6) {
      for (const t of pool) {
        if (!mixed.some((m) => m.id === t.id)) {
          mixed.push(t)
        }
        if (mixed.length >= 8) break
      }
    }
    return mixed
  }
}

export const recommendationEngine = new RecommendationEngine()
