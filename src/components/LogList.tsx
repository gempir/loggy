import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import type { FullMessage } from '@/api/model'
import { LogMessage } from './LogMessage'

interface LogListProps {
  messages: FullMessage[]
  channelName: string
  showChannel?: boolean
}

export function LogList({ messages, channelName, showChannel = false }: LogListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28, // Estimated row height in pixels
    overscan: 20, // Render extra items above/below visible area for smoother scrolling
  })

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p>No messages found</p>
      </div>
    )
  }

  return (
    <div className="bg-bg-secondary border border-border rounded-lg overflow-hidden">
      <div ref={parentRef} className="h-[70vh] overflow-y-auto scrollbar-thin">
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
                className="absolute top-0 left-0 w-full px-2"
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <LogMessage message={message} channelName={channelName} showChannel={showChannel} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
