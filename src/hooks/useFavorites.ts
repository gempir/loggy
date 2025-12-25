import { useCallback, useSyncExternalStore } from 'react'
import {
  addFavorite,
  type Favorite,
  getFavorites,
  isFavorite,
  removeFavorite,
  toggleFavorite as toggleFavoriteUtil,
} from '@/lib/favorites'

const subscribers = new Set<() => void>()

// Cache the favorites array to avoid creating new references on every call
let cachedFavorites: Favorite[] = []
let cachedFavoritesString = ''

function subscribe(callback: () => void): () => void {
  subscribers.add(callback)
  return () => subscribers.delete(callback)
}

function notifySubscribers(): void {
  // Update cache before notifying
  cachedFavorites = getFavorites()
  cachedFavoritesString = JSON.stringify(cachedFavorites)
  for (const callback of subscribers) {
    callback()
  }
}

function getSnapshot(): Favorite[] {
  // Only update cache if localStorage actually changed
  if (typeof window !== 'undefined') {
    const current = getFavorites()
    const currentString = JSON.stringify(current)
    if (currentString !== cachedFavoritesString) {
      cachedFavorites = current
      cachedFavoritesString = currentString
    }
  }
  return cachedFavorites
}

function getServerSnapshot(): Favorite[] {
  return []
}

// Initialize cache on module load
if (typeof window !== 'undefined') {
  cachedFavorites = getFavorites()
  cachedFavoritesString = JSON.stringify(cachedFavorites)
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const add = useCallback((favorite: Favorite) => {
    addFavorite(favorite)
    notifySubscribers()
  }, [])

  const remove = useCallback((type: Favorite['type'], channel: string, user?: string) => {
    removeFavorite(type, channel, user)
    notifySubscribers()
  }, [])

  const checkIsFavorite = useCallback((type: Favorite['type'], channel: string, user?: string) => {
    return isFavorite(type, channel, user)
  }, [])

  const toggle = useCallback((favorite: Favorite) => {
    toggleFavoriteUtil(favorite)
    notifySubscribers()
  }, [])

  return {
    favorites,
    add,
    remove,
    isFavorite: checkIsFavorite,
    toggle,
  }
}
