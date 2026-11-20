// Official YouTube IFrame Player API Service (Compliant with Google Terms of Service)
import { resolveYouTubeVideoId } from './youtubeResolver'

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height: string | number
          width: string | number
          videoId?: string
          playerVars?: Record<string, unknown>
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void
            onError?: (event: { data: number }) => void
          }
        }
      ) => YTPlayerInstance
      PlayerState: {
        UNSTARTED: number
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
  }
}

export interface YTPlayerInstance {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  setVolume: (volume: number) => void
  getVolume: () => number
  getPlayerState: () => number
  getCurrentTime: () => number
  getDuration: () => number
  loadVideoById: (videoId: string, startSeconds?: number) => void
  cueVideoById: (videoId: string) => void
  loadPlaylist: (options: { list?: string; listType?: string; index?: number; startSeconds?: number }) => void
  destroy: () => void
}

type StateChangeCallback = (state: 'playing' | 'paused' | 'buffering' | 'ended') => void
type TimeUpdateCallback = (currentTime: number, duration: number) => void

class YouTubeService {
  private player: YTPlayerInstance | null = null
  private isApiLoaded = false
  private isReady = false
  private pendingVideoId: string | null = null
  private pendingSearchQuery: string | null = null
  private pendingPlayOnReady = false
  private timeInterval: number | null = null
  private boundTarget: string | HTMLElement = 'raiwave-youtube-player'

  private onStateChangeCb: StateChangeCallback | null = null
  private onTimeUpdateCb: TimeUpdateCallback | null = null
  private onErrorCb: ((errCode: number) => void) | null = null

  public init() {
    if (this.isApiLoaded || window.YT) {
      if (window.YT && window.YT.Player && !this.player) {
        this.createPlayer()
      }
      return
    }

    this.isApiLoaded = true
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      this.createPlayer()
    }
  }

  public bindToElement(target: string | HTMLElement) {
    this.boundTarget = target
    if (window.YT && window.YT.Player) {
      this.createPlayer(target)
    } else {
      this.init()
    }
  }

  private createPlayer(target = this.boundTarget) {
    if (this.player || !window.YT || !window.YT.Player) return

    // If target is string, check DOM element presence
    if (typeof target === 'string' && !document.getElementById(target)) {
      return
    }

    try {
      this.player = new window.YT.Player(target, {
        height: '100%',
        width: '100%',
        videoId: this.pendingVideoId || '', // Do NOT load any seed video unprompted
        playerVars: {
          autoplay: 0, // Never autoplay without user interaction
          enablejsapi: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            this.isReady = true
            this.startTimeTracker()
            try {
              event.target.unMute()
              event.target.setVolume(85)
            } catch {
              // ignore
            }
            if (this.pendingPlayOnReady && this.pendingVideoId) {
              event.target.loadVideoById(this.pendingVideoId)
              event.target.playVideo()
              this.pendingVideoId = null
              this.pendingPlayOnReady = false
            } else if (this.pendingPlayOnReady && this.pendingSearchQuery) {
              this.loadSearchQuery(this.pendingSearchQuery)
              this.pendingSearchQuery = null
              this.pendingPlayOnReady = false
            }
          },
          onStateChange: (event) => {
            if (!window.YT) return
            const ps = window.YT.PlayerState
            if (event.data === ps.PLAYING) {
              this.onStateChangeCb?.('playing')
            } else if (event.data === ps.PAUSED) {
              this.onStateChangeCb?.('paused')
            } else if (event.data === ps.ENDED) {
              this.onStateChangeCb?.('ended')
            } else if (event.data === ps.BUFFERING) {
              this.onStateChangeCb?.('buffering')
            }
          },
          onError: (event) => {
            console.warn('YouTube Player error code:', event.data)
            this.onErrorCb?.(event.data)
          },
        },
      })
    } catch (err) {
      console.warn('Failed to initialize YouTube IFrame Player:', err)
    }
  }

  private startTimeTracker() {
    if (this.timeInterval !== null) {
      clearInterval(this.timeInterval)
    }

    this.timeInterval = window.setInterval(() => {
      if (this.player && this.isReady) {
        try {
          const current = this.player.getCurrentTime() || 0
          const total = this.player.getDuration() || 0
          if (this.onTimeUpdateCb && total > 0) {
            this.onTimeUpdateCb(current, total)
          }
        } catch {
          // ignore transient poll exceptions
        }
      }
    }, 250)
  }

  public setCallbacks(callbacks: {
    onStateChange?: StateChangeCallback
    onTimeUpdate?: TimeUpdateCallback
    onError?: (code: number) => void
  }) {
    if (callbacks.onStateChange) this.onStateChangeCb = callbacks.onStateChange
    if (callbacks.onTimeUpdate) this.onTimeUpdateCb = callbacks.onTimeUpdate
    if (callbacks.onError) this.onErrorCb = callbacks.onError
  }

  public loadVideo(videoId: string, playImmediately = true) {
    if (this.player && this.isReady && typeof this.player.loadVideoById === 'function') {
      try {
        if (typeof this.player.unMute === 'function') {
          this.player.unMute()
        }
        if (playImmediately) {
          this.player.loadVideoById(videoId)
        } else {
          this.player.cueVideoById(videoId)
        }
      } catch (err) {
        console.warn('Failed to load video on YT player:', err)
      }
    } else {
      this.pendingVideoId = videoId
      if (playImmediately) this.pendingPlayOnReady = true
    }
  }

  public async loadSearchQuery(query: string, excludeIds: string[] = []): Promise<string | null> {
    if (!query || !query.trim()) return null
    const resolvedId = await resolveYouTubeVideoId(query, excludeIds)
    if (resolvedId) {
      this.loadVideo(resolvedId, true)
      return resolvedId
    } else {
      console.warn('Could not resolve embeddable video ID for query:', query)
      return null
    }
  }

  public play() {
    if (this.player && this.isReady && typeof this.player.playVideo === 'function') {
      try {
        if (typeof this.player.unMute === 'function') {
          this.player.unMute()
        }
        this.player.playVideo()
      } catch (err) {
        console.warn('Error playing YT player:', err)
      }
    } else {
      this.pendingPlayOnReady = true
    }
  }

  public pause() {
    this.pendingPlayOnReady = false
    if (this.player && this.isReady && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo()
      } catch (err) {
        console.warn('Error pausing YT player:', err)
      }
    }
  }

  public seekTo(seconds: number) {
    if (this.player && this.isReady && typeof this.player.seekTo === 'function') {
      try {
        this.player.seekTo(seconds, true)
      } catch (err) {
        console.warn('Error seeking YT player:', err)
      }
    }
  }

  public setVolume(vol0to1: number) {
    if (this.player && this.isReady && typeof this.player.setVolume === 'function') {
      try {
        if (vol0to1 > 0 && typeof this.player.unMute === 'function') {
          this.player.unMute()
        }
        this.player.setVolume(Math.round(vol0to1 * 100))
      } catch (err) {
        console.warn('Error setting volume on YT player:', err)
      }
    }
  }
}

export const youtubeService = new YouTubeService()
