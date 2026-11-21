// Real-Time Global Music Service (Zero API Keys required)
// Fetches live real-time global charts and category recommendations via public feeds
import type { Track } from '../types'

export interface RealtimeChartItem {
  id: string
  title: string
  artist: string
  album: string
  coverUrl: string
  previewUrl?: string
  genre: string
  releaseYear: number
  duration: number
  color: string
}

const CACHE_TOP_CHARTS_KEY = 'raiwave_realtime_top_charts'

// Vibrant brand colors for cards
const BRAND_COLORS = [
  '#B6F36B', // Wave Lime
  '#52D6C9', // Ocean Teal
  '#8B5CF6', // Electric Purple
  '#EC4899', // Hot Pink
  '#3B82F6', // Cobalt
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#6366F1', // Indigo
]

export class RealtimeMusicService {
  private inMemoryCharts: Track[] = []
  private inMemoryCategories: Map<string, Track[]> = new Map()

  /**
   * Fetch Live Real-Time Global Top 50 Songs
   */
  public async fetchLiveTop50(): Promise<Track[]> {
    if (this.inMemoryCharts.length > 0) {
      return this.inMemoryCharts
    }

    // Try localStorage cache for instant loading
    try {
      const cached = localStorage.getItem(CACHE_TOP_CHARTS_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.inMemoryCharts = parsed
        }
      }
    } catch {}

    // Fetch fresh live data from Apple iTunes Public Top Songs RSS
    try {
      const res = await fetch('https://itunes.apple.com/us/rss/topsongs/limit=50/json')
      if (res.ok) {
        const data = await res.json()
        const entries = data?.feed?.entry || []

        const liveTracks: Track[] = entries.map((item: any, idx: number) => {
          const title = item['im:name']?.label || 'Unknown Track'
          const artist = item['im:artist']?.label || 'Various Artists'
          const album = item['im:collection']?.['im:name']?.label || 'Top Hit'
          const genre = item?.category?.attributes?.label || 'Pop'
          const rawImg = item['im:image']?.[2]?.label || item['im:image']?.[0]?.label || ''
          // Upgrade thumbnail to high-res 600x600 artwork
          const coverUrl = rawImg ? rawImg.replace(/\/\d+x\d+bb\./, '/600x600bb.') : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
          const releaseDate = item['im:releaseDate']?.label
          const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : new Date().getFullYear()

          return {
            id: `realtime-top-${idx + 1}-${encodeURIComponent(title.slice(0, 15))}`,
            title,
            artist,
            album,
            duration: 210, // Dynamic stream duration
            coverUrl,
            source: 'youtube', // Full length streaming
            genre,
            releaseYear,
            color: BRAND_COLORS[idx % BRAND_COLORS.length],
          }
        })

        if (liveTracks.length > 0) {
          this.inMemoryCharts = liveTracks
          try {
            localStorage.setItem(CACHE_TOP_CHARTS_KEY, JSON.stringify(liveTracks))
          } catch {}
          return liveTracks
        }
      }
    } catch (err) {
      console.warn('Realtime chart fetch fallback:', err)
    }

    return this.inMemoryCharts
  }

  /**
   * Fetch Real-Time Recommended Music by Category / Genre
   */
  public async fetchRealtimeByCategory(category: string): Promise<Track[]> {
    const cleanCat = category.toLowerCase().trim()
    if (this.inMemoryCategories.has(cleanCat)) {
      return this.inMemoryCategories.get(cleanCat)!
    }

    const termMap: Record<string, string> = {
      all: 'top hits 2026',
      party: 'party club dance hits',
      blues: 'blues rhythm soul',
      sad: 'sad melancholic emotional acoustic',
      'hip hop': 'hip hop rap global top',
      chill: 'chill lofi relax beats',
      pop: 'global pop hits billboard',
      rock: 'rock modern alternative classics',
      jazz: 'jazz cafe smooth classic',
    }

    const query = termMap[cleanCat] || `${category} hits`

    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=25`)
      if (res.ok) {
        const data = await res.json()
        const results = data?.results || []

        const tracks: Track[] = results.map((item: any, idx: number) => {
          const highResArt = item.artworkUrl100
            ? item.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
            : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'

          return {
            id: `realtime-cat-${cleanCat}-${item.trackId || idx}`,
            title: item.trackName || 'Track',
            artist: item.artistName || 'Artist',
            album: item.collectionName || 'Single',
            duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
            coverUrl: highResArt,
            source: 'youtube', // Full length streaming
            genre: item.primaryGenreName || category,
            releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 2026,
            color: BRAND_COLORS[idx % BRAND_COLORS.length],
          }
        })

        if (tracks.length > 0) {
          this.inMemoryCategories.set(cleanCat, tracks)
          return tracks
        }
      }
    } catch (err) {
      console.warn(`Category fetch error for ${category}:`, err)
    }

    return []
  }
}

export const realtimeMusicService = new RealtimeMusicService()
