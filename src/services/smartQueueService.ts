import type { Track } from '../types'
import { SAMPLE_TRACKS } from '../data/musicData'
import { searchGlobalMusic } from './musicSearch'
import { getNetworkState } from '../utils/networkImage'
import { offlineService } from './offlineService'

// Global pool of smart tracks
let globalSmartPool: Track[] = [...SAMPLE_TRACKS]

function mergePool(newTracks: Track[]) {
  for (const t of newTracks) {
    if (!globalSmartPool.some((p) => p.id === t.id)) {
      globalSmartPool.push(t)
    }
  }
  if (globalSmartPool.length > 120) {
    globalSmartPool = globalSmartPool.slice(-120)
  }
}

export const smartQueueService = {
  /**
   * Generates intelligent next-track recommendations based on current song & connectivity
   */
  async getSmartSuggestions(currentTrack: Track, existingQueueIds: string[] = []): Promise<Track[]> {
    const queueSet = new Set(existingQueueIds)
    queueSet.add(currentTrack.id)
    const net = getNetworkState()

    // When offline, suggest only tracks genuinely available offline
    if (!net.isOnline) {
      const offlineTracks = await offlineService.getOfflineTracks()
      return offlineTracks.filter((t) => !queueSet.has(t.id)).slice(0, 10)
    }

    let candidates = globalSmartPool.filter((t) => !queueSet.has(t.id))
    const sameArtist = candidates.filter(
      (t) => t.artist.toLowerCase() === currentTrack.artist.toLowerCase()
    )
    const sameGenre = candidates.filter(
      (t) => t.genre?.toLowerCase() === currentTrack.genre?.toLowerCase()
    )

    const suggestions: Track[] = [...sameArtist, ...sameGenre]

    if (suggestions.length < 5 && !net.isLowDataMode) {
      try {
        const query = currentTrack.genre ? `${currentTrack.genre} hits` : `${currentTrack.artist} similar`
        const fetched = await searchGlobalMusic(query)
        const newTracks = fetched.filter((t) => !queueSet.has(t.id))
        suggestions.push(...newTracks)
        mergePool(newTracks)
      } catch {
        // Fallback to local pool
      }
    }

    if (suggestions.length < 5) {
      suggestions.push(...candidates)
    }

    const seenKeys = new Set<string>()
    return suggestions
      .filter((t) => {
        const normKey = `${t.title.toLowerCase().trim()}|${t.artist.toLowerCase().trim()}`
        if (seenKeys.has(t.id) || seenKeys.has(normKey) || queueSet.has(t.id)) return false
        seenKeys.add(t.id)
        seenKeys.add(normKey)
        return true
      })
      .slice(0, 10)
  },

  /**
   * Picks the single best next track for Autoplay
   */
  async getNextSmartTrack(currentTrack: Track, queueIds: string[] = []): Promise<Track | null> {
    const suggestions = await this.getSmartSuggestions(currentTrack, queueIds)
    return suggestions.length > 0 ? suggestions[0] : null
  },
}
