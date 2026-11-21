// Vercel Serverless Function: /api/yt-resolve
// Zero API key, clean room YouTube embed video resolver

const cache = new Map<string, string>()

async function isEmbeddable(videoId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
    })
    return res.status === 200
  } catch {
    return false
  }
}

async function searchCandidateIds(searchQuery: string): Promise<string[]> {
  try {
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
    const fetchRes = await fetch(ytUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    const html = await fetchRes.text()
    const matches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map((m) => m[1])
    return [...new Set(matches)]
  } catch {
    return []
  }
}

async function findEmbeddableVideoId(query: string, excludeIds: string[] = []): Promise<string | null> {
  const excludeSet = new Set(excludeIds)

  const searchVariants = [
    `${query} audio`,
    `${query} lyrics`,
    query,
    `${query} official audio`,
  ]

  for (const variant of searchVariants) {
    const candidates = await searchCandidateIds(variant)
    const filtered = candidates.filter((id) => !excludeSet.has(id))

    for (const id of filtered.slice(0, 8)) {
      if (await isEmbeddable(id)) {
        return id
      }
    }
  }

  return null
}

export default async function handler(req: any, res: any) {
  // Enable CORS for mobile apps and PWA
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

  const cacheKey = query.trim().toLowerCase()
  if (cache.has(cacheKey) && !excludeIds.includes(cache.get(cacheKey)!)) {
    return res.status(200).json({ videoId: cache.get(cacheKey) })
  }

  try {
    const videoId = await findEmbeddableVideoId(query.trim(), excludeIds)
    if (videoId) {
      cache.set(cacheKey, videoId)
    }
    return res.status(200).json({ videoId })
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Resolution failed' })
  }
}
