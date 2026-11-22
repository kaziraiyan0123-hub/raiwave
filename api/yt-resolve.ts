// Vercel Serverless Function: /api/yt-resolve
// Precision YouTube Music & Video Resolver (Exact Song & Official Audio Matching)

const cache = new Map<string, string>()

interface Candidate {
  videoId: string
  title: string
  artist: string
  isOfficialSong: boolean
}

async function resolveViaYouTubeMusic(query: string, excludeSet: Set<string>): Promise<Candidate[]> {
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
      query: query,
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
    const candidates: Candidate[] = []

    function searchNodes(node: any) {
      if (!node || typeof node !== 'object') return
      if (node.musicResponsiveListItemRenderer) {
        const item = node.musicResponsiveListItemRenderer
        const nav =
          item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
            ?.playNavigationEndpoint?.watchEndpoint || item.navigationEndpoint?.watchEndpoint
        const vid = nav?.videoId
        const flexCols = item.flexColumns || []
        const title =
          flexCols[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs
            ?.map((r: any) => r.text)
            .join('') || ''
        const artist =
          flexCols[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs
            ?.map((r: any) => r.text)
            .join('') || ''

        if (vid && typeof vid === 'string' && vid.length === 11 && !excludeSet.has(vid)) {
          candidates.push({
            videoId: vid,
            title,
            artist,
            isOfficialSong: artist.toLowerCase().includes('song •'),
          })
        }
      }
      for (const k of Object.keys(node)) {
        searchNodes(node[k])
      }
    }

    searchNodes(data)
    return candidates
  } catch (err) {
    console.warn('YouTube Music API error:', err)
    return []
  }
}

async function checkThumbnailExists(videoId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, {
      method: 'HEAD',
    })
    return res.status === 200
  } catch {
    return true // Assume true on network error
  }
}

async function findExactSongVideoId(query: string, excludeIds: string[] = []): Promise<string | null> {
  const excludeSet = new Set(excludeIds)

  // 1. First priority: Search exact song via YouTube Music WEB_REMIX API
  const musicCandidates = await resolveViaYouTubeMusic(query, excludeSet)
  if (musicCandidates.length > 0) {
    // Prefer official studio song track
    const official = musicCandidates.find((c) => c.isOfficialSong)
    if (official && (await checkThumbnailExists(official.videoId))) {
      return official.videoId
    }

    for (const cand of musicCandidates) {
      if (await checkThumbnailExists(cand.videoId)) {
        return cand.videoId
      }
    }
  }

  // 2. Secondary priority: Search with query + "official audio"
  const audioCandidates = await resolveViaYouTubeMusic(`${query} official audio`, excludeSet)
  if (audioCandidates.length > 0) {
    for (const cand of audioCandidates) {
      if (await checkThumbnailExists(cand.videoId)) {
        return cand.videoId
      }
    }
  }

  return null
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const query = (req.query?.q as string) || ''
  const excludeParam = (req.query?.exclude as string) || ''
  const excludeIds = excludeParam ? excludeParam.split(',').map((s: string) => s.trim()) : []

  if (!query.trim()) {
    return res.status(400).json({ error: 'Missing query parameter q' })
  }

  const cacheKey = `${query.trim().toLowerCase()}_${excludeIds.sort().join('_')}`
  if (cache.has(cacheKey)) {
    return res.status(200).json({ videoId: cache.get(cacheKey) })
  }

  try {
    const videoId = await findExactSongVideoId(query.trim(), excludeIds)
    if (videoId) {
      cache.set(cacheKey, videoId)
    }
    return res.status(200).json({ videoId })
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Resolution failed' })
  }
}
