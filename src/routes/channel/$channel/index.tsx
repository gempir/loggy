import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowDownUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Timer,
  User,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FullMessage, JsonLogsResponse } from '@/api/model'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { LogList } from '@/components/LogList'
import { useApiConfig } from '@/hooks/useApiConfig'

export const Route = createFileRoute('/channel/$channel/')({
  component: ChannelLogsPage,
})

interface LogsQueryParams {
  year: string
  month: string
  day: string
}

type AutoRefreshInterval = 0 | 5 | 10 | 30 | 60

async function fetchChannelLogs(
  apiBaseUrl: string,
  channel: string,
  params?: LogsQueryParams
): Promise<FullMessage[]> {
  let url: string
  if (params) {
    url = `${apiBaseUrl}/channel/${channel}/${params.year}/${params.month}/${params.day}?json=true`
  } else {
    // Get today's date
    const today = new Date()
    const year = today.getFullYear().toString()
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const day = today.getDate().toString().padStart(2, '0')
    url = `${apiBaseUrl}/channel/${channel}/${year}/${month}/${day}?json=true`
  }

  const response = await fetch(url)
  if (!response.ok) {
    if (response.status === 404) {
      return []
    }
    throw new Error(`Failed to fetch logs: ${response.status}`)
  }

  const data: JsonLogsResponse = await response.json()
  return data.messages || []
}

function ChannelLogsPage() {
  const { channel } = Route.useParams()
  const { apiBaseUrl } = useApiConfig()
  const navigate = useNavigate()
  const [userSearch, setUserSearch] = useState('')
  const [sortNewestFirst, setSortNewestFirst] = useState(true)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<AutoRefreshInterval>(0)
  const [showAutoRefreshDropdown, setShowAutoRefreshDropdown] = useState(false)

  // Initialize with today's date
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return {
      year: today.getFullYear().toString(),
      month: (today.getMonth() + 1).toString().padStart(2, '0'),
      day: today.getDate().toString().padStart(2, '0'),
    }
  })

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (userSearch.trim()) {
      navigate({
        to: '/user/$channel/$user',
        params: { channel, user: userSearch.trim() },
      })
    }
  }

  const {
    data: messages,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['channel-logs', channel, selectedDate, apiBaseUrl],
    queryFn: () => fetchChannelLogs(apiBaseUrl, channel, selectedDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefreshInterval === 0) return

    const intervalMs = autoRefreshInterval * 1000
    const interval = setInterval(() => {
      refetch()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [autoRefreshInterval, refetch])

  // Sort messages based on preference
  const sortedMessages = useMemo(() => {
    if (!messages) return []
    if (sortNewestFirst) {
      return [...messages].reverse()
    }
    return messages
  }, [messages, sortNewestFirst])

  const navigateDay = (direction: 'prev' | 'next') => {
    const date = new Date(
      parseInt(selectedDate.year, 10),
      parseInt(selectedDate.month, 10) - 1,
      parseInt(selectedDate.day, 10)
    )
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1))

    setSelectedDate({
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString().padStart(2, '0'),
      day: date.getDate().toString().padStart(2, '0'),
    })
  }

  const isToday = () => {
    const today = new Date()
    return (
      selectedDate.year === today.getFullYear().toString() &&
      selectedDate.month === (today.getMonth() + 1).toString().padStart(2, '0') &&
      selectedDate.day === today.getDate().toString().padStart(2, '0')
    )
  }

  const autoRefreshOptions: { value: AutoRefreshInterval; label: string }[] = [
    { value: 0, label: 'Off' },
    { value: 5, label: '5s' },
    { value: 10, label: '10s' },
    { value: 30, label: '30s' },
    { value: 60, label: '60s' },
  ]

  return (
    <div className="px-2 py-2 flex flex-col h-[calc(100vh-4rem)] min-h-0">
      {/* Header Row: Breadcrumb + Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-2">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-text-secondary hover:text-accent transition-colors">
            Channels
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary font-medium">#{channel}</span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Navigation */}
          <div className="flex items-center gap-1 bg-bg-secondary border border-border rounded-lg px-2 py-1">
            <button
              type="button"
              onClick={() => navigateDay('prev')}
              className="p-1.5 hover:bg-bg-hover rounded transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={`${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`}
              onChange={(e) => {
                const date = new Date(e.target.value)
                setSelectedDate({
                  year: date.getFullYear().toString(),
                  month: (date.getMonth() + 1).toString().padStart(2, '0'),
                  day: date.getDate().toString().padStart(2, '0'),
                })
              }}
              className="px-2 py-1 bg-transparent border-none text-sm focus:outline-none"
            />

            <button
              type="button"
              onClick={() => navigateDay('next')}
              disabled={isToday()}
              className="p-1.5 hover:bg-bg-hover rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Link */}
          <Link
            to="/channel/$channel/stats"
            params={{ channel }}
            className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary hover:bg-bg-hover border border-border rounded-lg text-sm font-medium transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Stats</span>
          </Link>

          {/* User Search */}
          <form onSubmit={handleUserSearch} className="flex items-stretch gap-1">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Username..."
                aria-label="Search username"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-28 sm:w-36 pl-9 pr-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 placeholder:text-text-muted"
              />
            </div>
            <button
              type="submit"
              disabled={!userSearch.trim()}
              className="flex items-center justify-center px-3 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
              aria-label="Search user"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Message Count and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
        <div className="text-text-secondary text-sm">
          {messages ? `${messages.length.toLocaleString()} messages` : ''}
          {sortNewestFirst ? ' (newest first)' : ' (oldest first)'}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => setSortNewestFirst(!sortNewestFirst)}
            className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary hover:bg-bg-hover border border-border rounded-lg text-sm transition-colors"
            title={sortNewestFirst ? 'Showing newest first' : 'Showing oldest first'}
          >
            <ArrowDownUp className="w-4 h-4" />
            <span className="hidden sm:inline">{sortNewestFirst ? 'Newest' : 'Oldest'}</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary hover:bg-bg-hover border border-border rounded-lg text-sm transition-colors disabled:opacity-50"
            title="Refresh messages"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Auto Refresh Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAutoRefreshDropdown(!showAutoRefreshDropdown)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
                autoRefreshInterval > 0
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-bg-tertiary hover:bg-bg-hover border-border'
              }`}
              title="Auto refresh"
            >
              <Timer className="w-4 h-4" />
              <span className="hidden sm:inline">
                {autoRefreshInterval > 0 ? `${autoRefreshInterval}s` : 'Auto'}
              </span>
            </button>

            {showAutoRefreshDropdown && (
              <>
                {/* Backdrop */}
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setShowAutoRefreshDropdown(false)}
                  aria-label="Close dropdown"
                />

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 z-50 bg-bg-secondary border border-border rounded-lg shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <span className="text-xs text-text-muted">Auto Refresh</span>
                  </div>
                  {autoRefreshOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setAutoRefreshInterval(option.value)
                        setShowAutoRefreshDropdown(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-bg-hover transition-colors ${
                        autoRefreshInterval === option.value
                          ? 'text-accent bg-accent/10'
                          : 'text-text-primary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading logs..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex-1">
          <ErrorDisplay
            title="Failed to load logs"
            message={error instanceof Error ? error.message : 'Unknown error'}
            onRetry={() => refetch()}
          />
        </div>
      )}

      {/* Logs */}
      {!isLoading && !error && messages && (
        <LogList messages={sortedMessages} channelName={channel} />
      )}
    </div>
  )
}
