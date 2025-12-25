import { useCallback, useSyncExternalStore } from 'react'
import { get7tvEmotesEnabled, set7tvEmotesEnabled } from '@/lib/settings'

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

function getSnapshot(): boolean {
  return get7tvEmotesEnabled()
}

function getServerSnapshot(): boolean {
  return true // Default to enabled on server
}

export function use7tvEmotesEnabled() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setEnabled = useCallback((value: boolean) => {
    set7tvEmotesEnabled(value)
    notifySubscribers()
  }, [])

  const toggle = useCallback(() => {
    const current = get7tvEmotesEnabled()
    set7tvEmotesEnabled(!current)
    notifySubscribers()
  }, [])

  return {
    enabled,
    setEnabled,
    toggle,
  }
}
