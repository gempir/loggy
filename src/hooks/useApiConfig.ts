import { useCallback, useSyncExternalStore } from 'react'
import { DEFAULT_API_URL, getApiBaseUrl, resetApiBaseUrl, setApiBaseUrl } from '@/lib/apiConfig'

const subscribers = new Set<() => void>()

function subscribe(callback: () => void): () => void {
  subscribers.add(callback)
  return () => subscribers.delete(callback)
}

function notifySubscribers(): void {
  for (const callback of subscribers) {
    callback()
  }
}

function getSnapshot(): string {
  return getApiBaseUrl()
}

function getServerSnapshot(): string {
  return DEFAULT_API_URL
}

export function useApiConfig() {
  const apiBaseUrl = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const updateApiBaseUrl = useCallback((url: string) => {
    setApiBaseUrl(url)
    notifySubscribers()
  }, [])

  const resetUrl = useCallback(() => {
    resetApiBaseUrl()
    notifySubscribers()
  }, [])

  const isCustomUrl = apiBaseUrl !== DEFAULT_API_URL

  return {
    apiBaseUrl,
    updateApiBaseUrl,
    resetUrl,
    isCustomUrl,
    defaultUrl: DEFAULT_API_URL,
  }
}
