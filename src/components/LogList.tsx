import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowUp } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FullMessage } from '@/api/model'
import { extractChannelId, useChannelEmotes } from '@/hooks/useChannelEmotes'
import { use7tvEmotesEnabled } from '@/hooks/useSettings'
import { LogMessage } from './LogMessage'

interface LogListProps {
  messages: FullMessage[]
  channelName: string
  showChannel?: boolean
  showDate?: boolean
}

export function LogList({
  messages,
  channelName,
  showChannel = false,
  showDate = false,
}: LogListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Check if 7TV emotes are enabled in settings
  const { enabled: sevenTvEnabled } = use7tvEmotesEnabled()

  // Extract the Twitch channel ID from messages
  const channelId = useMemo(() => extractChannelId(messages), [messages])

  // Fetch 7TV emotes for this channel using the Twitch ID (only if enabled)
  const { data: emoteMap } = useChannelEmotes(sevenTvEnabled ? channelId : null)

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28, // Initial estimate, will be measured dynamically
    overscan: 10,
  })

  // Track scroll position to show/hide scroll to top button
  useEffect(() => {
    const element = parentRef.current
    if (!element) return

    const handleScroll = () => {
      // Show button if scrolled more than 500px
      setShowScrollTop(element.scrollTop > 500)
    }

    element.addEventListener('scroll', handleScroll)
    return () => element.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    parentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p>No messages found</p>
      </div>
    )
  }

  return (
    <div className="bg-bg-secondary border border-border rounded-md overflow-hidden flex-1 flex flex-col min-h-0 relative">
      <div ref={parentRef} className="flex-1 overflow-y-auto scrollbar-thick">
        <div
          className="relative w-full"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const message = messages[virtualItem.index]
            return (
              <div
                key={`${message.id}-${message.timestamp}-${virtualItem.index}`}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <LogMessage
                  message={message}
                  channelName={channelName}
                  showChannel={showChannel}
                  showDate={showDate}
                  emoteMap={emoteMap}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="absolute top-4 right-4 p-3 bg-accent hover:bg-accent-hover text-white rounded-full shadow-lg transition-all hover:scale-110 z-10 cursor-pointer"
          title="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
