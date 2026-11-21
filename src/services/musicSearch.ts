import type { Track } from '../types'

interface iTunesResult {
  trackId: number
  trackName: string
  artistName: string
  collectionName: string
  trackTimeMillis: number
  artworkUrl100: string
  previewUrl?: string
  primaryGenreName: string
  releaseDate: string
}

interface iTunesResponse {
  resultCount: number
  results: iTunesResult[]
}

// Global cache to avoid redundant network calls
const searchCache = new Map<string, Track[]>()

export async function searchGlobalMusic(query: string): Promise<Track[]> {
  const cleanQuery = query.trim()
  if (!cleanQuery) return []

  const cached = searchCache.get(cleanQuery.toLowerCase())
  if (cached) return cached

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
      cleanQuery
    )}&media=music&entity=song&limit=30`

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Search request failed with status: ${res.status}`)
    }

    const data: iTunesResponse = await res.json()

    const tracks: Track[] = data.results.map((item) => {
      // Upgrade thumbnail from 100x100 to 600x600 for sharp modern UI display
      const highResArt = item.artworkUrl100
        ? item.artworkUrl100.replace('100x100bb', '600x600bb')
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'

      const releaseYear = item.releaseDate
        ? new Date(item.releaseDate).getFullYear()
        : new Date().getFullYear()

      return {
        id: `global-${item.trackId}`,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName || 'Single',
        duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
        coverUrl: highResArt,
        source: 'youtube', // Streams full track via official embed player
        genre: item.primaryGenreName || 'Music',
        releaseYear,
        color: '#B6F36B',
      }
    })

    searchCache.set(cleanQuery.toLowerCase(), tracks)
    return tracks
  } catch (err) {
    console.warn('Global live search encountered an issue:', err)
    return []
  }
}
