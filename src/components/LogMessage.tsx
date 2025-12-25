import { Link } from '@tanstack/react-router'
import type { FullMessage } from '@/api/model'
import { type EmoteMap, parseMessageWithEmotes } from '@/hooks/useChannelEmotes'
import { Emote } from './Emote'

interface LogMessageProps {
  message: FullMessage
  channelName: string
  showChannel?: boolean
  emoteMap?: EmoteMap
}

export function LogMessage({
  message,
  channelName,
  showChannel = false,
  emoteMap,
}: LogMessageProps) {
  const timestamp = new Date(message.timestamp)
  const formattedTime = timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const formattedDate = timestamp.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  // Get user color from tags if available
  const userColor = message.tags?.color || '#9147ff'

  // Parse message text with emotes
  const messageParts = parseMessageWithEmotes(message.text || '', emoteMap || new Map())

  return (
    <div className="group flex gap-2 py-1 px-2 hover:bg-bg-tertiary/50 rounded font-mono text-sm leading-relaxed">
      {/* Timestamp */}
      <span
        className="text-text-muted shrink-0 tabular-nums"
        title={`${formattedDate} ${formattedTime}`}
      >
        {formattedTime}
      </span>

      {/* Channel (optional) */}
      {showChannel && (
        <Link
          to="/channel/$channel"
          params={{ channel: message.channel }}
          className="text-text-secondary hover:text-accent shrink-0"
        >
          #{message.channel}
        </Link>
      )}

      {/* Username */}
      <Link
        to="/user/$channel/$user"
        params={{ channel: channelName, user: message.username }}
        className="shrink-0 font-medium hover:underline"
        style={{ color: userColor }}
      >
        {message.displayName || message.username}:
      </Link>

      {/* Message text with emotes */}
      <span className="text-text-primary break-words chat-message-text">
        {messageParts.map((part) =>
          part.type === 'emote' && part.emote ? (
            <Emote key={`emote-${part.startIndex}-${part.emote.id}`} emote={part.emote} />
          ) : (
            <span key={`text-${part.startIndex}`}>{part.content}</span>
          )
        )}
      </span>
    </div>
  )
}
