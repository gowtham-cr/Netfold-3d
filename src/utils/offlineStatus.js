import { useEffect, useState } from 'react'

/**
 * Monitors real browser network state (navigator.onLine) and PWA Service Worker / Cache API readiness.
 * Never fabricates cloud sync or backend connectivity.
 */
export function useOfflineEnvironmentStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true,
  )
  const [swInfo, setSwInfo] = useState({
    supported: false,
    registered: false,
    controlled: false,
    cacheCount: 0,
    cachedUrls: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    let active = true

    async function inspectSwAndCache() {
      const supported =
        typeof navigator !== 'undefined' && 'serviceWorker' in navigator
      let registered = false
      let controlled = false
      let cacheCount = 0
      let cachedUrls = 0

      if (supported) {
        try {
          controlled = Boolean(navigator.serviceWorker.controller)
          const reg = await navigator.serviceWorker.getRegistration()
          registered = Boolean(reg)
        } catch {
          // Ignore SW probe error in restricted environments
        }
      }

      if (typeof window.caches !== 'undefined') {
        try {
          const names = await window.caches.keys()
          cacheCount = names.length
          for (const name of names) {
            const cache = await window.caches.open(name)
            const keys = await cache.keys()
            cachedUrls += keys.length
          }
        } catch {
          // Ignore cache API error
        }
      }

      if (active) {
        setSwInfo({
          supported,
          registered,
          controlled,
          cacheCount,
          cachedUrls,
        })
      }
    }

    inspectSwAndCache()

    return () => {
      active = false
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isOnline,
    ...swInfo,
  }
}
