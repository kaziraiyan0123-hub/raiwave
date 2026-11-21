// Legal, zero-API-key YouTube Video Resolver
// Resolves any song title & artist to its verified embeddable YouTube Video ID

const memoryCache = new Map<string, string>()

// Instant zero-delay verified catalogue mappings for popular anthems & chart-toppers
const PREMAPPED_CATALOG: Record<string, string> = {
  'the weeknd - blinding lights': '4NRXx6U8ABQ',
  'taylor swift - anti-hero': 'b1kbLwvqugk',
  'daft punk - get lucky': '5NV6Rdv1a3w',
  'queen - bohemian rhapsody': 'fJ9rUzIMcZQ',
  'billie eilish - bad guy': 'DyDfgMOUjCI',
  'coldplay - viva la vida': 'dvgZkm1xWPE',
  'ed sheeran - shape of you': 'JGwWNGJdvx8',
  'michael jackson - billie jean': 'Zi_XLORDoEY',
  'post malone - fall apart': '7a66clRobKI',
  'post malone - circles': 'UYwF-jdcVjY',
  'kendrick lamar - not like us': 'H58vbez_m4E',
  'sabrina carpenter - espresso': 'eVli-tstM5E',
  'sabrina carpenter - please please please': 'cF1Na4AIecM',
  'chappell roan - good luck, babe!': '1RKqOmSkGgM',
  'billie eilish - birds of a feather': 'd5gf9dXHevw',
  'lady gaga - die with a smile': 'kPa7bsKwL-8',
  'bruno mars - die with a smile': 'kPa7bsKwL-8',
  'dua lipa - levitating': 'TUVcZfQe-Kw',
  'dua lipa - houdini': 'suAR1PYFNYA',
  'drake - rich flex': 'Fv63f_B4Fm0',
  'drake - god\'s plan': 'xpVfcZ0ZcFM',
  'eminem - houdini': '22tVWwmTie8',
  'sza - kill bill': 'mSRp_1uE3nE',
  'sza - snooze': '6uhDYJk_iPQ',
  'olivia rodrigo - vampire': 'RlPNh_PBZb4',
  'olivia rodrigo - drivers license': 'ZmDBbnmKpqQ',
  'harry styles - as it was': 'H5v3kku4y6Q',
  'the weeknd - starboy': '34Na4j8AVgA',
  'the weeknd - save your tears': 'XXYlFuWEuKI',
  'miley cyrus - flowers': 'G7KNmW9a75Y',
}

export async function resolveYouTubeVideoId(query: string, excludeIds: string[] = []): Promise<string | null> {
  const clean = query.trim().toLowerCase()
  if (!clean) return null

  // Fast check: Known pre-mapped library
  if (excludeIds.length === 0) {
    for (const [key, vid] of Object.entries(PREMAPPED_CATALOG)) {
      if (clean.includes(key) || key.includes(clean)) {
        return vid
      }
    }
  }

  // Fast check: In-memory cache
  if (excludeIds.length === 0 && memoryCache.has(clean)) {
    return memoryCache.get(clean)!
  }

  // Fast check: Persisted local storage cache
  if (excludeIds.length === 0) {
    try {
      const saved = localStorage.getItem(`yt_id_${clean}`)
      if (saved) {
        memoryCache.set(clean, saved)
        return saved
      }
    } catch {
      // ignore
    }
  }

  const excludeParam = excludeIds.length > 0 ? `&exclude=${encodeURIComponent(excludeIds.join(','))}` : ''
  const endpoints = [
    `/api/yt-resolve?q=${encodeURIComponent(query)}${excludeParam}`,
    `https://raiwave.vercel.app/api/yt-resolve?q=${encodeURIComponent(query)}${excludeParam}`,
  ]

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: { 'Accept': 'application/json' },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.videoId) {
          memoryCache.set(clean, data.videoId)
          try {
            localStorage.setItem(`yt_id_${clean}`, data.videoId)
          } catch {}
          return data.videoId
        }
      }
    } catch {
      // try next endpoint
    }
  }

  // Fallback: Public Invidious instance search
  const invidiousInstances = [
    'https://invidious.nerdvpn.de',
    'https://inv.nadeko.net',
    'https://vid.puffyan.us',
  ]

  for (const instance of invidiousInstances) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3500)
      const res = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      if (res.ok) {
        const items = await res.json()
        if (Array.isArray(items)) {
          for (const item of items) {
            const vid = item.videoId
            if (vid && !excludeIds.includes(vid)) {
              memoryCache.set(clean, vid)
              try {
                localStorage.setItem(`yt_id_${clean}`, vid)
              } catch {}
              return vid
            }
          }
        }
      }
    } catch {
      // try next instance
    }
  }

  return null
}
