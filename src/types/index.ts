export interface LyricLine {
  time: number // in seconds
  text: string
}

export type AudioSourceType = 'local' | 'youtube' | 'spotify'

export interface Track {
  id: string
  title: string
  artist: string
  artistId?: string
  album: string
  albumId?: string
  duration: number // in seconds
  coverUrl: string
  audioUrl?: string
  previewUrl?: string
  youtubeId?: string
  spotifyUri?: string
  source?: AudioSourceType
  genre: string
  releaseYear: number
  lyrics?: LyricLine[]
  color?: string // Dominant theme hex for dynamic gradients (e.g. #3b82f6)
  explicit?: boolean
  isOfflineAvailable?: boolean
}

export interface Playlist {
  id: string
  name: string
  description: string
  coverUrl: string
  tracks: Track[]
  owner: string
  color: string
  isCustom?: boolean
}

export interface Album {
  id: string
  title: string
  artist: string
  coverUrl: string
  year: number
  tracks: Track[]
  color: string
}

export interface Artist {
  id: string
  name: string
  avatarUrl: string
  monthlyListeners: number
  bio: string
  topTracks: Track[]
  headerImage: string
}

export type ViewMode =
  | 'home'
  | 'explore'
  | 'search'
  | 'library'
  | 'playlist'
  | 'album'
  | 'artist'
  | 'liked'
  | 'lyrics'
  | 'queue'
  | 'visualizer'

export type VisualizerMode =
  | 'bars'
  | 'circular'
  | 'waveform'
  | 'aurora'
  | 'particles'
  | 'minimal'

export type RepeatMode = 'off' | 'all' | 'one'

export interface AudioRecording {
  id: string
  title: string
  audioDataUrl: string
  duration: number
  createdAt: number
  notes?: string
}

export interface UserProfile {
  name: string
  email: string
  avatarUrl: string
  developerCredit: string
  joinedDate: string
  recordings: AudioRecording[]
}

