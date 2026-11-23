import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import type { Track, Playlist, RepeatMode, ViewMode, Album, Artist, UserProfile, AudioRecording } from '../types'
import { SAMPLE_TRACKS } from '../data/musicData'
import { youtubeService } from '../services/youtubePlayer'
import { parseMediaUrl } from '../utils/urlParser'
import { searchGlobalMusic } from '../services/musicSearch'
import { realtimeMusicService } from '../services/realtimeMusicService'
import { fetchLiveLyrics } from '../services/lyricsService'
import { offlineService } from '../services/offlineService'
import { smartQueueService } from '../services/smartQueueService'
import {
  extractPaletteFromImage,
  generatePaletteFromColor,
  type DynamicPalette,
} from '../services/colorExtractionService'
import { visualizerAudioService } from '../services/visualizerAudioService'
import type { LyricLine } from '../types'

interface PlayerContextType {
  // Playback state
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  repeatMode: RepeatMode
  isShuffle: boolean
  queue: Track[]
  queueIndex: number
  history: Track[]
  activeEngine: 'audio' | 'youtube'
  toastMessage: string | null
  showToast: (msg: string) => void
  isVideoOpen: boolean
  toggleVideoOpen: () => void

  // Navigation & Views
  currentView: ViewMode
  selectedPlaylist: Playlist | null
  selectedAlbum: Album | null
  selectedArtist: Artist | null
  searchQuery: string

  // User Library & Playlists
  likedTrackIds: string[]
  userPlaylists: Playlist[]

  // Controls
  playTrack: (track: Track, newQueue?: Track[]) => void
  playCustomUrlOrId: (urlOrId: string) => boolean
  playBySearchQuery: (query: string) => void
  togglePlay: () => void
  seek: (seconds: number) => void
  setVolume: (vol: number) => void
  toggleMute: () => void
  nextTrack: () => void
  prevTrack: () => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  toggleLike: (trackId: string) => void
  isLiked: (trackId: string) => boolean
  addToQueue: (track: Track) => void
  addAlbumToQueue: (album: Album) => void
  addPlaylistToQueue: (playlist: Playlist) => void
  reorderQueue: (fromIndex: number, toIndex: number) => void
  reorderUpcoming: (fromUpcomingIdx: number, toUpcomingIdx: number) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  playQueuedTrackImmediately: (index: number) => void
  isQueuePanelOpen: boolean
  setIsQueuePanelOpen: (open: boolean) => void
  toggleQueuePanel: () => void

  // Navigation actions
  navigateTo: (view: ViewMode) => void
  goBack: () => void
  canGoBack: boolean
  openPlaylist: (playlist: Playlist) => void
  openAlbum: (album: Album) => void
  openArtist: (artist: Artist) => void
  setSearchQuery: (query: string) => void

  // Brand, Mobile & Category Extensions
  activeCategory: string
  setActiveCategory: (cat: string) => void
  isMobilePlayerOpen: boolean
  setIsMobilePlayerOpen: (open: boolean) => void
  toggleMobilePlayer: () => void

  // Dedicated Immersive Music Visualizer
  isDedicatedVisualizerOpen: boolean
  setIsDedicatedVisualizerOpen: (open: boolean) => void
  toggleDedicatedVisualizer: () => void
  openDedicatedVisualizer: () => void
  closeDedicatedVisualizer: () => void

  // Playlist management
  createPlaylist: (name: string, description?: string) => Playlist
  addTrackToPlaylist: (playlistId: string, track: Track) => void
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void

  // Gmail Profile & Developer Management
  userProfile: UserProfile
  isProfileOpen: boolean
  toggleProfile: () => void
  updateUserProfile: (updates: Partial<UserProfile>) => void

  // Android Music Notification Card
  isNotificationOpen: boolean
  toggleNotification: () => void
  setIsNotificationOpen: (val: boolean) => void
  isNotificationExpanded: boolean
  toggleNotificationExpanded: () => void
  notificationTheme: 'dark' | 'light'
  toggleNotificationTheme: () => void

  // Studio Audio Recorder
  isRecorderOpen: boolean
  toggleRecorder: () => void
  recordings: AudioRecording[]
  addRecording: (rec: AudioRecording) => void
  deleteRecording: (id: string) => void
  playRecording: (rec: AudioRecording) => void

  // Real-Time Music Engine
  realtimeTopTracks: Track[]
  realtimeRecommended: Track[]
  isLoadingRealtime: boolean
  refreshRealtimeMusic: () => Promise<void>

  // Recently Played
  clearHistory: () => void

  // Live Synced Lyrics
  liveLyrics: LyricLine[]
  isLoadingLyrics: boolean

  // Offline Mode & Downloads
  offlineTrackIds: string[]
  saveOffline: (track: Track) => Promise<boolean>
  removeOffline: (trackId: string) => Promise<boolean>
  isOffline: (trackId: string) => boolean

  // Smart Queue & Autoplay
  isSmartQueueEnabled: boolean
  toggleSmartQueue: () => void
  smartSuggestions: Track[]

  // Mood Stations
  playMoodStation: (moodTitle: string, tag: string) => Promise<void>

  // Dynamic Album-Art Theme
  dynamicTheme: DynamicPalette
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentEngineRef = useRef<'audio' | 'youtube'>('audio')
  const currentTrackRef = useRef<Track | null>(null)
  const repeatModeRef = useRef<RepeatMode>('off')
  const queueRef = useRef<Track[]>(SAMPLE_TRACKS)
  const queueIndexRef = useRef<number>(0)
  const isShuffleRef = useRef<boolean>(false)
  const blockedVideoIdsRef = useRef<Set<string>>(new Set())
  const playRequestIdRef = useRef<number>(0)
  const lastPlayTimeRef = useRef<number>(0)

  // Current track & queue state (Default idle - never autoplay on load)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [volume, setVolumeState] = useState<number>(0.85)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off')
  const [isShuffle, setIsShuffle] = useState<boolean>(false)
  const [queue, setQueue] = useState<Track[]>(SAMPLE_TRACKS)
  const [queueIndex, setQueueIndex] = useState<number>(0)
  const [history, setHistory] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('raiwave_recently_played')
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })

  const clearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem('raiwave_recently_played')
    } catch {}
    showToast('Recently played history cleared')
  }

  // Live Synced Lyrics State
  const [liveLyrics, setLiveLyrics] = useState<LyricLine[]>([])
  const [isLoadingLyrics, setIsLoadingLyrics] = useState<boolean>(false)

  // Offline Mode & Downloads State
  const [offlineTrackIds, setOfflineTrackIds] = useState<string[]>(() => offlineService.getOfflineTrackIds())

  const saveOffline = async (track: Track): Promise<boolean> => {
    showToast(`⏳ Saving "${track.title}" offline...`)
    const success = await offlineService.saveTrackOffline(track)
    if (success) {
      setOfflineTrackIds(offlineService.getOfflineTrackIds())
      showToast(`✅ "${track.title}" downloaded & ready offline!`)
    } else {
      showToast(`❌ Could not save "${track.title}" offline`)
    }
    return success
  }

  const removeOffline = async (trackId: string): Promise<boolean> => {
    const success = await offlineService.removeTrackOffline(trackId)
    if (success) {
      setOfflineTrackIds(offlineService.getOfflineTrackIds())
      showToast(`Removed from offline downloads`)
    }
    return success
  }

  const isOffline = (trackId: string) => offlineTrackIds.includes(trackId)

  // Smart Queue & Autoplay
  const [isSmartQueueEnabled, setIsSmartQueueEnabled] = useState<boolean>(true)
  const isSmartQueueEnabledRef = useRef<boolean>(true)
  const [smartSuggestions, setSmartSuggestions] = useState<Track[]>([])

  const toggleSmartQueue = () => {
    setIsSmartQueueEnabled((prev) => {
      const next = !prev
      isSmartQueueEnabledRef.current = next
      showToast(next ? '✨ Smart Autoplay Queue: ON' : 'Smart Autoplay Queue: OFF')
      return next
    })
  }

  const [activeEngine, setActiveEngine] = useState<'audio' | 'youtube'>('audio')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false)
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [isMobilePlayerOpen, setIsMobilePlayerOpen] = useState<boolean>(false)
  const [isDedicatedVisualizerOpen, setIsDedicatedVisualizerOpen] = useState<boolean>(false)

  // User Profile & Account (Gmail maintained)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('raiwave_user_profile')
      if (saved) return JSON.parse(saved)
    } catch {}
    return {
      name: '',
      email: '',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      developerCredit: 'Kazi Raiyan (Lead Developer & Creator)',
      joinedDate: 'November 2026',
      recordings: [],
    }
  })
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false)
  const toggleProfile = () => setIsProfileOpen((prev) => !prev)

  // Dynamic Album-Art-Based Theme Palette
  const [dynamicTheme, setDynamicTheme] = useState<DynamicPalette>(() =>
    generatePaletteFromColor('#8B5CF6')
  )

  // Extract and smoothly apply dynamic theme when currentTrack changes
  useEffect(() => {
    let isMounted = true
    if (currentTrack) {
      extractPaletteFromImage(
        currentTrack.coverUrl,
        currentTrack.color,
        `${currentTrack.title}-${currentTrack.artist}`
      ).then((palette) => {
        if (isMounted) {
          setDynamicTheme(palette)
          if (typeof document !== 'undefined') {
            const root = document.documentElement
            root.style.setProperty('--accent-primary', palette.primary)
            root.style.setProperty('--accent-secondary', palette.secondary)
            root.style.setProperty('--accent-glow', palette.accentGlow)
            root.style.setProperty('--accent-surface', palette.surfaceGlow)
            root.style.setProperty('--accent-border', palette.borderColor)
          }
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [currentTrack?.coverUrl, currentTrack?.color, currentTrack?.title])

  // UP NEXT Queue Panel State
  const [isQueuePanelOpen, setIsQueuePanelOpen] = useState<boolean>(false)
  const toggleQueuePanel = () => setIsQueuePanelOpen((prev) => !prev)

  // Android Music Notification Card State
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(true)
  const [isNotificationExpanded, setIsNotificationExpanded] = useState<boolean>(false)
  const [notificationTheme, setNotificationTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('raiwave_notification_theme')
      if (saved === 'light' || saved === 'dark') return saved
    } catch {}
    return 'dark'
  })

  const toggleNotification = () => setIsNotificationOpen((prev) => !prev)
  const toggleNotificationExpanded = () => setIsNotificationExpanded((prev) => !prev)
  const toggleNotificationTheme = () => {
    setNotificationTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('raiwave_notification_theme', next)
      } catch {}
      return next
    })
  }

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem('raiwave_user_profile', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  // Personal Audio & Studio Recorder
  const [isRecorderOpen, setIsRecorderOpen] = useState<boolean>(false)
  const toggleRecorder = () => setIsRecorderOpen((prev) => !prev)
  const [recordings, setRecordings] = useState<AudioRecording[]>(() => {
    try {
      const saved = localStorage.getItem('raiwave_recordings')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const addRecording = (rec: AudioRecording) => {
    setRecordings((prev) => {
      const updated = [rec, ...prev]
      try {
        localStorage.setItem('raiwave_recordings', JSON.stringify(updated))
      } catch {}
      return updated
    })
    showToast(`Saved recording: "${rec.title}"!`)
  }

  const deleteRecording = (id: string) => {
    setRecordings((prev) => {
      const updated = prev.filter((r) => r.id !== id)
      try {
        localStorage.setItem('raiwave_recordings', JSON.stringify(updated))
      } catch {}
      return updated
    })
    showToast('Recording removed from your library.')
  }

  const playRecording = (rec: AudioRecording) => {
    const recTrack: Track = {
      id: `recording-${rec.id}`,
      title: rec.title,
      artist: userProfile.name || 'Personal Recording',
      album: 'Studio Recordings',
      duration: rec.duration,
      coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
      audioUrl: rec.audioDataUrl,
      source: 'local',
      genre: 'Personal Recording',
      releaseYear: new Date(rec.createdAt).getFullYear(),
      color: '#B6F36B',
    }
    playTrack(recTrack, [recTrack])
  }

  // Real-Time Music Engine
  const [realtimeTopTracks, setRealtimeTopTracks] = useState<Track[]>([])
  const [realtimeRecommended, setRealtimeRecommended] = useState<Track[]>([])
  const [isLoadingRealtime, setIsLoadingRealtime] = useState<boolean>(false)

  const refreshRealtimeMusic = async () => {
    setIsLoadingRealtime(true)
    try {
      const [top, rec] = await Promise.all([
        realtimeMusicService.fetchLiveTop50(),
        realtimeMusicService.fetchRealtimeByCategory(activeCategory),
      ])
      if (top.length > 0) setRealtimeTopTracks(top)
      if (rec.length > 0) setRealtimeRecommended(rec)
    } catch (err) {
      console.warn('Realtime music refresh error:', err)
    } finally {
      setIsLoadingRealtime(false)
    }
  }

  // Fetch real-time music on mount and when active category changes
  useEffect(() => {
    refreshRealtimeMusic()
  }, [])

  useEffect(() => {
    realtimeMusicService.fetchRealtimeByCategory(activeCategory).then((tracks) => {
      if (tracks.length > 0) setRealtimeRecommended(tracks)
    })
  }, [activeCategory])

  const toggleVideoOpen = () => setIsVideoOpen((prev) => !prev)
  const toggleMobilePlayer = () => {
    setIsMobilePlayerOpen((prev) => {
      const next = !prev
      if (next) {
        try { window.history.pushState({ modal: 'mobilePlayer' }, '') } catch {}
      }
      return next
    })
  }

  const toggleDedicatedVisualizer = () => {
    if (!currentTrackRef.current) {
      showToast('Select and play a track first to visualize!')
      return
    }
    setIsDedicatedVisualizerOpen((prev) => {
      const next = !prev
      if (next) {
        try { window.history.pushState({ modal: 'visualizer' }, '') } catch {}
      }
      return next
    })
  }

  const openDedicatedVisualizer = () => {
    if (!currentTrackRef.current) {
      showToast('Select and play a track first to visualize!')
      return
    }
    try { window.history.pushState({ modal: 'visualizer' }, '') } catch {}
    setIsDedicatedVisualizerOpen(true)
  }

  const closeDedicatedVisualizer = () => {
    setIsDedicatedVisualizerOpen(false)
  }

  // Keep refs in sync for event callbacks
  useEffect(() => {
    currentTrackRef.current = currentTrack
  }, [currentTrack])

  useEffect(() => {
    repeatModeRef.current = repeatMode
  }, [repeatMode])

  useEffect(() => {
    queueRef.current = queue
  }, [queue])

  useEffect(() => {
    queueIndexRef.current = queueIndex
  }, [queueIndex])

  useEffect(() => {
    isShuffleRef.current = isShuffle
  }, [isShuffle])

  // Views & navigation
  const [currentView, setCurrentView] = useState<ViewMode>('home')
  const [viewHistory, setViewHistory] = useState<ViewMode[]>(['home'])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Persistence
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('raiwave_liked_tracks') || localStorage.getItem('spotiflow_liked_tracks')
      return saved ? JSON.parse(saved) : ['yt-weeknd-blinding-lights', 'yt-daft-punk-get-lucky']
    } catch {
      return ['yt-weeknd-blinding-lights', 'yt-daft-punk-get-lucky']
    }
  })

  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('raiwave_user_playlists') || localStorage.getItem('spotiflow_user_playlists')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Save liked tracks
  useEffect(() => {
    localStorage.setItem('raiwave_liked_tracks', JSON.stringify(likedTrackIds))
  }, [likedTrackIds])

  // Save user playlists
  useEffect(() => {
    localStorage.setItem('raiwave_user_playlists', JSON.stringify(userPlaylists))
  }, [userPlaylists])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 3500)
  }

  // 1. Initialize Persistent Audio Element ONCE on mount
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'auto'
    audioRef.current = audio
    visualizerAudioService.attachAudioElement(audio)

    const onPlay = () => {
      if (currentEngineRef.current === 'audio') {
        setIsPlaying(true)
      }
    }

    const onPause = () => {
      if (currentEngineRef.current === 'audio') {
        setIsPlaying(false)
      }
    }

    const onTimeUpdate = () => {
      if (currentEngineRef.current === 'audio') {
        setCurrentTime(audio.currentTime)
      }
    }

    const onLoadedMetadata = () => {
      if (currentEngineRef.current === 'audio' && audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    const onEnded = () => {
      if (currentEngineRef.current === 'audio') {
        handleTrackEnd()
      }
    }

    const onError = (e: Event) => {
      // Ignore if not in audio engine mode or if src is empty
      if (currentEngineRef.current !== 'audio' || !audio.src || audio.src === window.location.href) {
        return
      }
      console.warn('HTML5 Audio error, activating YouTube backup:', e)
      const track = currentTrackRef.current
      if (track?.youtubeId) {
        currentEngineRef.current = 'youtube'
        setActiveEngine('youtube')
        youtubeService.loadVideo(track.youtubeId, true)
      }
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    // Pre-populate with full audio if available
    if (SAMPLE_TRACKS[0]?.audioUrl) {
      audio.src = SAMPLE_TRACKS[0].audioUrl
    }

    return () => {
      audio.pause()
      audio.src = ''
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, []) // Empty deps: Never destroyed during playback!

  // 2. Initialize YouTube Service Handlers
  useEffect(() => {
    youtubeService.init()

    youtubeService.setCallbacks({
      onStateChange: (state) => {
        if (currentEngineRef.current === 'youtube') {
          if (state === 'playing') {
            setIsPlaying(true)
          } else if (state === 'paused') {
            setIsPlaying(false)
          } else if (state === 'ended') {
            handleTrackEnd()
          }
        }
      },
      onTimeUpdate: (cur, tot) => {
        if (currentEngineRef.current === 'youtube') {
          setCurrentTime(cur)
          if (tot > 0) setDuration(tot)
        }
      },
      onError: (code) => {
        console.warn('YouTube player error code:', code)
        const track = currentTrackRef.current
        if (!track) return

        if (track.youtubeId) {
          blockedVideoIdsRef.current.add(track.youtubeId)
        }

        // If embed is restricted (101/150) or failed, search for verified alternative embeddable stream
        const excludeList = Array.from(blockedVideoIdsRef.current)
        youtubeService
          .loadSearchQuery(`${track.artist} - ${track.title}`, excludeList)
          .then((newId) => {
            if (newId) {
              track.youtubeId = newId
              youtubeService.loadVideo(newId, true)
              return
            }

            if (track.audioUrl && audioRef.current) {
              currentEngineRef.current = 'audio'
              setActiveEngine('audio')
              audioRef.current.src = track.audioUrl
              audioRef.current.currentTime = 0
              audioRef.current.play().catch(() => {})
              return
            }

            // Never silently play an unrelated song
            setIsPlaying(false)
            showToast(`⚠️ "${track.title}" cannot be embedded. Please select an alternate version.`)
          })
      },
    })
  }, [])

  // 3. Sync Volume Across All Engines
  useEffect(() => {
    const actualVol = isMuted ? 0 : volume
    if (audioRef.current) {
      audioRef.current.volume = actualVol
    }
    youtubeService.setVolume(actualVol)
  }, [volume, isMuted])

  // 4. MediaSession API setup & Mobile Background Audio Session
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null)
  const isPlayingRef = useRef(isPlaying)
  const togglePlayRef = useRef<() => void>(() => {})
  const prevTrackRef = useRef<() => void>(() => {})
  const nextTrackRef = useRef<() => void>(() => {})
  const seekRef = useRef<(secs: number) => void>(() => {})
  const currentTimeRef = useRef(currentTime)
  const durationRef = useRef(duration)

  useEffect(() => {
    // Silent audio element to keep mobile background audio session and notification active
    const bgAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA')
    bgAudio.loop = true
    bgAudio.volume = 0.01
    backgroundAudioRef.current = bgAudio
    return () => {
      bgAudio.pause()
    }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      backgroundAudioRef.current?.play().catch(() => {})
    } else {
      backgroundAudioRef.current?.pause()
    }
  }, [isPlaying])

  // Stable MediaSession Action Handlers (registered once)
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => togglePlayRef.current())
      navigator.mediaSession.setActionHandler('pause', () => togglePlayRef.current())
      navigator.mediaSession.setActionHandler('previoustrack', () => prevTrackRef.current())
      navigator.mediaSession.setActionHandler('nexttrack', () => nextTrackRef.current())
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) seekRef.current(details.seekTime)
      })
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10
        seekRef.current(Math.max(0, currentTimeRef.current - offset))
      })
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10
        seekRef.current(Math.min(durationRef.current, currentTimeRef.current + offset))
      })
    }
  }, [])

  // Update MediaSession metadata only when track changes
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album || 'RAIWAVE Lossless Stream',
          artwork: [
            { src: currentTrack.coverUrl, sizes: '96x96', type: 'image/jpeg' },
            { src: currentTrack.coverUrl, sizes: '128x128', type: 'image/jpeg' },
            { src: currentTrack.coverUrl, sizes: '192x192', type: 'image/jpeg' },
            { src: currentTrack.coverUrl, sizes: '256x256', type: 'image/jpeg' },
            { src: currentTrack.coverUrl, sizes: '384x384', type: 'image/jpeg' },
            { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' },
          ],
        })
      } catch {}
    }
  }, [currentTrack?.id])

  // Update MediaSession playback state & Android Bridge on play/pause transition
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
    }

    if (currentTrack) {
      try {
        const androidBridge = (window as any).AndroidMedia
        if (androidBridge) {
          if (typeof androidBridge.updateMediaWithDetails === 'function') {
            androidBridge.updateMediaWithDetails(
              currentTrack.title,
              currentTrack.artist,
              currentTrack.album || 'RAIWAVE Lossless Stream',
              currentTrack.coverUrl,
              isPlaying,
              Math.round(duration || 0),
              Math.round(currentTime || 0)
            )
          } else if (typeof androidBridge.updateMedia === 'function') {
            androidBridge.updateMedia(
              currentTrack.title,
              currentTrack.artist,
              currentTrack.coverUrl,
              isPlaying
            )
          }
        }
      } catch {}
    }
  }, [isPlaying, currentTrack?.id])

  // Update position state smoothly when duration or currentTime change significantly
  useEffect(() => {
    if ('mediaSession' in navigator && duration > 0 && 'setPositionState' in navigator.mediaSession) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(duration, 1),
          playbackRate: isPlaying ? 1 : 0,
          position: Math.min(Math.max(currentTime, 0), duration),
        })
      } catch {}
    }
  }, [duration, isPlaying, Math.floor(currentTime)])

  // Live Synced Lyrics fetcher
  useEffect(() => {
    if (!currentTrack) {
      setLiveLyrics([])
      return
    }

    if (currentTrack.lyrics && currentTrack.lyrics.length > 0) {
      setLiveLyrics(currentTrack.lyrics)
      return
    }

    let isMounted = true
    setIsLoadingLyrics(true)

    fetchLiveLyrics(currentTrack.title, currentTrack.artist, currentTrack.duration)
      .then((lines) => {
        if (isMounted) {
          setLiveLyrics(lines)
          setIsLoadingLyrics(false)
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingLyrics(false)
      })

    return () => {
      isMounted = false
    }
  }, [currentTrack?.id])

  // Smart suggestions updater
  useEffect(() => {
    if (!currentTrack) return
    const queueIds = queue.map((t) => t.id)
    smartQueueService.getSmartSuggestions(currentTrack, queueIds).then((suggs) => {
      setSmartSuggestions(suggs)
    })
  }, [currentTrack?.id, queue.length])

  // Central Playback Engine Router
  const loadAndPlayTrack = (track: Track, shouldPlay = true) => {
    const reqId = ++playRequestIdRef.current
    setCurrentTrack(track)
    currentTrackRef.current = track
    setCurrentTime(0)
    setDuration(track.duration || 180)
    if (shouldPlay) {
      setIsPlaying(true)
      lastPlayTimeRef.current = Date.now()
    }

    showToast(`▶ Now Playing: ${track.title} • ${track.artist}`)

    // TIER 0: Offline Mode (Cached audio from IndexedDB vault)
    if ((typeof navigator !== 'undefined' && !navigator.onLine) || offlineService.isOffline(track.id)) {
      offlineService.getOfflineAudioBlob(track.id).then((blob) => {
        if (playRequestIdRef.current !== reqId) return
        if (blob && audioRef.current) {
          currentEngineRef.current = 'audio'
          setActiveEngine('audio')
          youtubeService.pause()
          audioRef.current.src = URL.createObjectURL(blob)
          audioRef.current.currentTime = 0
          if (shouldPlay) audioRef.current.play().catch(() => {})
        }
      })
    }

    // TIER 1: YouTube Full-Length Audio/Video Stream (Streams the FULL song from start to finish)
    if (track.youtubeId || track.source === 'youtube') {
      currentEngineRef.current = 'youtube'
      setActiveEngine('youtube')
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
        audioRef.current.load()
      }

      if (track.youtubeId) {
        youtubeService.loadVideo(track.youtubeId, shouldPlay)
      } else {
        showToast(`▶ Loading full song: ${track.title}`)
        youtubeService.loadSearchQuery(`${track.artist} - ${track.title}`).then((vid) => {
          if (playRequestIdRef.current !== reqId) return
          if (vid) {
            track.youtubeId = vid
            if (currentTrackRef.current?.id === track.id) {
              currentEngineRef.current = 'youtube'
              setActiveEngine('youtube')
              if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.removeAttribute('src')
                audioRef.current.load()
              }
              youtubeService.loadVideo(vid, shouldPlay)
            }
          } else {
            setIsPlaying(false)
            showToast(`⚠️ No stream found for "${track.title}". Please try an alternative.`)
          }
        })
      }
    }
    // TIER 2: Dedicated Full Audio File (e.g. Full Creator / Local MP3 Stream)
    else if (track.audioUrl && audioRef.current) {
      currentEngineRef.current = 'audio'
      setActiveEngine('audio')
      youtubeService.pause()

      const audio = audioRef.current
      audio.src = track.audioUrl
      audio.currentTime = 0

      if (shouldPlay) {
        audio.play().catch((err) => {
          console.warn('Audio play error, activating YouTube backup:', err)
          if (track.youtubeId) {
            currentEngineRef.current = 'youtube'
            setActiveEngine('youtube')
            youtubeService.loadVideo(track.youtubeId, true)
          }
        })
      }
    }
    // TIER 3: Universal query resolution on YouTube
    else {
      currentEngineRef.current = 'youtube'
      setActiveEngine('youtube')
      if (audioRef.current) audioRef.current.pause()
      youtubeService.loadSearchQuery(`${track.artist} - ${track.title}`).then((vid) => {
        if (playRequestIdRef.current !== reqId) return
        if (vid) {
          track.youtubeId = vid
          if (currentTrackRef.current?.id === track.id) {
            youtubeService.loadVideo(vid, shouldPlay)
          }
        } else {
          setIsPlaying(false)
          showToast(`⚠️ Audio stream not found for "${track.title}"`)
        }
      })
    }

    // Add to history & persist in localStorage
    setHistory((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id)
      const updated = [track, ...filtered].slice(0, 30)
      try {
        localStorage.setItem('raiwave_recently_played', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const playTrack = (track: Track, newQueue?: Track[]) => {
    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue)
      const idx = newQueue.findIndex((t) => t.id === track.id)
      setQueueIndex(idx >= 0 ? idx : 0)
    } else {
      const existingIdx = queue.findIndex((t) => t.id === track.id)
      if (existingIdx >= 0) {
        setQueueIndex(existingIdx)
      } else {
        setQueue((prev) => [...prev, track])
        setQueueIndex(queue.length)
      }
    }

    loadAndPlayTrack(track, true)
  }

  // Parses any pasted link or video ID or search query and plays immediately
  const playCustomUrlOrId = (urlOrId: string): boolean => {
    const trimmed = urlOrId.trim()
    if (!trimmed) return false

    const parsed = parseMediaUrl(trimmed)
    if (parsed.type === 'youtube') {
      const newTrack: Track = {
        id: `yt-custom-${parsed.id}-${Date.now()}`,
        title: `YouTube Video (${parsed.id})`,
        artist: 'YouTube Stream',
        album: 'Web Stream',
        duration: 210,
        coverUrl: `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`,
        youtubeId: parsed.id,
        source: 'youtube',
        genre: 'Streaming',
        releaseYear: new Date().getFullYear(),
        color: '#dc2626',
      }
      playTrack(newTrack, [newTrack, ...queue])
      return true
    }

    // Otherwise treat as plain search query
    playBySearchQuery(trimmed)
    return true
  }

  const playBySearchQuery = async (query: string) => {
    const cleanQuery = query.trim()
    if (!cleanQuery) return

    showToast(`Searching & Streaming "${cleanQuery}"...`)

    // First, check if global search has a matching track with direct preview audio
    try {
      const results = await searchGlobalMusic(cleanQuery)
      if (results.length > 0) {
        playTrack(results[0], results)
        return
      }
    } catch {
      // ignore
    }

    // Fallback: direct YouTube query
    const newTrack: Track = {
      id: `search-stream-${Date.now()}`,
      title: cleanQuery,
      artist: 'Official Music Stream',
      album: 'Universal Catalog',
      duration: 210,
      coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      source: 'youtube',
      genre: 'Streaming',
      releaseYear: new Date().getFullYear(),
      color: '#B6F36B',
    }

    setCurrentTrack(newTrack)
    currentTrackRef.current = newTrack
    currentEngineRef.current = 'youtube'
    setActiveEngine('youtube')
    setCurrentTime(0)
    setDuration(210)
    setQueue((prev) => [newTrack, ...prev])
    setQueueIndex(0)

    if (audioRef.current) audioRef.current.pause()
    youtubeService.loadSearchQuery(cleanQuery)
    setIsPlaying(true)

    setHistory((prev) => [newTrack, ...prev.filter((t) => t.id !== newTrack.id)].slice(0, 30))
  }

  const togglePlay = () => {
    if (!currentTrack) {
      if (queue.length > 0) playTrack(queue[0])
      return
    }

    if (isPlaying) {
      if (currentEngineRef.current === 'audio' && audioRef.current) {
        audioRef.current.pause()
      } else {
        youtubeService.pause()
      }
      setIsPlaying(false)
    } else {
      lastPlayTimeRef.current = Date.now()
      if (currentEngineRef.current === 'audio' && audioRef.current) {
        audioRef.current.play().catch(() => {
          if (currentTrack.youtubeId) {
            currentEngineRef.current = 'youtube'
            setActiveEngine('youtube')
            youtubeService.play()
          }
        })
      } else {
        youtubeService.play()
      }
      setIsPlaying(true)
    }
  }

  const seek = (seconds: number) => {
    setCurrentTime(seconds)
    if (currentEngineRef.current === 'audio' && audioRef.current) {
      audioRef.current.currentTime = seconds
    } else {
      youtubeService.seekTo(seconds)
    }

    // Immediately sync seeked position to Android MediaSession
    try {
      if (currentTrack) {
        const androidBridge = (window as any).AndroidMedia
        if (androidBridge && typeof androidBridge.updateMediaWithDetails === 'function') {
          androidBridge.updateMediaWithDetails(
            currentTrack.title,
            currentTrack.artist,
            currentTrack.album || 'RAIWAVE Universal Stream',
            currentTrack.coverUrl,
            isPlaying,
            Math.round(duration || 0),
            Math.round(seconds)
          )
        }
      }
    } catch {}
  }

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol))
    setVolumeState(clamped)
    if (isMuted && clamped > 0) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  const nextTrack = () => {
    const curQueue = queueRef.current
    if (curQueue.length === 0) return

    let nextIdx = queueIndexRef.current + 1
    if (isShuffleRef.current) {
      nextIdx = Math.floor(Math.random() * curQueue.length)
    } else if (nextIdx >= curQueue.length) {
      if (repeatModeRef.current === 'all') {
        nextIdx = 0
      } else if (isSmartQueueEnabledRef.current && currentTrackRef.current) {
        // Smart Queue automatically fetches and queues next recommended track
        const queueIds = curQueue.map((t) => t.id)
        smartQueueService.getNextSmartTrack(currentTrackRef.current, queueIds).then((nextSug) => {
          if (nextSug) {
            showToast(`✨ Smart Queue Autoplay: ${nextSug.title} • ${nextSug.artist}`)
            setQueue((prev) => [...prev, nextSug])
            setQueueIndex(curQueue.length)
            loadAndPlayTrack(nextSug, true)
          } else {
            setIsPlaying(false)
          }
        })
        return
      } else {
        setIsPlaying(false)
        return
      }
    }

    setQueueIndex(nextIdx)
    loadAndPlayTrack(curQueue[nextIdx], true)
  }

  const prevTrack = () => {
    if (currentTime > 3) {
      seek(0)
      return
    }

    const curQueue = queueRef.current
    if (curQueue.length === 0) return

    let prevIdx = queueIndexRef.current - 1
    if (prevIdx < 0) {
      prevIdx = repeatModeRef.current === 'all' ? curQueue.length - 1 : 0
    }

    setQueueIndex(prevIdx)
    loadAndPlayTrack(curQueue[prevIdx], true)
  }

  // Keep MediaSession refs continuously updated with latest functions and values
  useEffect(() => {
    togglePlayRef.current = togglePlay
    prevTrackRef.current = prevTrack
    nextTrackRef.current = nextTrack
    seekRef.current = seek
    isPlayingRef.current = isPlaying
    currentTimeRef.current = currentTime
    durationRef.current = duration
  }, [togglePlay, prevTrack, nextTrack, seek, isPlaying, currentTime, duration])

  // Native Android Media Notification Callback bridge
  useEffect(() => {
    ;(window as any).__raiwaveMediaControl = (action: string) => {
      if (action === 'play') {
        if (!isPlayingRef.current) togglePlay()
      } else if (action === 'pause') {
        // Protect against spurious audiofocus loss from native notification service within 3.5s of starting playback
        if (Date.now() - lastPlayTimeRef.current < 3500) {
          console.warn('Ignoring premature audiofocus pause event from native service')
          return
        }
        if (isPlayingRef.current) togglePlay()
      } else if (action === 'play_pause') {
        togglePlay()
      } else if (action === 'next') {
        nextTrack()
      } else if (action === 'prev') {
        prevTrack()
      } else if (action.startsWith('seek:')) {
        const sec = parseFloat(action.replace('seek:', ''))
        if (!isNaN(sec)) seek(sec)
      }
    }
    return () => {
      delete (window as any).__raiwaveMediaControl
    }
  }, [togglePlay, nextTrack, prevTrack])

  const handleTrackEnd = () => {
    // A track can only legitimately end if it reached near the end of its duration.
    // Spurious ENDED events fired by YouTube during stream unloads or buffer stalls must be ignored!
    if (duration > 5 && currentTime < duration - 4) {
      console.warn(`Spurious track end ignored (currentTime: ${currentTime}, duration: ${duration})`)
      return
    }

    if (repeatModeRef.current === 'one') {
      seek(0)
      if (currentEngineRef.current === 'audio' && audioRef.current) {
        audioRef.current.play().catch(() => {})
      } else {
        youtubeService.play()
      }
      return
    }
    nextTrack()
  }

  const toggleShuffle = () => setIsShuffle((prev) => !prev)

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all'
      if (prev === 'all') return 'one'
      return 'off'
    })
  }

  const toggleLike = (trackId: string) => {
    setLikedTrackIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    )
  }

  const isLiked = (trackId: string) => likedTrackIds.includes(trackId)

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track])
    showToast(`Added "${track.title}" to queue`)
  }

  const addAlbumToQueue = (album: Album) => {
    if (!album.tracks || album.tracks.length === 0) return
    setQueue((prev) => [...prev, ...album.tracks])
    showToast(`Added ${album.tracks.length} songs from "${album.title}" to queue`)
  }

  const addPlaylistToQueue = (playlist: Playlist) => {
    if (!playlist.tracks || playlist.tracks.length === 0) return
    setQueue((prev) => [...prev, ...playlist.tracks])
    showToast(`Added ${playlist.tracks.length} songs from "${playlist.name}" to queue`)
  }

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return
    setQueue((prev) => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
    setQueueIndex((currentIdx) => {
      if (fromIndex === currentIdx) return toIndex
      if (fromIndex < currentIdx && toIndex >= currentIdx) return currentIdx - 1
      if (fromIndex > currentIdx && toIndex <= currentIdx) return currentIdx + 1
      return currentIdx
    })
  }

  const reorderUpcoming = (fromUpcomingIdx: number, toUpcomingIdx: number) => {
    const fromIndex = queueIndex + 1 + fromUpcomingIdx
    const toIndex = queueIndex + 1 + toUpcomingIdx
    reorderQueue(fromIndex, toIndex)
  }

  const removeFromQueue = (index: number) => {
    if (index < 0 || index >= queue.length) return
    const removedTrack = queue[index]
    setQueue((prev) => prev.filter((_, i) => i !== index))
    if (index < queueIndex) {
      setQueueIndex((prev) => Math.max(0, prev - 1))
    } else if (index === queueIndex) {
      if (queue.length > 1) {
        const nextIdx = index < queue.length - 1 ? index : index - 1
        const nextT = queue[nextIdx]
        setQueueIndex(nextIdx)
        loadAndPlayTrack(nextT, isPlaying)
      }
    }
    if (removedTrack) {
      showToast(`Removed "${removedTrack.title}" from queue`)
    }
  }

  const clearQueue = () => {
    if (currentTrack) {
      setQueue([currentTrack])
      setQueueIndex(0)
    } else {
      setQueue([])
      setQueueIndex(0)
    }
    showToast('🧹 Upcoming queue cleared')
  }

  const playQueuedTrackImmediately = (index: number) => {
    if (index < 0 || index >= queue.length) return
    const track = queue[index]
    setQueueIndex(index)
    loadAndPlayTrack(track, true)
    showToast(`▶ Now playing "${track.title}"`)
  }

  const navigateTo = (view: ViewMode) => {
    setViewHistory((prev) => (prev[prev.length - 1] === view ? prev : [...prev, view]))
    setCurrentView(view)
    try {
      window.history.pushState({ view }, '', `#${view}`)
    } catch {}
  }

  const goBack = () => {
    if (isDedicatedVisualizerOpen) {
      setIsDedicatedVisualizerOpen(false)
      return
    }
    if (isMobilePlayerOpen) {
      setIsMobilePlayerOpen(false)
      return
    }
    setViewHistory((prev) => {
      if (prev.length <= 1) {
        setCurrentView('home')
        return ['home']
      }
      const updated = prev.slice(0, -1)
      const target = updated[updated.length - 1]
      setCurrentView(target)
      return updated
    })
  }

  const canGoBack = viewHistory.length > 1 || currentView !== 'home'

  // Hardware/Browser back button listener for mobile
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isDedicatedVisualizerOpen) {
        setIsDedicatedVisualizerOpen(false)
        return
      }
      if (isMobilePlayerOpen) {
        setIsMobilePlayerOpen(false)
        return
      }
      if (e.state?.view) {
        setCurrentView(e.state.view)
      } else {
        goBack()
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [isMobilePlayerOpen, isDedicatedVisualizerOpen])

  const openPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist)
    navigateTo('playlist')
  }

  const openAlbum = (album: Album) => {
    setSelectedAlbum(album)
    navigateTo('album')
  }

  const openArtist = (artist: Artist) => {
    setSelectedArtist(artist)
    navigateTo('artist')
  }

  const createPlaylist = (name: string, description?: string): Playlist => {
    const newPlaylist: Playlist = {
      id: `user-playlist-${Date.now()}`,
      name: name || `My Playlist #${userPlaylists.length + 1}`,
      description: description || 'Created by you on RAIWAVE.',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      tracks: [],
      owner: 'You',
      color: '#10b981',
      isCustom: true,
    }
    setUserPlaylists((prev) => [newPlaylist, ...prev])
    return newPlaylist
  }

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setUserPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          if (pl.tracks.some((t) => t.id === track.id)) return pl
          return { ...pl, tracks: [...pl.tracks, track] }
        }
        return pl
      })
    )
  }

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setUserPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          return { ...pl, tracks: pl.tracks.filter((t) => t.id !== trackId) }
        }
        return pl
      })
    )
  }

  const playMoodStation = async (moodTitle: string, tag: string) => {
    showToast(`🎶 Tuning into Mood Station: ${moodTitle}...`)
    try {
      const results = await searchGlobalMusic(`${tag} hits songs`)
      if (results.length > 0) {
        playTrack(results[0], results)
      } else {
        const fallback = SAMPLE_TRACKS.filter((t) => t.genre.toLowerCase().includes(tag.toLowerCase()))
        if (fallback.length > 0) {
          playTrack(fallback[0], fallback)
        }
      }
    } catch {
      showToast(`Enjoying ${moodTitle}!`)
    }
  }

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isShuffle,
        queue,
        queueIndex,
        history,
        clearHistory,
        liveLyrics,
        isLoadingLyrics,
        offlineTrackIds,
        saveOffline,
        removeOffline,
        isOffline,
        isSmartQueueEnabled,
        toggleSmartQueue,
        smartSuggestions,
        playMoodStation,
        activeEngine,
        toastMessage,
        showToast,
        isVideoOpen,
        toggleVideoOpen,
        currentView,
        selectedPlaylist,
        selectedAlbum,
        selectedArtist,
        searchQuery,
        likedTrackIds,
        userPlaylists,
        playTrack,
        playCustomUrlOrId,
        playBySearchQuery,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleRepeat,
        toggleLike,
        isLiked,
        addToQueue,
        addAlbumToQueue,
        addPlaylistToQueue,
        reorderQueue,
        reorderUpcoming,
        removeFromQueue,
        clearQueue,
        playQueuedTrackImmediately,
        isQueuePanelOpen,
        setIsQueuePanelOpen,
        toggleQueuePanel,
        navigateTo,
        goBack,
        canGoBack,
        openPlaylist,
        openAlbum,
        openArtist,
        setSearchQuery,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        activeCategory,
        setActiveCategory,
        isMobilePlayerOpen,
        setIsMobilePlayerOpen,
        toggleMobilePlayer,
        isDedicatedVisualizerOpen,
        setIsDedicatedVisualizerOpen,
        toggleDedicatedVisualizer,
        openDedicatedVisualizer,
        closeDedicatedVisualizer,
        userProfile,
        isProfileOpen,
        toggleProfile,
        updateUserProfile,
        isNotificationOpen,
        toggleNotification,
        setIsNotificationOpen,
        isNotificationExpanded,
        toggleNotificationExpanded,
        notificationTheme,
        toggleNotificationTheme,
        isRecorderOpen,
        toggleRecorder,
        recordings,
        addRecording,
        deleteRecording,
        playRecording,
        realtimeTopTracks,
        realtimeRecommended,
        isLoadingRealtime,
        refreshRealtimeMusic,
        dynamicTheme,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
