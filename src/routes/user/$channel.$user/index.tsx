import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BarChart3, Calendar, ChevronLeft, ChevronRight, Search, User } from 'lucide-react'
import { useState } from 'react'
import type { FullMessage, JsonLogsResponse } from '@/api/model'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { LogList } from '@/components/LogList'
import { useApiConfig } from '@/hooks/useApiConfig'

export const Route = createFileRoute('/user/$channel/$user/')({
  component: UserLogsPage,
})

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
  } = useQuery({
    queryKey: ['user-logs', channel, user, selectedMonth, apiBaseUrl],
    queryFn: () =>
      fetchUserLogs(apiBaseUrl, channel, user, selectedMonth.year, selectedMonth.month),
    staleTime: 1000 * 60 * 5,
  })

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

  const formattedMonth = new Date(
    parseInt(selectedMonth.year, 10),
    parseInt(selectedMonth.month, 10) - 1,
    1
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  const isCurrentMonth = () => {
    const today = new Date()
    return (
      selectedMonth.year === today.getFullYear().toString() &&
      selectedMonth.month === (today.getMonth() + 1).toString().padStart(2, '0')
    )
  }

  return (
    <div className="px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
          <Link to="/" className="hover:text-accent transition-colors">
            Channels
          </Link>
          <span>/</span>
          <Link
            to="/channel/$channel"
            params={{ channel }}
            className="hover:text-accent transition-colors"
          >
            {channel}
          </Link>
          <span>/</span>
          <span className="text-text-primary">{user}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-twitch/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-twitch" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{user}</h1>
              <p className="text-text-secondary text-sm">in #{channel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/user/$channel/$user/stats"
              params={{ channel, user }}
              className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary hover:bg-bg-hover border border-border rounded-lg text-sm font-medium transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Stats
            </Link>
            <Link
              to="/user/$channel/$user/search"
              params={{ channel, user }}
              className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary hover:bg-bg-hover border border-border rounded-lg text-sm font-medium transition-colors"
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="bg-bg-secondary border border-border rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-accent" />
            <span className="font-medium">{formattedMonth}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <input
              type="month"
              value={`${selectedMonth.year}-${selectedMonth.month}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-')
                setSelectedMonth({ year, month })
              }}
              className="px-3 py-2 bg-bg-tertiary border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
            />

            <button
              type="button"
              onClick={() => navigateMonth('next')}
              disabled={isCurrentMonth()}
              className="p-2 hover:bg-bg-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Message Count */}
      {messages && (
        <div className="text-text-secondary text-sm mb-4">
          {messages.length.toLocaleString()} messages
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Loading logs..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <ErrorDisplay
          title="Failed to load logs"
          message={error instanceof Error ? error.message : 'Unknown error'}
          onRetry={() => refetch()}
        />
      )}

      {/* Logs */}
      {!isLoading && !error && messages && <LogList messages={messages} channelName={channel} />}
    </div>
  )
}
