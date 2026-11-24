import { useState, useEffect } from 'react'

export interface NetworkStatus {
  isOnline: boolean
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown'
  isSlowConnection: boolean
  saveData: boolean
}

const DATA_SAVER_KEY = 'raiwave_data_saver_mode'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  })

  const [effectiveType, setEffectiveType] = useState<'4g' | '3g' | '2g' | 'slow-2g' | 'unknown'>('4g')
  const [dataSaverEnabled, setDataSaverEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DATA_SAVER_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check navigator.connection if available (Chrome / Edge / Android WebView)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      const updateConn = () => {
        const type = connection.effectiveType || '4g'
        setEffectiveType(type)
      }
      updateConn()
      connection.addEventListener('change', updateConn)
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection.removeEventListener('change', updateConn)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const toggleDataSaver = (val?: boolean) => {
    setDataSaverEnabled((prev) => {
      const next = typeof val === 'boolean' ? val : !prev
      try {
        localStorage.setItem(DATA_SAVER_KEY, String(next))
      } catch {}
      return next
    })
  }

  const isSlow = !isOnline || effectiveType === '2g' || effectiveType === 'slow-2g'

  return {
    isOnline,
    effectiveType,
    isSlowConnection: isSlow,
    dataSaverEnabled,
    toggleDataSaver,
  }
}
