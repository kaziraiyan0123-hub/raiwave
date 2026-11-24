import type { Track } from '../types'
import { SAMPLE_TRACKS } from '../data/musicData'
import { getNetworkState, getOptimizedArtworkUrl } from '../utils/networkImage'

interface MemoryCacheEntry {
  tracks: Track[]
  ts: number
}

interface PersistedCacheEntry {
  tracks: Track[]
  ts: number
}

const memorySearchCache = new Map<string, MemoryCacheEntry>()
const PERSISTED_SEARCH_CACHE_KEY = 'raiwave_search_cache_v1'
const SEARCH_CACHE_TTL_MS = 1000 * 60 * 60 * 6 // 6 hours

/**
 * Unicode-aware keyword extraction preserving Latin, Bengali (\u0980-\u09FF), and Devanagari (\u0900-\u097F).
 */
export function extractSearchKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s|•\-_,/()[\]]+/)
    .map((w) => w.replace(/[^a-z0-9\u0980-\u09FF\u0900-\u097F]/g, ''))
    .filter((w) => w.length >= 2)
}

function readPersistedSearch(cacheKey: string, allowStale: boolean): Track[] | null {
  try {
    const raw = localStorage.getItem(PERSISTED_SEARCH_CACHE_KEY)
    if (!raw) return null
    const store = JSON.parse(raw) as Record<string, PersistedCacheEntry>
    const hit = store[cacheKey]
    if (!hit) return null
    if (!allowStale && Date.now() - hit.ts > SEARCH_CACHE_TTL_MS) return null
    return hit.tracks
  } catch {
    return null
  }
}

function writePersistedSearch(cacheKey: string, tracks: Track[]): void {
  if (tracks.length === 0) return
  try {
    const raw = localStorage.getItem(PERSISTED_SEARCH_CACHE_KEY)
    const store: Record<string, PersistedCacheEntry> = raw ? JSON.parse(raw) : {}
    store[cacheKey] = { ts: Date.now(), tracks: tracks.slice(0, 20) }
    const keys = Object.keys(store)
    if (keys.length > 30) {
      const oldest = keys.sort((a, b) => store[a].ts - store[b].ts)[0]
      delete store[oldest]
    }
    localStorage.setItem(PERSISTED_SEARCH_CACHE_KEY, JSON.stringify(store))
  } catch {
    // Ignore quota errors
  }
}

function parseRunsText(runs?: Array<{ text?: string }>): string {
  if (!Array.isArray(runs)) return ''
  return runs.map((r) => r.text || '').join('')
}

function parseDurationText(str: string): number {
  const m = str.match(/^(\d+):(\d{2})(?::(\d{2}))?$/)
  if (!m) return 210
  if (m[3]) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
  return Number(m[1]) * 60 + Number(m[2])
}

async function searchYouTubeDirectBrowser(
  query: string,
  limit: number,
  signal?: AbortSignal
): Promise<Track[]> {
  try {
    const url = 'https://www.youtube.com/youtubei/v1/search?prettyPrint=false'
    const payload = {
      context: {
        client: {
          hl: 'en',
          gl: 'US',
          clientName: 'WEB_REMIX',
          clientVersion: '1.20240101.00.00',
        },
      },
      query,
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    })
    if (!res.ok) return []
    const data = await res.json()

    const results: Track[] = []
    const seen = new Set<string>()
    const { isLowDataMode } = getNetworkState()

    function scan(node: unknown) {
      if (!node || typeof node !== 'object') return
      const obj = node as Record<string, unknown>

      if (obj.musicResponsiveListItemRenderer) {
        const item = obj.musicResponsiveListItemRenderer as Record<string, any>
        const nav =
          item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
            ?.playNavigationEndpoint?.watchEndpoint || item.navigationEndpoint?.watchEndpoint
        const vid = nav?.videoId as string | undefined
        if (vid && vid.length === 11 && !seen.has(vid)) {
          const flex = item.flexColumns || []
          const title = parseRunsText(flex[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs)
          const sub = parseRunsText(flex[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs)
          const thumbs = item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
          const rawThumb = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : ''
          if (title) {
            seen.add(vid)
            const parts = sub.split(' • ').map((s: string) => s.trim())
            let artist = 'Artist'
            let album = 'Single'
            let duration = 210
            for (const p of parts) {
              if (/^\d+:\d{2}/.test(p)) {
                duration = parseDurationText(p)
              } else if (!/^(song|video)$/i.test(p) && !/views$/i.test(p)) {
                if (artist === 'Artist' && p.length > 1) artist = p
                else if (album === 'Single' && p.length > 1) album = p
              }
            }
            const rawCover = rawThumb || `https://img.youtube.com/vi/${vid}/hqdefault.jpg`
            results.push({
              id: `yt-${vid}`,
              title,
              artist,
              album,
              duration,
              coverUrl: getOptimizedArtworkUrl(rawCover, 'card', isLowDataMode),
              youtubeId: vid,
              source: 'youtube',
              genre: 'Music',
              releaseYear: new Date().getFullYear(),
              color: '#8b5cf6',
            })
          }
        }
      }

      for (const k of Object.keys(obj)) {
        scan(obj[k])
      }
    }

    scan(data)
    return results.slice(0, limit)
  } catch {
    return []
  }
}

/**
 * Rejects false fuzzy matches from iTunes Search (e.g. "Prenatal Yoga" when searching "Prematal").
 */
function matchesQueryKeywordsStrict(candidateText: string, queryKeywords: string[]): boolean {
  if (queryKeywords.length === 0) return true
  const hay = candidateText.toLowerCase()
  let hits = 0
  for (const kw of queryKeywords) {
    if (hay.includes(kw)) {
      hits++
    }
  }
  if (queryKeywords.length === 1) return hits === 1
  if (queryKeywords.length === 2) return hits === 2 || (hits >= 1 && hay.includes(queryKeywords[0]))
  return hits >= Math.ceil(queryKeywords.length * 0.65)
}

export async function searchGlobalMusic(query: string, signal?: AbortSignal): Promise<Track[]> {
  const cleanQuery = query.trim()
  if (!cleanQuery) return []

  const cacheKey = cleanQuery.toLowerCase()
  const net = getNetworkState()
  const mem = memorySearchCache.get(cacheKey)
  if (mem && Date.now() - mem.ts < 1000 * 60 * 15) {
    return mem.tracks
  }

  // When offline, serve local cache + matching local catalog tracks immediately
  if (!net.isOnline) {
    const cachedOffline = readPersistedSearch(cacheKey, true)
    if (cachedOffline && cachedOffline.length > 0) return cachedOffline
    const kws = extractSearchKeywords(cleanQuery)
    return SAMPLE_TRACKS.filter((t) => {
      const hay = `${t.title} ${t.artist} ${t.album} ${t.genre}`.toLowerCase()
      return kws.length > 0 ? kws.every((k) => hay.includes(k)) : hay.includes(cacheKey)
    })
  }

  const limit = net.isLowDataMode ? 12 : 25
  const keywords = extractSearchKeywords(cleanQuery)

  // Fast cache return under Data Saver if available within TTL
  if (net.isLowDataMode) {
    const cachedSaver = readPersistedSearch(cacheKey, false)
    if (cachedSaver && cachedSaver.length > 0) return cachedSaver
  }

  const combinedResults: Track[] = []
  const seenKeys = new Set<string>()
  const pushUnique = (t: Track) => {
    const normKey = `${t.title.toLowerCase().trim()}|${t.artist.toLowerCase().trim()}`
    if (!seenKeys.has(t.id) && !seenKeys.has(normKey)) {
      seenKeys.add(t.id)
      seenKeys.add(normKey)
      combinedResults.push({
        ...t,
        coverUrl: getOptimizedArtworkUrl(t.coverUrl, 'card', net.isLowDataMode),
      })
    }
  }

  // 1. Primary YouTube Music API resolver (/api/yt-search)
  const endpoints = [
    `/api/yt-search?q=${encodeURIComponent(cleanQuery)}`,
    `https://raiwave.vercel.app/api/yt-search?q=${encodeURIComponent(cleanQuery)}`,
  ]

  for (const ep of endpoints) {
    if (signal?.aborted) break
    try {
      const res = await fetch(ep, {
        headers: { Accept: 'application/json' },
        signal: signal || AbortSignal.timeout(5500),
      })
      if (res.ok) {
        const data = (await res.json()) as { results?: Track[] }
        if (Array.isArray(data.results) && data.results.length > 0) {
          for (const t of data.results.slice(0, limit)) {
            pushUnique(t)
          }
          break
        }
      }
    } catch {
      if (signal?.aborted) return []
    }
  }

  // 2. Direct browser fallback if serverless search returned empty
  if (combinedResults.length === 0 && !signal?.aborted) {
    const directTracks = await searchYouTubeDirectBrowser(cleanQuery, limit, signal)
    for (const t of directTracks) pushUnique(t)
  }

  // 3. Strictly verified iTunes metadata fallback (skipped in low-data mode if YT returned results)
  if ((combinedResults.length < 4 || !net.isLowDataMode) && combinedResults.length < limit && !signal?.aborted) {
    try {
      const itunesLimit = net.isLowDataMode ? 8 : 18
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=music&entity=song&limit=${itunesLimit}`
      const res = await fetch(url, { signal: signal || AbortSignal.timeout(4000) })
      if (res.ok) {
        const data = (await res.json()) as {
          results?: Array<{
            trackId?: number
            trackName?: string
            artistName?: string
            collectionName?: string
            artworkUrl100?: string
            trackTimeMillis?: number
            primaryGenreName?: string
            releaseDate?: string
            previewUrl?: string
          }>
        }
        for (const item of data.results || []) {
          if (!item.trackId || !item.trackName) continue
          const hay = `${item.trackName} ${item.artistName || ''} ${item.collectionName || ''}`
          if (!matchesQueryKeywordsStrict(hay, keywords)) continue

          const cover = item.artworkUrl100
            ? item.artworkUrl100.replace('100x100bb', net.isLowDataMode ? '200x200bb' : '600x600bb')
            : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=75'

          pushUnique({
            id: `itunes-${item.trackId}`,
            title: item.trackName,
            artist: item.artistName || 'Artist',
            album: item.collectionName || 'Single',
            duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
            coverUrl: cover,
            // Store snippet on previewUrl so full-length playback resolves via YouTube engine
            previewUrl: item.previewUrl,
            source: 'youtube',
            genre: item.primaryGenreName || 'Music',
            releaseYear: item.releaseDate
              ? Number(item.releaseDate.slice(0, 4)) || new Date().getFullYear()
              : new Date().getFullYear(),
            color: '#8b5cf6',
          })
        }
      }
    } catch {
      if (signal?.aborted) return []
    }
  }

  const finalSlice = combinedResults.slice(0, limit)
  if (finalSlice.length > 0) {
    memorySearchCache.set(cacheKey, { tracks: finalSlice, ts: Date.now() })
    writePersistedSearch(cacheKey, finalSlice)
    return finalSlice
  }

  // Local catalog exact keyword match last resort before returning empty
  const localMatches = SAMPLE_TRACKS.filter((t) => {
    const hay = `${t.title} ${t.artist} ${t.album} ${t.genre}`.toLowerCase()
    return matchesQueryKeywordsStrict(hay, keywords)
  })
  return localMatches
}
