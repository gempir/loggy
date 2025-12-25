const API_BASE_URL_KEY = 'loggy_api_base_url'
const DEFAULT_API_BASE_URL = 'https://logs.zonian.dev'

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_API_BASE_URL
  }
  return localStorage.getItem(API_BASE_URL_KEY) || DEFAULT_API_BASE_URL
}

export function setApiBaseUrl(url: string): void {
  if (typeof window === 'undefined') {
    return
  }
  if (url === DEFAULT_API_BASE_URL || url === '') {
    localStorage.removeItem(API_BASE_URL_KEY)
  } else {
    // Normalize URL - remove trailing slash
    const normalizedUrl = url.replace(/\/+$/, '')
    localStorage.setItem(API_BASE_URL_KEY, normalizedUrl)
  }
}

export function resetApiBaseUrl(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem(API_BASE_URL_KEY)
}

export const DEFAULT_API_URL = DEFAULT_API_BASE_URL
