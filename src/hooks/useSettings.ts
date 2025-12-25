import { useCallback, useSyncExternalStore } from 'react'
import {
  type FontFamily,
  type FontSize,
  get7tvEmotesEnabled,
  getFontFamily,
  getFontSize,
  set7tvEmotesEnabled,
  setFontFamily,
  setFontSize,
} from '@/lib/settings'

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

function getFontSnapshot(): FontFamily {
  return getFontFamily()
}

function getFontServerSnapshot(): FontFamily {
  return 'helvetica' // Default font on server
}

function getFontSizeSnapshot(): FontSize {
  return getFontSize()
}

function getFontSizeServerSnapshot(): FontSize {
  return 'base' // Default font size on server
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

export function useFontFamily() {
  const font = useSyncExternalStore(subscribe, getFontSnapshot, getFontServerSnapshot)

  const setFont = useCallback((value: FontFamily) => {
    setFontFamily(value)
    notifySubscribers()
  }, [])

  return {
    font,
    setFont,
  }
}

export function useFontSize() {
  const size = useSyncExternalStore(subscribe, getFontSizeSnapshot, getFontSizeServerSnapshot)

  const setSize = useCallback((value: FontSize) => {
    setFontSize(value)
    notifySubscribers()
  }, [])

  return {
    size,
    setSize,
  }
}
