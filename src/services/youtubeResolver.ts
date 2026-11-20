// Legal, zero-API-key YouTube Video Resolver
// Resolves any song title & artist to its verified embeddable YouTube Video ID

const memoryCache = new Map<string, string>()

export async function resolveYouTubeVideoId(query: string, excludeIds: string[] = []): Promise<string | null> {
  const clean = query.trim().toLowerCase()
  if (!clean) return null

  // If no excluded IDs, check cache
  if (excludeIds.length === 0 && memoryCache.has(clean)) {
    return memoryCache.get(clean)!
  }

  // Check localStorage for persisted cache
  if (excludeIds.length === 0) {
    try {
      const saved = localStorage.getItem(`yt_id_${clean}`)
      if (saved) {
        memoryCache.set(clean, saved)
        return saved
      }
    } catch {
      // ignore storage restrictions
    }
  }

  // Call local Vite dev server resolver
  try {
    const excludeParam = excludeIds.length > 0 ? `&exclude=${encodeURIComponent(excludeIds.join(','))}` : ''
    const res = await fetch(`/api/yt-resolve?q=${encodeURIComponent(query)}${excludeParam}`)
    if (res.ok) {
      const data = await res.json()
      if (data.videoId) {
        memoryCache.set(clean, data.videoId)
        try {
          localStorage.setItem(`yt_id_${clean}`, data.videoId)
        } catch {
          // ignore
        }
        return data.videoId
      }
    }
  } catch {
    // continue
  }

  return null
}
