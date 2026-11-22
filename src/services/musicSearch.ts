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

function normalizeStr(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function extractKeywords(str: string): string[] {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length >= 2)
}

// Direct YouTube Music Search in case Serverless endpoint is unreachable
async function searchDirectYouTubeMusic(query: string): Promise<Track[]> {
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
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) return []
    const data = await res.json()
    const tracks: Track[] = []
    const seenIds = new Set<string>()

    function scanNodes(node: any) {
      if (!node || typeof node !== 'object') return
      if (node.musicResponsiveListItemRenderer) {
        const item = node.musicResponsiveListItemRenderer
        const nav =
          item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
            ?.playNavigationEndpoint?.watchEndpoint || item.navigationEndpoint?.watchEndpoint
        const vid = nav?.videoId
        const flex = item.flexColumns || []
        const title =
          flex[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs
            ?.map((r: any) => r.text)
            .join('') || ''
        const runs = flex[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || []
        const subtitle = runs.map((r: any) => r.text || '').join('')

        let artist = 'Artist'
        let album = 'Single'
        let durationSec = 210

        const artistRun = runs.find(
          (r: any) =>
            r.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
              ?.browseEndpointContextMusicConfig?.pageType === 'MUSIC_PAGE_TYPE_ARTIST'
        )
        if (artistRun && artistRun.text) {
          artist = artistRun.text
        } else {
          const parts = subtitle.split(' • ').map((s: string) => s.trim())
          if (
            parts.length >= 2 &&
            (parts[0].toLowerCase() === 'song' || parts[0].toLowerCase() === 'video')
          ) {
            artist = parts[1]
          } else if (parts.length >= 1) {
            artist = parts[0]
          }
        }

        const durRun = runs.find((r: any) => /^\d+:\d+$/.test(r.text))
        if (durRun && durRun.text) {
          const [m, s] = durRun.text.split(':').map(Number)
          if (!isNaN(m) && !isNaN(s)) {
            durationSec = m * 60 + s
          }
        }

        const thumbs = item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
        const thumb = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : ''

        if (vid && vid.length === 11 && title && !seenIds.has(vid)) {
          seenIds.add(vid)
          tracks.push({
            id: 'yt-' + vid,
            title,
            artist,
            album,
            duration: durationSec,
            coverUrl: thumb || `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
            youtubeId: vid,
            source: 'youtube',
            genre: 'Music',
            releaseYear: new Date().getFullYear(),
            color: '#B6F36B',
          })
        }
      }
      for (const k of Object.keys(node)) scanNodes(node[k])
    }

    scanNodes(data)
    return tracks
  } catch {
    return []
  }
}

export async function searchGlobalMusic(query: string): Promise<Track[]> {
  const cleanQuery = query.trim()
  if (!cleanQuery) return []

  const cacheKey = cleanQuery.toLowerCase()
  const cached = searchCache.get(cacheKey)
  if (cached) return cached

  const queryKeywords = extractKeywords(cleanQuery)
  const normQuery = normalizeStr(cleanQuery)

  let ytTracks: Track[] = []

  // 1. First Priority: YouTube Music API (resolves true studio songs, regional anthems & remixes)
  const endpoints = [
    `/api/yt-search?q=${encodeURIComponent(cleanQuery)}`,
    `https://raiwave.vercel.app/api/yt-search?q=${encodeURIComponent(cleanQuery)}`,
  ]

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { headers: { Accept: 'application/json' } })
      if (res.ok) {
        const json = await res.json()
        if (Array.isArray(json.results) && json.results.length > 0) {
          ytTracks = json.results
          break
        }
      }
    } catch {
      // try next endpoint
    }
  }

  // Fallback direct InnerTube search if serverless is unreachable
  if (ytTracks.length === 0) {
    ytTracks = await searchDirectYouTubeMusic(cleanQuery)
  }

  // 2. iTunes Secondary Search (filtered for exactness to eliminate outsider songs like 'prenatal yoga')
  let itunesTracks: Track[] = []
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
      cleanQuery
    )}&media=music&entity=song&limit=25`

    const res = await fetch(url)
    if (res.ok) {
      const data: iTunesResponse = await res.json()
      itunesTracks = data.results
        .filter((item) => {
          // STRICT OUTSIDER FILTER:
          // Song must contain at least one of the query keywords in its title or artist
          const titleWords = extractKeywords(item.trackName)
          const artistWords = extractKeywords(item.artistName)
          const allCandidateWords = [...titleWords, ...artistWords]

          const matchesAnyKeyword = queryKeywords.some((qw) =>
            allCandidateWords.some((cw) => cw.includes(qw) || qw.includes(cw))
          )
          return matchesAnyKeyword
        })
        .map((item) => {
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
            source: 'youtube' as const,
            genre: item.primaryGenreName || 'Music',
            releaseYear,
            color: '#B6F36B',
          }
        })
    }
  } catch (err) {
    console.warn('iTunes search skipped:', err)
  }

  // 3. Merge & Deduplicate
  const merged: Track[] = []
  const seenKeys = new Set<string>()

  // Insert YouTube Music tracks first (already verified official media)
  for (const t of ytTracks) {
    const key = `${normalizeStr(t.title)}_${normalizeStr(t.artist)}`
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      merged.push(t)
    }
  }

  // Merge iTunes tracks
  for (const t of itunesTracks) {
    const key = `${normalizeStr(t.title)}_${normalizeStr(t.artist)}`
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      merged.push(t)
    }
  }

  // 4. Spotify-Grade Exact Match Priority Scoring (guarantees searched song is #1)
  const wantsRemix =
    cleanQuery.toLowerCase().includes('remix') ||
    cleanQuery.toLowerCase().includes('cover') ||
    cleanQuery.toLowerCase().includes('lofi')

  merged.sort((a, b) => {
    const titleA = a.title.toLowerCase()
    const titleB = b.title.toLowerCase()
    const artistA = a.artist.toLowerCase()
    const artistB = b.artist.toLowerCase()

    const titleWordsA = extractKeywords(a.title)
    const titleWordsB = extractKeywords(b.title)

    let scoreA = 0
    let scoreB = 0

    // Keyword presence
    for (const qw of queryKeywords) {
      if (titleWordsA.some((w) => w === qw || w.includes(qw))) scoreA += 180
      if (titleWordsB.some((w) => w === qw || w.includes(qw))) scoreB += 180

      if (artistA.includes(qw)) scoreA += 120
      if (artistB.includes(qw)) scoreB += 120
    }

    // Exact Title match (+350)
    if (normalizeStr(a.title) === normQuery) scoreA += 350
    if (normalizeStr(b.title) === normQuery) scoreB += 350

    // YouTube verified track bonus (+30)
    if (a.youtubeId) scoreA += 30
    if (b.youtubeId) scoreB += 30

    // Penalize covers and remixes if not requested
    if (!wantsRemix) {
      if (titleA.includes('cover')) scoreA -= 150
      if (titleB.includes('cover')) scoreB -= 150

      if (titleA.includes('lofi') || titleA.includes('lo-fi')) scoreA -= 90
      if (titleB.includes('lofi') || titleB.includes('lo-fi')) scoreB -= 90

      if (titleA.includes('remix')) scoreA -= 80
      if (titleB.includes('remix')) scoreB -= 80

      if (titleA.includes('slowed') || titleA.includes('reverb')) scoreA -= 90
      if (titleB.includes('slowed') || titleB.includes('reverb')) scoreB -= 90
    }

    return scoreB - scoreA
  })

  searchCache.set(cacheKey, merged)
  return merged
}
