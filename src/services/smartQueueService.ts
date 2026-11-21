import type { Track } from '../types'
import { SAMPLE_TRACKS } from '../data/musicData'
import { searchGlobalMusic } from './musicSearch'

// Global pool of smart tracks
let globalSmartPool: Track[] = [...SAMPLE_TRACKS]

export const smartQueueService = {
  /**
   * Generates intelligent next-track recommendations based on current song
   */
  async getSmartSuggestions(currentTrack: Track, existingQueueIds: string[] = []): Promise<Track[]> {
    const queueSet = new Set(existingQueueIds)
    queueSet.add(currentTrack.id)

    // 1. Try finding candidates by genre and artist from local pool
    let candidates = globalSmartPool.filter((t) => !queueSet.has(t.id))

    const sameArtist = candidates.filter(
      (t) => t.artist.toLowerCase() === currentTrack.artist.toLowerCase()
    )
    const sameGenre = candidates.filter(
      (t) => t.genre?.toLowerCase() === currentTrack.genre?.toLowerCase()
    )

    let suggestions: Track[] = [...sameArtist, ...sameGenre]

    // 2. If candidates are low, query global music for related tracks
    if (suggestions.length < 5) {
      try {
        const query = currentTrack.genre ? `${currentTrack.genre} hits` : `${currentTrack.artist} similar`
        const fetched = await searchGlobalMusic(query)
        const newTracks = fetched.filter((t) => !queueSet.has(t.id))
        suggestions.push(...newTracks)
        // Add to global pool
        globalSmartPool.push(...newTracks)
      } catch (e) {
        console.warn('Smart queue fetch fallback:', e)
      }
    }

    // 3. Fallback to remaining candidates
    if (suggestions.length < 5) {
      suggestions.push(...candidates)
    }

    // Remove duplicates
    const seen = new Set<string>()
    return suggestions.filter((t) => {
      if (seen.has(t.id) || queueSet.has(t.id)) return false
      seen.add(t.id)
      return true
    }).slice(0, 10)
  },

  /**
   * Picks the single best next track for Autoplay
   */
  async getNextSmartTrack(currentTrack: Track, queueIds: string[] = []): Promise<Track | null> {
    const suggestions = await this.getSmartSuggestions(currentTrack, queueIds)
    return suggestions.length > 0 ? suggestions[0] : null
  },
}
