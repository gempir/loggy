import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BarChart3, MessageSquare, User } from 'lucide-react'
import type { UserLogsStats } from '@/api/model'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useApiConfig } from '@/hooks/useApiConfig'

export const Route = createFileRoute('/user/$channel/$user/stats')({
  component: UserStatsPage,
})

async function fetchUserStats(
  apiBaseUrl: string,
  channel: string,
  user: string
): Promise<UserLogsStats> {
  const response = await fetch(`${apiBaseUrl}/channel/${channel}/user/${user}/stats`)
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.status}`)
  }
  return response.json()
}

function UserStatsPage() {
  const { channel, user } = Route.useParams()
  const { apiBaseUrl } = useApiConfig()

  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-stats', channel, user, apiBaseUrl],
    queryFn: () => fetchUserStats(apiBaseUrl, channel, user),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

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
          <Link
            to="/user/$channel/$user"
            params={{ channel, user }}
            className="hover:text-accent transition-colors"
          >
            {user}
          </Link>
          <span>/</span>
          <span className="text-text-primary">Stats</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-twitch/20 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-twitch" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{user}'s Statistics</h1>
            <p className="text-text-secondary text-sm">in #{channel}</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Loading stats..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <ErrorDisplay
          title="Failed to load stats"
          message={error instanceof Error ? error.message : 'Unknown error'}
          onRetry={() => refetch()}
        />
      )}

      {/* Stats */}
      {!isLoading && !error && stats && (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-bg-secondary border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                <span className="text-text-secondary text-sm">Total Messages</span>
              </div>
              <p className="text-3xl font-bold text-text-primary">
                {stats.messageCount.toLocaleString()}
              </p>
            </div>

            <div className="bg-bg-secondary border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-twitch" />
                <span className="text-text-secondary text-sm">Username</span>
              </div>
              <p className="text-xl font-bold text-text-primary">{stats.userLogin || 'Unknown'}</p>
            </div>

            <div className="bg-bg-secondary border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-success" />
                <span className="text-text-secondary text-sm">User ID</span>
              </div>
              <p className="text-xl font-bold text-text-primary font-mono">{stats.userId}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-bg-secondary border border-border rounded-lg p-6">
            <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/user/$channel/$user"
                params={{ channel, user }}
                className="px-4 py-2 bg-bg-tertiary hover:bg-bg-hover border border-border rounded-lg text-sm font-medium transition-colors"
              >
                View Logs
              </Link>
              <Link
                to="/user/$channel/$user/search"
                params={{ channel, user }}
                className="px-4 py-2 bg-bg-tertiary hover:bg-bg-hover border border-border rounded-lg text-sm font-medium transition-colors"
              >
                Search Messages
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
