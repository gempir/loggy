export type FavoriteType = 'channel' | 'user'

export interface Favorite {
  type: FavoriteType
  channel: string
  user?: string // Only present for user favorites
  name: string // Display name
}

const FAVORITES_KEY = 'loggy_favorites'

function getFavoritesFromStorage(): Favorite[] {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (!stored) return []
    return JSON.parse(stored) as Favorite[]
  } catch {
    return []
  }
}

function saveFavoritesToStorage(favorites: Favorite[]): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  } catch {
    // Ignore storage errors
  }
}

export function getFavorites(): Favorite[] {
  return getFavoritesFromStorage()
}

export function addFavorite(favorite: Favorite): void {
  const favorites = getFavoritesFromStorage()
  // Check if already exists
  const exists = favorites.some(
    (f) =>
      f.type === favorite.type &&
      f.channel === favorite.channel &&
      (favorite.type === 'channel' || f.user === favorite.user)
  )
  if (!exists) {
    favorites.push(favorite)
    saveFavoritesToStorage(favorites)
  }
}

export function removeFavorite(type: FavoriteType, channel: string, user?: string): void {
  const favorites = getFavoritesFromStorage()
  const filtered = favorites.filter(
    (f) => !(f.type === type && f.channel === channel && (type === 'channel' || f.user === user))
  )
  saveFavoritesToStorage(filtered)
}

export function isFavorite(type: FavoriteType, channel: string, user?: string): boolean {
  const favorites = getFavoritesFromStorage()
  return favorites.some(
    (f) => f.type === type && f.channel === channel && (type === 'channel' || f.user === user)
  )
}

export function toggleFavorite(favorite: Favorite): void {
  if (isFavorite(favorite.type, favorite.channel, favorite.user)) {
    removeFavorite(favorite.type, favorite.channel, favorite.user)
  } else {
    addFavorite(favorite)
  }
}
