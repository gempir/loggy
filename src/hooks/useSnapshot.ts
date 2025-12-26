import { useCallback, useEffect, useRef, useState } from 'react'
import type { FullMessage } from '@/api/model'

export interface SnapshotConfig {
  removeEmoteOnly: boolean
  showTimestamps: boolean
  showUsernames: boolean
  minCharacters: number
}

export interface SnapshotState {
  isActive: boolean
  startTime: Date | null
  messageCount: number
  messages: FullMessage[]
  config: SnapshotConfig
}

const DEFAULT_CONFIG: SnapshotConfig = {
  removeEmoteOnly: true,
  showTimestamps: true,
  showUsernames: true,
  minCharacters: 0,
}

export function useSnapshot(allMessages: FullMessage[], refetch: () => void) {
  const [state, setState] = useState<SnapshotState>({
    isActive: false,
    startTime: null,
    messageCount: 0,
    messages: [],
    config: DEFAULT_CONFIG,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousMessagesCountRef = useRef(0)

  // Start snapshot
  const startSnapshot = useCallback(() => {
    const now = new Date()
    setState({
      isActive: true,
      startTime: now,
      messageCount: 0,
      messages: [],
      config: DEFAULT_CONFIG,
    })
    previousMessagesCountRef.current = allMessages.length

    // Start auto-refresh every 5 seconds
    intervalRef.current = setInterval(() => {
      refetch()
    }, 5000)
  }, [allMessages.length, refetch])

  // Stop snapshot
  const stopSnapshot = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setState((prev) => ({ ...prev, isActive: false }))
  }, [])

  // Create snapshot from past timeframe (in seconds)
  const snapshotFromPast = useCallback(
    (seconds: number) => {
      const now = new Date()
      const cutoffTime = new Date(now.getTime() - seconds * 1000)

      const filteredMessages = allMessages.filter((msg) => {
        const msgTime = new Date(msg.timestamp)
        return msgTime >= cutoffTime && msgTime <= now
      })

      setState({
        isActive: false,
        startTime: cutoffTime,
        messageCount: filteredMessages.length,
        messages: filteredMessages,
        config: DEFAULT_CONFIG,
      })
    },
    [allMessages]
  )

  // Update config
  const updateConfig = useCallback((newConfig: Partial<SnapshotConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...newConfig },
    }))
  }, [])

  // Reset snapshot
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setState({
      isActive: false,
      startTime: null,
      messageCount: 0,
      messages: [],
      config: DEFAULT_CONFIG,
    })
    previousMessagesCountRef.current = 0
  }, [])

  // Track new messages when snapshot is active
  useEffect(() => {
    if (!state.isActive || !state.startTime) return

    const newMessages = allMessages.filter((msg) => {
      const msgTime = new Date(msg.timestamp)
      return msgTime >= state.startTime!
    })

    const newCount = newMessages.length

    setState((prev) => ({
      ...prev,
      messageCount: newCount,
      messages: newMessages,
    }))

    previousMessagesCountRef.current = allMessages.length
  }, [allMessages, state.isActive, state.startTime])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    state,
    startSnapshot,
    stopSnapshot,
    snapshotFromPast,
    updateConfig,
    reset,
  }
}
