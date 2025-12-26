import { Check, Copy, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FullMessage } from '@/api/model'
import type { SnapshotConfig } from '@/hooks/useSnapshot'
import { type EmoteMap, parseMessageWithEmotes } from '@/hooks/useChannelEmotes'

export interface SnapshotOutputProps {
  messages: FullMessage[]
  config: SnapshotConfig
  onConfigChange: (config: Partial<SnapshotConfig>) => void
  onClose: () => void
  emoteMap?: EmoteMap
}

// Helper function to check if message contains only emotes using actual emote data
function isEmoteOnlyMessage(text: string, emoteMap?: EmoteMap): boolean {
  if (!text || text.trim().length === 0) return true
  if (!emoteMap || emoteMap.size === 0) return false // Can't detect without emote data

  // Clean the text by removing invisible/control characters and other Unicode garbage
  // This handles cases like "BANGER 󠀀" or "UncPls  ͏" where there are invisible/weird Unicode chars
  const cleanedText = text
    .replace(
      /[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF\u{E0000}-\u{E007F}\u034F\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE00-\uFE0F\u{E0100}-\u{E01EF}]/gu,
      ''
    )
    .trim()

  if (cleanedText.length === 0) return true

  // Split into words
  const words = cleanedText.split(/\s+/).filter((w) => w.length > 0)

  // Check if every word is in the emote map
  return words.every((word) => emoteMap.has(word))
}

export function SnapshotOutput({
  messages,
  config,
  onConfigChange,
  onClose,
  emoteMap,
}: SnapshotOutputProps) {
  const [copied, setCopied] = useState(false)

  // Filter and format messages based on config
  const formattedText = useMemo(() => {
    let filteredMessages = messages

    // Filter by minimum characters
    if (config.minCharacters > 0) {
      filteredMessages = filteredMessages.filter(
        (msg) => (msg.text || '').length >= config.minCharacters
      )
    }

    // Filter emote-only messages
    if (config.removeEmoteOnly) {
      filteredMessages = filteredMessages.filter(
        (msg) => !isEmoteOnlyMessage(msg.text || '', emoteMap)
      )
    }

    // Format messages
    return filteredMessages
      .map((msg) => {
        const parts: string[] = []

        if (config.showTimestamps) {
          const timestamp = new Date(msg.timestamp)
          const time = timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })
          parts.push(`[${time}]`)
        }

        if (config.showUsernames) {
          parts.push(`${msg.displayName || msg.username}:`)
        }

        parts.push(msg.text || '')

        return parts.join(' ')
      })
      .join('\n')
  }, [messages, config, emoteMap])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const filteredCount = useMemo(() => {
    let count = messages.length

    if (config.minCharacters > 0) {
      count = messages.filter((msg) => (msg.text || '').length >= config.minCharacters).length
    }

    if (config.removeEmoteOnly) {
      count = messages
        .filter((msg) => !isEmoteOnlyMessage(msg.text || '', emoteMap))
        .filter(
          (msg) => !config.minCharacters || (msg.text || '').length >= config.minCharacters
        ).length
    }

    return count
  }, [messages, config, emoteMap])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-bg-primary border border-border rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Snapshot Output</h2>
            <p className="text-sm text-text-secondary mt-1">
              {filteredCount} of {messages.length} messages
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Config Options */}
        <div className="p-4 border-b border-border bg-bg-secondary">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Remove emote-only messages */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.removeEmoteOnly}
                onChange={(e) => onConfigChange({ removeEmoteOnly: e.target.checked })}
                className="w-4 h-4 rounded accent-accent"
              />
              <span className="text-sm text-text-primary">Remove emote-only</span>
            </label>

            {/* Show timestamps */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showTimestamps}
                onChange={(e) => onConfigChange({ showTimestamps: e.target.checked })}
                className="w-4 h-4 rounded accent-accent"
              />
              <span className="text-sm text-text-primary">Show timestamps</span>
            </label>

            {/* Show usernames */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.showUsernames}
                onChange={(e) => onConfigChange({ showUsernames: e.target.checked })}
                className="w-4 h-4 rounded accent-accent"
              />
              <span className="text-sm text-text-primary">Show usernames</span>
            </label>

            {/* Minimum characters */}
            <label className="flex items-center gap-2">
              <span className="text-sm text-text-primary whitespace-nowrap">Min chars:</span>
              <input
                type="number"
                min="0"
                value={config.minCharacters}
                onChange={(e) =>
                  onConfigChange({ minCharacters: Math.max(0, parseInt(e.target.value, 10) || 0) })
                }
                className="w-20 px-2 py-1 bg-bg-tertiary border border-border rounded text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20"
              />
            </label>
          </div>
        </div>

        {/* Output Text */}
        <div className="flex-1 overflow-y-auto p-4">
          <pre className="text-sm text-text-primary font-mono whitespace-pre-wrap break-words bg-bg-secondary border border-border rounded p-4">
            {formattedText || 'No messages to display'}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!formattedText}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
