// Dynamic Album Artwork Color Extraction & Palette Service
// Intelligently analyzes album covers, computes harmonious accents, and guarantees accessibility

export interface DynamicPalette {
  primary: string        // Vibrant, accessible accent hex (e.g. #3B82F6, #EF4444, #8B5CF6)
  secondary: string      // Complementary lighter tint for gradients (e.g. #60A5FA)
  accentGlow: string     // Semi-transparent glow for halos and ambient lighting (rgba(r,g,b,0.28))
  surfaceGlow: string    // Deep dark ambient wash for card backgrounds (rgba(r,g,b,0.08))
  surfaceSubtle: string  // Ultra-subtle background wash for main workspace (rgba(r,g,b,0.03))
  borderColor: string    // Subtle transparent border (rgba(r,g,b,0.22))
  textColor: string      // High-contrast primary text (always white #FFFFFF for dark UI)
}

const paletteCache = new Map<string, DynamicPalette>()

/**
 * Converts a hex color string to RGB components.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim()
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('')
  }
  const num = parseInt(clean, 16)
  if (isNaN(num)) return { r: 139, g: 92, b: 246 }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

/**
 * Converts RGB components to a hex string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Converts RGB to HSL.
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/**
 * Converts HSL to Hex.
 */
export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0,
    g = 0,
    b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
  } else if (h >= 120 && h < 180) {
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255)
}

/**
 * Derives a full harmonized dynamic palette from a base color.
 * Enforces accessibility guidelines: maintains dark-theme contrast and avoids blinding saturation.
 */
export function generatePaletteFromColor(colorInput: string): DynamicPalette {
  const { r, g, b } = hexToRgb(colorInput)
  const { h, s, l } = rgbToHsl(r, g, b)

  // Calibrate lightness to optimal sweet spot (50% - 62%) for rich glowing appearance on dark charcoal
  const tunedLightness = Math.max(50, Math.min(62, l))
  const tunedSaturation = Math.max(68, Math.min(92, s))

  const primary = hslToHex(h, tunedSaturation, tunedLightness)
  const secondary = hslToHex((h + 12) % 360, Math.min(95, tunedSaturation + 5), Math.min(75, tunedLightness + 12))

  const pRgb = hexToRgb(primary)

  return {
    primary,
    secondary,
    accentGlow: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.28)`,
    surfaceGlow: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.08)`,
    surfaceSubtle: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.03)`,
    borderColor: `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.22)`,
    textColor: '#FFFFFF',
  }
}

/**
 * Computes a fallback palette based on track data if image extraction fails or has no CORS.
 */
export function getFallbackPalette(fallbackColor?: string, seedText?: string): DynamicPalette {
  if (fallbackColor && fallbackColor.startsWith('#')) {
    return generatePaletteFromColor(fallbackColor)
  }

  // Curated spectrum of 8 rich, elegant, dark-theme accents
  const PALETTE_SPECTRUM = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#10B981', // Emerald
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
  ]

  let hash = 0
  const str = seedText || 'raiwave-theme'
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const picked = PALETTE_SPECTRUM[Math.abs(hash) % PALETTE_SPECTRUM.length]
  return generatePaletteFromColor(picked)
}

/**
 * Intelligently extracts the dominant, vibrant accent color from an album artwork URL.
 * Uses an offscreen HTML Canvas to downsample and analyze color clusters.
 * Caches results in memory to eliminate redundant work.
 */
export async function extractPaletteFromImage(
  imageUrl?: string,
  fallbackColor?: string,
  seedText?: string
): Promise<DynamicPalette> {
  if (!imageUrl) {
    return getFallbackPalette(fallbackColor, seedText)
  }

  // Return cached palette if already analyzed
  if (paletteCache.has(imageUrl)) {
    return paletteCache.get(imageUrl)!
  }

  return new Promise((resolve) => {
    // If not in a browser environment (e.g. SSR or testing), return fallback
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      const fallback = getFallbackPalette(fallbackColor, seedText)
      paletteCache.set(imageUrl, fallback)
      resolve(fallback)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    // Safety timeout in case image loading hangs
    const timer = setTimeout(() => {
      const fallback = getFallbackPalette(fallbackColor, seedText)
      paletteCache.set(imageUrl, fallback)
      resolve(fallback)
    }, 1800)

    img.onload = () => {
      clearTimeout(timer)
      try {
        const canvas = document.createElement('canvas')
        const size = 36 // Downsample to 36x36 for instant analysis and noise reduction
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d', { willReadFrequently: true })

        if (!ctx) {
          const fallback = getFallbackPalette(fallbackColor, seedText)
          paletteCache.set(imageUrl, fallback)
          resolve(fallback)
          return
        }

        ctx.drawImage(img, 0, 0, size, size)
        const imgData = ctx.getImageData(0, 0, size, size).data
        const pixelCount = size * size

        // Analyze pixels: find the color with highest vibrancy score
        let bestR = 139,
          bestG = 92,
          bestB = 246
        let maxVibrancyScore = -1

        // Color buckets by hue (12 bins around the 360 color wheel)
        const bins: { count: number; sumR: number; sumG: number; sumB: number; totalScore: number }[] = Array.from(
          { length: 12 },
          () => ({ count: 0, sumR: 0, sumG: 0, sumB: 0, totalScore: 0 })
        )

        for (let i = 0; i < pixelCount; i++) {
          const r = imgData[i * 4]
          const g = imgData[i * 4 + 1]
          const b = imgData[i * 4 + 2]
          const a = imgData[i * 4 + 3]

          if (a < 128) continue // Skip transparent pixels

          const { h, s, l } = rgbToHsl(r, g, b)

          // Filter out pure black, pure white, and low-saturation muddiness
          if (l < 15 || l > 88 || s < 18) continue

          // Vibrancy score rewards high saturation and balanced lightness
          const vibrancyScore = (s / 100) * (1 - Math.abs(l - 55) / 50)
          const binIndex = Math.floor(h / 30) % 12

          bins[binIndex].count++
          bins[binIndex].sumR += r
          bins[binIndex].sumG += g
          bins[binIndex].sumB += b
          bins[binIndex].totalScore += vibrancyScore
        }

        // Find the bin with the highest combined vibrancy score
        for (const bin of bins) {
          if (bin.count > 0 && bin.totalScore > maxVibrancyScore) {
            maxVibrancyScore = bin.totalScore
            bestR = Math.round(bin.sumR / bin.count)
            bestG = Math.round(bin.sumG / bin.count)
            bestB = Math.round(bin.sumB / bin.count)
          }
        }

        // If no vibrant pixels found (e.g. grayscale album art), fall back gracefully
        if (maxVibrancyScore <= 0) {
          const fallback = getFallbackPalette(fallbackColor, seedText)
          paletteCache.set(imageUrl, fallback)
          resolve(fallback)
          return
        }

        const rawHex = rgbToHex(bestR, bestG, bestB)
        const palette = generatePaletteFromColor(rawHex)
        paletteCache.set(imageUrl, palette)
        resolve(palette)
      } catch {
        // CORS or canvas extraction error fallback
        const fallback = getFallbackPalette(fallbackColor, seedText)
        paletteCache.set(imageUrl, fallback)
        resolve(fallback)
      }
    }

    img.onerror = () => {
      clearTimeout(timer)
      const fallback = getFallbackPalette(fallbackColor, seedText)
      paletteCache.set(imageUrl, fallback)
      resolve(fallback)
    }

    img.src = imageUrl
  })
}
