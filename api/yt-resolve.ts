// Vercel Serverless Function: /api/yt-resolve
// Precision YouTube Music & Video Resolver (Exact Song & Official Audio Matching)

const cache = new Map<string, string>()

interface Candidate {
  videoId: string
  title: string
  subtitle: string
  isOfficialSong: boolean
}

function extractKeywords(str: string): string[] {
  return str
    .toLowerCase()
    .split(/[\s|•\-_,()]+/)
    .map((w) => w.replace(/[^a-z0-9\u0980-\u09FF]/g, ''))
    .filter((w) => w.length >= 2)
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
        const subtitle =
          flexCols[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs
            ?.map((r: any) => r.text)
            .join('') || ''

        if (vid && typeof vid === 'string' && vid.length === 11 && !excludeSet.has(vid)) {
          candidates.push({
            videoId: vid,
            title,
            subtitle,
            isOfficialSong: subtitle.toLowerCase().includes('song •'),
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

async function checkEmbeddable(videoId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(2500),
    })
    return res.status === 200
  } catch {
    return true
  }
}

async function findExactSongVideoId(query: string, excludeIds: string[] = []): Promise<string | null> {
  const excludeSet = new Set(excludeIds)
  const qWords = extractKeywords(query)

  // 1. Search YouTube Music WEB_REMIX
  const candidates = await resolveViaYouTubeMusic(query, excludeSet)

  // Strict Title Matching: Candidates MUST have words matching the requested title!
  const scored: Array<Candidate & { score: number }> = []

  const queryParts = query.split(/[-–|]+/).map((s) => s.trim()).filter(Boolean)

  const wantsRemix =
    query.toLowerCase().includes('remix') ||
    query.toLowerCase().includes('cover') ||
    query.toLowerCase().includes('lofi')

  for (const c of candidates) {
    const titleLower = c.title.toLowerCase()
    const subtitleLower = c.subtitle.toLowerCase()

    // Filter out non-song items
    if (
      titleLower.includes('news') ||
      titleLower.includes('পুরস্কার') ||
      titleLower.includes('দোয়া') ||
      titleLower.includes('ওয়াজ') ||
      titleLower.includes('talk show')
    ) {
      continue
    }

    const tWords = extractKeywords(c.title)
    const sWords = extractKeywords(c.subtitle)
    const allWords = [...tWords, ...sWords]

    let matched = 0
    for (const qw of qWords) {
      if (allWords.some((w) => w.includes(qw) || qw.includes(w))) {
        matched++
      }
    }

    // Must match at least one keyword
    if (matched === 0) continue

    // CRITICAL: Ensure at least one query keyword matches the TITLE itself if multi-word query
    // This prevents "Amar Golpe Tumi" from being selected when searching for "Alo Tahsan"
    const titleMatchesQuery = qWords.some((qw) =>
      tWords.some((tw) => tw === qw || tw.includes(qw) || qw.includes(tw))
    )
    if (!titleMatchesQuery && qWords.length > 1) {
      continue
    }

    let score = matched * 100
    if (c.isOfficialSong) score += 150
    if (subtitleLower.includes('video •')) score += 80
    if (titleLower.includes('official')) score += 100
    if (titleLower.includes('lyrics') || titleLower.includes('lyrical')) score += 60

    // Exact or Core title match bonus
    const coreTitle = c.title.split(/[-–|:(\[]+/)[0].trim().toLowerCase()
    const normCore = coreTitle.replace(/[^a-z0-9]/g, '')
    if (queryParts.some((p) => p.toLowerCase().replace(/[^a-z0-9]/g, '') === normCore)) {
      score += 350
    }

    // Divergent words penalty in core title (prevents picking tracks with completely different extra words)
    const coreWords = extractKeywords(c.title.split(/[-–|:(\[]+/)[0])
    const extraWords = coreWords.filter(
      (tw) => !qWords.some((qw) => qw === tw || qw.includes(tw) || tw.includes(qw))
    )
    score -= extraWords.length * 60

    if (!wantsRemix) {
      if (titleLower.includes('cover')) score -= 150
      if (titleLower.includes('lofi') || titleLower.includes('lo-fi')) score -= 90
      if (titleLower.includes('remix')) score -= 70
      if (titleLower.includes('slowed') || titleLower.includes('reverb')) score -= 80
    }

    scored.push({ ...c, score })
  }

  scored.sort((a, b) => b.score - a.score)

  // Test embeddability on the top candidates
  for (const item of scored) {
    const ok = await checkEmbeddable(item.videoId)
    if (ok) {
      return item.videoId
    }
  }

  // 2. Secondary fallback: Search with query + "official audio"
  const audioCandidates = await resolveViaYouTubeMusic(`${query} official audio`, excludeSet)
  for (const c of audioCandidates) {
    const tWords = extractKeywords(c.title)
    const titleMatches = qWords.some((qw) =>
      tWords.some((tw) => tw === qw || tw.includes(qw) || qw.includes(tw))
    )
    if (titleMatches) {
      const ok = await checkEmbeddable(c.videoId)
      if (ok) return c.videoId
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
