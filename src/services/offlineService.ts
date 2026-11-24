import type { Track } from '../types'

const DB_NAME = 'raiwave_offline_db'
const STORE_NAME = 'offline_tracks'
const DB_VERSION = 2
const STORAGE_KEY_IDS = 'raiwave_offline_ids'
const MIN_VALID_AUDIO_BYTES = 1024

export type DownloadStatus =
  | 'idle'
  | 'downloading'
  | 'verifying'
  | 'downloaded'
  | 'failed'
  | 'cancelled'
  | 'unsupported'

export interface TrackDownloadState {
  status: DownloadStatus
  progress: number
  downloadedBytes?: number
  totalBytes?: number
  sizeBytes?: number
  error?: string
  localUrl?: string
}

export interface OfflineTrackRecord {
  id: string
  track: Track
  blob?: Blob
  localUrl?: string
  sizeBytes: number
  mimeType: string
  nativeStored: boolean
  verified: boolean
  downloadedAt: number
}

export interface OfflineVaultItem {
  track: Track
  sizeBytes: number
  downloadedAt: number
  nativeStored: boolean
  verified: boolean
  localUrl?: string
}

export interface DownloadResult {
  success: boolean
  cancelled?: boolean
  unsupported?: boolean
  sizeBytes?: number
  localUrl?: string
  error?: string
}

type ProgressListener = (trackId: string, state: TrackDownloadState) => void

interface NativeBridgeWindow extends Window {
  AndroidMedia?: {
    downloadOfflineAudio?: (trackId: string, audioUrl: string) => void
    cancelOfflineAudio?: (trackId: string) => boolean
    deleteOfflineAudio?: (trackId: string) => boolean
    getOfflineAudioInfo?: (trackId: string) => string
    getNativeVersion?: () => string
  }
  chrome?: {
    webview?: {
      postMessage: (msg: unknown) => void
    }
  }
  __raiwaveNativeDownloadProgress?: (
    trackId: string,
    percent: number,
    downloadedBytes: number,
    totalBytes: number
  ) => void
  __raiwaveNativeDownloadComplete?: (
    trackId: string,
    success: boolean,
    error: string,
    sizeBytes: number,
    localUrl: string
  ) => void
  __raiwaveDesktopAudioCheck?: (
    trackId: string,
    exists: boolean,
    sizeBytes: number,
    localUrl: string
  ) => void
}

function getWin(): NativeBridgeWindow | null {
  return typeof window !== 'undefined' ? (window as NativeBridgeWindow) : null
}

function hasAndroidOfflineBridge(): boolean {
  const w = getWin()
  return Boolean(w?.AndroidMedia?.downloadOfflineAudio)
}

function hasDesktopOfflineBridge(): boolean {
  const w = getWin()
  return Boolean(
    w?.chrome?.webview?.postMessage &&
      typeof navigator !== 'undefined' &&
      navigator.userAgent.includes('RAIWAVE-Desktop-Standalone')
  )
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
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

async function getRecord(trackId: string): Promise<OfflineTrackRecord | null> {
  try {
    const db = await openDB()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(trackId)
      req.onsuccess = () => resolve((req.result as OfflineTrackRecord) || null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

async function getAllRecords(): Promise<OfflineTrackRecord[]> {
  try {
    const db = await openDB()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).getAll()
      req.onsuccess = () => resolve((req.result as OfflineTrackRecord[]) || [])
      req.onerror = () => reject(req.error)
    })
  } catch {
    return []
  }
}

async function putRecord(record: OfflineTrackRecord): Promise<void> {
  const db = await openDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(record)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function deleteRecord(trackId: string): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(trackId)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // Ignore DB errors during deletion cleanup
  }
}

function writeOfflineIds(ids: string[]): void {
  try {
    const unique = Array.from(new Set(ids))
    localStorage.setItem(STORAGE_KEY_IDS, JSON.stringify(unique))
  } catch {
    // Ignore storage quota errors
  }
}

function addOfflineId(trackId: string): void {
  const ids = offlineService.getOfflineTrackIds()
  if (!ids.includes(trackId)) {
    writeOfflineIds([...ids, trackId])
  }
}

function removeOfflineId(trackId: string): void {
  const ids = offlineService.getOfflineTrackIds().filter((id) => id !== trackId)
  writeOfflineIds(ids)
}

async function verifyAudioUrlPlayable(url: string): Promise<boolean> {
  if (typeof document === 'undefined') return true
  return await new Promise<boolean>((resolve) => {
    const audio = document.createElement('audio')
    let settled = false
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      audio.onloadedmetadata = null
      audio.oncanplay = null
      audio.onerror = null
      try {
        audio.removeAttribute('src')
        audio.load()
      } catch {
        // Ignore cleanup errors
      }
      resolve(ok)
    }

    const timer = window.setTimeout(() => finish(false), 6000)
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      // Valid audio should expose positive finite duration
      const validDuration = Number.isFinite(audio.duration) ? audio.duration > 0.2 : true
      finish(validDuration)
    }
    audio.oncanplay = () => finish(true)
    audio.onerror = () => finish(false)
    audio.src = url
  })
}

function checkDesktopNativeFile(trackId: string): Promise<{ exists: boolean; sizeBytes: number; localUrl: string }> {
  const w = getWin()
  if (!hasDesktopOfflineBridge() || !w?.chrome?.webview) {
    return Promise.resolve({ exists: false, sizeBytes: 0, localUrl: '' })
  }

  return new Promise((resolve) => {
    let settled = false
    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true
        desktopCheckWaiters.delete(trackId)
        resolve({ exists: false, sizeBytes: 0, localUrl: '' })
      }
    }, 2500)

    const waiters = desktopCheckWaiters.get(trackId) || []
    waiters.push((info) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(info)
    })
    desktopCheckWaiters.set(trackId, waiters)
    try {
      w.chrome!.webview!.postMessage({ action: 'checkOfflineAudio', trackId })
    } catch {
      if (!settled) {
        settled = true
        clearTimeout(timer)
        resolve({ exists: false, sizeBytes: 0, localUrl: '' })
      }
    }
  })
}

const activeDownloads = new Map<string, Promise<DownloadResult>>()
const webAbortControllers = new Map<string, AbortController>()
const nativeResolvers = new Map<
  string,
  (result: { success: boolean; error: string; sizeBytes: number; localUrl: string }) => void
>()
const desktopCheckWaiters = new Map<
  string,
  Array<(info: { exists: boolean; sizeBytes: number; localUrl: string }) => void>
>()
const downloadStates = new Map<string, TrackDownloadState>()
const listeners = new Set<ProgressListener>()

function notifyState(trackId: string, state: TrackDownloadState): void {
  downloadStates.set(trackId, state)
  listeners.forEach((fn) => {
    try {
      fn(trackId, state)
    } catch {
      // Ignore subscriber errors
    }
  })
}

function installGlobalBridgeCallbacks(): void {
  const w = getWin()
  if (!w) return

  w.__raiwaveNativeDownloadProgress = (trackId, percent, downloadedBytes, totalBytes) => {
    notifyState(trackId, {
      status: 'downloading',
      progress: Math.max(0, Math.min(99, Math.round(percent))),
      downloadedBytes,
      totalBytes,
    })
  }

  w.__raiwaveNativeDownloadComplete = (trackId, success, error, sizeBytes, localUrl) => {
    const resolver = nativeResolvers.get(trackId)
    if (resolver) {
      nativeResolvers.delete(trackId)
      resolver({ success, error, sizeBytes, localUrl })
    }
  }

  w.__raiwaveDesktopAudioCheck = (trackId, exists, sizeBytes, localUrl) => {
    const waiters = desktopCheckWaiters.get(trackId)
    if (waiters && waiters.length > 0) {
      desktopCheckWaiters.delete(trackId)
      waiters.forEach((cb) => cb({ exists, sizeBytes, localUrl }))
    }
  }
}

installGlobalBridgeCallbacks()

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let idx = 0
  let val = bytes
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024
    idx++
  }
  return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

export const offlineService = {
  subscribe(listener: ProgressListener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  getDownloadState(trackId: string): TrackDownloadState {
    return (
      downloadStates.get(trackId) ||
      (this.isOffline(trackId) ? { status: 'downloaded', progress: 100 } : { status: 'idle', progress: 0 })
    )
  },

  getAllDownloadStates(): Record<string, TrackDownloadState> {
    const out: Record<string, TrackDownloadState> = {}
    downloadStates.forEach((val, key) => {
      out[key] = val
    })
    return out
  },

  isTrackDownloadable(track: Track): { downloadable: boolean; reason?: string } {
    if (!track?.audioUrl || !/^https?:\/\/|^blob:|^data:audio\//i.test(track.audioUrl.trim())) {
      return {
        downloadable: false,
        reason:
          track?.youtubeId || track?.source === 'youtube'
            ? 'Stream-only YouTube audio cannot be downloaded offline.'
            : 'This track does not provide a direct downloadable audio file.',
      }
    }
    return { downloadable: true }
  },

  getOfflineTrackIds(): string[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_IDS)
      return saved ? (JSON.parse(saved) as string[]) : []
    } catch {
      return []
    }
  },

  isOffline(trackId: string): boolean {
    return this.getOfflineTrackIds().includes(trackId)
  },

  async verifyNativeRecord(record: OfflineTrackRecord): Promise<boolean> {
    if (!record.nativeStored) {
      return Boolean(
        record.blob instanceof Blob &&
          record.blob.size > MIN_VALID_AUDIO_BYTES &&
          record.track?.audioUrl
      )
    }

    const w = getWin()
    if (w?.AndroidMedia?.getOfflineAudioInfo) {
      try {
        const info = JSON.parse(w.AndroidMedia.getOfflineAudioInfo(record.id)) as {
          exists: boolean
          sizeBytes: number
          localUrl: string
        }
        return Boolean(info.exists && info.sizeBytes > MIN_VALID_AUDIO_BYTES)
      } catch {
        return false
      }
    }

    if (hasDesktopOfflineBridge()) {
      const info = await checkDesktopNativeFile(record.id)
      return Boolean(info.exists && info.sizeBytes > MIN_VALID_AUDIO_BYTES)
    }

    // Fallback check when native bridge isn't attached in plain web browser
    return false
  },

  async verifyAndSyncVault(): Promise<string[]> {
    const records = await getAllRecords()
    const validIds: string[] = []

    for (const rec of records) {
      const isValid = await this.verifyNativeRecord(rec)
      if (isValid) {
        validIds.push(rec.id)
        notifyState(rec.id, {
          status: 'downloaded',
          progress: 100,
          sizeBytes: rec.sizeBytes,
          localUrl: rec.localUrl,
        })
      } else {
        // Purge fake 44-byte WAV stubs or missing native files
        await deleteRecord(rec.id)
        notifyState(rec.id, { status: 'idle', progress: 0 })
      }
    }

    writeOfflineIds(validIds)
    return validIds
  },

  async getOfflineVaultItems(): Promise<OfflineVaultItem[]> {
    const records = await getAllRecords()
    const items: OfflineVaultItem[] = []
    for (const rec of records) {
      const ok = await this.verifyNativeRecord(rec)
      if (!ok) {
        await deleteRecord(rec.id)
        removeOfflineId(rec.id)
        continue
      }
      items.push({
        track: rec.track,
        sizeBytes: rec.sizeBytes || rec.blob?.size || 0,
        downloadedAt: rec.downloadedAt,
        nativeStored: rec.nativeStored,
        verified: true,
        localUrl: rec.localUrl,
      })
    }
    return items.sort((a, b) => b.downloadedAt - a.downloadedAt)
  },

  async getOfflineTracks(): Promise<Track[]> {
    const items = await this.getOfflineVaultItems()
    return items.map((i) => i.track)
  },

  async getPlayableOfflineUrl(trackId: string): Promise<string | null> {
    const rec = await getRecord(trackId)
    if (!rec) {
      removeOfflineId(trackId)
      return null
    }

    if (rec.nativeStored) {
      const w = getWin()
      if (w?.AndroidMedia?.getOfflineAudioInfo) {
        try {
          const info = JSON.parse(w.AndroidMedia.getOfflineAudioInfo(trackId)) as {
            exists: boolean
            sizeBytes: number
            localUrl: string
          }
          if (info.exists && info.sizeBytes > MIN_VALID_AUDIO_BYTES && info.localUrl) {
            return info.localUrl
          }
        } catch {
          // Fall through to purge
        }
      } else if (hasDesktopOfflineBridge()) {
        const info = await checkDesktopNativeFile(trackId)
        if (info.exists && info.sizeBytes > MIN_VALID_AUDIO_BYTES && info.localUrl) {
          return info.localUrl
        }
      }
      await deleteRecord(trackId)
      removeOfflineId(trackId)
      return null
    }

    if (rec.blob instanceof Blob && rec.blob.size > MIN_VALID_AUDIO_BYTES) {
      return URL.createObjectURL(rec.blob)
    }

    await deleteRecord(trackId)
    removeOfflineId(trackId)
    return null
  },

  async getOfflineAudioBlob(trackId: string): Promise<Blob | null> {
    const rec = await getRecord(trackId)
    if (rec?.blob instanceof Blob && rec.blob.size > MIN_VALID_AUDIO_BYTES) {
      return rec.blob
    }
    return null
  },

  async saveTrackOffline(track: Track): Promise<DownloadResult> {
    const eligibility = this.isTrackDownloadable(track)
    if (!eligibility.downloadable) {
      notifyState(track.id, {
        status: 'unsupported',
        progress: 0,
        error: eligibility.reason,
      })
      return {
        success: false,
        unsupported: true,
        error: eligibility.reason,
      }
    }

    // Prevent duplicate concurrent downloads
    const existingPromise = activeDownloads.get(track.id)
    if (existingPromise) {
      return existingPromise
    }

    // Check if already verified downloaded
    const existingRecord = await getRecord(track.id)
    if (existingRecord && (await this.verifyNativeRecord(existingRecord))) {
      addOfflineId(track.id)
      notifyState(track.id, {
        status: 'downloaded',
        progress: 100,
        sizeBytes: existingRecord.sizeBytes,
        localUrl: existingRecord.localUrl,
      })
      return {
        success: true,
        sizeBytes: existingRecord.sizeBytes,
        localUrl: existingRecord.localUrl,
      }
    }

    const job = (async (): Promise<DownloadResult> => {
      installGlobalBridgeCallbacks()
      const audioUrl = track.audioUrl!.trim()
      notifyState(track.id, { status: 'downloading', progress: 1 })

      // Path A: Native Android or Windows Desktop persistent filesystem downloader
      if (hasAndroidOfflineBridge() || hasDesktopOfflineBridge()) {
        const w = getWin()!
        const nativeRes = await new Promise<{
          success: boolean
          error: string
          sizeBytes: number
          localUrl: string
        }>((resolve) => {
          nativeResolvers.set(track.id, resolve)
          if (hasAndroidOfflineBridge()) {
            w.AndroidMedia!.downloadOfflineAudio!(track.id, audioUrl)
          } else {
            w.chrome!.webview!.postMessage({
              action: 'downloadOfflineAudio',
              trackId: track.id,
              audioUrl,
            })
          }
        })

        if (!nativeRes.success) {
          if (nativeRes.error === 'cancelled') {
            notifyState(track.id, { status: 'cancelled', progress: 0 })
            return { success: false, cancelled: true, error: 'Download cancelled' }
          }
          notifyState(track.id, {
            status: 'failed',
            progress: 0,
            error: nativeRes.error || 'Download failed',
          })
          return { success: false, error: nativeRes.error || 'Download failed' }
        }

        if (nativeRes.sizeBytes <= MIN_VALID_AUDIO_BYTES || !nativeRes.localUrl) {
          notifyState(track.id, {
            status: 'failed',
            progress: 0,
            error: 'Downloaded file failed integrity check.',
          })
          return { success: false, error: 'Downloaded file failed integrity check.' }
        }

        notifyState(track.id, { status: 'verifying', progress: 99, sizeBytes: nativeRes.sizeBytes })
        const playable = await verifyAudioUrlPlayable(nativeRes.localUrl)
        if (!playable) {
          await this.removeTrackOffline(track.id)
          notifyState(track.id, {
            status: 'failed',
            progress: 0,
            error: 'Audio verification failed: file is unplayable.',
          })
          return { success: false, error: 'Audio verification failed: file is unplayable.' }
        }

        const record: OfflineTrackRecord = {
          id: track.id,
          track,
          localUrl: nativeRes.localUrl,
          sizeBytes: nativeRes.sizeBytes,
          mimeType: 'audio/mpeg',
          nativeStored: true,
          verified: true,
          downloadedAt: Date.now(),
        }
        await putRecord(record)
        addOfflineId(track.id)
        notifyState(track.id, {
          status: 'downloaded',
          progress: 100,
          sizeBytes: nativeRes.sizeBytes,
          localUrl: nativeRes.localUrl,
        })
        return {
          success: true,
          sizeBytes: nativeRes.sizeBytes,
          localUrl: nativeRes.localUrl,
        }
      }

      // Path B: Web browser IndexedDB real-Blob streaming download
      const controller = new AbortController()
      webAbortControllers.set(track.id, controller)
      try {
        const res = await fetch(audioUrl, { signal: controller.signal })
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const contentType = res.headers.get('content-type') || 'audio/mpeg'
        if (contentType.includes('text/html') || contentType.includes('application/json')) {
          throw new Error(`Unexpected response type: ${contentType}`)
        }

        const totalBytesHeader = res.headers.get('content-length')
        const totalBytes = totalBytesHeader ? Number(totalBytesHeader) : 0

        let blob: Blob
        if (res.body && typeof res.body.getReader === 'function') {
          const reader = res.body.getReader()
          const chunks: Uint8Array[] = []
          let received = 0

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            if (value) {
              chunks.push(value)
              received += value.byteLength
              const pct =
                totalBytes > 0
                  ? Math.min(98, Math.round((received * 100) / totalBytes))
                  : Math.min(90, Math.max(5, Math.round(received / 65536)))
              notifyState(track.id, {
                status: 'downloading',
                progress: pct,
                downloadedBytes: received,
                totalBytes: totalBytes || undefined,
              })
            }
          }

          if (totalBytes > 0 && received < totalBytes) {
            throw new Error('Download ended before full audio was received.')
          }
          blob = new Blob(chunks as unknown as BlobPart[], { type: contentType })
        } else {
          blob = await res.blob()
        }

        if (blob.size <= MIN_VALID_AUDIO_BYTES) {
          throw new Error('Downloaded file is empty or invalid.')
        }

        notifyState(track.id, {
          status: 'verifying',
          progress: 99,
          sizeBytes: blob.size,
        })

        const objectUrl = URL.createObjectURL(blob)
        let playable = false
        try {
          playable = await verifyAudioUrlPlayable(objectUrl)
        } finally {
          URL.revokeObjectURL(objectUrl)
        }

        if (!playable) {
          throw new Error('Audio verification failed: unplayable audio stream.')
        }

        const record: OfflineTrackRecord = {
          id: track.id,
          track,
          blob,
          sizeBytes: blob.size,
          mimeType: contentType,
          nativeStored: false,
          verified: true,
          downloadedAt: Date.now(),
        }
        await putRecord(record)
        addOfflineId(track.id)
        notifyState(track.id, {
          status: 'downloaded',
          progress: 100,
          sizeBytes: blob.size,
        })
        return { success: true, sizeBytes: blob.size }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Download failed'
        if (controller.signal.aborted || msg.toLowerCase().includes('abort')) {
          notifyState(track.id, { status: 'cancelled', progress: 0 })
          return { success: false, cancelled: true, error: 'Download cancelled' }
        }
        const friendlyMsg =
          msg === 'Failed to fetch'
            ? 'Source host blocked browser download (use RAIWAVE app or a direct CORS-enabled source).'
            : msg
        notifyState(track.id, { status: 'failed', progress: 0, error: friendlyMsg })
        return { success: false, error: friendlyMsg }
      } finally {
        webAbortControllers.delete(track.id)
      }
    })()

    activeDownloads.set(track.id, job)
    try {
      return await job
    } finally {
      activeDownloads.delete(track.id)
    }
  },

  cancelDownload(trackId: string): void {
    const controller = webAbortControllers.get(trackId)
    if (controller) {
      controller.abort()
      webAbortControllers.delete(trackId)
    }
    const w = getWin()
    if (w?.AndroidMedia?.cancelOfflineAudio) {
      try {
        w.AndroidMedia.cancelOfflineAudio(trackId)
      } catch {
        // Ignore bridge errors
      }
    } else if (hasDesktopOfflineBridge() && w?.chrome?.webview) {
      try {
        w.chrome.webview.postMessage({ action: 'cancelOfflineAudio', trackId })
      } catch {
        // Ignore bridge errors
      }
    }
  },

  async removeTrackOffline(trackId: string): Promise<boolean> {
    this.cancelDownload(trackId)
    const w = getWin()
    if (w?.AndroidMedia?.deleteOfflineAudio) {
      try {
        w.AndroidMedia.deleteOfflineAudio(trackId)
      } catch {
        // Ignore bridge errors
      }
    } else if (hasDesktopOfflineBridge() && w?.chrome?.webview) {
      try {
        w.chrome.webview.postMessage({ action: 'deleteOfflineAudio', trackId })
      } catch {
        // Ignore bridge errors
      }
    }
    await deleteRecord(trackId)
    removeOfflineId(trackId)
    notifyState(trackId, { status: 'idle', progress: 0 })
    return true
  },
}
