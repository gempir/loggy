const SEVENTV_EMOTES_KEY = 'loggy_7tv_emotes_enabled'
const FONT_FAMILY_KEY = 'loggy_font_family'

export type FontFamily =
  | 'system'
  | 'helvetica'
  | 'arial'
  | 'times'
  | 'georgia'
  | 'courier'
  | 'verdana'
  | 'trebuchet'
  | 'palatino'
  | 'garamond'
  | 'comic-sans'
  | 'jetbrains'
  | 'fira-code'
  | 'source-code'
  | 'consolas'

export const FONT_OPTIONS: { value: FontFamily; label: string; family: string }[] = [
  {
    value: 'helvetica',
    label: 'Helvetica Neue',
    family: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  { value: 'system', label: 'System Default', family: 'system-ui, -apple-system, sans-serif' },
  { value: 'arial', label: 'Arial', family: 'Arial, Helvetica, sans-serif' },
  { value: 'times', label: 'Times New Roman', family: '"Times New Roman", Times, serif' },
  { value: 'georgia', label: 'Georgia', family: 'Georgia, serif' },
  { value: 'verdana', label: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
  { value: 'trebuchet', label: 'Trebuchet MS', family: '"Trebuchet MS", sans-serif' },
  { value: 'palatino', label: 'Palatino', family: '"Palatino Linotype", "Book Antiqua", serif' },
  { value: 'garamond', label: 'Garamond', family: 'Garamond, serif' },
  { value: 'comic-sans', label: 'Comic Sans MS', family: '"Comic Sans MS", cursive' },
  {
    value: 'jetbrains',
    label: 'JetBrains Mono',
    family: '"JetBrains Mono", monospace',
  },
  {
    value: 'fira-code',
    label: 'Fira Code',
    family: '"Fira Code", monospace',
  },
  {
    value: 'source-code',
    label: 'Source Code Pro',
    family: '"Source Code Pro", monospace',
  },
  {
    value: 'courier',
    label: 'Courier New',
    family: '"Courier New", Courier, monospace',
  },
  {
    value: 'consolas',
    label: 'Consolas',
    family: 'Consolas, Monaco, monospace',
  },
]

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

export function getFontFamily(): FontFamily {
  if (typeof window === 'undefined') {
    return 'helvetica'
  }
  const stored = localStorage.getItem(FONT_FAMILY_KEY)
  return (stored as FontFamily) || 'helvetica'
}

export function setFontFamily(font: FontFamily): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(FONT_FAMILY_KEY, font)

  // Update CSS variable
  const fontOption = FONT_OPTIONS.find((f) => f.value === font)
  if (fontOption) {
    document.documentElement.style.setProperty('--font-family', fontOption.family)
  }
}

// Initialize font on load
if (typeof window !== 'undefined') {
  const font = getFontFamily()
  const fontOption = FONT_OPTIONS.find((f) => f.value === font)
  if (fontOption) {
    document.documentElement.style.setProperty('--font-family', fontOption.family)
  }
}
