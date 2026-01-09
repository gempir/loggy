import { Link } from '@tanstack/react-router'
import type { FullMessage } from '@/api/model'
import { type EmoteMap, parseMessageWithEmotes } from '@/hooks/useChannelEmotes'
import { parseTextWithLinks } from '@/lib/parseLinks'
import { Emote } from './Emote'

interface LogMessageProps {
  message: FullMessage
  channelName: string
  showChannel?: boolean
  showDate?: boolean
  emoteMap?: EmoteMap
}

export function LogMessage({
  message,
  channelName,
  showChannel = false,
  showDate = false,
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
    <div className="group flex gap-2 py-1 px-2 hover:bg-bg-tertiary/50 rounded leading-relaxed">
      {/* Timestamp */}
      <span
        className="text-text-muted shrink-0 tabular-nums font-mono chat-message-text"
        title={`${formattedDate} ${formattedTime}`}
      >
        {showDate ? `${formattedDate} ${formattedTime}` : formattedTime}
      </span>

      {/* Channel (optional) */}
      {showChannel && (
        <Link
          to="/channel/$channel"
          params={{ channel: message.channel }}
          className="text-text-secondary hover:text-accent shrink-0 chat-message-text"
        >
          #{message.channel}
        </Link>
      )}

      {/* Username */}
      <Link
        to="/user/$channel/$user"
        params={{ channel: channelName, user: message.username }}
        className="shrink-0 font-medium hover:underline chat-message-text"
        style={{ color: userColor }}
      >
        {message.displayName || message.username}:
      </Link>

      {/* Message text with emotes and links */}
      <span className="text-text-primary break-words chat-message-text">
        {messageParts.map((part) => {
          if (part.type === 'emote' && part.emote) {
            return <Emote key={`emote-${part.startIndex}-${part.emote.id}`} emote={part.emote} />
          }

          // Parse text parts for links
          const textSegments = parseTextWithLinks(part.content)
          return (
            <span key={`text-${part.startIndex}`}>
              {textSegments.map((segment, segmentIndex) => {
                if (segment.type === 'link' && segment.href) {
                  return (
                    <a
                      key={`link-${part.startIndex}-${segmentIndex}`}
                      href={segment.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      {segment.content}
                    </a>
                  )
                }
                return (
                  <span key={`segment-${part.startIndex}-${segmentIndex}`}>{segment.content}</span>
                )
              })}
            </span>
          )
        })}
      </span>
    </div>
  )
}
