import { Link } from '@tanstack/react-router'
import type { FullMessage } from '@/api/model'
import { type EmoteMap, parseMessageWithEmotes } from '@/hooks/useChannelEmotes'
import { parseTextWithLinks } from '@/lib/parseLinks'
import type { TimestampDisplay } from '@/lib/settings'
import { formatTimestamp } from '@/lib/timestamp'
import { Emote } from './Emote'

interface LogMessageProps {
  message: FullMessage
  channelName: string
  showChannel?: boolean
  timestampDisplay: TimestampDisplay
  emoteMap?: EmoteMap
}

export function LogMessage({
  message,
  channelName,
  showChannel = false,
  timestampDisplay,
  emoteMap,
}: LogMessageProps) {
  const timestamp = new Date(message.timestamp)
  const formattedTimestamp = formatTimestamp(timestamp, timestampDisplay)
  const fullTimestamp = formatTimestamp(timestamp, 'full')

  // Get user color from tags if available
  const userColor = message.tags?.color || '#9147ff'

  // Parse message text with emotes
  const messageParts = parseMessageWithEmotes(message.text || '', emoteMap || new Map())

  return (
    <div className="group py-0.5 px-2 hover:bg-bg-tertiary/50 rounded leading-tight break-words">
      {/* Timestamp */}
      {timestampDisplay !== 'none' && (
        <span
          className="text-text-muted tabular-nums font-mono chat-message-text mr-2"
          title={fullTimestamp}
        >
          {formattedTimestamp}
        </span>
      )}

      {/* Channel (optional) */}
      {showChannel && (
        <Link
          to="/channel/$channel"
          params={{ channel: message.channel }}
          className="text-text-secondary hover:text-accent chat-message-text mr-2"
        >
          #{message.channel}
        </Link>
      )}

      {/* Username */}
      <Link
        to="/user/$channel/$user"
        params={{ channel: channelName, user: message.username }}
        className="font-medium hover:underline chat-message-text mr-2"
        style={{ color: userColor }}
      >
        {message.displayName || message.username}:
      </Link>

      {/* Message text with emotes and links */}
      <span className="text-text-primary chat-message-text">
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
