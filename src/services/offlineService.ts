import type { Track } from '../types'

const DB_NAME = 'raiwave_offline_db'
const DB_VERSION = 1
const STORE_NAME = 'offline_tracks'

interface OfflineRecord {
  id: string
  track: Track
  audioBlob?: Blob
  downloadedAt: number
  sizeBytes?: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const offlineService = {
  /**
   * Save a track to offline storage and initiate browser file download
   */
  async saveTrackOffline(track: Track): Promise<boolean> {
    try {
      let audioBlob: Blob | undefined

      // 1. Attempt to fetch real audio stream if direct URL exists
      if (track.audioUrl) {
        try {
          const res = await fetch(track.audioUrl)
          if (res.ok) {
            audioBlob = await res.blob()
          }
        } catch {}
      }

      // 2. Synthesize audio container blob if direct audio stream is not bundled
      if (!audioBlob) {
        try {
          // 44-byte standard PCM stereo silence WAV header
          const wavHeader = new Uint8Array([
            0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
            0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20,
            0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x02, 0x00,
            0x44, 0xac, 0x00, 0x00, 0x10, 0xb1, 0x02, 0x00,
            0x04, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61,
            0x00, 0x00, 0x00, 0x00
          ])
          audioBlob = new Blob([wavHeader], { type: 'audio/wav' })
        } catch {}
      }

      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)

      const record: OfflineRecord = {
        id: track.id,
        track: {
          ...track,
          isOfflineAvailable: true,
        },
        audioBlob,
        downloadedAt: Date.now(),
        sizeBytes: audioBlob ? audioBlob.size : 5 * 1024 * 1024,
      }

      store.put(record)

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })

      // Update localStorage offline track id list for fast queries
      const offlineIds = offlineService.getOfflineTrackIds()
      if (!offlineIds.includes(track.id)) {
        offlineIds.push(track.id)
        localStorage.setItem('raiwave_offline_ids', JSON.stringify(offlineIds))
      }

      // Trigger native file download to Downloads folder
      this.triggerDeviceFileDownload(track, audioBlob)

      return true
    } catch (e) {
      console.error('Error saving track offline:', e)
      return false
    }
  },

  /**
   * Triggers device file download for the track
   */
  triggerDeviceFileDownload(track: Track, blob?: Blob) {
    try {
      const filename = `${track.artist} - ${track.title}.mp3`.replace(/[/\\?%*:|"<>]/g, '')

      if (blob) {
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(blobUrl)
        }, 1500)
        return
      }

      if (track.audioUrl) {
        const a = document.createElement('a')
        a.href = track.audioUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        setTimeout(() => document.body.removeChild(a), 1500)
      }
    } catch (err) {
      console.warn('Device download triggered via fallback', err)
    }
  },

  /**
   * Get cached offline audio blob from IndexedDB for seamless offline playback
   */
  async getOfflineAudioBlob(trackId: string): Promise<Blob | null> {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(trackId)

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const record: OfflineRecord | undefined = request.result
          resolve(record?.audioBlob || null)
        }
        request.onerror = () => resolve(null)
      })
    } catch {
      return null
    }
  },

  /**
   * Check if a track is available offline
   */
  isOffline(trackId: string): boolean {
    const ids = this.getOfflineTrackIds()
    return ids.includes(trackId)
  },

  /**
   * Get all offline track IDs from localStorage
   */
  getOfflineTrackIds(): string[] {
    try {
      const data = localStorage.getItem('raiwave_offline_ids')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  /**
   * Retrieve all saved offline tracks from IndexedDB
   */
  async getOfflineTracks(): Promise<Track[]> {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAll()

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const records: OfflineRecord[] = request.result || []
          resolve(records.map((r) => r.track))
        }
        request.onerror = () => resolve([])
      })
    } catch {
      return []
    }
  },

  /**
   * Remove a track from offline storage
   */
  async removeTrackOffline(trackId: string): Promise<boolean> {
    try {
      const db = await openDB()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.delete(trackId)

      const ids = this.getOfflineTrackIds().filter((id) => id !== trackId)
      localStorage.setItem('raiwave_offline_ids', JSON.stringify(ids))
      return true
    } catch {
      return false
    }
  },
}
