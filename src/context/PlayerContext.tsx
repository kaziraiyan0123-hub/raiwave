import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react'
import type { Track, Playlist, RepeatMode, ViewMode, Album, Artist, UserProfile, AudioRecording } from '../types'
import { SAMPLE_TRACKS } from '../data/musicData'
import { youtubeService } from '../services/youtubePlayer'
import { parseMediaUrl } from '../utils/urlParser'
import { searchGlobalMusic } from '../services/musicSearch'
import { realtimeMusicService } from '../services/realtimeMusicService'
import { fetchLiveLyrics } from '../services/lyricsService'
import { offlineService, type TrackDownloadState } from '../services/offlineService'
import { smartQueueService } from '../services/smartQueueService'
import {
  extractPaletteFromImage,
  generatePaletteFromColor,
  type DynamicPalette,
} from '../services/colorExtractionService'
import { visualizerAudioService } from '../services/visualizerAudioService'
import { artistService, extractPrimaryArtistName } from '../services/artistService'
import { recommendationEngine } from '../services/recommendationEngine'
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

  // Application Mode (Official Website vs Web Player)
  appMode: 'website' | 'player'
  setAppMode: (mode: 'website' | 'player') => void

  // Navigation & Views
  currentView: ViewMode
  selectedPlaylist: Playlist | null
  selectedAlbum: Album | null
  selectedArtist: Artist | null
  searchQuery: string

  // User Library & Playlists
  likedTrackIds: string[]
  likedTracks: Track[]
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
  toggleLike: (trackId: string, trackObj?: Track) => void
  isLiked: (trackId: string) => boolean
  playNext: (track: Track) => void
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
  openArtist: (artist: Artist | string) => void
  isLoadingAlbum: boolean
  isLoadingArtist: boolean
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
  refreshRealtimeMusic: (force?: boolean) => Promise<void>

  // Recently Played
  clearHistory: () => void

  // Live Synced Lyrics
  liveLyrics: LyricLine[]
  isLoadingLyrics: boolean

  // Offline Mode & Downloads
  offlineTrackIds: string[]
  downloadStates: Record<string, TrackDownloadState>
  saveOffline: (track: Track) => Promise<boolean>
  cancelDownload: (trackId: string) => void
  removeOffline: (trackId: string) => Promise<boolean>
  isOffline: (trackId: string) => boolean
  isTrackDownloadable: (track: Track) => { downloadable: boolean; reason?: string }

  // Smart Queue & Autoplay
  isSmartQueueEnabled: boolean
  toggleSmartQueue: () => void
  smartSuggestions: Track[]

  // Mood Stations
  playMoodStation: (moodTitle: string, tag: string) => Promise<void>

  // Dynamic Album-Art Theme
  dynamicTheme: DynamicPalette
}

const QUEUE_STORAGE_KEY = 'raiwave_queue_v1'

function dedupTracksById(list: Track[]): Track[] {
  const seen = new Set<string>()
  const out: Track[] = []
  for (const t of list) {
    if (t && t.id && !seen.has(t.id)) {
      seen.add(t.id)
      out.push(t)
    }
  }
  return out
}

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function loadSavedQueueState(): { queue: Track[]; queueIndex: number } {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { queue?: Track[]; queueIndex?: number }
      if (Array.isArray(parsed.queue)) {
        const clean = dedupTracksById(parsed.queue)
        const idx =
          typeof parsed.queueIndex === 'number' && parsed.queueIndex >= 0 && parsed.queueIndex < clean.length
            ? parsed.queueIndex
            : 0
        return { queue: clean, queueIndex: idx }
      }
    }
  } catch {
    // Fallback to clean empty queue
  }
  return { queue: [], queueIndex: 0 }
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialQueueState = useMemo(() => loadSavedQueueState(), [])

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentEngineRef = useRef<'audio' | 'youtube'>('audio')
  const currentTrackRef = useRef<Track | null>(null)
  const repeatModeRef = useRef<RepeatMode>('off')
  const queueRef = useRef<Track[]>(initialQueueState.queue)
  const queueIndexRef = useRef<number>(initialQueueState.queueIndex)
  const originalQueueRef = useRef<Track[]>(initialQueueState.queue)
  const isShuffleRef = useRef<boolean>(false)
  const blockedVideoIdsRef = useRef<Set<string>>(new Set())
  const playRequestIdRef = useRef<number>(0)
  const lastPlayTimeRef = useRef<number>(0)
  const lastBlobUrlRef = useRef<string | null>(null)
  const artistRequestIdRef = useRef<number>(0)
  const albumRequestIdRef = useRef<number>(0)

  // Current track & queue state (Default idle - starts clean, persisted queue)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [volume, setVolumeState] = useState<number>(0.85)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off')
  const [isShuffle, setIsShuffle] = useState<boolean>(false)
  const [queue, setQueue] = useState<Track[]>(initialQueueState.queue)
  const [queueIndex, setQueueIndex] = useState<number>(initialQueueState.queueIndex)

  const syncQueueState = (nextQueue: Track[], nextIdx: number) => {
    const clean = dedupTracksById(nextQueue)
    const clampedIdx = clean.length === 0 ? 0 : Math.max(0, Math.min(nextIdx, clean.length - 1))
    queueRef.current = clean
    queueIndexRef.current = clampedIdx
    setQueue(clean)
    setQueueIndex(clampedIdx)
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify({ queue: clean, queueIndex: clampedIdx }))
    } catch {
      // Ignore quota errors
    }
  }
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

  // Offline Mode & Downloads State (Real verified files only)
  const [offlineTrackIds, setOfflineTrackIds] = useState<string[]>(() => offlineService.getOfflineTrackIds())
  const [downloadStates, setDownloadStates] = useState<Record<string, TrackDownloadState>>(() =>
    offlineService.getAllDownloadStates()
  )

  useEffect(() => {
    const unsub = offlineService.subscribe((trackId, state) => {
      setDownloadStates((prev) => ({ ...prev, [trackId]: state }))
      if (state.status === 'downloaded' || state.status === 'idle') {
        setOfflineTrackIds(offlineService.getOfflineTrackIds())
      }
    })
    offlineService.verifyAndSyncVault().then((validIds) => {
      setOfflineTrackIds(validIds)
      setDownloadStates(offlineService.getAllDownloadStates())
    })
    return unsub
  }, [])

  const saveOffline = async (track: Track): Promise<boolean> => {
    const eligibility = offlineService.isTrackDownloadable(track)
    if (!eligibility.downloadable) {
      showToast(`ℹ️ ${eligibility.reason}`)
      return false
    }
    showToast(`Downloading "${track.title}"...`)
    const result = await offlineService.saveTrackOffline(track)
    setOfflineTrackIds(offlineService.getOfflineTrackIds())
    if (result.success) {
      showToast(`Saved "${track.title}" offline & verified`)
      return true
    }
    if (result.cancelled) {
      showToast(`Cancelled download for "${track.title}"`)
      return false
    }
    showToast(`Could not download "${track.title}": ${result.error || 'Failed'}`)
    return false
  }

  const cancelDownload = (trackId: string) => {
    offlineService.cancelDownload(trackId)
    showToast('Download cancelled')
  }

  const removeOffline = async (trackId: string): Promise<boolean> => {
    const success = await offlineService.removeTrackOffline(trackId)
    if (success) {
      setOfflineTrackIds(offlineService.getOfflineTrackIds())
      showToast('Removed offline file & freed space')
    }
    return success
  }

  const isOffline = (trackId: string) => offlineTrackIds.includes(trackId)
  const isTrackDownloadable = (track: Track) => offlineService.isTrackDownloadable(track)

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
  const [isLoadingAlbum, setIsLoadingAlbum] = useState<boolean>(false)
  const [isLoadingArtist, setIsLoadingArtist] = useState<boolean>(false)

  // User Profile & Account
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    let savedName = ''
    try {
      savedName = localStorage.getItem('raiwave_user_name') || ''
    } catch {}
    try {
      const saved = localStorage.getItem('raiwave_user_profile')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (!parsed.name && savedName) parsed.name = savedName
        return {
          ...parsed,
          developerCredit: 'Created with passion by Raiyan.',
        }
      }
    } catch {}
    return {
      name: savedName,
      email: '',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      developerCredit: 'Created with passion by Raiyan.',
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
        if (updates.name !== undefined) {
          localStorage.setItem('raiwave_user_name', updates.name)
        }
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

  const refreshRealtimeMusic = async (force = false) => {
    setIsLoadingRealtime(true)
    try {
      const [top, rec] = await Promise.all([
        realtimeMusicService.fetchLiveTop50({ force }),
        realtimeMusicService.fetchRealtimeByCategory(activeCategory, { force }),
      ])
      if (top.length > 0) setRealtimeTopTracks(top)
      if (rec.length > 0) setRealtimeRecommended(rec)
    } catch (err) {
      console.warn('Realtime music refresh error:', err)
    } finally {
      setIsLoadingRealtime(false)
    }
  }

  // Fetch real-time music on mount, reconnect, and when active category changes
  useEffect(() => {
    refreshRealtimeMusic(false)
    const onReconnect = () => refreshRealtimeMusic(false)
    if (typeof window !== 'undefined') {
      window.addEventListener('online', onReconnect)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', onReconnect)
      }
    }
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

  // Application Mode (Official Website vs Standalone Music Player)
  // Standalone Native App Detection:
  // When running inside the downloaded Android APK (window.AndroidMedia injected by Java WebView),
  // or inside the downloaded Windows Desktop app (window.chrome.webview injected by C# WebView2),
  // or launched via #app, /app, ?mode=player, ?platform=android, ?platform=desktop,
  // or standalone display mode (PWA installed app),
  // RAIWAVE MUST run strictly as the standalone music application and never show the website.
  const checkIsStandaloneApp = () => {
    if (typeof window === 'undefined') return false
    const PLAYER_VIEW_HASHES = [
      '#app',
      '#home',
      '#explore',
      '#search',
      '#library',
      '#playlist',
      '#album',
      '#artist',
      '#liked',
      '#lyrics',
      '#queue',
    ]
    const hasAndroidBridge = Boolean((window as unknown as { AndroidMedia?: unknown }).AndroidMedia)
    const hasDesktopBridge = Boolean((window as unknown as { chrome?: { webview?: unknown } }).chrome?.webview)
    const hasAppHash = PLAYER_VIEW_HASHES.includes(window.location.hash)
    const hasAppPath = window.location.pathname === '/app'
    const hasPlayerQuery =
      window.location.search.includes('mode=player') ||
      window.location.search.includes('platform=')
    const isStandaloneDisplay =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as unknown as { standalone?: boolean }).standalone)
    const isCustomUA = Boolean(
      navigator.userAgent &&
        (navigator.userAgent.includes('RAIWAVE-Desktop') ||
          navigator.userAgent.includes('RAIWAVE-Android'))
    )

    return (
      hasAndroidBridge ||
      hasDesktopBridge ||
      hasAppHash ||
      hasAppPath ||
      hasPlayerQuery ||
      isStandaloneDisplay ||
      isCustomUA
    )
  }

  const [appMode, setAppModeState] = useState<'website' | 'player'>(() => {
    return checkIsStandaloneApp() ? 'player' : 'website'
  })

  // Ensure that if native Android bridge or desktop bridge initializes shortly after script execution,
  // or when the URL hash changes to #app, the app immediately locks into standalone player mode.
  useEffect(() => {
    if (typeof window === 'undefined') return

    const verifyAndLockStandalone = () => {
      if (checkIsStandaloneApp() && appMode !== 'player') {
        setAppModeState('player')
      }
    }

    verifyAndLockStandalone()
    const timer = setTimeout(verifyAndLockStandalone, 150)

    const handleHashChange = () => {
      verifyAndLockStandalone()
    }
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [appMode])

  // Synchronize document body class to enable full natural vertical scrolling on the website
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (appMode === 'website') {
        document.body.classList.add('website-mode')
        document.body.classList.remove('player-mode')
      } else {
        document.body.classList.add('player-mode')
        document.body.classList.remove('website-mode')
      }
    }
  }, [appMode])

  const setAppMode = (mode: 'website' | 'player') => {
    // If running inside the standalone Android or Desktop app, never allow switching to the website
    if (mode === 'website' && checkIsStandaloneApp()) {
      return
    }
    try {
      if (mode === 'website') {
        window.history.pushState({ mode: 'website' }, '', window.location.pathname)
      } else {
        window.history.pushState({ mode: 'player' }, '', '#app')
      }
    } catch {}
    setAppModeState(mode)
  }

  // Views & navigation
  const [currentView, setCurrentView] = useState<ViewMode>('home')
  const [viewHistory, setViewHistory] = useState<ViewMode[]>(['home'])
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Clean legacy demo seeds from user's storage so liked songs starts pristine & empty
  const DEMO_SEEDS = ['yt-weeknd-blinding-lights', 'yt-daft-punk-get-lucky']

  // Single source of truth: likedTrackIds is always derived from likedTracks (never out of sync)
  const [likedTracks, setLikedTracks] = useState<Track[]>(() => {
    try {
      const savedData = localStorage.getItem('raiwave_liked_tracks_data')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        if (Array.isArray(parsed)) {
          return dedupTracksById(parsed.filter((t: Track) => t && t.id && !DEMO_SEEDS.includes(t.id)))
        }
      }
    } catch {}
    return []
  })

  const likedTrackIds = useMemo(() => likedTracks.map((t) => t.id), [likedTracks])
  const likedTracksRef = useRef<Track[]>(likedTracks)
  useEffect(() => {
    likedTracksRef.current = likedTracks
  }, [likedTracks])

  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>(() => {
    try {
      const saved = localStorage.getItem('raiwave_user_playlists') || localStorage.getItem('spotiflow_user_playlists')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Keep storage synced strictly from single-source likedTracks
  useEffect(() => {
    try {
      localStorage.setItem('raiwave_liked_tracks', JSON.stringify(likedTrackIds))
      localStorage.setItem('raiwave_liked_tracks_data', JSON.stringify(likedTracks))
    } catch {}
  }, [likedTrackIds, likedTracks])

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
            // Re-assert MediaSession after YT iframe focus so Windows SMTC shows RAIWAVE track art
            window.setTimeout(() => {
              const t = currentTrackRef.current
              if ('mediaSession' in navigator && t) {
                try {
                  const fallbackUrl = `${window.location.origin}/icon-512.png`
                  const artSrc = t.coverUrl?.trim() || fallbackUrl
                  navigator.mediaSession.metadata = new MediaMetadata({
                    title: t.title,
                    artist: t.artist,
                    album: t.album || 'RAIWAVE Lossless Stream',
                    artwork: [
                      { src: artSrc, sizes: '192x192' },
                      { src: artSrc, sizes: '512x512' },
                    ],
                  })
                  navigator.mediaSession.playbackState = 'playing'
                } catch {}
              }
            }, 350)
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
        if (currentEngineRef.current !== 'youtube') return
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

  // Update MediaSession metadata whenever track or cover updates (with verified artwork fallback)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return
    let cancelled = false

    const applyMetadata = (artSrc: string, mimeType?: string) => {
      if (cancelled) return
      try {
        const entry96 = mimeType ? { src: artSrc, sizes: '96x96', type: mimeType } : { src: artSrc, sizes: '96x96' }
        const entry192 = mimeType ? { src: artSrc, sizes: '192x192', type: mimeType } : { src: artSrc, sizes: '192x192' }
        const entry512 = mimeType ? { src: artSrc, sizes: '512x512', type: mimeType } : { src: artSrc, sizes: '512x512' }
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album || 'RAIWAVE Lossless Stream',
          artwork: [entry96, entry192, entry512],
        })
      } catch {}
    }

    const fallbackUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/icon-512.png` : '/icon-512.png'
    const cover = currentTrack.coverUrl?.trim()

    if (!cover) {
      applyMetadata(fallbackUrl, 'image/png')
      return
    }

    // Apply track cover immediately, then verify loadability and fallback if image fails
    applyMetadata(cover)
    const tester = new Image()
    tester.onerror = () => applyMetadata(fallbackUrl, 'image/png')
    tester.src = cover

    return () => {
      cancelled = true
    }
  }, [currentTrack?.id, currentTrack?.title, currentTrack?.artist, currentTrack?.coverUrl])

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

  const startOnlinePlayback = (track: Track, shouldPlay: boolean, reqId: number) => {
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
          } else {
            setIsPlaying(false)
            showToast(`Could not play "${track.title}".`)
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
  }

  // Central Playback Engine Router
  const loadAndPlayTrack = (track: Track, shouldPlay = true) => {
    const reqId = ++playRequestIdRef.current
    if (lastBlobUrlRef.current) {
      try {
        URL.revokeObjectURL(lastBlobUrlRef.current)
      } catch {}
      lastBlobUrlRef.current = null
    }

    setCurrentTrack(track)
    currentTrackRef.current = track
    setCurrentTime(0)
    setDuration(track.duration || 180)
    if (shouldPlay) {
      setIsPlaying(true)
      lastPlayTimeRef.current = Date.now()
    }

    showToast(`▶ Now Playing: ${track.title} • ${track.artist}`)

    const isOfflineSaved = offlineService.isOffline(track.id)
    const isOnlineNow = typeof navigator === 'undefined' ? true : navigator.onLine

    // TIER 0: Real Offline Mode (Native file or verified IndexedDB Blob)
    if (isOfflineSaved || !isOnlineNow) {
      currentEngineRef.current = 'audio'
      setActiveEngine('audio')
      youtubeService.pause()

      offlineService.getPlayableOfflineUrl(track.id).then((playableUrl) => {
        if (playRequestIdRef.current !== reqId) {
          if (playableUrl?.startsWith('blob:')) {
            try { URL.revokeObjectURL(playableUrl) } catch {}
          }
          return
        }
        if (playableUrl && audioRef.current) {
          if (playableUrl.startsWith('blob:')) {
            lastBlobUrlRef.current = playableUrl
          }
          currentEngineRef.current = 'audio'
          setActiveEngine('audio')
          youtubeService.pause()
          audioRef.current.src = playableUrl
          audioRef.current.currentTime = 0
          if (shouldPlay) {
            audioRef.current.play().catch(() => {
              setIsPlaying(false)
              showToast(`Unable to play offline audio for "${track.title}".`)
            })
          }
          return
        }

        // Offline file missing/invalid
        setOfflineTrackIds(offlineService.getOfflineTrackIds())
        if (!navigator.onLine) {
          setIsPlaying(false)
          showToast(`Offline copy unavailable for "${track.title}". Connect to stream.`)
        } else {
          startOnlinePlayback(track, shouldPlay, reqId)
        }
      })
    } else {
      startOnlinePlayback(track, shouldPlay, reqId)
    }

    // Add to history & persist in localStorage
    recommendationEngine.recordPlay(track)
    setHistory((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id)
      const updated = [track, ...filtered].slice(0, 30)
      try {
        localStorage.setItem('raiwave_recently_played', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const maybeRecordEarlySkip = (nextTrackId?: string) => {
    const prevTrack = currentTrackRef.current
    if (!prevTrack || prevTrack.id === nextTrackId) return
    const elapsed = currentTimeRef.current
    const dur = durationRef.current || prevTrack.duration || 180
    if (elapsed >= 2 && elapsed < 25 && elapsed / Math.max(dur, 1) < 0.35) {
      recommendationEngine.recordSkip(prevTrack)
    }
  }

  const playTrack = (track: Track, newQueue?: Track[]) => {
    maybeRecordEarlySkip(track.id)

    if (newQueue && newQueue.length > 0) {
      const baseList = dedupTracksById(
        newQueue.some((t) => t.id === track.id) ? newQueue : [track, ...newQueue]
      )
      originalQueueRef.current = baseList
      if (isShuffleRef.current) {
        const rest = fisherYatesShuffle(baseList.filter((t) => t.id !== track.id))
        syncQueueState([track, ...rest], 0)
      } else {
        const idx = baseList.findIndex((t) => t.id === track.id)
        syncQueueState(baseList, idx >= 0 ? idx : 0)
      }
    } else {
      const curQueue = queueRef.current
      const existingIdx = curQueue.findIndex((t) => t.id === track.id)
      if (existingIdx >= 0) {
        syncQueueState(curQueue, existingIdx)
      } else if (curQueue.length === 0 || !currentTrackRef.current) {
        originalQueueRef.current = [track]
        syncQueueState([track], 0)
      } else {
        const insertAt = queueIndexRef.current + 1
        const nextList = [...curQueue]
        nextList.splice(insertAt, 0, track)
        originalQueueRef.current = dedupTracksById([...originalQueueRef.current, track])
        syncQueueState(nextList, insertAt)
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
      playTrack(newTrack, [newTrack, ...queueRef.current])
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

    try {
      const results = await searchGlobalMusic(cleanQuery)
      if (results.length > 0) {
        playTrack(results[0], results)
        return
      }
    } catch {
      // ignore
    }

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
    const nextQueue = [newTrack, ...queueRef.current]
    originalQueueRef.current = nextQueue
    syncQueueState(nextQueue, 0)

    if (audioRef.current) audioRef.current.pause()
    youtubeService.loadSearchQuery(cleanQuery)
    setIsPlaying(true)

    setHistory((prev) => [newTrack, ...prev.filter((t) => t.id !== newTrack.id)].slice(0, 30))
  }

  const togglePlay = () => {
    if (!currentTrack) {
      const curQueue = queueRef.current
      if (curQueue.length > 0) {
        const idx = Math.max(0, Math.min(queueIndexRef.current, curQueue.length - 1))
        playTrack(curQueue[idx], curQueue)
      }
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

    maybeRecordEarlySkip()

    let nextIdx = queueIndexRef.current + 1
    if (nextIdx >= curQueue.length) {
      if (repeatModeRef.current === 'all') {
        nextIdx = 0
      } else if (isSmartQueueEnabledRef.current && currentTrackRef.current) {
        // Smart Queue automatically fetches and appends next recommended track cleanly
        const queueIds = curQueue.map((t) => t.id)
        smartQueueService.getNextSmartTrack(currentTrackRef.current, queueIds).then((nextSug) => {
          if (nextSug) {
            const latestQueue = queueRef.current
            if (latestQueue.some((t) => t.id === nextSug.id)) return
            const updatedQueue = [...latestQueue, nextSug]
            originalQueueRef.current = dedupTracksById([...originalQueueRef.current, nextSug])
            const targetIdx = updatedQueue.length - 1
            syncQueueState(updatedQueue, targetIdx)
            showToast(`✨ Smart Queue Autoplay: ${nextSug.title} • ${nextSug.artist}`)
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

    syncQueueState(curQueue, nextIdx)
    loadAndPlayTrack(curQueue[nextIdx], true)
  }

  const prevTrack = () => {
    if (currentTimeRef.current > 3) {
      seek(0)
      return
    }

    const curQueue = queueRef.current
    if (curQueue.length === 0) return

    let prevIdx = queueIndexRef.current - 1
    if (prevIdx < 0) {
      prevIdx = repeatModeRef.current === 'all' ? curQueue.length - 1 : 0
    }

    syncQueueState(curQueue, prevIdx)
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

  const toggleShuffle = () => {
    const nextShuffle = !isShuffleRef.current
    isShuffleRef.current = nextShuffle
    setIsShuffle(nextShuffle)

    const curQueue = queueRef.current
    const curIdx = queueIndexRef.current
    if (curQueue.length <= 1) {
      showToast(nextShuffle ? 'Shuffle ON' : 'Shuffle OFF')
      return
    }

    if (nextShuffle) {
      originalQueueRef.current = [...curQueue]
      const head = curQueue.slice(0, curIdx + 1)
      const tail = fisherYatesShuffle(curQueue.slice(curIdx + 1))
      syncQueueState([...head, ...tail], curIdx)
      showToast('Shuffle ON — Upcoming order shuffled')
    } else {
      const currentId = curQueue[curIdx]?.id
      const curIds = new Set(curQueue.map((t) => t.id))
      const base = originalQueueRef.current.filter((t) => curIds.has(t.id))
      const extras = curQueue.filter((t) => !base.some((b) => b.id === t.id))
      const restored = dedupTracksById([...base, ...extras])
      const restoredIdx = currentId ? restored.findIndex((t) => t.id === currentId) : 0
      syncQueueState(restored, restoredIdx >= 0 ? restoredIdx : 0)
      showToast('Shuffle OFF — Original order restored')
    }
  }

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all'
      if (prev === 'all') return 'one'
      return 'off'
    })
  }

  const toggleLike = (trackId: string, trackObj?: Track) => {
    const curLiked = likedTracksRef.current
    const exists = curLiked.some((t) => t.id === trackId)
    if (exists) {
      const removedTrack = trackObj || curLiked.find((t) => t.id === trackId)
      const updated = curLiked.filter((t) => t.id !== trackId)
      likedTracksRef.current = updated
      setLikedTracks(updated)
      showToast('Removed from Liked Songs')
      if (removedTrack) recommendationEngine.recordLike(removedTrack, false)
    } else {
      const resolved =
        trackObj ||
        (currentTrackRef.current?.id === trackId ? currentTrackRef.current : null) ||
        queueRef.current.find((t) => t.id === trackId) ||
        history.find((t) => t.id === trackId) ||
        SAMPLE_TRACKS.find((t) => t.id === trackId) ||
        ({
          id: trackId,
          title: 'Liked Track',
          artist: 'Favorite Artist',
          album: 'Liked Songs',
          duration: 210,
          coverUrl:
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
          source: 'youtube',
          genre: 'Music',
          releaseYear: new Date().getFullYear(),
        } as Track)
      const updated = dedupTracksById([resolved, ...curLiked])
      likedTracksRef.current = updated
      setLikedTracks(updated)
      showToast(`Added "${resolved.title}" to Liked Songs`)
      recommendationEngine.recordLike(resolved, true)
    }
  }

  const isLiked = (trackId: string) => likedTrackIds.includes(trackId)

  const playNext = (track: Track) => {
    const curQueue = queueRef.current
    const curIdx = queueIndexRef.current
    const curPlaying = currentTrackRef.current

    if (curQueue.length === 0 || !curPlaying) {
      originalQueueRef.current = dedupTracksById([track, ...curQueue])
      syncQueueState(originalQueueRef.current, 0)
      loadAndPlayTrack(track, true)
      showToast(`Playing next: "${track.title}"`)
      return
    }

    if (curPlaying.id === track.id) {
      showToast(`"${track.title}" is currently playing`)
      return
    }

    // Keep history prefix intact, remove any duplicate in upcoming, insert immediately at curIdx + 1
    const prefix = curQueue.slice(0, curIdx + 1).filter((t) => t.id !== track.id)
    const upcoming = curQueue.slice(curIdx + 1).filter((t) => t.id !== track.id)
    const newCurIdx = prefix.length - 1
    const nextQueue = [...prefix, track, ...upcoming]
    originalQueueRef.current = dedupTracksById([...originalQueueRef.current, track])
    syncQueueState(nextQueue, Math.max(0, newCurIdx))
    showToast(`Will play next: "${track.title}"`)
  }

  const addToQueue = (track: Track) => {
    const curQueue = queueRef.current
    const curIdx = queueIndexRef.current
    if (curQueue.some((t) => t.id === track.id)) {
      showToast(`"${track.title}" is already in queue`)
      return
    }
    const nextQueue = [...curQueue, track]
    originalQueueRef.current = dedupTracksById([...originalQueueRef.current, track])
    syncQueueState(nextQueue, curQueue.length === 0 ? 0 : curIdx)
    showToast(`Added "${track.title}" to queue`)
  }

  const addAlbumToQueue = (album: Album) => {
    if (!album.tracks || album.tracks.length === 0) return
    const curQueue = queueRef.current
    const curIdx = queueIndexRef.current
    const nextQueue = dedupTracksById([...curQueue, ...album.tracks])
    const addedCount = nextQueue.length - curQueue.length
    originalQueueRef.current = dedupTracksById([...originalQueueRef.current, ...album.tracks])
    syncQueueState(nextQueue, curQueue.length === 0 ? 0 : curIdx)
    showToast(
      addedCount > 0
        ? `Added ${addedCount} songs from "${album.title}" to queue`
        : `"${album.title}" tracks are already in queue`
    )
  }

  const addPlaylistToQueue = (playlist: Playlist) => {
    if (!playlist.tracks || playlist.tracks.length === 0) return
    const curQueue = queueRef.current
    const curIdx = queueIndexRef.current
    const nextQueue = dedupTracksById([...curQueue, ...playlist.tracks])
    const addedCount = nextQueue.length - curQueue.length
    originalQueueRef.current = dedupTracksById([...originalQueueRef.current, ...playlist.tracks])
    syncQueueState(nextQueue, curQueue.length === 0 ? 0 : curIdx)
    showToast(
      addedCount > 0
        ? `Added ${addedCount} songs from "${playlist.name}" to queue`
        : `"${playlist.name}" tracks are already in queue`
    )
  }

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    const curQueue = queueRef.current
    const curIdx = queueIndexRef.current
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= curQueue.length ||
      toIndex >= curQueue.length
    ) {
      return
    }

    const updated = [...curQueue]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)

    let nextIdx = curIdx
    if (fromIndex === curIdx) nextIdx = toIndex
    else if (fromIndex < curIdx && toIndex >= curIdx) nextIdx = curIdx - 1
    else if (fromIndex > curIdx && toIndex <= curIdx) nextIdx = curIdx + 1

    if (!isShuffleRef.current) {
      originalQueueRef.current = updated
    }
    syncQueueState(updated, nextIdx)
  }

  const reorderUpcoming = (fromUpcomingIdx: number, toUpcomingIdx: number) => {
    const curIdx = queueIndexRef.current
    const offset = currentTrackRef.current ? curIdx + 1 : 0
    const fromIndex = offset + fromUpcomingIdx
    const toIndex = offset + toUpcomingIdx
    reorderQueue(fromIndex, toIndex)
  }

  const removeFromQueue = (index: number) => {
    const curQueue = queueRef.current
    const curIdx = queueIndexRef.current
    if (index < 0 || index >= curQueue.length) return

    const removedTrack = curQueue[index]
    const nextQueue = curQueue.filter((_, i) => i !== index)
    originalQueueRef.current = originalQueueRef.current.filter((t) => t.id !== removedTrack.id)

    if (nextQueue.length === 0) {
      syncQueueState([], 0)
      if (currentTrackRef.current?.id === removedTrack.id) {
        if (audioRef.current) audioRef.current.pause()
        youtubeService.pause()
        setIsPlaying(false)
        setCurrentTrack(null)
        currentTrackRef.current = null
      }
    } else if (index < curIdx) {
      syncQueueState(nextQueue, curIdx - 1)
    } else if (index === curIdx && currentTrackRef.current) {
      const nextIdx = Math.min(index, nextQueue.length - 1)
      const nextT = nextQueue[nextIdx]
      syncQueueState(nextQueue, nextIdx)
      loadAndPlayTrack(nextT, isPlayingRef.current)
    } else {
      syncQueueState(nextQueue, Math.min(curIdx, nextQueue.length - 1))
    }

    showToast(`Removed "${removedTrack.title}" from queue`)
  }

  const clearQueue = () => {
    if (currentTrackRef.current) {
      originalQueueRef.current = [currentTrackRef.current]
      syncQueueState([currentTrackRef.current], 0)
    } else {
      originalQueueRef.current = []
      syncQueueState([], 0)
    }
    showToast('🧹 Upcoming queue cleared')
  }

  const playQueuedTrackImmediately = (index: number) => {
    const curQueue = queueRef.current
    if (index < 0 || index >= curQueue.length) return
    const track = curQueue[index]
    maybeRecordEarlySkip(track.id)
    syncQueueState(curQueue, index)
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
      if (e.state?.mode) {
        if (e.state.mode === 'website' && checkIsStandaloneApp()) {
          // Locked in standalone player mode
          return
        }
        setAppModeState(e.state.mode)
        return
      }
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
    const reqId = ++albumRequestIdRef.current
    setSelectedAlbum(album)
    navigateTo('album')

    if (!album.tracks || album.tracks.length === 0) {
      setIsLoadingAlbum(true)
      artistService
        .getAlbumTracks(album)
        .then((tracks) => {
          if (albumRequestIdRef.current !== reqId) return
          if (tracks.length > 0) {
            setSelectedAlbum({ ...album, tracks })
          }
        })
        .finally(() => {
          if (albumRequestIdRef.current === reqId) {
            setIsLoadingAlbum(false)
          }
        })
    } else {
      setIsLoadingAlbum(false)
    }
  }

  const openArtist = (artist: Artist | string) => {
    const reqId = ++artistRequestIdRef.current
    if (typeof artist === 'string') {
      const primaryName = extractPrimaryArtistName(artist)
      setSelectedArtist({
        id: `artist-loading-${primaryName.toLowerCase().replace(/\s+/g, '-')}`,
        name: primaryName,
        avatarUrl: '',
        headerImage: '',
        monthlyListeners: 0,
        bio: '',
        isFallbackBio: true,
        topTracks: [],
        albums: [],
        singles: [],
      })
      setIsLoadingArtist(true)
      navigateTo('artist')
      artistService
        .getArtistProfile(primaryName)
        .then((profile) => {
          if (artistRequestIdRef.current !== reqId) return
          setSelectedArtist(profile)
        })
        .finally(() => {
          if (artistRequestIdRef.current === reqId) {
            setIsLoadingArtist(false)
          }
        })
    } else {
      setSelectedArtist(artist)
      setIsLoadingArtist(false)
      navigateTo('artist')
    }
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
        downloadStates,
        saveOffline,
        cancelDownload,
        removeOffline,
        isOffline,
        isTrackDownloadable,
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
        likedTracks,
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
        playNext,
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
        isLoadingAlbum,
        isLoadingArtist,
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
        appMode,
        setAppMode,
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
