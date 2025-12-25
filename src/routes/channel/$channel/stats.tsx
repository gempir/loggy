import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BarChart3, MessageSquare, Trophy, Users } from 'lucide-react'
import type { ChannelLogsStats } from '@/api/model'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useApiConfig } from '@/hooks/useApiConfig'

export const Route = createFileRoute('/channel/$channel/stats')({
  component: ChannelStatsPage,
})

async function fetchChannelStats(apiBaseUrl: string, channel: string): Promise<ChannelLogsStats> {
  const response = await fetch(`${apiBaseUrl}/channel/${channel}/stats`)
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.status}`)
  }
  return response.json()
}

function ChannelStatsPage() {
  const { channel } = Route.useParams()
  const { apiBaseUrl } = useApiConfig()

  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['channel-stats', channel, apiBaseUrl],
    queryFn: () => fetchChannelStats(apiBaseUrl, channel),
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
          <span className="text-text-primary">Stats</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">#{channel} Statistics</h1>
            <p className="text-text-secondary text-sm">Channel activity and top chatters</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Users className="w-5 h-5 text-success" />
                <span className="text-text-secondary text-sm">Top Chatters</span>
              </div>
              <p className="text-3xl font-bold text-text-primary">
                {stats.topChatters?.length || 0}
              </p>
            </div>
          </div>

          {/* Top Chatters */}
          {stats.topChatters && stats.topChatters.length > 0 && (
            <div className="bg-bg-secondary border border-border rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
                <h2 className="font-semibold text-lg">Top Chatters</h2>
              </div>

              <div className="divide-y divide-border">
                {stats.topChatters.map((chatter, index) => (
                  <Link
                    key={chatter.userId}
                    to="/user/$channel/$user"
                    params={{
                      channel,
                      user: chatter.userLogin || chatter.userId,
                    }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-bg-tertiary transition-colors"
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-warning/20 text-warning'
                          : index === 1
                            ? 'bg-text-secondary/20 text-text-secondary'
                            : index === 2
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-bg-tertiary text-text-muted'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">
                        {chatter.userLogin || `User ${chatter.userId}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">
                        {chatter.messageCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-text-muted">messages</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
