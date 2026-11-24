export const DATA_SAVER_STORAGE_KEY = 'raiwave_data_saver_mode'
export const DATA_SAVER_EVENT = 'raiwave-data-saver-change'

export interface StaticNetworkState {
  isOnline: boolean
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown'
  isSlowConnection: boolean
  dataSaverEnabled: boolean
  isLowDataMode: boolean
}

export function getNetworkState(): StaticNetworkState {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  let dataSaverEnabled = false
  try {
    dataSaverEnabled = localStorage.getItem(DATA_SAVER_STORAGE_KEY) === 'true'
  } catch {
    dataSaverEnabled = false
  }

  let effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown' = '4g'
  let saveDataHeader = false
  if (typeof navigator !== 'undefined') {
    const conn =
      (navigator as unknown as { connection?: { effectiveType?: string; saveData?: boolean } })
        .connection ||
      (navigator as unknown as { mozConnection?: { effectiveType?: string; saveData?: boolean } })
        .mozConnection ||
      (navigator as unknown as { webkitConnection?: { effectiveType?: string; saveData?: boolean } })
        .webkitConnection
    if (conn) {
      if (
        conn.effectiveType === '4g' ||
        conn.effectiveType === '3g' ||
        conn.effectiveType === '2g' ||
        conn.effectiveType === 'slow-2g'
      ) {
        effectiveType = conn.effectiveType
      } else {
        effectiveType = 'unknown'
      }
      saveDataHeader = Boolean(conn.saveData)
    }
  }

  const isSlowConnection =
    !isOnline ||
    effectiveType === '3g' ||
    effectiveType === '2g' ||
    effectiveType === 'slow-2g' ||
    saveDataHeader

  return {
    isOnline,
    effectiveType,
    isSlowConnection,
    dataSaverEnabled: dataSaverEnabled || saveDataHeader,
    isLowDataMode: dataSaverEnabled || saveDataHeader || isSlowConnection,
  }
}

export function getOptimizedArtworkUrl(
  url: string | undefined | null,
  size: 'thumb' | 'card' | 'hero' = 'card',
  forceLowData?: boolean
): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed
  }

  const lowData = typeof forceLowData === 'boolean' ? forceLowData : getNetworkState().isLowDataMode

  // iTunes / Apple Music CDN
  if (trimmed.includes('mzstatic.com')) {
    const px = lowData
      ? size === 'thumb'
        ? 120
        : size === 'card'
          ? 200
          : 360
      : size === 'thumb'
        ? 200
        : size === 'card'
          ? 400
          : 800
    return trimmed.replace(/\/\d+x\d+bb(\.\w+)$/i, `/${px}x${px}bb$1`)
  }

  // YouTube Video Thumbnails
  if (trimmed.includes('ytimg.com/vi/')) {
    if (lowData) {
      return trimmed.replace(/(maxresdefault|sddefault|hqdefault)\.jpg/i, size === 'hero' ? 'hqdefault.jpg' : 'mqdefault.jpg')
    }
    if (size === 'thumb') {
      return trimmed.replace(/(maxresdefault|sddefault)\.jpg/i, 'mqdefault.jpg')
    }
    return trimmed
  }

  // YouTube Music / Google User Content CDN
  if (trimmed.includes('googleusercontent.com') || trimmed.includes('ggpht.com')) {
    const px = lowData
      ? size === 'thumb'
        ? 120
        : size === 'card'
          ? 220
          : 400
      : size === 'thumb'
        ? 220
        : size === 'card'
          ? 400
          : 720
    if (/=w\d+-h\d+/i.test(trimmed)) {
      return trimmed.replace(/=w\d+-h\d+[^&\s]*/i, `=w${px}-h${px}-l85-rj`)
    }
    if (/=s\d+/i.test(trimmed)) {
      return trimmed.replace(/=s\d+[^&\s]*/i, `=s${px}-c`)
    }
  }

  // Unsplash images
  if (trimmed.includes('images.unsplash.com')) {
    const px = lowData
      ? size === 'thumb'
        ? 160
        : size === 'card'
          ? 280
          : 540
      : size === 'thumb'
        ? 240
        : size === 'card'
          ? 480
          : 900
    let out = trimmed.replace(/([?&]w=)\d+/i, `$1${px}`)
    if (lowData && !/([?&]q=)\d+/i.test(out)) {
      out += (out.includes('?') ? '&' : '?') + 'q=65&auto=format'
    }
    return out
  }

  return trimmed
}
