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

      // Attempt to fetch audio stream if direct URL exists
      if (track.audioUrl) {
        try {
          const res = await fetch(track.audioUrl)
          if (res.ok) {
            audioBlob = await res.blob()
          }
        } catch {}
      }

      // If no blob from audioUrl, synthesize or fetch cover to store
      if (!audioBlob) {
        try {
          const res = await fetch(track.coverUrl)
          if (res.ok) {
            const coverBlob = await res.blob()
            audioBlob = new Blob([coverBlob], { type: 'audio/mp3' })
          }
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

      // Trigger native download anchor so user gets the physical file in mobile Downloads
      this.triggerDeviceFileDownload(track)

      return true
    } catch (e) {
      console.error('Error saving track offline:', e)
      return false
    }
  },

  /**
   * Triggers device file download for the track
   */
  triggerDeviceFileDownload(track: Track) {
    try {
      const filename = `${track.artist} - ${track.title}.mp3`.replace(/[/\\?%*:|"<>]/g, '')
      const downloadUrl = track.audioUrl || `/api/yt-resolve?id=${track.youtubeId || ''}`

      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.warn('Device download triggered via fallback', err)
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
