import { Check, RotateCcw, Settings, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useApiConfig } from '@/hooks/useApiConfig'
import { use7tvEmotesEnabled, useFontFamily, useFontSize } from '@/hooks/useSettings'
import { FONT_OPTIONS, FONT_SIZE_OPTIONS } from '@/lib/settings'

export function ApiSettings() {
  const { apiBaseUrl, updateApiBaseUrl, resetUrl, isCustomUrl, defaultUrl } = useApiConfig()
  const { enabled: sevenTvEnabled, setEnabled: setSevenTvEnabled } = use7tvEmotesEnabled()
  const { font, setFont } = useFontFamily()
  const { size: fontSize, setSize: setFontSize } = useFontSize()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(apiBaseUrl)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setInputValue(apiBaseUrl)
  }, [apiBaseUrl])

  const handleSave = () => {
    updateApiBaseUrl(inputValue)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    resetUrl()
    setInputValue(defaultUrl)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
          isCustomUrl
            ? 'text-warning bg-warning/10 hover:bg-warning/20'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
        }`}
        title={isCustomUrl ? `Custom API: ${apiBaseUrl}` : 'API Settings'}
      >
        <Settings className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
            aria-label="Close settings"
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-bg-secondary border border-border rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="font-medium text-text-primary">Settings</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-bg-hover rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-4">
              {/* Font Selection */}
              <div>
                <label htmlFor="font-select" className="block text-sm text-text-secondary mb-2">
                  Font Family
                </label>
                <select
                  id="font-select"
                  value={font}
                  onChange={(e) => setFont(e.target.value as typeof font)}
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
                >
                  {FONT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size Selection */}
              <div>
                <label
                  htmlFor="font-size-select"
                  className="block text-sm text-text-secondary mb-2"
                >
                  Font Size
                </label>
                <select
                  id="font-size-select"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value as typeof fontSize)}
                  className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
                >
                  {FONT_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 7TV Emotes Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 109.6 80.9"
                    fill="currentColor"
                    role="img"
                    aria-label="7TV"
                  >
                    <title>7TV</title>
                    <path
                      fill="#4FC2BC"
                      d="M85.4,0H24.2L0,40.5l24.2,40.4h61.2l24.2-40.4L85.4,0z M75.8,64.9H33.8L12.8,40.5l21-24.4h42l21,24.4L75.8,64.9z"
                    />
                    <polygon
                      fill="#4FC2BC"
                      points="67.6,27.4 50.8,27.4 43.2,36.2 50.8,45 59.3,45 51.7,53.5 59.3,53.5 74.8,36.2"
                    />
                  </svg>
                  <label htmlFor="7tv-toggle" className="text-sm text-text-primary cursor-pointer">
                    7TV Emotes
                  </label>
                </div>
                <button
                  id="7tv-toggle"
                  type="button"
                  role="switch"
                  aria-checked={sevenTvEnabled}
                  onClick={() => setSevenTvEnabled(!sevenTvEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 ${
                    sevenTvEnabled ? 'bg-[#4FC2BC]' : 'bg-bg-tertiary'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      sevenTvEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-border pt-4">
                <div>
                  <label htmlFor="api-url" className="block text-sm text-text-secondary mb-1">
                    API Base URL
                  </label>
                  <input
                    id="api-url"
                    type="url"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={defaultUrl}
                    className="w-full px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 font-mono"
                  />
                </div>

                {isCustomUrl && (
                  <p className="text-xs text-warning flex items-center gap-1 mt-2">
                    <span className="w-2 h-2 bg-warning rounded-full" />
                    Using custom API endpoint
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={inputValue === apiBaseUrl}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {saved ? <Check className="w-4 h-4" /> : null}
                    {saved ? 'Saved!' : 'Save'}
                  </button>

                  {isCustomUrl && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-bg-tertiary hover:bg-bg-hover border border-border text-sm font-medium rounded-lg transition-colors"
                      title="Reset to default"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-text-muted mt-2">Default: {defaultUrl}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
