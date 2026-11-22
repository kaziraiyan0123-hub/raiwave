// Vercel Serverless Function: /api/yt-search
// Precision YouTube Music & Video Search Engine (Exact Song & First Priority Matching)

interface Run {
  text: string
  navigationEndpoint?: any
}

interface ParsedTrack {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl: string
  youtubeId: string
  source: 'youtube'
  genre: string
  releaseYear: number
  color: string
}

const searchCache = new Map<string, { timestamp: number; tracks: ParsedTrack[] }>()
const CACHE_TTL_MS = 1000 * 60 * 30 // 30 minutes

function parseRunText(runs?: Run[]): string {
  if (!runs || !Array.isArray(runs)) return ''
  return runs.map((r) => r.text || '').join('')
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const query = typeof req.query?.q === 'string' ? req.query.q.trim() : ''
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter q' })
  }

  const cacheKey = query.toLowerCase()
  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return res.status(200).json({ query, results: cached.tracks })
  }

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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return res.status(502).json({ error: 'YouTube Search request failed' })
    }

    const data = await response.json()
    const tracks: ParsedTrack[] = []
    const seenIds = new Set<string>()

    // 1. First priority: Check YouTube Music Top Result Card
    function scanCards(node: any) {
      if (!node || typeof node !== 'object') return
      if (node.musicCardShelfRenderer) {
        const card = node.musicCardShelfRenderer
        const title = parseRunText(card.title?.runs)
        const subtitle = parseRunText(card.subtitle?.runs)
        const nav =
          card.onTap?.watchEndpoint ||
          card.header?.musicCardShelfHeaderBasicRenderer?.title?.runs?.[0]?.navigationEndpoint
            ?.watchEndpoint
        const vid = nav?.videoId
        const thumbs = card.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
        const thumb = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : ''

        let artist = 'Artist'
        let album = 'Top Result'
        const parts = subtitle.split(' • ').map((s: string) => s.trim())
        if (
          parts.length >= 2 &&
          (parts[0].toLowerCase() === 'video' || parts[0].toLowerCase() === 'song')
        ) {
          artist = parts[1]
          if (parts[2] && !parts[2].includes(':') && !parts[2].toLowerCase().includes('views')) {
            album = parts[2]
          }
        } else if (parts.length >= 1) {
          artist = parts[0]
        }

        if (vid && vid.length === 11 && title) {
          tracks.push({
            id: 'yt-' + vid,
            title,
            artist,
            album,
            duration: 210,
            coverUrl: thumb || `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
            youtubeId: vid,
            source: 'youtube',
            genre: 'Music',
            releaseYear: new Date().getFullYear(),
            color: '#B6F36B',
          })
          seenIds.add(vid)
        }
      }
      for (const k of Object.keys(node)) scanCards(node[k])
    }
    scanCards(data)

    // 2. Parse all music list item renderers
    function scanItems(node: any) {
      if (!node || typeof node !== 'object') return
      if (node.musicResponsiveListItemRenderer) {
        const item = node.musicResponsiveListItemRenderer
        const nav =
          item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
            ?.playNavigationEndpoint?.watchEndpoint || item.navigationEndpoint?.watchEndpoint
        const vid = nav?.videoId
        const flex = item.flexColumns || []
        const title = parseRunText(flex[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs)
        const runs = flex[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || []
        const subtitle = runs.map((r: Run) => r.text || '').join('')

        let artist = 'Artist'
        let album = 'Single'
        let durationSec = 210

        // Find artist run with browseEndpoint or following 'Song • '
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

        // Extract album if present
        const albumRun = runs.find(
          (r: any) =>
            r.navigationEndpoint?.browseEndpoint?.browseId?.startsWith('MPREb_')
        )
        if (albumRun && albumRun.text) {
          album = albumRun.text
        }

        // Check for duration string: e.g. 3:45
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
      for (const k of Object.keys(node)) scanItems(node[k])
    }
    scanItems(data)

    // 3. Precision Relevance Ranking (Prioritize Exact Matches)
    const normQ = query.toLowerCase().replace(/[^a-z0-9]/g, '')
    tracks.sort((a, b) => {
      const normA = a.title.toLowerCase().replace(/[^a-z0-9]/g, '')
      const normB = b.title.toLowerCase().replace(/[^a-z0-9]/g, '')

      let scoreA = 0
      let scoreB = 0

      // Exact title match gets utmost priority (+300)
      if (normA === normQ) scoreA += 300
      if (normB === normQ) scoreB += 300

      // Title starts with query (+150)
      if (normA.startsWith(normQ)) scoreA += 150
      if (normB.startsWith(normQ)) scoreB += 150

      // Artist exact match (+120)
      const normArtistA = a.artist.toLowerCase().replace(/[^a-z0-9]/g, '')
      const normArtistB = b.artist.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (normArtistA === normQ) scoreA += 120
      if (normArtistB === normQ) scoreB += 120

      // Contains query (+80)
      if (normA.includes(normQ)) scoreA += 80
      if (normB.includes(normQ)) scoreB += 80

      return scoreB - scoreA
    })

    searchCache.set(cacheKey, { timestamp: Date.now(), tracks })
    return res.status(200).json({ query, results: tracks })
  } catch (error: any) {
    console.error('API /api/yt-search error:', error)
    return res.status(500).json({ error: error.message || 'Internal Search Error' })
  }
}
