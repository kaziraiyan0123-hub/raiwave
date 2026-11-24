// Vercel Serverless Function: /api/yt-artist
// Retrieves authentic Artist metadata, real bio (Wikipedia), discography (iTunes + YouTube Music), and Album tracklists.

interface Run {
  text: string
  navigationEndpoint?: {
    watchEndpoint?: { videoId?: string }
    browseEndpoint?: { browseId?: string }
  }
}

interface AlbumSummary {
  id: string
  collectionId?: number
  title: string
  artist: string
  coverUrl: string
  year: number
  trackCount?: number
  releaseType: 'album' | 'ep' | 'single'
  genre?: string
  tracks: TrackSummary[]
  color: string
}

interface TrackSummary {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl: string
  youtubeId?: string
  audioUrl?: string
  source: 'youtube' | 'local'
  genre: string
  releaseYear: number
  color: string
}

const artistCache = new Map<string, { ts: number; data: unknown }>()
const CACHE_TTL_MS = 1000 * 60 * 30

function normText(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’".,!?:;()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseRuns(runs?: Run[]): string {
  if (!Array.isArray(runs)) return ''
  return runs.map((r) => r.text || '').join('')
}

function parseDurationSec(text: string): number {
  const m = text.match(/^(\d+):(\d{2})(?::(\d{2}))?$/)
  if (!m) return 210
  if (m[3]) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
  return Number(m[1]) * 60 + Number(m[2])
}

async function fetchWikiArtistBio(artistName: string): Promise<{ bio: string; thumbnail?: string } | null> {
  const candidates = [
    `${artistName} (musician)`,
    `${artistName} (singer)`,
    `${artistName} (band)`,
    artistName,
  ]
  const musicHints = [
    'singer',
    'musician',
    'band',
    'songwriter',
    'composer',
    'rapper',
    'album',
    'music',
    'discography',
    'playback',
    'guitarist',
    'vocalist',
    'rock',
    'pop',
    'bengali',
    'record',
  ]

  for (const title of candidates) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, '_'))}`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'RAIWAVE-Music-App/1.3 (https://raiwave.vercel.app)' },
        signal: AbortSignal.timeout(2500),
      })
      if (!res.ok) continue
      const json = (await res.json()) as {
        type?: string
        extract?: string
        description?: string
        thumbnail?: { source?: string }
        originalimage?: { source?: string }
      }
      if (json.type === 'disambiguation' || !json.extract) continue
      const haystack = `${json.description || ''} ${json.extract}`.toLowerCase()
      if (/\b(first name|given name|surname|may refer to|list of people|masculine name|feminine name)\b/i.test(haystack)) {
        continue
      }
      if (musicHints.some((kw) => haystack.includes(kw))) {
        return {
          bio: json.extract.trim(),
          thumbnail: json.originalimage?.source || json.thumbnail?.source,
        }
      }
    } catch {
      // Try next candidate
    }
  }

  // Fallback: Wikipedia search query for stage names (e.g. "Arnob" -> "Shayan Chowdhury Arnob")
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      `${artistName} singer musician band`
    )}&srlimit=3&format=json`
    const sRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'RAIWAVE-Music-App/1.3 (https://raiwave.vercel.app)' },
      signal: AbortSignal.timeout(2500),
    })
    if (sRes.ok) {
      const sJson = (await sRes.json()) as { query?: { search?: Array<{ title: string }> } }
      const nameWords = normText(artistName).split(' ').filter((w) => w.length >= 2)
      for (const hit of sJson.query?.search || []) {
        const hitNorm = normText(hit.title)
        if (!nameWords.some((w) => hitNorm.includes(w))) continue
        const sumRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title.replace(/\s+/g, '_'))}`,
          {
            headers: { 'User-Agent': 'RAIWAVE-Music-App/1.3 (https://raiwave.vercel.app)' },
            signal: AbortSignal.timeout(2500),
          }
        )
        if (!sumRes.ok) continue
        const sumJson = (await sumRes.json()) as {
          type?: string
          extract?: string
          description?: string
          thumbnail?: { source?: string }
          originalimage?: { source?: string }
        }
        if (sumJson.type === 'disambiguation' || !sumJson.extract) continue
        const hay = `${sumJson.description || ''} ${sumJson.extract}`.toLowerCase()
        if (/\b(first name|given name|surname|may refer to)\b/i.test(hay)) continue
        if (musicHints.some((kw) => hay.includes(kw))) {
          return {
            bio: sumJson.extract.trim(),
            thumbnail: sumJson.originalimage?.source || sumJson.thumbnail?.source,
          }
        }
      }
    }
  } catch {
    // Ignore search failures
  }

  return null
}

async function fetchItunesDiscography(
  artistName: string,
  lite: boolean
): Promise<{
  artistId?: number
  matchedName?: string
  primaryGenre?: string
  albums: AlbumSummary[]
  eps: AlbumSummary[]
  singlesAlbums: AlbumSummary[]
}> {
  try {
    const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=musicArtist&limit=6`
    const sRes = await fetch(searchUrl, { signal: AbortSignal.timeout(3500) })
    if (!sRes.ok) return { albums: [], eps: [], singlesAlbums: [] }
    const sJson = (await sRes.json()) as {
      results?: Array<{ artistId: number; artistName: string; primaryGenreName?: string }>
    }
    const targetNorm = normText(artistName)
    const targetWords = targetNorm.split(' ').filter((w) => w.length >= 2)
    const artists = sJson.results || []

    // Strict matching so e.g. short names don't collide with unrelated artists
    let matched = artists.find((a) => normText(a.artistName) === targetNorm)
    if (!matched && targetWords.length > 0) {
      matched = artists.find((a) => {
        const candNorm = normText(a.artistName)
        return targetWords.every((w) => candNorm.split(' ').includes(w))
      })
    }
    if (!matched) {
      return { albums: [], eps: [], singlesAlbums: [] }
    }

    const limit = lite ? 14 : 30
    const lookupUrl = `https://itunes.apple.com/lookup?id=${matched.artistId}&entity=album&limit=${limit}`
    const lRes = await fetch(lookupUrl, { signal: AbortSignal.timeout(4000) })
    if (!lRes.ok) {
      return {
        artistId: matched.artistId,
        matchedName: matched.artistName,
        primaryGenre: matched.primaryGenreName,
        albums: [],
        eps: [],
        singlesAlbums: [],
      }
    }
    const lJson = (await lRes.json()) as {
      results?: Array<{
        wrapperType?: string
        collectionId?: number
        collectionName?: string
        artistName?: string
        artworkUrl100?: string
        releaseDate?: string
        trackCount?: number
        primaryGenreName?: string
      }>
    }

    const albums: AlbumSummary[] = []
    const eps: AlbumSummary[] = []
    const singlesAlbums: AlbumSummary[] = []
    const seenTitle = new Set<string>()

    for (const item of lJson.results || []) {
      if (item.wrapperType !== 'collection' || !item.collectionId || !item.collectionName) continue
      const key = normText(item.collectionName)
      if (seenTitle.has(key)) continue
      seenTitle.add(key)

      const count = item.trackCount || 0
      const nameLower = item.collectionName.toLowerCase()
      const year = item.releaseDate ? Number(item.releaseDate.slice(0, 4)) || new Date().getFullYear() : new Date().getFullYear()
      const coverUrl = (item.artworkUrl100 || '').replace('100x100bb', lite ? '300x300bb' : '600x600bb')
      const isSingle = count <= 3 || nameLower.includes(' - single')
      const isEp = !isSingle && (count <= 6 || /\bep\b/i.test(item.collectionName) || nameLower.includes(' - ep'))
      const releaseType: 'album' | 'ep' | 'single' = isSingle ? 'single' : isEp ? 'ep' : 'album'

      const entry: AlbumSummary = {
        id: `itunes-alb-${item.collectionId}`,
        collectionId: item.collectionId,
        title: item.collectionName.replace(/ - (Single|EP)$/i, '').trim(),
        artist: item.artistName || matched.artistName,
        coverUrl,
        year,
        trackCount: count,
        releaseType,
        genre: item.primaryGenreName || matched.primaryGenreName,
        tracks: [],
        color: '#8B5CF6',
      }

      if (releaseType === 'album') albums.push(entry)
      else if (releaseType === 'ep') eps.push(entry)
      else singlesAlbums.push(entry)
    }

    return {
      artistId: matched.artistId,
      matchedName: matched.artistName,
      primaryGenre: matched.primaryGenreName,
      albums,
      eps,
      singlesAlbums,
    }
  } catch {
    return { albums: [], eps: [], singlesAlbums: [] }
  }
}

async function fetchYtMusicArtistTracks(
  artistName: string,
  lite: boolean
): Promise<{ topTracks: TrackSummary[]; avatarUrl?: string; monthlyListeners: number; related: Array<{ id: string; name: string; avatarUrl: string }> }> {
  try {
    const payload = {
      context: {
        client: {
          hl: 'en',
          gl: 'US',
          clientName: 'WEB_REMIX',
          clientVersion: '1.20240101.00.00',
        },
      },
      query: artistName,
    }
    const res = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4500),
    })
    if (!res.ok) return { topTracks: [], monthlyListeners: 0, related: [] }
    const data = await res.json()

    const topTracks: TrackSummary[] = []
    const seenVid = new Set<string>()
    let artistBrowseId: string | undefined
    let avatarUrl: string | undefined
    let monthlyListeners = 0
    const related: Array<{ id: string; name: string; avatarUrl: string }> = []

    const targetNorm = normText(artistName)
    const targetWords = targetNorm.split(' ').filter((w) => w.length >= 2)

    function artistMatches(candidateArtist: string, title: string): boolean {
      const cNorm = normText(candidateArtist)
      const tNorm = normText(title)
      if (!targetNorm) return false
      if (cNorm === targetNorm || cNorm.includes(targetNorm)) return true
      if (targetWords.length >= 2 && targetWords.every((w) => cNorm.includes(w) || tNorm.includes(w))) {
        return true
      }
      return false
    }

    function walk(node: any) {
      if (!node || typeof node !== 'object') return

      if (node.musicCardShelfRenderer) {
        const card = node.musicCardShelfRenderer
        const sub = parseRuns(card.subtitle?.runs)
        const cardTitle = parseRuns(card.title?.runs)
        if (/artist/i.test(sub) && artistMatches(cardTitle, cardTitle)) {
          const thumbs = card.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
          if (thumbs.length > 0 && !avatarUrl) {
            avatarUrl = thumbs[thumbs.length - 1].url
          }
          const bid = card.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId
          if (bid && !artistBrowseId) artistBrowseId = bid
          const listenerMatch = sub.match(/([\d.]+)\s*([KMB])?\s*(?:monthly|subscribers)/i)
          if (listenerMatch && monthlyListeners === 0) {
            const num = parseFloat(listenerMatch[1])
            const unit = (listenerMatch[2] || '').toUpperCase()
            const mult = unit === 'M' ? 1_000_000 : unit === 'K' ? 1_000 : unit === 'B' ? 1_000_000_000 : 1
            if (Number.isFinite(num)) monthlyListeners = Math.round(num * mult)
          }
        }
      }

      if (node.musicResponsiveListItemRenderer) {
        const item = node.musicResponsiveListItemRenderer
        const nav =
          item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
            ?.playNavigationEndpoint?.watchEndpoint || item.navigationEndpoint?.watchEndpoint
        const vid = nav?.videoId
        const browse = item.navigationEndpoint?.browseEndpoint
        const flex = item.flexColumns || []
        const col0 = parseRuns(flex[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs)
        const col1 = parseRuns(flex[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs)
        const thumbs = item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || []
        const thumb = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : ''

        if (!vid && browse?.browseId?.startsWith('UC') && col0 && !artistBrowseId && artistMatches(col0, col0)) {
          artistBrowseId = browse.browseId
          if (!avatarUrl && thumb) avatarUrl = thumb
        }

        if (vid && vid.length === 11 && col0 && !seenVid.has(vid)) {
          const parts = col1.split(' • ').map((s: string) => s.trim())
          let trackArtist = artistName
          let trackAlbum = 'Single'
          let duration = 210
          for (const p of parts) {
            if (/^\d+:\d{2}/.test(p)) {
              duration = parseDurationSec(p)
            } else if (!/^(song|video|views)$/i.test(p) && !/views$/i.test(p)) {
              if (trackArtist === artistName && p.length > 1) trackArtist = p
              else if (trackAlbum === 'Single' && p.length > 1) trackAlbum = p
            }
          }

          if (artistMatches(trackArtist, col0)) {
            seenVid.add(vid)
            topTracks.push({
              id: `yt-${vid}`,
              title: col0,
              artist: trackArtist,
              album: trackAlbum,
              duration,
              coverUrl: thumb || `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
              youtubeId: vid,
              source: 'youtube',
              genre: 'Music',
              releaseYear: new Date().getFullYear(),
              color: '#8B5CF6',
            })
          }
        }
      }

      for (const key of Object.keys(node)) {
        walk(node[key])
      }
    }

    walk(data)
    const maxTracks = lite ? 8 : 16
    return {
      topTracks: topTracks.slice(0, maxTracks),
      avatarUrl,
      monthlyListeners,
      related,
    }
  } catch {
    return { topTracks: [], monthlyListeners: 0, related: [] }
  }
}

async function fetchItunesAlbumTracks(collectionId: string, artistHint: string): Promise<TrackSummary[]> {
  try {
    const cleanId = collectionId.replace(/^itunes-alb-/, '').trim()
    if (!/^\d+$/.test(cleanId)) return []
    const res = await fetch(`https://itunes.apple.com/lookup?id=${cleanId}&entity=song&limit=50`, {
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return []
    const json = (await res.json()) as {
      results?: Array<{
        wrapperType?: string
        trackId?: number
        trackName?: string
        artistName?: string
        collectionName?: string
        artworkUrl100?: string
        trackTimeMillis?: number
        releaseDate?: string
        primaryGenreName?: string
        previewUrl?: string
      }>
    }

    const tracks: TrackSummary[] = []
    for (const item of json.results || []) {
      if (item.wrapperType !== 'track' || !item.trackId || !item.trackName) continue
      tracks.push({
        id: `itunes-trk-${item.trackId}`,
        title: item.trackName,
        artist: item.artistName || artistHint || 'Artist',
        album: item.collectionName || 'Album',
        duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 210,
        coverUrl: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
        previewUrl: item.previewUrl,
        source: 'youtube',
        genre: item.primaryGenreName || 'Music',
        releaseYear: item.releaseDate ? Number(item.releaseDate.slice(0, 4)) || new Date().getFullYear() : new Date().getFullYear(),
        color: '#8B5CF6',
      })
    }
    return tracks
  } catch {
    return []
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const albumId = typeof req.query?.albumId === 'string' ? req.query.albumId.trim() : ''
  if (albumId) {
    const artistHint = typeof req.query?.artist === 'string' ? req.query.artist.trim() : ''
    const cacheKey = `alb:${albumId}`
    const cached = artistCache.get(cacheKey)
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return res.status(200).json(cached.data)
    }
    const tracks = await fetchItunesAlbumTracks(albumId, artistHint)
    const data = { albumId, tracks }
    artistCache.set(cacheKey, { ts: Date.now(), data })
    return res.status(200).json(data)
  }

  const name = typeof req.query?.name === 'string' ? req.query.name.trim() : ''
  const lite = req.query?.lite === '1' || req.query?.lite === 'true'
  if (!name) {
    return res.status(400).json({ error: 'Missing query parameter name or albumId' })
  }

  const cacheKey = `art:${normText(name)}:${lite ? 'lite' : 'full'}`
  const cached = artistCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return res.status(200).json(cached.data)
  }

  const [wiki, itunes, ytm] = await Promise.all([
    fetchWikiArtistBio(name),
    fetchItunesDiscography(name, lite),
    fetchYtMusicArtistTracks(name, lite),
  ])

  const avatarUrl =
    ytm.avatarUrl ||
    wiki?.thumbnail ||
    itunes.albums[0]?.coverUrl ||
    ytm.topTracks[0]?.coverUrl ||
    ''

  const headerImage =
    itunes.albums[0]?.coverUrl ||
    wiki?.thumbnail ||
    ytm.avatarUrl ||
    ytm.topTracks[0]?.coverUrl ||
    ''

  const singlesTracks: TrackSummary[] = []
  const seenTrackKey = new Set<string>()
  for (const t of ytm.topTracks) {
    seenTrackKey.add(`${normText(t.title)}|${normText(t.artist)}`)
  }
  for (const sAlb of itunes.singlesAlbums) {
    const key = `${normText(sAlb.title)}|${normText(sAlb.artist)}`
    if (!seenTrackKey.has(key)) {
      seenTrackKey.add(key)
      singlesTracks.push({
        id: sAlb.id,
        title: sAlb.title,
        artist: sAlb.artist,
        album: `${sAlb.title} - Single`,
        duration: 210,
        coverUrl: sAlb.coverUrl,
        source: 'youtube',
        genre: sAlb.genre || itunes.primaryGenre || 'Music',
        releaseYear: sAlb.year,
        color: '#8B5CF6',
      })
    }
  }

  const genres = Array.from(
    new Set(
      [
        itunes.primaryGenre,
        ...itunes.albums.map((a) => a.genre),
        ...itunes.eps.map((a) => a.genre),
      ].filter((g): g is string => Boolean(g && g !== 'Music'))
    )
  ).slice(0, 4)

  const payload = {
    artist: {
      id: `artist-${normText(name).replace(/\s+/g, '-')}`,
      name: itunes.matchedName || name,
      avatarUrl,
      headerImage,
      bannerUrl: headerImage,
      monthlyListeners: ytm.monthlyListeners || 0,
      bio: wiki?.bio || '',
      isFallbackBio: !wiki?.bio,
      genre: genres[0] || itunes.primaryGenre || 'Music',
      genres,
      isVerified: Boolean(itunes.artistId || ytm.avatarUrl || wiki?.bio),
      topTracks: ytm.topTracks,
      albums: itunes.albums,
      eps: itunes.eps,
      singles: singlesTracks,
      relatedArtists: ytm.related,
    },
  }

  artistCache.set(cacheKey, { ts: Date.now(), data: payload })
  return res.status(200).json(payload)
}
