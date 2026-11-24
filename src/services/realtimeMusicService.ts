import type { Track } from '../types'
import { getNetworkState, getOptimizedArtworkUrl } from '../utils/networkImage'

export interface RealtimeChartItem {
  id: string
  name: string
  artistName: string
  artworkUrl100: string
  url: string
  genres: { genreId: string; name: string }[]
  releaseDate: string
}

const CHART_CACHE_KEY = 'raiwave_realtime_top50_cache'
const CATEGORY_CACHE_KEY = 'raiwave_realtime_category_cache_v1'
const CACHE_EXPIRY = 1000 * 60 * 45 // 45 mins

function readCategoryCache(categoryKey: string, allowStale: boolean): Track[] | null {
  try {
    const raw = localStorage.getItem(CATEGORY_CACHE_KEY)
    if (!raw) return null
    const map = JSON.parse(raw) as Record<string, { timestamp: number; tracks: Track[] }>
    const entry = map[categoryKey]
    if (!entry) return null
    if (!allowStale && Date.now() - entry.timestamp > CACHE_EXPIRY) return null
    return entry.tracks
  } catch {
    return null
  }
}

function writeCategoryCache(categoryKey: string, tracks: Track[]): void {
  if (tracks.length === 0) return
  try {
    const raw = localStorage.getItem(CATEGORY_CACHE_KEY)
    const map: Record<string, { timestamp: number; tracks: Track[] }> = raw ? JSON.parse(raw) : {}
    map[categoryKey] = { timestamp: Date.now(), tracks }
    const keys = Object.keys(map)
    if (keys.length > 15) {
      const oldest = keys.sort((a, b) => map[a].timestamp - map[b].timestamp)[0]
      delete map[oldest]
    }
    localStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(map))
  } catch {
    // Ignore storage quota errors
  }
}

export class RealtimeMusicService {
  /**
   * Fetch live Global Top 50 tracks from Apple iTunes RSS API, with Data Saver & offline fallback
   */
  public async fetchLiveTop50(options?: { force?: boolean }): Promise<Track[]> {
    const net = getNetworkState()

    try {
      const cached = localStorage.getItem(CHART_CACHE_KEY)
      if (cached && !options?.force) {
        const parsed = JSON.parse(cached) as { timestamp: number; tracks: Track[] }
        const fresh = Date.now() - parsed.timestamp < CACHE_EXPIRY
        if (fresh || !net.isOnline || net.isLowDataMode) {
          return parsed.tracks.map((t) => ({
            ...t,
            coverUrl: getOptimizedArtworkUrl(t.coverUrl, 'card', net.isLowDataMode),
          }))
        }
      }
    } catch {
      // Proceed to network fetch
    }

    if (!net.isOnline) {
      return []
    }

    try {
      const limit = net.isLowDataMode ? 20 : 50
      const res = await fetch(`https://itunes.apple.com/us/rss/topsongs/limit=${limit}/json`, {
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) throw new Error('Network error')
      const data = await res.json()
      const entries = data?.feed?.entry || []

      const tracks: Track[] = entries.map((entry: any, index: number) => {
        const title = entry['im:name']?.label || 'Trending Track'
        const artist = entry['im:artist']?.label || 'Top Artist'
        const album = entry['im:collection']?.['im:name']?.label || `${title} - Single`
        const rawImgs = entry['im:image'] || []
        const rawImg = rawImgs[rawImgs.length - 1]?.label || ''
        const hiResCover = rawImg
          ? rawImg.replace(/\/\d+x\d+bb\./, net.isLowDataMode ? '/240x240bb.' : '/600x600bb.')
          : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=480&auto=format&fit=crop&q=75'
        const genre = entry.category?.attributes?.label || 'Pop'
        const releaseYear = entry['im:releaseDate']?.label
          ? parseInt(entry['im:releaseDate'].label.slice(0, 4), 10)
          : new Date().getFullYear()
        const id = `live-${entry.id?.attributes?.['im:id'] || index}-${title.slice(0, 10).replace(/\W/g, '')}`

        const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
        const color = colors[index % colors.length]

        return {
          id,
          title,
          artist,
          album,
          duration: 215,
          coverUrl: getOptimizedArtworkUrl(hiResCover, 'card', net.isLowDataMode),
          source: 'youtube',
          genre,
          releaseYear: isNaN(releaseYear) ? new Date().getFullYear() : releaseYear,
          color,
        }
      })

      try {
        localStorage.setItem(CHART_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), tracks }))
      } catch {
        // Ignore storage quota overflow
      }

      return tracks
    } catch {
      try {
        const cached = localStorage.getItem(CHART_CACHE_KEY)
        if (cached) {
          return (JSON.parse(cached) as { tracks: Track[] }).tracks || []
        }
      } catch {
        // Ignore parse failures
      }
      return []
    }
  }

  /**
   * Fetch live tracks by Category or Bengali / Acoustic / Rock mixes with offline caching
   */
  public async fetchRealtimeByCategory(
    category: string,
    options?: { force?: boolean }
  ): Promise<Track[]> {
    const net = getNetworkState()
    const key = category.toLowerCase().trim()

    if (!options?.force) {
      const cached = readCategoryCache(key, !net.isOnline || net.isLowDataMode)
      if (cached && cached.length > 0) {
        return cached.map((t) => ({
          ...t,
          coverUrl: getOptimizedArtworkUrl(t.coverUrl, 'card', net.isLowDataMode),
        }))
      }
    }

    if (!net.isOnline) {
      return []
    }

    const queryMap: Record<string, string> = {
      All: 'top trending hits music 2025',
      'Bangla Mix': 'bangla romantic rock hits anupam roy james tahsan arijit singh',
      Lofi: 'lofi chill beats study relax music',
      Romantic: 'hindi bengali english love songs romantic hits',
      Electronic: 'electronic synthwave edm dance music',
      Workout: 'high energy workout gym hip hop rap',
      Sad: 'emotional sad heartfelt acoustic ballad music',
      Acoustic: 'unplugged acoustic indie guitar songs',
    }

    const query = queryMap[category] || category
    const limit = net.isLowDataMode ? 12 : 25

    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=${limit}`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (!res.ok) return []
      const data = await res.json()
      const tracks: Track[] = (data.results || []).map((item: any, idx: number) => {
        const cover = item.artworkUrl100
          ? item.artworkUrl100.replace('100x100bb', net.isLowDataMode ? '220x220bb' : '600x600bb')
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=480&auto=format&fit=crop&q=75'
        return {
          id: `rt-${item.trackId || idx}`,
          title: item.trackName || 'Music Track',
          artist: item.artistName || 'Artist',
          album: item.collectionName || 'Single',
          duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
          coverUrl: getOptimizedArtworkUrl(cover, 'card', net.isLowDataMode),
          previewUrl: item.previewUrl,
          source: 'youtube',
          genre: item.primaryGenreName || category,
          releaseYear: item.releaseDate ? parseInt(item.releaseDate.slice(0, 4), 10) : 2024,
          color: '#8b5cf6',
        }
      })

      writeCategoryCache(key, tracks)
      return tracks
    } catch {
      return readCategoryCache(key, true) || []
    }
  }
}

export const realtimeMusicService = new RealtimeMusicService()
