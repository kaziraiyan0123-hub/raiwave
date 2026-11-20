// Official Spotify Web Playback SDK Service (Compliant with Spotify Developer Terms)

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void
    Spotify?: {
      Player: new (options: {
        name: string
        getOAuthToken: (cb: (token: string) => void) => void
        volume?: number
      }) => SpotifyWebPlayerInstance
    }
  }
}

export interface SpotifyWebPlayerInstance {
  connect: () => Promise<boolean>
  disconnect: () => void
  addListener: (event: string, cb: (data: any) => void) => void
  removeListener: (event: string, cb: (data: any) => void) => void
  getCurrentState: () => Promise<any>
  setName: (name: string) => Promise<void>
  getVolume: () => Promise<number>
  setVolume: (volume: number) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  togglePlay: () => Promise<void>
  seek: (positionMs: number) => Promise<void>
  previousTrack: () => Promise<void>
  nextTrack: () => Promise<void>
}

class SpotifyService {
  private player: SpotifyWebPlayerInstance | null = null
  private deviceId: string | null = null
  private accessToken: string | null = null
  private isLoaded = false

  public init(accessToken?: string) {
    if (accessToken) {
      this.accessToken = accessToken
    }

    if (this.isLoaded || window.Spotify) {
      if (this.accessToken && !this.player) {
        this.createPlayer()
      }
      return
    }

    this.isLoaded = true
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    document.body.appendChild(script)

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (this.accessToken) {
        this.createPlayer()
      }
    }
  }

  public setToken(token: string) {
    this.accessToken = token
    localStorage.setItem('spotiflow_spotify_token', token)
    if (!this.player) {
      this.createPlayer()
    }
  }

  public getToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('spotiflow_spotify_token')
    }
    return this.accessToken
  }

  public clearToken() {
    this.accessToken = null
    localStorage.removeItem('spotiflow_spotify_token')
    if (this.player) {
      this.player.disconnect()
      this.player = null
    }
  }

  private createPlayer() {
    if (!window.Spotify || !this.accessToken) return

    this.player = new window.Spotify.Player({
      name: 'SpotiFlow Web Player',
      getOAuthToken: (cb) => {
        if (this.accessToken) cb(this.accessToken)
      },
      volume: 0.8,
    })

    this.player.addListener('ready', ({ device_id }: { device_id: string }) => {
      this.deviceId = device_id
      console.log('Spotify Web Player Ready with Device ID:', device_id)
    })

    this.player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.warn('Spotify Device ID is offline:', device_id)
    })

    this.player.addListener('initialization_error', ({ message }: { message: string }) => {
      console.error('Spotify initialization error:', message)
    })

    this.player.addListener('authentication_error', ({ message }: { message: string }) => {
      console.error('Spotify authentication error:', message)
      this.clearToken()
    })

    this.player.addListener('account_error', ({ message }: { message: string }) => {
      console.warn('Spotify account error (Premium required for playback):', message)
    })

    this.player.connect()
  }

  public async playTrack(spotifyUri: string) {
    if (!this.accessToken || !this.deviceId) {
      throw new Error('Spotify not connected or not ready.')
    }

    // Call Spotify Web API to transfer & play on this Web SDK device
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [spotifyUri],
      }),
    })
  }

  public async pause() {
    if (this.player) {
      await this.player.pause()
    }
  }

  public async resume() {
    if (this.player) {
      await this.player.resume()
    }
  }

  public async seek(positionMs: number) {
    if (this.player) {
      await this.player.seek(positionMs)
    }
  }

  public async setVolume(vol0to1: number) {
    if (this.player) {
      await this.player.setVolume(vol0to1)
    }
  }
}

export const spotifyService = new SpotifyService()
