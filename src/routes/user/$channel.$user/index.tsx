import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowDownUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Star,
  Timer,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { FullMessage, JsonLogsResponse } from '@/api/model'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { LogList } from '@/components/LogList'
import { useApiConfig } from '@/hooks/useApiConfig'
import { useFavorites } from '@/hooks/useFavorites'

export const Route = createFileRoute('/user/$channel/$user/')({
  component: UserLogsPage,
})

type AutoRefreshInterval = 0 | 5 | 10 | 30 | 60

async function fetchUserLogs(
  apiBaseUrl: string,
  channel: string,
  user: string,
  year?: string,
  month?: string
): Promise<FullMessage[]> {
  let url: string
  if (year && month) {
    url = `${apiBaseUrl}/channel/${channel}/user/${user}/${year}/${month}?json=true`
  } else {
    // Get current month
    const today = new Date()
    const currentYear = today.getFullYear().toString()
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0')
    url = `${apiBaseUrl}/channel/${channel}/user/${user}/${currentYear}/${currentMonth}?json=true`
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

function UserLogsPage() {
  const { channel, user } = Route.useParams()
  const { apiBaseUrl } = useApiConfig()
  const { isFavorite, toggle } = useFavorites()
  const [sortNewestFirst, setSortNewestFirst] = useState(true)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<AutoRefreshInterval>(0)
  const [showAutoRefreshDropdown, setShowAutoRefreshDropdown] = useState(false)

  const isUserFavorite = isFavorite('user', channel, user)

  const handleToggleFavorite = () => {
    toggle({
      type: 'user',
      channel,
      user,
      name: `${user} in #${channel}`,
    })
  }

  // Initialize with current month
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date()
    return {
      year: today.getFullYear().toString(),
      month: (today.getMonth() + 1).toString().padStart(2, '0'),
    }
  })

  const {
    data: messages,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['user-logs', channel, user, selectedMonth, apiBaseUrl],
    queryFn: () =>
      fetchUserLogs(apiBaseUrl, channel, user, selectedMonth.year, selectedMonth.month),
    staleTime: 1000 * 60 * 5,
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const date = new Date(
      parseInt(selectedMonth.year, 10),
      parseInt(selectedMonth.month, 10) - 1,
      1
    )
    date.setMonth(date.getMonth() + (direction === 'next' ? 1 : -1))

    setSelectedMonth({
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString().padStart(2, '0'),
    })
  }

  const isCurrentMonth = () => {
    const today = new Date()
    return (
      selectedMonth.year === today.getFullYear().toString() &&
      selectedMonth.month === (today.getMonth() + 1).toString().padStart(2, '0')
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
          <Link
            to="/channel/$channel"
            params={{ channel }}
            className="text-text-secondary hover:text-accent transition-colors"
          >
            #{channel}
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary font-medium">{user}</span>
          <button
            type="button"
            onClick={handleToggleFavorite}
            className="ml-1 p-1 hover:bg-bg-hover rounded transition-colors"
            title={isUserFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                isUserFavorite
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-text-muted hover:text-yellow-500'
              }`}
            />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Navigation */}
          <div className="flex items-center gap-1 bg-bg-secondary border border-border rounded-lg px-2 py-1">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1.5 hover:bg-bg-hover rounded transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="month"
              value={`${selectedMonth.year}-${selectedMonth.month}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-')
                setSelectedMonth({ year, month })
              }}
              className="px-2 py-1 bg-transparent border-none text-sm focus:outline-none"
            />

            <button
              type="button"
              onClick={() => navigateMonth('next')}
              disabled={isCurrentMonth()}
              className="p-1.5 hover:bg-bg-hover rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Link */}
          <Link
            to="/user/$channel/$user/stats"
            params={{ channel, user }}
            className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary hover:bg-bg-hover border border-border rounded-lg text-sm font-medium transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Stats</span>
          </Link>

          {/* Search Link */}
          <Link
            to="/user/$channel/$user/search"
            params={{ channel, user }}
            className="flex items-center gap-2 px-3 py-2 bg-bg-tertiary hover:bg-bg-hover border border-border rounded-lg text-sm font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search Messages</span>
          </Link>
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
