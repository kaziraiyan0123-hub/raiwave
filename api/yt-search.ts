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

function extractKeywords(str: string): string[] {
  return str
    .toLowerCase()
    .split(/[\s|•\-_,()]+/)
    .map((w) => w.replace(/[^a-z0-9\u0980-\u09FF]/g, ''))
    .filter((w) => w.length >= 2)
}

// Quick embeddability check to ensure top recommendations don't crash with 150/101
async function checkEmbeddable(videoId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(2000),
    })
    return res.status === 200
  } catch {
    return true
  }
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

    const queryKeywords = extractKeywords(query)

    // Helper to clean artist names
    function cleanArtist(rawArtist: string, title: string): string {
      let a = rawArtist.trim()
      // If artist is a date or view count or generic, try extracting from title
      if (/^\w+\s+\d{1,2},\s+\d{4}$/.test(a) || /^\d+(\.\d+)?[KM]?\s+views$/i.test(a) || a.toLowerCase() === 'artist') {
        const segments = title.split(/[|•\-–]+/).map((s) => s.trim())
        for (const seg of segments) {
          const segLower = seg.toLowerCase()
          if (!segLower.includes('remix') && !segLower.includes('cover') && !segLower.includes('lofi') && !segLower.includes('lyrics') && !segLower.includes('album')) {
            for (const qw of queryKeywords) {
              if (segLower.includes(qw)) {
                return seg
              }
            }
          }
        }
        return 'Various Artists'
      }
      return a
    }

    // 1. Scan YouTube Music Top Result Card
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

        artist = cleanArtist(artist, title)

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

        artist = cleanArtist(artist, title)

        const albumRun = runs.find(
          (r: any) => r.navigationEndpoint?.browseEndpoint?.browseId?.startsWith('MPREb_')
        )
        if (albumRun && albumRun.text) {
          album = albumRun.text
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
      for (const k of Object.keys(node)) scanItems(node[k])
    }
    scanItems(data)

    // 3. Strict Relevance & Quality Filter
    // Discard non-music items (talks, sermons, lectures, news)
    const validMusicTracks = tracks.filter((t) => {
      const titleLower = t.title.toLowerCase()
      if (
        titleLower.includes('news') ||
        titleLower.includes('পুরস্কার') ||
        titleLower.includes('দোয়া') ||
        titleLower.includes('ওয়াজ') ||
        titleLower.includes('talk show') ||
        titleLower.includes('interview') ||
        titleLower.includes('podcast') ||
        titleLower.includes('behind the fame')
      ) {
        return false
      }

      // Check if at least one keyword matches
      const tWords = extractKeywords(t.title + ' ' + t.artist)
      const matchesAnyKeyword = queryKeywords.some((qw) =>
        tWords.some((tw) => tw.includes(qw) || qw.includes(tw))
      )
      return matchesAnyKeyword
    })

    // 4. Precision Relevance Scoring
    const wantsRemix =
      query.toLowerCase().includes('remix') ||
      query.toLowerCase().includes('cover') ||
      query.toLowerCase().includes('lofi')

    validMusicTracks.sort((a, b) => {
      const titleA = a.title.toLowerCase()
      const titleB = b.title.toLowerCase()
      const artistA = a.artist.toLowerCase()
      const artistB = b.artist.toLowerCase()

      const aWords = extractKeywords(a.title)
      const bWords = extractKeywords(b.title)

      let scoreA = 0
      let scoreB = 0

      // Count query word matches in title
      for (const qw of queryKeywords) {
        if (aWords.some((w) => w.includes(qw) || qw.includes(w))) scoreA += 150
        if (bWords.some((w) => w.includes(qw) || qw.includes(w))) scoreB += 150

        if (artistA.includes(qw)) scoreA += 100
        if (artistB.includes(qw)) scoreB += 100
      }

      // Official / Studio track bonuses
      if (titleA.includes('official') || a.album !== 'Single') scoreA += 50
      if (titleB.includes('official') || b.album !== 'Single') scoreB += 50

      // Penalize remixes and covers if user didn't ask for them
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

    // 5. Ensure Top 3 tracks are embeddable so user never clicks a dead/401 track
    const finalResults: ParsedTrack[] = []
    for (const t of validMusicTracks) {
      if (finalResults.length < 3) {
        const embeddable = await checkEmbeddable(t.youtubeId)
        if (embeddable) {
          finalResults.push(t)
        }
      } else {
        finalResults.push(t)
      }
    }

    searchCache.set(cacheKey, { timestamp: Date.now(), tracks: finalResults })
    return res.status(200).json({ query, results: finalResults })
  } catch (error: any) {
    console.error('API /api/yt-search error:', error)
    return res.status(500).json({ error: error.message || 'Internal Search Error' })
  }
}
