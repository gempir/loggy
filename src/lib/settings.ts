const SEVENTV_EMOTES_KEY = 'loggy_7tv_emotes_enabled'

export function get7tvEmotesEnabled(): boolean {
  if (typeof window === 'undefined') {
    return true // Default to enabled
  }
  const stored = localStorage.getItem(SEVENTV_EMOTES_KEY)
  // Default to true if not set
  return stored === null ? true : stored === 'true'
}

export function set7tvEmotesEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(SEVENTV_EMOTES_KEY, String(enabled))
}

