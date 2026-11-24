import { useState, useEffect, useCallback } from 'react'
import {
  DATA_SAVER_STORAGE_KEY,
  DATA_SAVER_EVENT,
  getNetworkState,
} from '../utils/networkImage'

export interface NetworkStatus {
  isOnline: boolean
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown'
  isSlowConnection: boolean
  saveData: boolean
}

export function useNetworkStatus() {
  const [state, setState] = useState(() => getNetworkState())

  useEffect(() => {
    if (typeof window === 'undefined') return

    const refresh = () => {
      setState(getNetworkState())
    }

    window.addEventListener('online', refresh)
    window.addEventListener('offline', refresh)
    window.addEventListener(DATA_SAVER_EVENT, refresh)

    const handleStorage = (e: StorageEvent) => {
      if (e.key === DATA_SAVER_STORAGE_KEY) refresh()
    }
    window.addEventListener('storage', handleStorage)

    const connection =
      (navigator as unknown as { connection?: EventTarget }).connection ||
      (navigator as unknown as { mozConnection?: EventTarget }).mozConnection ||
      (navigator as unknown as { webkitConnection?: EventTarget }).webkitConnection

    if (connection && typeof connection.addEventListener === 'function') {
      connection.addEventListener('change', refresh)
    }

    return () => {
      window.removeEventListener('online', refresh)
      window.removeEventListener('offline', refresh)
      window.removeEventListener(DATA_SAVER_EVENT, refresh)
      window.removeEventListener('storage', handleStorage)
      if (connection && typeof connection.removeEventListener === 'function') {
        connection.removeEventListener('change', refresh)
      }
    }
  }, [])

  const toggleDataSaver = useCallback((val?: boolean) => {
    const current = getNetworkState().dataSaverEnabled
    const next = typeof val === 'boolean' ? val : !current
    try {
      localStorage.setItem(DATA_SAVER_STORAGE_KEY, String(next))
    } catch {
      // Ignore storage quota issues
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(DATA_SAVER_EVENT, { detail: { enabled: next } }))
    }
    setState(getNetworkState())
  }, [])

  return {
    isOnline: state.isOnline,
    effectiveType: state.effectiveType,
    isSlowConnection: state.isSlowConnection,
    dataSaverEnabled: state.dataSaverEnabled,
    isLowDataMode: state.isLowDataMode,
    toggleDataSaver,
  }
}
