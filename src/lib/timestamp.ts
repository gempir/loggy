import type { TimestampDisplay } from './settings'

export function formatTimestamp(timestamp: Date, display: TimestampDisplay): string {
  if (display === 'none') {
    return ''
  }

  if (display === 'full') {
    const date = timestamp.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    const time = timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    return `${date} ${time}`
  }

  if (display === 'hours-minutes') {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}
