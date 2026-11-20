export interface ParsedMediaLink {
  type: 'youtube' | 'spotify' | 'unknown'
  id: string
  originalUrl: string
}

export function parseMediaUrl(input: string): ParsedMediaLink {
  const trimmed = input.trim()

  // 1. YouTube & YouTube Music formats
  // Examples:
  // - https://music.youtube.com/watch?v=4NRXx6U8ABQ
  // - https://www.youtube.com/watch?v=4NRXx6U8ABQ&list=...
  // - https://youtu.be/4NRXx6U8ABQ
  // - https://www.youtube.com/embed/4NRXx6U8ABQ
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|music\.youtube\.com\/watch\?v=|youtu\.be\/)([^"&?\/\s]{11})/i
  const ytMatch = trimmed.match(ytRegex)
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      id: ytMatch[1],
      originalUrl: trimmed,
    }
  }

  // 2. Direct 11-character YouTube ID check
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return {
      type: 'youtube',
      id: trimmed,
      originalUrl: `https://www.youtube.com/watch?v=${trimmed}`,
    }
  }

  // 3. Spotify Track Link or URI
  // Examples:
  // - spotify:track:4NRXx6U8ABQ
  // - https://open.spotify.com/track/4NRXx6U8ABQ
  const spotifyRegex = /(?:spotify:track:|open\.spotify\.com\/track\/)([a-zA-Z0-9]{22})/i
  const spotifyMatch = trimmed.match(spotifyRegex)
  if (spotifyMatch && spotifyMatch[1]) {
    return {
      type: 'spotify',
      id: spotifyMatch[1],
      originalUrl: trimmed,
    }
  }

  return {
    type: 'unknown',
    id: '',
    originalUrl: trimmed,
  }
}
