import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function youtubeResolverPlugin(): Plugin {
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
      `${query} song`,
    ]

    for (const variant of searchVariants) {
      const candidates = await searchCandidateIds(variant)
      const filtered = candidates.filter((id) => !excludeSet.has(id))

      // Check first 8 candidates
      for (const id of filtered.slice(0, 8)) {
        if (await isEmbeddable(id)) {
          return id
        }
      }
    }

    return null
  }

  return {
    name: 'youtube-resolver',
    configureServer(server) {
      server.middlewares.use('/api/yt-resolve', async (req, res) => {
        try {
          const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`)
          const query = url.searchParams.get('q') || ''
          const excludeParam = url.searchParams.get('exclude') || ''
          const excludeIds = excludeParam ? excludeParam.split(',').map((s) => s.trim()) : []

          if (!query.trim()) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing query parameter q' }))
            return
          }

          const cacheKey = query.trim().toLowerCase()
          if (cache.has(cacheKey) && !excludeIds.includes(cache.get(cacheKey)!)) {
            const cachedId = cache.get(cacheKey)!
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify({ videoId: cachedId }))
            return
          }

          const videoId = await findEmbeddableVideoId(query.trim(), excludeIds)

          if (videoId) {
            cache.set(cacheKey, videoId)
          }

          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(JSON.stringify({ videoId }))
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Resolution failed'
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    youtubeResolverPlugin(),
  ],
})
